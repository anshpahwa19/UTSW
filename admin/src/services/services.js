/* ==========================================================================================
   MOCK SERVICE LAYER. Async interfaces with simulated latency and optional simulated errors.
   No network requests are made; there are no endpoints or credentials anywhere in this app.
   A real backend replaces the bodies of these functions; screens only call the interfaces.
   ========================================================================================== */
const MockSettings = { latency: [180, 420], simulateErrors: false };
class ServiceError extends Error {}
const wait = ms => new Promise(r => setTimeout(r, ms));
/* Persisted mock state (device only): config records, users, prefs and the simulated session */
let DB = null;
function loadDb() {
  const saved = store.read();
  DB = saved && saved.db && saved.db.schema === 1 ? saved : { db: seedDb(), session: null, prefs: {} };
  MockSettings.simulateErrors = !!DB.prefs.simulateErrors;
}
const saveDb = () => store.write(DB);
function resetMockData() {
  const session = DB.session;
  DB = { db: seedDb(), session, prefs: {} };
  MockSettings.simulateErrors = false;
  saveDb();
}
async function mockCall(name, fn) {
  const [a, b] = MockSettings.latency;
  await wait(a + Math.random() * (b - a));
  if (MockSettings.simulateErrors) throw new ServiceError(`The mock ${name} service returned a simulated error. Turn off “Simulate service errors” in the user menu, then try again.`);
  const out = fn();
  saveDb();
  return clone(out);
}

/* ---------- Config schema (HANDOVER §6.3): one entry per config type ----------
   supportsRollback is per type and every value is an assumption for the prototype, pending confirmation. */
const CONFIG_TYPES = {
  homeLayout: { label: 'Home screen layout', area: 'homeLayout', supportsRollback: true },
  campaign: { label: 'Campaign', area: 'campaigns', supportsRollback: false },
  alert: { label: 'Emergency alert', area: 'alerts', supportsRollback: false },
  quickLink: { label: 'Quick link', area: 'quickLinks', supportsRollback: true },
  featuredCard: { label: 'Featured card', area: 'featuredCards', supportsRollback: true },
  drawer: { label: 'Drawer / More options', area: 'drawer', supportsRollback: true },
  globalColors: { label: 'Global colors', area: 'colors', supportsRollback: true },
  appEntry: { label: 'App entry', area: 'appEntry', supportsRollback: true },
  search: { label: 'Search configuration', area: 'search', supportsRollback: false }
};

const actor = () => DB.session && DB.session.userId;
function guard(rec, action) {
  const role = DB.session && DB.session.role;
  const area = CONFIG_TYPES[rec.type].area;
  if (!role || !canAct(role, area, action)) throw new ServiceError('Your role does not allow this action.');
}
function rec(id) { const r = DB.db.records[id]; if (!r) throw new ServiceError(`No configuration named ${id}.`); return r; }
function logEvent(r, action, environment, version, comment) {
  r.events.push({ id: uid('ev'), action, environment, version, by: actor(), at: new Date().toISOString(), comment: comment || '' });
}

const ConfigService = {
  get: id => mockCall('configuration', () => rec(id)),
  list: type => mockCall('configuration', () => Object.values(DB.db.records).filter(r => !type || r.type === type)),
  /* Draft: the working copy is saved; nothing reaches demo or production */
  saveDraft: (id, data, comment) => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'saveDraft');
    r.draft = { data: clone(data), updatedBy: actor(), updatedAt: new Date().toISOString(), comment: comment || '', baseVersion: r.production };
    r.review = null;
    logEvent(r, 'Draft saved', 'draft', null, comment);
    return r;
  }),
  discardDraft: id => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'saveDraft');
    r.draft = null; r.review = null;
    logEvent(r, 'Draft discarded', 'draft', null, '');
    return r;
  }),
  requestReview: (id, comment) => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'requestReview');
    if (!r.draft) throw new ServiceError('Save a draft before you request a review.');
    r.review = { by: actor(), at: new Date().toISOString(), comment: comment || '' };
    logEvent(r, 'Review requested', 'draft', null, comment);
    return r;
  }),
  /* Demo: the saved draft becomes a numbered version in the demo environment */
  deployToDemo: (id, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'deployDemo');
    if (!r.draft) throw new ServiceError('There is no saved draft to deploy.');
    const v = r.nextVersion++;
    r.versions[v] = { version: v, data: clone(r.draft.data), updatedBy: actor(), updatedAt: new Date().toISOString(), comment: comment || r.draft.comment || '' };
    r.demo = v; r.draft = null; r.review = null;
    logEvent(r, 'Deployed to demo', 'demo', v, comment);
    return r;
  }),
  /* Request changes: the demo version goes back to a draft with the reviewer's comment */
  requestChanges: (id, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'requestChanges');
    if (!r.demo || r.demo === r.production) throw new ServiceError('There is nothing on demo waiting for production.');
    r.draft = { data: clone(r.versions[r.demo].data), updatedBy: actor(), updatedAt: new Date().toISOString(), comment: `Changes requested: ${comment}`, baseVersion: r.production, changesRequested: comment };
    logEvent(r, 'Changes requested', 'demo', r.demo, comment);
    return r;
  }),
  /* Production: publishes the version on demo, never a draft */
  publish: (id, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'publish');
    if (!r.demo || r.demo === r.production) throw new ServiceError('Deploy to demo and check it there before you publish.');
    r.production = r.demo;
    logEvent(r, 'Published to production', 'production', r.demo, comment);
    return r;
  }),
  /* Rollback: only for types that support it; makes a new version with the old contents, in demo and production */
  rollback: (id, toVersion, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'rollback');
    if (!CONFIG_TYPES[r.type].supportsRollback) throw new ServiceError(`${CONFIG_TYPES[r.type].label} does not support rollback.`);
    const old = r.versions[toVersion]; if (!old) throw new ServiceError(`Version ${toVersion} does not exist.`);
    const v = r.nextVersion++;
    r.versions[v] = { version: v, data: clone(old.data), updatedBy: actor(), updatedAt: new Date().toISOString(), comment: `Rollback to v${toVersion}: ${comment}`, rollbackOf: toVersion };
    r.production = v; r.demo = v;
    logEvent(r, `Rolled back to v${toVersion}`, 'production', v, comment);
    return r;
  })
};

const UserService = {
  list: () => mockCall('users', () => DB.db.users),
  byId: id => DB.db.users.find(u => u.id === id) || null, /* synchronous lookup for names in tables */
  name: id => { const u = UserService.byId(id); return u ? `${u.first} ${u.last}` : 'Unknown user'; }
};
