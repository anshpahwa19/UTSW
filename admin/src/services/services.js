/* ==========================================================================================
   MOCK SERVICE LAYER. Async interfaces with simulated latency and optional simulated errors.
   No network requests are made; there are no endpoints or credentials anywhere in this app.
   A real backend replaces the bodies of these functions; screens only call the interfaces.
   ========================================================================================== */
const MockSettings = { latency: [160, 380], simulateErrors: false };
class ServiceError extends Error {}
const wait = ms => new Promise(r => setTimeout(r, ms));
const SCHEMA = 3;
let DB = null;
function loadDb() {
  const saved = store.read();
  DB = saved && saved.db && saved.db.schema === SCHEMA ? saved : { db: seedDb(), session: saved && saved.session && saved.db && saved.db.schema === SCHEMA ? saved.session : null, prefs: (saved && saved.prefs) || {} };
  MockSettings.simulateErrors = !!DB.prefs.simulateErrors;
}
const saveDb = () => store.write(DB);
function resetMockData() {
  DB = { db: seedDb(), session: DB.session, prefs: { theme: DB.prefs.theme } };
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
const actor = () => DB.session && DB.session.userId;
const nowIso = () => new Date().toISOString();
function needs(area, level) {
  const role = DB.session && DB.session.role;
  if (!role || !can(role, area, level)) throw new ServiceError('Your role does not allow this action.');
}
function audit(action, target, { targetId = null, targetType = null, environment = null, version = null, comment = '', before = null, after = null } = {}) {
  DB.db.audit.push({ id: uid('au'), at: nowIso(), by: actor(), action, target, targetId, targetType, environment, version, comment, before: before && clone(before), after: after && clone(after) });
}

/* ---------- Config schema (HANDOVER §6.3) ----------
   supportsRollback is per type; every value is an assumption pending confirmation (§10.17). */
const CONFIG_TYPES = {
  homeLayout: { label: 'Home screen layout', area: 'homeLayout', supportsRollback: true, route: 'home-layout' },
  campaign: { label: 'Campaign', area: 'campaigns', supportsRollback: false, route: 'home-campaigns' },
  alert: { label: 'Emergency alert', area: 'alerts', supportsRollback: false, route: 'home-alerts' },
  quickLink: { label: 'Quick link', area: 'quickLinks', supportsRollback: true, route: 'home-quick-links' },
  featuredCard: { label: 'Featured card', area: 'featuredCards', supportsRollback: true, route: 'home-featured-cards' },
  drawer: { label: 'Drawer / More options', area: 'drawer', supportsRollback: true, route: 'content-drawer' },
  globalColors: { label: 'Global colors', area: 'colors', supportsRollback: true, route: 'content-colors' },
  appEntry: { label: 'App entry', area: 'appEntry', supportsRollback: true, route: 'content-app-entry' },
  searchMappings: { label: 'Query mappings', area: 'search', supportsRollback: true, route: 'search-query-mappings' },
  searchSynonyms: { label: 'Synonyms', area: 'search', supportsRollback: true, route: 'search-synonyms' },
  searchSpecialties: { label: 'Specialty mapping', area: 'search', supportsRollback: true, route: 'search-specialties' },
  searchRanking: { label: 'Ranking', area: 'search', supportsRollback: true, route: 'search-ranking' },
  segment: { label: 'Audience segment', area: 'audiences', supportsRollback: false, route: 'audiences' },
  locations: { label: 'Location-aware configuration', area: 'locations', supportsRollback: true, route: 'admin-settings-locations' }
};
const recLink = r => CONFIG_TYPES[r.type].route + (['campaign', 'alert', 'quickLink', 'featuredCard', 'segment'].includes(r.type) ? `-${r.id}` : '');
/* What each environment holds */
const dataAt = (r, env) => env === 'draft' ? r.draft && r.draft.data : env === 'demo' ? r.demo && r.versions[r.demo].data : r.production && r.versions[r.production].data;
const latestData = r => dataAt(r, 'draft') || dataAt(r, 'demo') || dataAt(r, 'production');
const recName = d => d.title || d.name || null;

function rec(id) { const r = DB.db.records[id]; if (!r) throw new ServiceError('That item no longer exists. It may have been deleted.'); return r; }
function guard(r, action) {
  const role = DB.session && DB.session.role;
  if (!role || !canAct(role, CONFIG_TYPES[r.type].area, action)) throw new ServiceError('Your role does not allow this action.');
}
function logEvent(r, action, environment, version, comment, before, after) {
  const e = { id: uid('ev'), action, environment, version, by: actor(), at: nowIso(), comment: comment || '' };
  r.events.push(e);
  audit(action, r.name, { targetId: r.id, targetType: r.type, environment, version, comment, before, after });
}

const ConfigService = {
  get: id => mockCall('configuration', () => rec(id)),
  list: type => mockCall('configuration', () => Object.values(DB.db.records).filter(r => !type || r.type === type)),
  peek: id => DB.db.records[id] ? clone(DB.db.records[id]) : null, /* synchronous read for previews and pickers */
  peekAll: type => clone(Object.values(DB.db.records).filter(r => r.type === type)),
  create: (type, data, comment) => mockCall('configuration', () => {
    const area = CONFIG_TYPES[type].area; needs(area, 'draft');
    const id = `${type.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}-${Date.now().toString(36)}`;
    const r = { id, type, name: recName(data) || CONFIG_TYPES[type].label, versions: {}, production: null, demo: null, draft: null, review: null, nextVersion: 1, events: [] };
    r.draft = { data: clone(data), updatedBy: actor(), updatedAt: nowIso(), comment: comment || '', baseVersion: null };
    DB.db.records[id] = r;
    logEvent(r, 'Created as draft', 'draft', null, comment, null, data);
    return r;
  }),
  remove: id => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'saveDraft');
    if (r.production || r.demo) throw new ServiceError('Published items can’t be deleted. Turn the item off and publish instead, so the change is versioned.');
    delete DB.db.records[id];
    audit('Deleted draft', r.name, { targetId: id, targetType: r.type, environment: 'draft', before: r.draft && r.draft.data });
    return { id };
  }),
  saveDraft: (id, data, comment) => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'saveDraft');
    const before = latestData(r);
    r.draft = { data: clone(data), updatedBy: actor(), updatedAt: nowIso(), comment: comment || '', baseVersion: r.production };
    r.review = null;
    if (recName(data)) r.name = recName(data);
    logEvent(r, 'Draft saved', 'draft', null, comment, before, data);
    return r;
  }),
  discardDraft: id => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'saveDraft');
    const before = r.draft && r.draft.data;
    r.draft = null; r.review = null;
    const d = latestData(r); if (d && recName(d)) r.name = recName(d);
    logEvent(r, 'Draft discarded', 'draft', null, '', before, null);
    return r;
  }),
  requestReview: (id, comment) => mockCall('configuration', () => {
    const r = rec(id); guard(r, 'requestReview');
    if (!r.draft) throw new ServiceError('Save a draft before you request a review.');
    r.review = { by: actor(), at: nowIso(), comment: comment || '' };
    logEvent(r, 'Review requested', 'draft', null, comment);
    return r;
  }),
  deployToDemo: (id, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'deployDemo');
    if (!r.draft) throw new ServiceError('There is no saved draft to deploy.');
    const before = dataAt(r, 'demo');
    const v = r.nextVersion++;
    r.versions[v] = { version: v, data: clone(r.draft.data), updatedBy: actor(), updatedAt: nowIso(), comment: comment || r.draft.comment || '' };
    r.demo = v; r.draft = null; r.review = null;
    logEvent(r, 'Deployed to demo', 'demo', v, comment, before, r.versions[v].data);
    return r;
  }),
  requestChanges: (id, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'requestChanges');
    if (!r.demo || r.demo === r.production) throw new ServiceError('There is nothing on demo waiting for production.');
    r.draft = { data: clone(r.versions[r.demo].data), updatedBy: actor(), updatedAt: nowIso(), comment: `Changes requested: ${comment}`, baseVersion: r.production, changesRequested: comment };
    logEvent(r, 'Changes requested', 'demo', r.demo, comment);
    return r;
  }),
  publish: (id, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'publish');
    if (!r.demo || r.demo === r.production) throw new ServiceError('Deploy to demo and check it there before you publish.');
    if (DB.db.settings.requirePublishComment && !comment) throw new ServiceError('A comment is required to publish (Administrative settings).');
    const before = dataAt(r, 'production');
    r.production = r.demo;
    logEvent(r, 'Published to production', 'production', r.demo, comment, before, r.versions[r.demo].data);
    return r;
  }),
  rollback: (id, toVersion, comment) => mockCall('publishing', () => {
    const r = rec(id); guard(r, 'rollback');
    if (!CONFIG_TYPES[r.type].supportsRollback) throw new ServiceError(`${CONFIG_TYPES[r.type].label} does not support rollback.`);
    const old = r.versions[toVersion]; if (!old) throw new ServiceError(`Version ${toVersion} does not exist.`);
    const before = dataAt(r, 'production');
    const v = r.nextVersion++;
    r.versions[v] = { version: v, data: clone(old.data), updatedBy: actor(), updatedAt: nowIso(), comment: `Rollback to v${toVersion}: ${comment}`, rollbackOf: toVersion };
    r.production = v; r.demo = v;
    logEvent(r, `Rolled back to v${toVersion}`, 'production', v, comment, before, old.data);
    return r;
  })
};

