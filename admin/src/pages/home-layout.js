/* ---------- Home screen management → Layout ----------
   Order and visibility of the home modules for guests and signed-in patients, a module library, a live preview
   built from the designs/guest modules, and the shared Draft → Demo → Production lifecycle. */
/* EXTRA_GLYPHS: save rate_review science public */
const AUDIENCES = [['guest', 'Guest'], ['authenticated', 'Authenticated']];
const modLabel = id => (HOME_MODULES[id] || {}).label || id;
function describeLayout(from, to) {
  if (!from) return ['New layout'];
  const out = [], pos = list => Object.fromEntries(list.map((m, i) => [m.id, i + 1]));
  const pf = pos(from.modules), pt = pos(to.modules);
  to.modules.forEach(m => {
    const was = from.modules.find(x => x.id === m.id);
    if (!was) { out.push(`${modLabel(m.id)} is added at position ${pt[m.id]}${m.on ? '' : ', hidden'}`); return; }
    if (pf[m.id] !== pt[m.id]) out.push(`${modLabel(m.id)} moves from position ${pf[m.id]} to ${pt[m.id]}`);
    if (was.on !== m.on) out.push(`${modLabel(m.id)} is ${m.on ? 'shown' : 'hidden'}`);
  });
  from.modules.forEach(m => { if (!pt[m.id]) out.push(`${modLabel(m.id)} is removed`); });
  return out;
}

