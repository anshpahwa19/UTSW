/* ---------- Home screen management → Layout ----------
   Order and visibility of the home modules per audience, a live preview built from the designs/guest modules,
   and the Draft → Demo → Production lifecycle on the mock ConfigService. */
/* EXTRA_GLYPHS: save rate_review science public */
const AREA = 'homeLayout';
const AUDIENCES = [['guest', 'Guest'], ['authenticated', 'Authenticated']];
const modLabel = id => (HOME_MODULES[id] || {}).label || id;

/* Plain-language list of what changes between two module lists */
function describeChanges(from, to) {
  const out = [];
  const pos = list => Object.fromEntries(list.map((m, i) => [m.id, i + 1]));
  const pf = pos(from), pt = pos(to);
  to.forEach(m => {
    const was = from.find(x => x.id === m.id);
    if (!was) { out.push(`${modLabel(m.id)} is added at position ${pt[m.id]}${m.on ? '' : ', hidden'}`); return; }
    if (pf[m.id] !== pt[m.id]) out.push(`${modLabel(m.id)} moves from position ${pf[m.id]} to ${pt[m.id]}`);
    if (was.on !== m.on) out.push(`${modLabel(m.id)} is ${m.on ? 'shown' : 'hidden'}`);
  });
  from.forEach(m => { if (!pt[m.id]) out.push(`${modLabel(m.id)} is removed`); });
  return out;
}
const changeList = items => items.length
  ? `<ul class="changes">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
  : '<p class="muted">No differences in module order or visibility.</p>';

BUILT_PAGES['home-layout'] = (() => {
  let st, main;
  const role = () => Session.role();
  const may = a => canAct(role(), AREA, a);
  const base = () => st.rec.draft ? st.rec.draft.data : st.rec.production ? st.rec.versions[st.rec.production].data : null;
  const dirty = () => !!base() && !same(st.working, base().modules);
  const demoAhead = () => !!st.rec.demo && st.rec.demo !== st.rec.production;
  const lastEvent = (env, version) => [...st.rec.events].reverse().find(e => e.environment === env && (version == null || e.version === version));
  const when = e => e ? `${fmtDateTime(e.at)} by ${esc(UserService.name(e.by))}` : '';

  function render(host) {
    main = host;
    st = st && st.keep ? { ...st, keep: false } : { aud: 'guest', rec: null, working: null, src: 'working', theme: 'light', showAlert: false };
    main.innerHTML = `<div class="page hl">
      ${pageHead({ crumbs: [['Home screen management', null]], title: 'Home screen layout',
        lede: 'Choose which modules patients see on the MyCare home screen and in what order. Changes stay in your draft until they are deployed to demo and then published to production.' })}
      <div class="tabs" role="tablist" aria-label="Audience">${AUDIENCES.map(([k, l]) =>
        `<button type="button" role="tab" id="aud-${k}" aria-controls="aud-panel" aria-selected="${k === st.aud}" tabindex="${k === st.aud ? 0 : -1}" data-aud="${k}">${esc(l)}</button>`).join('')}</div>
      <div id="aud-panel" role="tabpanel" aria-labelledby="aud-${st.aud}"></div>
    </div>`;
    wireTabs();
    load();
  }

  function wireTabs() {
    const tabs = $$('[role="tab"]', main);
    const pick = async (t, focus) => {
      if (t.dataset.aud === st.aud) return;
      if (dirty()) {
        const r = await confirmDialog({ title: 'Discard unsaved changes?', body: `<p>You have unsaved changes to the ${st.aud} layout. Switching audiences discards them.</p>`, confirmLabel: 'Discard and switch', variant: 'danger', cancelLabel: 'Keep editing' });
        if (!r.ok) return;
      }
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      if (focus) t.focus();
      st.aud = t.dataset.aud; st.src = 'working';
      $('#aud-panel').setAttribute('aria-labelledby', t.id);
      load();
    };
    tabs.forEach((t, i) => {
      t.onclick = () => pick(t);
      t.onkeydown = e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
      };
    });
  }

  async function load() {
    const panel = $('#aud-panel');
    panel.innerHTML = loadingState('Loading the layout');
    if (st.preview) { st.preview.destroy(); st.preview = null; }
    try {
      st.rec = await ConfigService.get(`home-layout-${st.aud}`);
    } catch (err) {
      panel.innerHTML = errorState(err.message);
      $('[data-retry]', panel).onclick = load;
      return;
    }
    if (st.rec.pending) {
      panel.innerHTML = emptyState({ icon: 'design_services', title: 'No authenticated home design yet',
        text: `${esc(st.rec.pending)} The signed-in home is the next design round. Once UTSW confirms its modules, this tab gets the same editor as Guest. Until then nothing here is published to patients.` });
      Router.clearGuard();
      return;
    }
    st.working = clone(base().modules);
    panel.innerHTML = `
      <section class="card lc" aria-labelledby="lc-h"><div class="card-head"><h2 id="lc-h">Publishing</h2><div id="lc-badges" class="card-actions"></div></div><div class="card-body" id="lc"></div></section>
      <div class="hl-grid">
        <div class="hl-edit" id="editor"></div>
        <aside class="hl-preview" aria-labelledby="pv-h">
          <section class="card pv-card"><div class="card-head"><h2 id="pv-h">Mobile preview</h2></div><div class="card-body">
            <div id="pv-controls"></div>
            <div class="pv-host" id="pv-host"></div>
            <p class="pv-note">${ic('info', 16)}<span>Drawn with the designs/guest home modules and sample content. It is not the live app.</span></p>
          </div></section>
        </aside>
      </div>
      <section class="card" aria-labelledby="hist-h"><div class="card-head"><h2 id="hist-h">Change history</h2><div class="card-actions">${badge(CONFIG_TYPES.homeLayout.supportsRollback ? 'pending' : 'fixed', CONFIG_TYPES.homeLayout.supportsRollback ? 'Rollback supported – assumed, pending confirmation' : 'No rollback for this type')}</div></div>
        <div class="card-body" id="history"></div></section>`;
    st.preview = mountPreview($('#pv-host'), { title: 'Mobile preview of the guest home screen' });
    st.table = dataTable($('#history'), historyConfig());
    Router.setGuard(async () => {
      if (!dirty()) return true;
      const r = await confirmDialog({ title: 'Leave without saving?', body: '<p>Your changes to the layout are not saved. If you leave, they are lost.</p>', confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
      return r.ok;
    });
    renderAll();
  }

  /* ---------- Lifecycle: stepper and actions ---------- */
  function renderLifecycle() {
    const r = st.rec, d = dirty(), stage = d || r.draft ? 0 : demoAhead() ? 1 : 2;
    const stateOf = i => i < stage ? 'done' : i === stage ? (stage === 2 ? 'done' : 'current') : 'todo';
    const draftEv = r.draft && lastEvent('draft');
    const steps = [
      { title: 'Draft', state: stateOf(0), detail: d ? `${badge('unsaved')} Not saved yet` : r.draft
        ? `${r.draft.changesRequested ? badge('changes') : r.review ? badge('review') : badge('draft', 'Saved')} ${when(draftEv)}` : 'No open draft' },
      { title: 'Demo', state: stateOf(1), detail: r.demo ? `${badge('demo', `v${r.demo}`)} ${when(lastEvent('demo', r.demo))}` : 'Nothing on demo' },
      { title: 'Production', state: stateOf(2), detail: r.production ? `${badge('production', `v${r.production}`)} ${when(lastEvent('production', r.production))}` : 'Not published' }
    ];
    const acts = [];
    const reason = {};
    const add = (key, label, variant, ok, why, icon) => {
      acts.push(btn({ label, icon, variant, attrs: `data-act="${key}" ${ok ? '' : `aria-disabled="true" aria-describedby="why-${key}"`}` }));
      if (!ok) reason[key] = why;
    };
    const next = d ? 'save' : r.draft ? (may('deployDemo') ? 'deploy' : 'review') : demoAhead() ? 'publish' : null;
    const v = k => (k === next ? 'primary' : 'secondary');
    if (d) acts.push(btn({ label: 'Discard changes', variant: 'text', attrs: 'data-act="discard"' }));
    else if (r.draft && may('saveDraft')) acts.push(btn({ label: 'Discard draft', variant: 'text', attrs: 'data-act="discardDraft"' }));
    if (may('saveDraft')) add('save', 'Save draft', v('save'), d, 'There are no unsaved changes to save.', 'save');
    if (may('requestReview') && !may('deployDemo')) add('review', r.review ? 'Review requested' : 'Request review', v('review'), !!r.draft && !d && !r.review,
      d ? 'Save the draft before you request a review.' : r.review ? 'A review is already requested for this draft.' : 'Save a draft first, then request a review.', 'rate_review');
    if (may('deployDemo')) add('deploy', 'Deploy to demo', v('deploy'), !!r.draft && !d, d ? 'Save the draft first. Demo only takes saved drafts.' : 'Save a draft first. Demo only takes saved drafts.', 'science');
    if (may('requestChanges') && demoAhead()) acts.push(btn({ label: 'Request changes', icon: 'undo', variant: 'secondary', attrs: 'data-act="changes"' }));
    if (may('publish')) add('publish', 'Publish to production', v('publish'), demoAhead(), `Production v${r.production} already matches demo. Deploy a new version to demo and check it there first.`, 'public');
    const note = !may('deployDemo')
      ? `<p class="role-note">${ic('info', 20)}<span>As ${esc(ROLES[role()].label)}, you can save drafts and request a review. Deploying to demo and publishing need Admin or Super Admin. These permissions are proposed and pending confirmation.</span></p>` : '';
    $('#lc').innerHTML = `${stepper(steps, 'Where the newest layout changes are')}
      <div class="lc-actions">${acts.join('')}</div>
      ${Object.entries(reason).map(([k, t]) => `<span class="vh" id="why-${k}">${esc(t)}</span>`).join('')}
      ${note}`;
    $('#lc-badges').innerHTML = `${badge('mock')}${d ? badge('unsaved') : ''}`;
    $('#lc').onclick = e => { const b = e.target.closest('[data-act]'); if (b) act(b, reason); };
  }

  /* ---------- Editor: fixed header, ordered modules, library ---------- */
  function renderEditor(focus) {
    const ro = !may('saveDraft');
    const allowed = AUDIENCE_MODULES[st.aud];
    const lib = allowed.filter(id => !st.working.some(m => m.id === id));
    const n = st.working.length;
    const row = (m, i) => {
      const meta = HOME_MODULES[m.id];
      return `<li class="mod-row${m.on ? '' : ' is-off'}" data-id="${m.id}">
        <span class="mod-pos" aria-hidden="true">${i + 1}</span>
        <span class="mod-ic">${ic(meta.icon, 20)}</span>
        <span class="mod-txt"><span class="mod-t" id="mt-${m.id}">${esc(meta.label)}<span class="vh">, position ${i + 1} of ${n}</span></span><span class="mod-d">${esc(meta.desc)}</span></span>
        ${badge(m.on ? 'visible' : 'hidden')}
        ${ro ? '' : `<span class="mod-ctl">
          ${switchBtn({ id: `vis-${m.id}`, checked: m.on, label: `Show ${meta.label} on the home screen`, attrs: 'data-act="vis"' })}
          <button type="button" class="btn btn-text btn-icon" data-act="up" aria-label="Move ${esc(meta.label)} up" ${i === 0 ? 'disabled' : ''}>${ic('arrow_upward', 20)}</button>
          <button type="button" class="btn btn-text btn-icon" data-act="down" aria-label="Move ${esc(meta.label)} down" ${i === n - 1 ? 'disabled' : ''}>${ic('arrow_downward', 20)}</button>
          <button type="button" class="btn btn-text btn-icon" data-act="remove" aria-label="Remove ${esc(meta.label)} from the layout">${ic('remove_circle', 20)}</button>
        </span>`}
      </li>`;
    };
    $('#editor').innerHTML = card({ title: `${st.aud === 'guest' ? 'Guest' : 'Authenticated'} home modules`, titleId: 'ed-h', actions: ro ? badge('fixed', 'View only') : '', body: `
      <h3 class="sub-h">Fixed at the top</h3>
      <ul class="fixed-list">${HOME_FIXED.map(f => `<li>${ic(f.icon, 20)}<span class="mod-txt"><span class="mod-t">${esc(f.label)}</span><span class="mod-d">${esc(f.desc)}</span></span>${badge('fixed')}</li>`).join('')}</ul>
      <h3 class="sub-h" id="ord-h">Modules, in order</h3>
      <p class="hint-line">Use the arrows to reorder. Hidden modules keep their place but patients don’t see them.</p>
      ${n ? `<ol class="mod-list" aria-labelledby="ord-h">${st.working.map(row).join('')}</ol>`
        : emptyState({ icon: 'view_agenda', title: 'No modules on this layout', text: 'Add modules from the library below.', level: 4 })}
      <h3 class="sub-h" id="lib-h">Module library</h3>
      ${lib.length ? `<ul class="lib-list" aria-labelledby="lib-h">${lib.map(id => `<li class="lib-row" data-id="${id}">
          <span class="mod-ic">${ic(HOME_MODULES[id].icon, 20)}</span><span class="mod-txt"><span class="mod-t">${esc(HOME_MODULES[id].label)}</span><span class="mod-d">${esc(HOME_MODULES[id].desc)}</span></span>
          ${ro ? '' : btn({ label: 'Add to layout', icon: 'add', variant: 'tonal', attrs: `data-act="add" aria-label="Add ${esc(HOME_MODULES[id].label)} to the layout"` })}</li>`).join('')}</ul>`
        : `<p class="lib-empty">${ic('check_circle', 20)}<span>Every ${st.aud} module is on the layout. Remove one to move it here.</span></p>`}` });
    $('#editor').onclick = editorClick;
    if (focus) {
      const sel = focus.id ? `[data-id="${focus.id}"] [data-act="${focus.act}"]` : focus.sel;
      let el = sel && $(sel, main);
      if (el && el.disabled) el = $(`[data-id="${focus.id}"] [data-act="${focus.act === 'up' ? 'down' : 'up'}"]`, main);
      (el && !el.disabled ? el : $('#ord-h')).focus();
    }
  }

  function editorClick(e) {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const rowEl = b.closest('[data-id]'), id = rowEl && rowEl.dataset.id, i = st.working.findIndex(m => m.id === id);
    const label = modLabel(id);
    if (b.dataset.act === 'vis') {
      st.working[i].on = !st.working[i].on;
      announce(`${label} ${st.working[i].on ? 'shown' : 'hidden'}`);
      update({ id, act: 'vis' });
    }
    if (b.dataset.act === 'up' || b.dataset.act === 'down') {
      const j = i + (b.dataset.act === 'up' ? -1 : 1);
      [st.working[i], st.working[j]] = [st.working[j], st.working[i]];
      announce(`${label} moved to position ${j + 1} of ${st.working.length}`);
      update({ id, act: b.dataset.act });
    }
    if (b.dataset.act === 'remove') {
      const [gone] = st.working.splice(i, 1);
      announce(`${label} removed from the layout. It is in the module library.`);
      update({ sel: `[data-id="${id}"] [data-act="add"]` });
      toast(`${label} removed from the layout.`, { action: 'Undo', onAction: () => {
        if (st.working.some(m => m.id === gone.id)) return;
        st.working.splice(i, 0, gone); announce(`${label} restored to position ${i + 1}`); update({ id, act: 'remove' });
      } });
    }
    if (b.dataset.act === 'add') {
      st.working.push({ id, on: true });
      announce(`${label} added at position ${st.working.length}`);
      update({ id, act: 'up' });
    }
  }

  /* ---------- Preview controls and payload ---------- */
  function renderPreviewControls() {
    const r = st.rec, opts = [['working', dirty() ? 'Your edits' : r.draft ? 'Draft' : 'Current']];
    if (r.demo) opts.push(['demo', 'Demo']);
    if (r.production) opts.push(['production', 'Production']);
    if (!opts.some(o => o[0] === st.src)) st.src = 'working';
    const src = st.src;
    const what = src === 'working'
      ? (dirty() ? badge('unsaved', 'Unsaved edits – not live') : r.draft ? badge('draft', 'Saved draft – not live') : badge('production', `Same as production v${r.production}`))
      : src === 'demo' ? badge('demo', `Demo v${r.demo} – demo environment only`) : badge('production', `Production v${r.production} – what patients see (simulated)`);
    $('#pv-controls').innerHTML = `
      <div class="pv-row"><span class="pv-k" id="pv-src-l">Show</span>${segmented({ id: 'pv-src', label: 'Preview source', options: opts, value: src })}</div>
      <p class="pv-what" id="pv-what">${what}</p>
      <div class="pv-row">${checkbox({ id: 'pv-alert', label: 'Show a sample emergency alert', checked: st.showAlert })}
        ${segmented({ id: 'pv-theme', label: 'Preview appearance', options: [['light', 'Light'], ['dark', 'Dark']], value: st.theme })}</div>`;
    wireSegmented($('#pv-src'), v => { st.src = v; renderPreviewControls(); $('#pv-src [aria-checked="true"]').focus(); });
    wireSegmented($('#pv-theme'), v => { st.theme = v; sendPreview(); });
    $('#pv-alert').onchange = e => { st.showAlert = e.target.checked; sendPreview(); };
    sendPreview();
  }
  function sendPreview() {
    const r = st.rec, src = st.src;
    const data = src === 'working' ? { head: base().head, modules: st.working } : r.versions[src === 'demo' ? r.demo : r.production].data;
    const label = src === 'working' ? (dirty() ? 'unsaved edits, not live' : r.draft ? 'saved draft, not live' : `production version ${r.production}`) : src === 'demo' ? `demo version ${r.demo}` : `production version ${r.production}`;
    const f = $('#pv-host iframe'); if (f) f.title = `Mobile preview of the ${st.aud} home screen: ${label}`;
    st.preview.render({ layout: clone(data), content: MOCK_CONTENT, theme: st.theme, showAlert: st.showAlert, label });
  }

  /* ---------- History table ---------- */
  function historyConfig() {
    const canRb = CONFIG_TYPES.homeLayout.supportsRollback && may('rollback');
    return {
      id: 'hist', caption: 'Change history', noun: 'change', searchPlaceholder: 'Search events, people and comments',
      rows: st.rec.events, defaultSort: { key: 'at', dir: 'desc' },
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
        { key: 'acts', label: 'Actions', hideLabel: true, render: e => canRb && e.environment === 'production' && e.version && e.version !== st.rec.production
          ? btn({ label: `Roll back to v${e.version}`, icon: 'history', variant: 'text', attrs: `data-rollback="${e.version}"` }) : '' }
      ],
      onRender(tbody) { tbody.onclick = ev => { const b = ev.target.closest('[data-rollback]'); if (b) rollback(+b.dataset.rollback, b); }; }
    };
  }

  function renderAll(focus) { renderLifecycle(); renderEditor(focus); renderPreviewControls(); }
  function update(focus) { renderLifecycle(); renderEditor(focus); renderPreviewControls(); }
  function afterSave(rec, msg) {
    st.rec = rec; st.working = clone(base().modules);
    renderAll(); st.table.update(rec.events);
    toast(msg, { kind: 'success' }); announce(msg);
  }

  /* ---------- Actions ---------- */
  async function act(b, reason) {
    const key = b.dataset.act;
    if (b.getAttribute('aria-disabled') === 'true') { toast(reason[key]); return; }
    const r = st.rec, id = r.id;
    const run = async (fn, busyLabel, msg) => {
      setBusy(b, true, busyLabel);
      try { const rec = await fn(); afterSave(rec, msg); $('#lc-h').focus(); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    };
    if (key === 'save') return run(() => ConfigService.saveDraft(id, { head: base().head, modules: st.working }, ''), 'Saving draft', 'Draft saved. It is not on demo or production yet.');
    if (key === 'discard') {
      const c = await confirmDialog({ title: 'Discard unsaved changes?', body: `<p>The layout goes back to ${r.draft ? 'your saved draft' : `production v${r.production}`}. These changes are lost:</p>${changeList(describeChanges(base().modules, st.working))}`, confirmLabel: 'Discard changes', variant: 'danger', cancelLabel: 'Keep editing' });
      if (!c.ok) return;
      st.working = clone(base().modules); renderAll(); announce('Changes discarded'); $('#lc-h').focus(); return;
    }
    if (key === 'discardDraft') {
      const c = await confirmDialog({ title: 'Discard the saved draft?', body: `<p>The draft is deleted and the editor goes back to production v${r.production}. Demo and production don’t change.</p>`, confirmLabel: 'Discard draft', variant: 'danger' });
      if (c.ok) run(() => ConfigService.discardDraft(id), 'Discarding draft', 'Draft discarded.');
      return;
    }
    if (key === 'review') {
      const c = await confirmDialog({ title: 'Request a review?', body: '<p>An Admin or Super Admin checks the draft and deploys it to demo. In the prototype this only marks the draft; no message is sent.</p>', confirmLabel: 'Request review', comment: { label: 'Note for the reviewer', hint: 'Optional' } });
      if (c.ok) run(() => ConfigService.requestReview(id, c.comment), 'Requesting review', 'Review requested.');
      return;
    }
    if (key === 'deploy') {
      const prev = r.demo ? r.versions[r.demo].data.modules : [];
      const c = await confirmDialog({ title: `Deploy to demo as v${r.nextVersion}?`, body: `<p>The saved draft becomes version ${r.nextVersion} in the demo environment, for checking on demo devices. Production stays on v${r.production} and patients see no change.</p><h3 class="sub-h">Changes from demo v${r.demo}</h3>${changeList(describeChanges(prev, r.draft.data.modules))}`, confirmLabel: 'Deploy to demo', comment: { label: 'Comment', hint: 'Optional. Shown in the change history.', value: r.draft.comment || '' } });
      if (c.ok) run(() => ConfigService.deployToDemo(id, c.comment), 'Deploying to demo', `Deployed to demo as v${r.nextVersion}. Production is unchanged.`);
      return;
    }
    if (key === 'changes') {
      const c = await confirmDialog({ title: `Request changes to demo v${r.demo}?`, body: '<p>The demo version goes back to a draft with your comment, so it can be fixed and deployed again. Production does not change.</p>', confirmLabel: 'Request changes', comment: { label: 'What needs to change', required: true } });
      if (c.ok) run(() => ConfigService.requestChanges(id, c.comment), 'Requesting changes', 'Changes requested. The demo version is back in draft.');
      return;
    }
    if (key === 'publish') {
      const c = await confirmDialog({ title: `Publish v${r.demo} to production?`, body: `<div class="warn-box">${ic('public', 20)}<p>Production is what patients see. In this prototype publishing is simulated and nothing reaches the MyCare app.</p></div>
        <h3 class="sub-h">Changes from production v${r.production}</h3>${changeList(describeChanges(r.versions[r.production].data.modules, r.versions[r.demo].data.modules))}
        ${r.draft || dirty() ? '<p class="muted">Your open draft is not included. Only the version checked on demo is published.</p>' : ''}`,
        confirmLabel: `Publish v${r.demo} to production`, comment: { label: 'Comment', hint: 'Optional. Shown in the change history.' } });
      if (c.ok) run(() => ConfigService.publish(id, c.comment), 'Publishing', `Published v${r.demo} to production (simulated).`);
    }
  }

  async function rollback(version, b) {
    const r = st.rec;
    const c = await confirmDialog({ title: `Roll back to v${version}?`, body: `<p>This creates version ${r.nextVersion} with the contents of v${version} and puts it on demo and production. Production v${r.production} stays in the history.</p>
      <h3 class="sub-h">Changes from production v${r.production}</h3>${changeList(describeChanges(r.versions[r.production].data.modules, r.versions[version].data.modules))}`,
      confirmLabel: `Roll back to v${version}`, variant: 'danger', comment: { label: 'Reason for the rollback', required: true } });
    if (!c.ok) return;
    setBusy(b, true, 'Rolling back');
    try { const rec = await ConfigService.rollback(r.id, version, c.comment); afterSave(rec, `Rolled back. Production is now v${rec.production}, a copy of v${version} (simulated).`); $('#hist-h').focus(); }
    catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
  }

  return {
    render,
    leave() { if (st && st.preview) { st.preview.destroy(); st.preview = null; } }
  };
})();