/* ---------- Admin users ---------- */
const UserService = {
  list: () => mockCall('users', () => DB.db.users),
  get: id => mockCall('users', () => { const u = DB.db.users.find(x => x.id === id); if (!u) throw new ServiceError('That user no longer exists.'); return u; }),
  byId: id => DB.db.users.find(u => u.id === id) || null,
  name: id => { const u = UserService.byId(id); return u ? `${u.first} ${u.last}` : 'Unknown user'; },
  emailTaken: (email, exceptId) => DB.db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== exceptId),
  create: d => mockCall('users', () => {
    needs('users', 'manage');
    if (UserService.emailTaken(d.email)) throw new ServiceError(`An account already exists for ${d.email}.`);
    const u = { id: uid('u'), first: d.first.trim(), last: d.last.trim(), email: d.email.trim().toLowerCase(), role: d.role, status: 'invited', created: nowIso(), lastSignIn: null };
    DB.db.users.push(u);
    audit('User invited', `${u.first} ${u.last}`, { targetId: u.id, targetType: 'user', after: { role: ROLES[u.role].label, status: 'Invited', email: u.email } });
    return u;
  }),
  update: (id, patch) => mockCall('users', () => {
    needs('users', 'manage');
    const u = DB.db.users.find(x => x.id === id); if (!u) throw new ServiceError('That user no longer exists.');
    if (patch.email && UserService.emailTaken(patch.email, id)) throw new ServiceError(`Another account already uses ${patch.email}.`);
    if (id === actor() && patch.role && patch.role !== u.role) throw new ServiceError('You can’t change your own role. Ask another Super Admin.');
    const before = {}, after = {};
    Object.keys(patch).forEach(k => { if (u[k] !== patch[k]) { before[k] = k === 'role' ? ROLES[u[k]].label : u[k]; after[k] = k === 'role' ? ROLES[patch[k]].label : patch[k]; u[k] = patch[k]; } });
    if (Object.keys(after).length) audit(after.role ? 'Role changed' : 'User updated', `${u.first} ${u.last}`, { targetId: id, targetType: 'user', before, after });
    return u;
  }),
  setStatus: (id, status, comment) => mockCall('users', () => {
    needs('users', 'manage');
    const u = DB.db.users.find(x => x.id === id); if (!u) throw new ServiceError('That user no longer exists.');
    if (id === actor()) throw new ServiceError('You can’t deactivate your own account.');
    const label = { active: 'Active', deactivated: 'Deactivated', invited: 'Invited' };
    audit(status === 'deactivated' ? 'User deactivated' : 'User reactivated', `${u.first} ${u.last}`, { targetId: id, targetType: 'user', comment, before: { status: label[u.status] }, after: { status: label[status] } });
    u.status = status;
    return u;
  }),
  resendInvite: id => mockCall('users', () => {
    needs('users', 'manage');
    const u = DB.db.users.find(x => x.id === id);
    audit('Invitation resent', `${u.first} ${u.last}`, { targetId: id, targetType: 'user' });
    return u;
  }),
  remove: id => mockCall('users', () => {
    needs('users', 'manage');
    if (id === actor()) throw new ServiceError('You can’t delete your own account.');
    const i = DB.db.users.findIndex(x => x.id === id); if (i < 0) throw new ServiceError('That user no longer exists.');
    const [u] = DB.db.users.splice(i, 1);
    audit('User deleted', `${u.first} ${u.last}`, { targetId: id, targetType: 'user', before: { email: u.email, role: ROLES[u.role].label } });
    return u;
  })
};