BUILT_PAGES['home-layout'] = (() => {
  let st = { aud: 'guest', showAlert: true }, main, pv;
  const may = a => canAct(Session.role(), 'homeLayout', a);
  const base = () => latestData(st.rec);
  const dirty = () => !!st.rec && !same(st.working, base());

  function render(host) {
    main = host;
    main.innerHTML = `<div class="page hl">
      ${pageHead({ crumbs: [['Home screen management', null]], title: 'Home screen layout',
        lede: 'Choose which modules patients see on the MyCare home screen and in what order, for guests and for signed-in patients.' })}
      <div class="tabs" role="tablist" aria-label="Audience">${AUDIENCES.map(([k, l]) =>
        `<button type="button" role="tab" id="aud-${k}" aria-controls="aud-panel" aria-selected="${k === st.aud}" tabindex="${k === st.aud ? 0 : -1}" data-aud="${k}">${esc(l)}</button>`).join('')}</div>
      <div id="aud-panel" role="tabpanel" aria-labelledby="aud-${st.aud}"></div>
    </div>`;
    const tabs = $$('[role="tab"]', main);
    const pick = async (t, focus) => {
      if (t.dataset.aud === st.aud) return;
      if (dirty()) {
        const r = await confirmDialog({ title: 'Discard unsaved changes?', body: `<p>You have unsaved changes to the ${st.aud} layout. Switching audiences discards them.</p>`, confirmLabel: 'Discard and switch', variant: 'danger', cancelLabel: 'Keep editing' });
        if (!r.ok) return;
      }
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      if (focus) t.focus();
      st.aud = t.dataset.aud;
      $('#aud-panel').setAttribute('aria-labelledby', t.id);
      load();
    };
    tabs.forEach((t, i) => {
      t.onclick = () => pick(t);
      t.onkeydown = e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); } };
    });
    load();
  }

  async function load() {
    const panel = $('#aud-panel');
    panel.innerHTML = loadingState('Loading the layout');
    if (pv) { pv.destroy(); pv = null; }
    try { st.rec = await ConfigService.get(`home-layout-${st.aud}`); }
    catch (err) { panel.innerHTML = errorState(err.message); $('[data-retry]', panel).onclick = load; return; }
    st.working = clone(base());
    panel.innerHTML = `
      ${st.aud === 'authenticated' ? `<p class="note-line">${ic('info', 20)}<span>The signed-in home has no approved design yet (§10.5). These modules come from the personalised homepage prototype; “Your next visits” is read only from MyChart – Epic stays the source.</span></p>` : ''}
      <section class="card lc" aria-labelledby="lc-h"><div class="card-head"><h2 id="lc-h" tabindex="-1">Publishing</h2><div id="lc-badges" class="card-actions"></div></div><div class="card-body" id="lc"></div></section>
      <div class="hl-grid">
        <div class="hl-edit" id="editor"></div>
        <aside class="hl-preview" id="hl-pv"></aside>
      </div>
      ${historyCard()}`;
    const lc = Lifecycle({
      host: () => $('#lc'), area: 'homeLayout', noun: 'layout', getRec: () => st.rec, getWorking: () => clone(st.working), isDirty: dirty, describe: describeLayout,
      onSaved: rec => { st.rec = rec; st.working = clone(base()); update(); hist.update(rec.events); $('#lc-h').focus(); },
      onDiscard: () => { st.working = clone(base()); update(); $('#lc-h').focus(); }, afterDelete: () => {}
    });
    st.lc = lc;
    const hist = mountHistory({ getRec: () => st.rec, describe: describeLayout, onSaved: rec => { st.rec = rec; st.working = clone(base()); update(); hist.update(rec.events); } });
    pv = mountPreviewCard($('#hl-pv'), {
      title: `Mobile preview of the ${st.aud} home screen`,
      sources: () => recSources(st.rec, dirty(), false),
      extras: checkbox({ id: 'pv-alert', label: 'Show emergency alerts', checked: st.showAlert }),
      onExtras: (h, send) => { $('#pv-alert', h).onchange = e => { st.showAlert = e.target.checked; send(); }; },
      payload: src => {
        const data = src === 'working' ? st.working : dataAt(st.rec, src);
        const content = appContent({ audience: st.aud, allAlerts: true });
        if (!st.showAlert) content.alerts = [];
        return { screen: 'home', audience: st.aud, layout: clone(data), content, colors: colorsFor('production'),
          label: src === 'working' ? (dirty() ? 'unsaved edits, not live' : st.rec.draft ? 'saved draft, not live' : `production version ${st.rec.production}`) : `${src} version ${src === 'demo' ? st.rec.demo : st.rec.production}` };
      }
    });
    Router.setGuard(async () => {
      if (!dirty()) return true;
      const r = await confirmDialog({ title: 'Leave without saving?', body: '<p>Your changes to the layout aren’t saved. If you leave, they’re lost.</p>', confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
      return r.ok;
    });
    update();
  }

  function update(focus) {
    $('#lc-badges').innerHTML = `${badge('mock')}${dirty() ? badge('unsaved') : ''}`;
    st.lc.render(); renderEditor(focus); pv.update();
  }

  function renderEditor(focus) {
    const ro = !may('saveDraft');
    const lib = AUDIENCE_MODULES[st.aud].filter(id => !st.working.modules.some(m => m.id === id));
    const n = st.working.modules.length;
    const row = (m, i) => {
      const meta = HOME_MODULES[m.id];
      return `<li class="mod-row${m.on ? '' : ' is-off'}" data-id="${m.id}">
        <span class="mod-pos" aria-hidden="true">${i + 1}</span>
        <span class="mod-ic">${ic(meta.icon, 20)}</span>
        <span class="mod-txt"><span class="mod-t" id="mt-${m.id}">${esc(meta.label)}<span class="vh">, position ${i + 1} of ${n}</span></span><span class="mod-d">${esc(meta.desc)}${meta.link ? ` <a class="text-link" href="#${meta.link}">Manage</a>` : ''}</span></span>
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
      <h3 class="sub-h" id="ord-h" tabindex="-1">Modules, in order</h3>
      <p class="hint-line">Use the arrows to reorder. Hidden modules keep their place but patients don’t see them.</p>
      ${n ? `<ol class="mod-list" aria-labelledby="ord-h">${st.working.modules.map(row).join('')}</ol>`
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
    const rowEl = b.closest('[data-id]'), id = rowEl && rowEl.dataset.id, list = st.working.modules, i = list.findIndex(m => m.id === id);
    const label = modLabel(id);
    if (b.dataset.act === 'vis') { list[i].on = !list[i].on; announce(`${label} ${list[i].on ? 'shown' : 'hidden'}`); update({ id, act: 'vis' }); }
    if (b.dataset.act === 'up' || b.dataset.act === 'down') {
      const j = i + (b.dataset.act === 'up' ? -1 : 1);
      [list[i], list[j]] = [list[j], list[i]];
      announce(`${label} moved to position ${j + 1} of ${list.length}`);
      update({ id, act: b.dataset.act });
    }
    if (b.dataset.act === 'remove') {
      const [gone] = list.splice(i, 1);
      announce(`${label} removed from the layout. It is in the module library.`);
      update({ sel: `[data-id="${id}"] [data-act="add"]` });
      toast(`${label} removed from the layout.`, { action: 'Undo', onAction: () => {
        if (st.working.modules.some(m => m.id === gone.id)) return;
        st.working.modules.splice(i, 0, gone); announce(`${label} restored to position ${i + 1}`); update({ id, act: 'remove' });
      } });
    }
    if (b.dataset.act === 'add') { list.push({ id, on: true }); announce(`${label} added at position ${list.length}`); update({ id, act: 'up' }); }
  }

  return { render, leave() { if (pv) { pv.destroy(); pv = null; } } };
})();
