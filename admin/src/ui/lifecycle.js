/* ---------- Publishing workflow panel (Draft → Demo → Production), shared by every config editor ----------
   opts: { host, area, noun, getRec, getWorking, isDirty, isNew, describe(from, to), validate(), onSaved(rec, kind), onDiscard(), afterDelete() } */
const changeList = items => items.length
  ? `<ul class="changes">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
  : '<p class="muted">No differences.</p>';

function Lifecycle(opts) {
  const role = () => Session.role();
  const may = a => canAct(role(), opts.area, a);
  const demoAhead = r => !!r && !!r.demo && r.demo !== r.production;
  const lastEvent = (r, env, version) => [...r.events].reverse().find(e => e.environment === env && (version == null || e.version === version));
  const when = e => e ? `${fmtDateTime(e.at)} by ${esc(UserService.name(e.by))}` : '';
  let reason = {};

  function render() {
    const r = opts.getRec(), d = opts.isDirty(), isNew = opts.isNew && opts.isNew();
    const host = opts.host();
    if (!host) return;
    const stage = d || isNew || (r && r.draft) ? 0 : demoAhead(r) ? 1 : 2;
    const stateOf = i => i < stage ? 'done' : i === stage ? (stage === 2 ? 'done' : 'current') : 'todo';
    const steps = [
      { title: 'Draft', state: stateOf(0), detail: isNew ? `${badge('unsaved', 'New – not saved')}` : d ? `${badge('unsaved')} Not saved yet` : r.draft
        ? `${r.draft.changesRequested ? badge('changes') : r.review ? badge('review') : badge('draft', 'Saved')} ${when(lastEvent(r, 'draft'))}` : 'No open draft' },
      { title: 'Demo', state: stateOf(1), detail: r && r.demo ? `${badge('demo', `v${r.demo}`)} ${when(lastEvent(r, 'demo', r.demo))}` : 'Nothing on demo' },
      { title: 'Production', state: stateOf(2), detail: r && r.production ? `${badge('production', `v${r.production}`)} ${when(lastEvent(r, 'production', r.production))}` : 'Not published' }
    ];
    reason = {};
    const acts = [];
    const add = (key, label, variant, ok, why, icon) => {
      acts.push(btn({ label, icon, variant, size: 'sm', attrs: `data-lc="${key}" ${ok ? '' : `aria-disabled="true" aria-describedby="why-${key}"`}` }));
      if (!ok) reason[key] = why;
    };
    const hasDraft = r && r.draft, draftOnly = !!opts.draftOnly;
    const next = d || isNew ? 'save' : hasDraft ? (may('deployDemo') ? 'deploy' : 'review') : demoAhead(r) ? 'publish' : null;
    const v = k => (k === next ? 'primary' : 'secondary');
    if (!isNew && d) acts.push(btn({ label: 'Discard changes', variant: 'text', size: 'sm', attrs: 'data-lc="discard"' }));
    else if (hasDraft && may('saveDraft')) acts.push(btn({ label: 'Discard draft', variant: 'text', size: 'sm', attrs: 'data-lc="discardDraft"' }));
    if (r && !r.production && !r.demo && may('saveDraft')) acts.push(btn({ label: 'Delete', icon: 'delete', variant: 'text', size: 'sm', attrs: 'data-lc="delete"' }));
    if (may('saveDraft')) add('save', isNew ? 'Save as draft' : 'Save draft', v('save'), d || isNew, 'There are no unsaved changes to save.', 'save');
    if (!isNew && may('requestReview') && !may('deployDemo')) add('review', r.review ? 'Review requested' : 'Request review', v('review'), !!hasDraft && !d && !r.review,
      d ? 'Save the draft before you request a review.' : r.review ? 'A review is already requested for this draft.' : 'Save a draft first, then request a review.', 'rate_review');
    if (!isNew && !draftOnly && may('deployDemo')) add('deploy', 'Deploy to demo', v('deploy'), !!hasDraft && !d, d ? 'Save the draft first. Demo only takes saved drafts.' : 'Save a draft first. Demo only takes saved drafts.', 'science');
    if (!isNew && !draftOnly && may('requestChanges') && demoAhead(r)) acts.push(btn({ label: 'Request changes', icon: 'undo', variant: 'secondary', size: 'sm', attrs: 'data-lc="changes"' }));
    if (!isNew && !draftOnly && may('publish')) add('publish', 'Publish to production', v('publish'), demoAhead(r), r && r.production ? `Production v${r.production} already matches demo. Deploy a new version to demo first.` : 'Deploy to demo and check it there first.', 'public');
    const lvl = levelOf(role(), opts.area);
    const note = lvl === 'view' ? `You can view this ${opts.noun}. Your role, ${ROLES[role()].label}, can’t change it.`
      : !may('deployDemo') ? `As ${ROLES[role()].label}, you can save drafts and request a review. An Admin or Super Admin deploys to demo and publishes.`
      : !may('publish') ? `As ${ROLES[role()].label}, you can deploy to demo. An Admin or Super Admin publishes to production.` : '';
    const status = !draftOnly ? '' : d || isNew ? `${badge('unsaved', isNew ? 'New – not saved' : 'Unsaved changes')}<span>Save a draft, then deploy it from Publishing above.</span>`
      : hasDraft ? `${r.draft.changesRequested ? badge('changes') : r.review ? badge('review') : badge('draft', 'Saved draft')}<span>${when(lastEvent(r, 'draft'))}. Deploy it with the other drafts from Publishing above.</span>`
      : `${r.production ? badge('production', `Production v${r.production}`) : ''}${demoAhead(r) ? badge('demo', `Demo v${r.demo}`) : ''}<span>No open draft. Edit below to start one.</span>`;
    /* Full mode, same row: where the newest changes are, as three tags */
    const chips = `${d || isNew ? badge('unsaved', isNew ? 'New – not saved' : 'Unsaved changes') : hasDraft ? (r.draft.changesRequested ? badge('changes') : r.review ? badge('review') : badge('draft', 'Saved draft')) : '<span class="muted">No open draft</span>'}
      ${r && r.demo ? badge('demo', `Demo v${r.demo}`) : ''}${r && r.production ? badge('production', `Production v${r.production}`) : '<span class="muted">Not published</span>'}`;
    host.innerHTML = `<div class="lc-row"><h2 id="lc-h" class="lc-row-h" tabindex="-1">${draftOnly ? 'Draft' : 'Publishing'}</h2>
      <p class="lc-status">${draftOnly ? status : chips}</p>${acts.length ? `<div class="lc-actions">${acts.join('')}</div>` : ''}</div>`;
    host.innerHTML += `
      ${Object.entries(reason).map(([k, t]) => `<span class="vh" id="why-${k}">${esc(t)}</span>`).join('')}
      ${note ? `<p class="role-note">${ic('info', 20)}<span>${esc(note)} Permissions are proposed, pending confirmation.</span></p>` : ''}`;
    host.onclick = e => { const b = e.target.closest('[data-lc]'); if (b) act(b); };
  }

  async function act(b) {
    const key = b.dataset.lc;
    if (b.getAttribute('aria-disabled') === 'true') { toast(reason[key]); return; }
    const r = opts.getRec();
    const run = async (fn, busyLabel, msg, kind) => {
      setBusy(b, true, busyLabel);
      try { const rec = await fn(); opts.onSaved(rec, kind); hubRenderBar(); toast(msg, { kind: 'success' }); announce(msg); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    };
    const needComment = DB.db.settings.requirePublishComment;
    if (key === 'save') {
      if (opts.validate && !opts.validate()) { toast('Fix the highlighted fields, then save again.', { kind: 'error' }); return; }
      if (opts.isNew && opts.isNew()) return run(() => opts.create(opts.getWorking()), 'Saving draft', `Draft saved. The ${opts.noun} isn’t on demo or production yet.`, 'created');
      return run(() => ConfigService.saveDraft(r.id, opts.getWorking(), ''), 'Saving draft', 'Draft saved. It isn’t on demo or production yet.', 'save');
    }
    if (key === 'discard') {
      const base = r.draft ? r.draft.data : dataAt(r, 'production') || dataAt(r, 'demo');
      const c = await confirmDialog({ title: 'Discard unsaved changes?', body: `<p>The editor goes back to ${r.draft ? 'your saved draft' : `production v${r.production}`}. These changes are lost:</p>${changeList(opts.describe(base, opts.getWorking()))}`, confirmLabel: 'Discard changes', variant: 'danger', cancelLabel: 'Keep editing' });
      if (c.ok) { opts.onDiscard(); announce('Changes discarded'); }
      return;
    }
    if (key === 'discardDraft') {
      const c = await confirmDialog({ title: 'Discard the saved draft?', body: `<p>The draft is deleted${r.production ? ` and the editor goes back to production v${r.production}` : ''}. Demo and production don’t change.</p>`, confirmLabel: 'Discard draft', variant: 'danger' });
      if (c.ok) run(() => ConfigService.discardDraft(r.id), 'Discarding draft', 'Draft discarded.', 'discardDraft');
      return;
    }
    if (key === 'delete') {
      const c = await confirmDialog({ title: `Delete this ${opts.noun}?`, body: `<p>“${esc(r.name)}” has never been published, so it’s deleted for good. The audit log keeps a record.</p>`, confirmLabel: `Delete ${opts.noun}`, variant: 'danger' });
      if (!c.ok) return;
      setBusy(b, true, 'Deleting');
      try { await ConfigService.remove(r.id); toast(`Deleted “${r.name}”.`, { kind: 'success' }); opts.afterDelete(); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
      return;
    }
    if (key === 'review') {
      const c = await confirmDialog({ title: 'Request a review?', body: '<p>An Admin or Super Admin checks the draft and deploys it to demo. The request shows on their Dashboard.</p>', confirmLabel: 'Request review', comment: { label: 'Note for the reviewer', hint: 'Optional' } });
      if (c.ok) run(() => ConfigService.requestReview(r.id, c.comment), 'Requesting review', 'Review requested.', 'review');
      return;
    }
    if (key === 'deploy') {
      const c = await confirmDialog({ title: `Deploy to demo as v${r.nextVersion}?`, wide: true, body: `<p>The saved draft becomes version ${r.nextVersion} in the demo environment, for checking on demo devices. ${r.production ? `Production stays on v${r.production}, so patients see no change.` : 'Nothing is in production yet.'}</p><h3 class="sub-h">Changes from ${r.demo ? `demo v${r.demo}` : 'empty'}</h3>${changeList(opts.describe(dataAt(r, 'demo'), r.draft.data))}`, confirmLabel: 'Deploy to demo', comment: { label: 'Comment', hint: 'Optional. Shown in the change history.', value: r.draft.comment || '' } });
      if (c.ok) run(() => ConfigService.deployToDemo(r.id, c.comment), 'Deploying to demo', `Deployed to demo as v${r.nextVersion}. Production is unchanged.`, 'deploy');
      return;
    }
    if (key === 'changes') {
      const c = await confirmDialog({ title: `Request changes to demo v${r.demo}?`, body: '<p>The demo version goes back to a draft with your comment, so it can be fixed and deployed again. Production doesn’t change.</p>', confirmLabel: 'Request changes', comment: { label: 'What needs to change', required: true } });
      if (c.ok) run(() => ConfigService.requestChanges(r.id, c.comment), 'Requesting changes', 'Changes requested. The demo version is back in draft.', 'changes');
      return;
    }
    if (key === 'publish') {
      const c = await confirmDialog({ title: `Publish v${r.demo} to production?`, wide: true, body: `<div class="warn-box">${ic('public', 20)}<p>Production is what patients see in the MyCare app. In this prototype, publishing is simulated.</p></div>
        <h3 class="sub-h">Changes from ${r.production ? `production v${r.production}` : 'nothing published'}</h3>${changeList(opts.describe(dataAt(r, 'production'), r.versions[r.demo].data))}
        ${r.draft || opts.isDirty() ? '<p class="muted">Your open draft isn’t included. Only the version checked on demo is published.</p>' : ''}`,
        confirmLabel: `Publish v${r.demo}`, comment: { label: 'Comment', required: needComment, hint: needComment ? 'Required by Administrative settings.' : 'Optional. Shown in the change history.' } });
      if (c.ok) run(() => ConfigService.publish(r.id, c.comment), 'Publishing', `Published v${r.demo} to production.`, 'publish');
    }
  }
  return { render };
}

/* Change history table with rollback where the type supports it */
function historyCard(id = 'hist') {
  return `<section class="card" aria-labelledby="${id}-h"><div class="card-head"><h2 id="${id}-h" tabindex="-1">History</h2>
      <div class="card-actions">${segmented({ id: `${id}-view`, label: 'Show', options: [['versions', 'Versions'], ['events', 'Change history']], value: 'versions' })}</div></div>
    <div class="card-body"><div id="${id}-v"></div><div id="${id}" hidden></div></div></section>`;
}
function mountHistory({ hostId = 'hist', getRec, describe, onSaved }) {
  const r0 = getRec(), type = CONFIG_TYPES[r0.type];
  const canRb = () => type.supportsRollback && canAct(Session.role(), type.area, 'rollback');
  const rollback = async (version, b) => {
    const r = getRec();
    const c = await confirmDialog({ title: `Roll back to v${version}?`, wide: true, body: `<p>This creates version ${r.nextVersion} with the contents of v${version} and puts it on demo and production. Production v${r.production} stays in the history.</p>
      <h3 class="sub-h">Changes from production v${r.production}</h3>${changeList(describe(dataAt(r, 'production'), r.versions[version].data))}`,
      confirmLabel: `Roll back to v${version}`, variant: 'danger', comment: { label: 'Reason for the rollback', required: true } });
    if (!c.ok) return;
    if (b) setBusy(b, true, 'Rolling back');
    try { const rec = await ConfigService.rollback(r.id, version, c.comment); onSaved(rec, 'rollback'); toast(`Rolled back. Production is now v${rec.production}, a copy of v${version}.`, { kind: 'success' }); $(`#${hostId}-h`).focus(); }
    catch (err) { if (b) setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
  };
  /* Versions: every saved version, where it is now, what it changes, and a way back to it */
  const where = (r, v) => `${r.production === v ? badge('production', 'In production') : ''}${r.demo === v && r.demo !== r.production ? badge('demo', 'On demo') : ''}${r.versions[v].rollbackOf ? badge('pending', `Copy of v${r.versions[v].rollbackOf}`) : ''}`;
  const viewVersion = v => {
    const r = getRec(), ver = r.versions[v], ok = canRb() && v !== r.production;
    const m = openModal({ title: `Version ${v}`, wide: true,
      body: `<dl class="facts cols"><dt>Saved</dt><dd>${esc(fmtDateTime(ver.updatedAt))} by ${esc(UserService.name(ver.updatedBy))}</dd><dt>Comment</dt><dd>${ver.comment ? esc(ver.comment) : '<span class="muted">None</span>'}</dd><dt>Where</dt><dd>${where(r, v) || '<span class="muted">Not on demo or production</span>'}</dd></dl>
        <h3 class="sub-h">${v === r.production ? 'This is the version in production' : `Compared with production v${r.production}`}</h3>${v === r.production ? '' : changeList(describe(dataAt(r, 'production'), ver.data))}`,
      actions: `${btn({ label: 'Close', variant: 'text', attrs: 'data-close' })}${ok ? btn({ label: `Roll back to v${v}`, icon: 'history', variant: 'danger', attrs: `data-vrb="${v}"` }) : ''}`,
      onOpen(d, close) { d.addEventListener('click', e => { const b = e.target.closest('[data-vrb]'); if (b) { e.preventDefault(); close(); rollback(v, null); } }); } });
    return m;
  };
  const versionsTable = () => dataTable($(`#${hostId}-v`), { hideCount: true,
    id: `${hostId}v`, caption: 'Versions', noun: 'version', searchPlaceholder: 'Search versions and comments',
    rows: Object.values(getRec().versions), defaultSort: { key: 'version', dir: 'desc' },
    searchText: v => `v${v.version} ${v.comment || ''} ${UserService.name(v.updatedBy)}`,
    empty: { icon: 'history', title: 'No versions yet', text: 'A version is made each time a draft goes to demo.' },
    columns: [
      { key: 'version', label: 'Version', sortable: true, render: v => `<span class="ord-chip">v${v.version}</span>`, cls: 'ord' },
      { key: 'saved', label: 'Saved', sortable: true, sortValue: v => v.updatedAt, render: v => `<span class="nowrap">${esc(fmtDateTime(v.updatedAt))}</span>` },
      { key: 'by', label: 'By', render: v => esc(UserService.name(v.updatedBy)) },
      { key: 'comment', label: 'Comment', render: v => v.comment ? esc(v.comment) : '<span class="muted">None</span>', cls: 'wrap' },
      { key: 'where', label: 'Where', render: v => `<span class="badges">${where(getRec(), v.version)}</span>` },
      { key: 'acts', label: 'Actions', hideLabel: true, render: v => { const r = getRec(); return `<span class="row-acts">${btn({ label: 'View', icon: 'visibility', variant: 'text', size: 'sm', attrs: `data-vview="${v.version}" aria-label="View version ${v.version}"` })}${canRb() && v.version !== r.production ? btn({ label: 'Roll back', icon: 'history', variant: 'text', size: 'sm', attrs: `data-rollback="${v.version}" aria-label="Roll back to version ${v.version}"` }) : ''}</span>`; } }
    ],
    onRender(tbody) { tbody.onclick = ev => { const vb = ev.target.closest('[data-vview]'), rb = ev.target.closest('[data-rollback]'); if (vb) viewVersion(+vb.dataset.vview); if (rb) rollback(+rb.dataset.rollback, rb); }; }
  });
  const vt = versionsTable();
  const toggle = $(`#${hostId}-view`);
  if (toggle) wireSegmented(toggle, k => { $(`#${hostId}-v`).hidden = k !== 'versions'; $(`#${hostId}`).hidden = k !== 'events'; });
  const events = dataTable($(`#${hostId}`), { hideCount: true,
    id: hostId, caption: 'Change history', noun: 'change', searchPlaceholder: 'Search events, people and comments',
    rows: r0.events, defaultSort: { key: 'at', dir: 'desc' },
    searchText: e => `${e.action} ${UserService.name(e.by)} ${e.comment} v${e.version || ''}`,
    filters: [
      { key: 'env', label: 'Environment', options: [['draft', 'Draft'], ['demo', 'Demo'], ['production', 'Production']], match: (e, v) => e.environment === v },
      { key: 'by', label: 'Changed by', options: DB.db.users.map(u => [u.id, `${u.first} ${u.last}`]), match: (e, v) => e.by === v }
    ],
    empty: { icon: 'history', title: 'No changes yet', text: 'Saved drafts, deployments and publications appear here.' },
    columns: [
      { key: 'at', label: 'When', sortable: true, render: e => `<span class="nowrap">${esc(fmtDateTime(e.at))}</span>` },
      { key: 'action', label: 'Event', sortable: true, render: e => esc(e.action) },
      { key: 'environment', label: 'Environment', render: e => badge(e.environment) },
      { key: 'version', label: 'Version', sortable: true, sortValue: e => e.version || 0, render: e => e.version ? `v${e.version}` : '<span class="muted">–</span>', cls: 'num' },
      { key: 'by', label: 'By', render: e => esc(UserService.name(e.by)) },
      { key: 'comment', label: 'Comment', render: e => e.comment ? esc(e.comment) : '<span class="muted">None</span>', cls: 'wrap' },
      { key: 'acts', label: 'Actions', hideLabel: true, render: e => { const r = getRec(); return canRb() && e.environment === 'production' && e.version && e.version !== r.production && r.versions[e.version]
        ? btn({ label: `Roll back to v${e.version}`, icon: 'history', variant: 'text', attrs: `data-rollback="${e.version}"` }) : ''; } }
    ],
    onRender(tbody) { tbody.onclick = ev => { const b = ev.target.closest('[data-rollback]'); if (b) rollback(+b.dataset.rollback, b); }; }
  });
  return { update(rows) { events.update(rows); vt.update(Object.values(getRec().versions)); } };
}

/* Environment status badges for list rows */
function envBadges(r) {
  const out = [];
  if (r.production) out.push(badge('production', `Production v${r.production}`));
  if (r.demo && r.demo !== r.production) out.push(badge('demo', `Demo v${r.demo}`));
  if (r.draft) out.push(r.review ? badge('review') : r.draft.changesRequested ? badge('changes') : badge('draft'));
  return `<span class="badges">${out.join('')}</span>`;
}
const envRank = r => r.draft ? 'draft' : r.demo !== r.production ? 'demo' : 'production';