/* ---------- Notifications: draft → pending approval → scheduled or sent; cancel while scheduled ---------- */
const NOTE_STATUS = { draft: 'Draft', pending: 'Pending approval', scheduled: 'Scheduled', sent: 'Sent', cancelled: 'Cancelled' };
const NotificationService = {
  list: () => mockCall('notifications', () => DB.db.notifications),
  get: id => mockCall('notifications', () => { const n = DB.db.notifications.find(x => x.id === id); if (!n) throw new ServiceError('That notification no longer exists.'); return n; }),
  save: (id, data) => mockCall('notifications', () => {
    needs('notifications', 'draft');
    if (!id) {
      const n = { ...clone(data), id: uid('n'), status: 'draft', createdBy: actor(), createdAt: nowIso(), updatedAt: nowIso(), sentAt: null, stats: null };
      DB.db.notifications.unshift(n);
      audit('Notification created', n.title, { targetId: n.id, targetType: 'notification', after: data });
      return n;
    }
    const n = DB.db.notifications.find(x => x.id === id);
    if (!['draft', 'pending'].includes(n.status)) throw new ServiceError(`${NOTE_STATUS[n.status]} notifications can’t be edited. Duplicate it instead.`);
    const before = clone(n);
    Object.assign(n, clone(data), { status: 'draft', updatedAt: nowIso() });
    audit('Notification edited', n.title, { targetId: id, targetType: 'notification', before, after: data });
    return n;
  }),
  submit: id => mockCall('notifications', () => {
    needs('notifications', 'draft');
    const n = DB.db.notifications.find(x => x.id === id); n.status = 'pending'; n.updatedAt = nowIso();
    audit('Submitted for approval', n.title, { targetId: id, targetType: 'notification' });
    return n;
  }),
  approve: (id, comment) => mockCall('notifications', () => {
    needs('notifications', 'publish');
    const n = DB.db.notifications.find(x => x.id === id);
    if (n.timing === 'now') { n.status = 'sent'; n.sentAt = nowIso(); n.stats = { delivered: 0, opened: 0, actions: 0 }; }
    else n.status = 'scheduled';
    n.updatedAt = nowIso();
    audit(n.status === 'sent' ? 'Notification sent (simulated)' : 'Notification scheduled', n.title, { targetId: id, targetType: 'notification', comment });
    return n;
  }),
  cancel: (id, comment) => mockCall('notifications', () => {
    needs('notifications', 'publish');
    const n = DB.db.notifications.find(x => x.id === id);
    if (n.status !== 'scheduled' && n.status !== 'pending') throw new ServiceError('Only scheduled or pending notifications can be cancelled.');
    n.status = 'cancelled'; n.updatedAt = nowIso();
    audit('Notification cancelled', n.title, { targetId: id, targetType: 'notification', comment });
    return n;
  }),
  duplicate: id => mockCall('notifications', () => {
    needs('notifications', 'draft');
    const src = DB.db.notifications.find(x => x.id === id);
    const n = { ...clone(src), id: uid('n'), title: `${src.title} (copy)`, status: 'draft', createdBy: actor(), createdAt: nowIso(), updatedAt: nowIso(), sentAt: null, stats: null };
    DB.db.notifications.unshift(n);
    audit('Notification duplicated', n.title, { targetId: n.id, targetType: 'notification' });
    return n;
  }),
  remove: id => mockCall('notifications', () => {
    needs('notifications', 'draft');
    const i = DB.db.notifications.findIndex(x => x.id === id); const n = DB.db.notifications[i];
    if (n.status !== 'draft' && n.status !== 'cancelled') throw new ServiceError('Only drafts and cancelled notifications can be deleted.');
    DB.db.notifications.splice(i, 1);
    audit('Notification deleted', n.title, { targetId: id, targetType: 'notification', before: n });
    return { id };
  })
};

/* ---------- Wayfinding: manual Gozio JSON. The schema checked here is a placeholder until UTSW shares a real export. ---------- */
const WAY_CATEGORIES = ['Clinic', 'Imaging', 'Lab', 'Pharmacy', 'Restroom', 'Elevator', 'Entrance', 'Parking', 'Food', 'Information', 'Other'];
function validateGozio(text) {
  const errors = [], warnings = [];
  let doc;
  try { doc = JSON.parse(text); }
  catch (e) {
    const m = /position (\d+)/.exec(e.message); let where = '';
    if (m) { const pos = +m[1], before = text.slice(0, pos); where = ` at line ${before.split('\n').length}, column ${pos - before.lastIndexOf('\n')}`; }
    return { ok: false, errors: [`The file isn’t valid JSON${where}. Export the file again from Gozio and upload the new copy.`], warnings, stats: null };
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { ok: false, errors: ['The file must contain one JSON object with venue and buildings.'], warnings, stats: null };
  if (!doc.schemaVersion) errors.push('Missing “schemaVersion”.');
  if (!doc.venue || !doc.venue.id || !doc.venue.name) errors.push('Missing “venue” with an id and a name.');
  if (!Array.isArray(doc.buildings) || !doc.buildings.length) errors.push('“buildings” must be a list with at least one building.');
  let floors = 0, dests = 0; const ids = new Set();
  (Array.isArray(doc.buildings) ? doc.buildings : []).forEach((b, bi) => {
    const bn = b && b.name ? `“${b.name}”` : `Building ${bi + 1}`;
    if (!b || !b.id || !b.name) errors.push(`${bn} needs an id and a name.`);
    if (!Array.isArray(b && b.floors) || !b.floors.length) { errors.push(`${bn} has no floors.`); return; }
    b.floors.forEach((f, fi) => {
      floors++;
      const fn = `${bn}, floor ${f && f.name ? `“${f.name}”` : fi + 1}`;
      if (typeof (f && f.level) !== 'number') errors.push(`${fn} needs a numeric “level”.`);
      if (!Array.isArray(f && f.destinations) || !f.destinations.length) { warnings.push(`${fn} has no destinations.`); return; }
      f.destinations.forEach((d, di) => {
        dests++;
        if (!d || !d.id) errors.push(`${fn}, destination ${di + 1} has no id.`);
        else if (ids.has(d.id)) errors.push(`Destination id “${d.id}” is used more than once.`);
        else ids.add(d.id);
        if (d && !d.name) warnings.push(`${fn}: destination “${d.id}” has no name, so patients can’t search for it.`);
        if (d && d.category && !WAY_CATEGORIES.includes(d.category)) errors.push(`${fn}: “${d.category}” isn’t a known category for “${d.id}”.`);
      });
    });
  });
  return { ok: !errors.length, errors: errors.slice(0, 50), moreErrors: Math.max(0, errors.length - 50), warnings, stats: { buildings: (doc.buildings || []).length, floors, destinations: dests, venue: doc.venue && doc.venue.name } };
}
const WayfindingService = {
  get: () => mockCall('wayfinding', () => DB.db.wayfinding),
  validate: text => mockCall('wayfinding validation', () => validateGozio(text)),
  upload: (fileName, sizeKb, stats, comment) => mockCall('wayfinding upload', () => {
    needs('wayfinding', 'publish');
    const w = DB.db.wayfinding, v = Math.max(...w.versions.map(x => x.version)) + 1;
    w.versions.forEach(x => { if (x.status === 'validated') x.status = 'superseded'; });
    w.versions.push({ version: v, fileName, sizeKb, by: actor(), at: nowIso(), status: 'validated', buildings: stats.buildings, floors: stats.floors, destinations: stats.destinations, warnings: stats.warnings || 0, comment });
    w.history.push({ at: nowIso(), by: actor(), action: 'Uploaded and validated', version: v, environment: 'draft', comment });
    audit('Wayfinding file uploaded', fileName, { targetType: 'wayfinding', version: v, environment: 'draft', comment, after: stats });
    return w;
  }),
  publish: (version, env, comment) => mockCall('wayfinding publishing', () => {
    needs('wayfinding', 'publish');
    const w = DB.db.wayfinding, v = w.versions.find(x => x.version === version);
    if (env === 'production' && w.demo !== version) throw new ServiceError('Publish this version to demo and check it there first.');
    if (env === 'demo') w.demo = version; else w.production = version;
    w.versions.forEach(x => { x.status = x.version === w.production ? 'production' : x.version === w.demo ? 'demo' : ['validated', 'superseded'].includes(x.status) ? x.status : 'retired'; });
    const action = `${env === 'demo' ? 'Published to demo' : 'Published to production'}`;
    w.history.push({ at: nowIso(), by: actor(), action, version, environment: env, comment });
    audit(`Wayfinding ${action.toLowerCase()}`, v.fileName, { targetType: 'wayfinding', version, environment: env, comment });
    return w;
  }),
  rollback: (version, comment) => mockCall('wayfinding publishing', () => {
    needs('wayfinding', 'publish');
    const w = DB.db.wayfinding, from = w.production;
    w.production = version; w.demo = version;
    w.versions.forEach(x => { x.status = x.version === version ? 'production' : x.status === 'production' || x.status === 'demo' ? 'retired' : x.status; });
    w.history.push({ at: nowIso(), by: actor(), action: `Rolled back from v${from}`, version, environment: 'production', comment });
    audit('Wayfinding rolled back', `v${from} → v${version}`, { targetType: 'wayfinding', version, environment: 'production', comment, before: { version: from }, after: { version } });
    return w;
  })
};

/* ---------- Zero-result searches (would come from search analytics) ---------- */
const ZeroResultService = {
  list: () => mockCall('search analytics', () => DB.db.zeroResults),
  setStatus: (id, status) => mockCall('search analytics', () => {
    needs('search', 'publish');
    const z = DB.db.zeroResults.find(x => x.id === id); const before = z.status; z.status = status;
    audit(status === 'dismissed' ? 'Zero-result query dismissed' : 'Zero-result query resolved', z.query, { targetType: 'search', before: { status: before }, after: { status } });
    return z;
  })
};

/* ---------- Analytics: deterministic mock series (clearly labeled in the UI) ---------- */
function prng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
const ANALYTICS_END = '2026-10-30';
function series(key, days, base, spread, trend = 0, weekly = 0) {
  const r = prng(key), out = [], end = new Date(ANALYTICS_END + 'T12:00:00Z');
  for (let i = 179; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 864e5), dow = d.getUTCDay();
    const v = base + trend * (179 - i) + (r() - .5) * spread + (dow === 0 || dow === 6 ? -weekly : weekly / 3);
    out.push({ x: d.toISOString().slice(0, 10), y: v });
  }
  return out.slice(-days);
}
const METRICS = {
  adoption: [
    { key: 'dau', label: 'Daily active users', unit: 'count', base: 38000, spread: 3200, trend: 22, weekly: 6000 },
    { key: 'mau', label: 'Monthly active users', unit: 'count', base: 151000, spread: 1500, trend: 170, weekly: 0, smooth: true },
    { key: 'activation', label: 'New-user activation rate', unit: '%', base: 58, spread: 5, trend: .02 },
    { key: 'return30', label: '30-day return rate', unit: '%', base: 44, spread: 3, trend: .015 },
    { key: 'engagement', label: 'Meaningful engagement rate', unit: '%', base: 36, spread: 4, trend: .01 },
    { key: 'taskSuccess', label: 'Patient task success rate', unit: '%', base: 81, spread: 4, trend: .01 }
  ],
  search: [
    { key: 'homeCtr', label: 'Home module click-through rate', unit: '%', base: 27, spread: 4, trend: .01 },
    { key: 'searchSuccess', label: 'Unified search success rate', unit: '%', base: 76, spread: 5, trend: .02 },
    { key: 'zeroRate', label: 'Zero-result search rate', unit: '%', base: 7.8, spread: 1.6, trend: -.008, lowerBetter: true },
    { key: 'profileDiscovery', label: 'Provider profile discovery rate', unit: '%', base: 33, spread: 4, trend: .01 }
  ],
  content: [
    { key: 'articleEng', label: 'Article engagement rate', unit: '%', base: 22, spread: 4, trend: .005 },
    { key: 'resourceAct', label: 'Patient resource action rate', unit: '%', base: 15, spread: 3, trend: .01 },
    { key: 'crashFree', label: 'Crash-free session rate', unit: '%', base: 99.4, spread: .4, trend: .001 },
    { key: 'homeLoad', label: 'Home load time', unit: 's', base: 1.6, spread: .3, trend: -.001, lowerBetter: true }
  ],
  care: [
    { key: 'findCareConv', label: 'Find Care action conversion rate', unit: '%', base: 18, spread: 3, trend: .01 },
    { key: 'wayAdoption', label: 'Wayfinding adoption rate', unit: '%', base: 12, spread: 2.5, trend: .02 }
  ],
  notifications: [
    { key: 'notifConv', label: 'Notification-to-action conversion rate', unit: '%', base: 5.4, spread: 1.4, trend: .004 }
  ]
};
const AnalyticsService = {
  get: (category, days) => mockCall('analytics', () => (METRICS[category] || []).map(m => {
    const all = series(m.key, days * 2, m.base, m.spread, m.trend, m.weekly || 0);
    const cur = all.slice(-days), prev = all.slice(0, days);
    const avg = a => a.reduce((s, p) => s + p.y, 0) / a.length;
    const value = m.unit === 'count' && m.key === 'mau' ? cur[cur.length - 1].y : avg(cur);
    const pv = m.unit === 'count' && m.key === 'mau' ? prev[prev.length - 1].y : avg(prev);
    return { ...m, series: cur, value, change: pv ? (value - pv) / pv : 0 };
  }))
};

const AuditService = { list: () => mockCall('audit', () => DB.db.audit) };
const PlatformService = {
  integrations: () => mockCall('platform', () => DB.db.integrations),
  check: id => mockCall('platform', () => { const i = DB.db.integrations.find(x => x.id === id); i.lastCheck = nowIso(); audit('Integration check run (simulated)', i.name, { targetType: 'platform' }); return i; }),
  monitoring: days => mockCall('platform', () => ({
    errors: series('errs', days, 0.42, .3, 0).map(p => ({ x: p.x, y: Math.max(0.05, p.y) })),
    latency: series('lat', days, 420, 90, -.2).map(p => ({ x: p.x, y: Math.round(p.y) })),
    incidents: [
      { at: '2026-10-22T03:10:00Z', title: 'Configuration fetch slow on Android (sample)', severity: 'Minor', status: 'Resolved', minutes: 38 },
      { at: '2026-10-09T15:42:00Z', title: 'MedBlog feed timeout (sample)', severity: 'Minor', status: 'Resolved', minutes: 12 },
      { at: '2026-09-30T11:05:00Z', title: 'Push delivery delayed (sample)', severity: 'Moderate', status: 'Resolved', minutes: 74 }
    ]
  }))
};
const SettingsService = {
  get: () => mockCall('settings', () => DB.db.settings),
  save: data => mockCall('settings', () => {
    needs('adminSettings', 'publish');
    const before = clone(DB.db.settings); Object.assign(DB.db.settings, data);
    audit('Administrative settings changed', 'Administrative settings', { targetType: 'settings', before, after: DB.db.settings });
    return DB.db.settings;
  })
};
