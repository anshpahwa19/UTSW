/* ---------- Single-record editors with the same lifecycle: colors, drawer, app entry, search, ranking, locations ---------- */

/* Modal form: resolves the edited data, or null when cancelled */
function formModal({ title, sections, data, validate, confirmLabel = 'Save', note = '' }) {
  return new Promise(resolve => {
    const d = clone(data); let errors = {}, done = false;
    const fs = () => fields(sections);
    openModal({
      title, wide: true,
      body: `${note}<div id="mf"></div>`,
      actions: `${btn({ label: 'Cancel', variant: 'text', attrs: 'data-close' })}${btn({ label: confirmLabel, variant: 'primary', type: 'submit' })}`,
      onOpen(dlg, close) {
        const host = $('#mf', dlg);
        const draw = () => { host.innerHTML = renderForm(sections, d, errors, 'm'); };
        draw();
        wireForm(host, fs, d, () => {}, draw);
        const first = $('input:not([type=hidden]),select,textarea', host); first && first.focus();
        $('form', dlg).addEventListener('submit', e => {
          e.preventDefault();
          errors = validateData(fs(), d, validate);
          if (Object.keys(errors).length) { draw(); $('#m-errsum', dlg).focus(); return; }
          done = true; resolve(d); close();
        });
        dlg.addEventListener('close', () => { if (!done) resolve(null); });
      }
    });
  });
}

/* Editable rows (search tables, locations) on top of dataTable */
function rowsEditor(host, { rows, noun, caption, columns, sections, blank, validate, ro, onChange, searchText, rowTitle, extraActions, onExtraClick }) {
  const t = dataTable(host, {
    id: 'rows', caption, noun, rows, searchPlaceholder: `Search ${caption.toLowerCase()}`, pageSize: 10,
    searchText, actions: ro ? '' : btn({ label: `Add ${noun}`, icon: 'add', variant: 'primary', attrs: 'data-row-add' }),
    empty: { icon: 'table_rows', title: `No ${noun}s yet`, text: ro ? '' : `Add the first ${noun}.` },
    columns: [...columns, { key: 'acts', label: 'Actions', hideLabel: true, render: r => ro ? '' : `<span class="row-acts">${extraActions ? extraActions(r) : ''}${btn({ label: `Edit ${rowTitle(r)}`, icon: 'edit', variant: 'text', iconOnly: true, attrs: `data-row-edit="${r.id}"` })}${btn({ label: `Delete ${rowTitle(r)}`, icon: 'delete', variant: 'text', iconOnly: true, attrs: `data-row-del="${r.id}"` })}</span>` }]
  });
  host.onclick = async e => {
    if (onExtraClick) onExtraClick(e);
    const add = e.target.closest('[data-row-add]'), ed = e.target.closest('[data-row-edit]'), del = e.target.closest('[data-row-del]');
    if (add) {
      const d = await formModal({ title: `Add ${noun}`, sections, data: blank(), validate: v => validate(v, null), confirmLabel: `Add ${noun}` });
      if (d) { rows.push({ ...d, id: uid('r') }); t.update(rows); onChange(); toast(`${noun[0].toUpperCase()}${noun.slice(1)} added to your working copy. Save the draft to keep it.`); announce(`${noun} added`); }
      add.focus();
    }
    if (ed) {
      const i = rows.findIndex(r => r.id === ed.dataset.rowEdit);
      const d = await formModal({ title: `Edit ${noun}`, sections, data: rows[i], validate: v => validate(v, rows[i].id) });
      if (d) { rows[i] = d; t.update(rows); onChange(); announce(`${noun} updated`); }
      const again = $(`[data-row-edit="${rows[i].id}"]`, host); again && again.focus();
    }
    if (del) {
      const i = rows.findIndex(r => r.id === del.dataset.rowDel), gone = rows[i];
      rows.splice(i, 1); t.update(rows); onChange();
      toast(`Deleted “${rowTitle(gone)}” from your working copy.`, { action: 'Undo', onAction: () => { rows.splice(i, 0, gone); t.update(rows); onChange(); announce('Restored'); } });
      $('[data-row-add]', host) && $('[data-row-add]', host).focus();
    }
  };
  return t;
}

function defineSingleton(cfg) {
  BUILT_PAGES[cfg.route] = {
    async render(main) {
      const st = this.st = { rec: null, working: null, errors: {} };
      main.innerHTML = `<div class="page" id="sg-page">${pageHead({ crumbs: [[cfg.section, null]], title: cfg.title, lede: cfg.lede })}<div id="sg-body">${loadingState(`Loading ${cfg.title.toLowerCase()}`)}</div></div>`;
      try { st.rec = await ConfigService.get(cfg.id); }
      catch (err) { $('#sg-body').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
      st.working = clone(latestData(st.rec));
      const base = () => latestData(st.rec), dirty = () => !same(st.working, base());
      const ro = !can(Session.role(), cfg.area, 'draft');
      const allF = () => cfg.sections ? fields(cfg.sections) : [];
      const describe = (a, b) => cfg.describe ? cfg.describe(a, b) : describeData(a, b, allF());
      $('#sg-body').innerHTML = `
        <section class="card lc" aria-labelledby="lc-h"><div class="card-head"><h2 id="lc-h" tabindex="-1">Publishing</h2><div class="card-actions"><span id="sg-badges"></span>${badge('mock')}</div></div><div class="card-body" id="lc"></div></section>
        <div class="ed-grid${cfg.preview || cfg.side || cfg.sideStatic ? '' : ' single'}">
          <div class="ed-main">
            <section class="card" aria-labelledby="form-h"><div class="card-head"><h2 id="form-h">${esc(cfg.formTitle || 'Settings')}</h2>${ro ? `<div class="card-actions">${badge('fixed', 'View only')}</div>` : ''}</div>
              <div class="card-body" id="sg-editor"></div></section>
            ${cfg.preview && cfg.side ? '<section class="card"><div class="card-body" id="sg-side"></div></section>' : ''}
          </div>
          ${cfg.preview ? '<aside class="ed-side" id="sg-pv"></aside>' : cfg.side || cfg.sideStatic ? `<aside class="ed-side"><section class="card"><div class="card-body" id="sg-side">${cfg.sideStatic ? cfg.sideStatic() : ''}</div></section></aside>` : ''}
        </div>
        ${historyCard()}`;
      let pv = null, hist = null;
      const refresh = () => {
        $('#sg-badges').innerHTML = `${envBadges(st.rec)}${dirty() ? badge('unsaved') : ''}`;
        lc.render(); if (pv) pv.update(); if (cfg.side) $('#sg-side').innerHTML = cfg.side(st.working, st); if (cfg.onRefresh) cfg.onRefresh(st);
      };
      const reset = data => { Object.keys(st.working).forEach(k => delete st.working[k]); Object.assign(st.working, clone(data)); st.errors = {}; drawEditor(); refresh(); };
      const editorHost = $('#sg-editor');
      const drawEditor = () => {
        if (cfg.sections) { editorHost.innerHTML = `<form class="form" novalidate id="sg-form">${renderForm(cfg.sections.map(s => ({ ...s, fields: s.fields.map(f => ro ? { ...f, readonly: true } : f) })), st.working, st.errors, 'f')}</form>`; }
        else cfg.renderEditor(editorHost, st, { ro, onChange: debounce(refresh, 80) });
      };
      drawEditor();
      if (cfg.sections) {
        editorHost.addEventListener('submit', e => e.preventDefault());
        wireForm(editorHost, allF, st.working, debounce(refresh, 100), drawEditor);
      }
      const validate = () => {
        const errs = cfg.sections ? validateData(allF(), st.working, cfg.validate) : (cfg.validate ? cfg.validate(st.working) : {});
        st.errors = errs;
        if (cfg.sections) { drawEditor(); if (Object.keys(errs).length) $('#f-errsum').focus(); }
        else if (Object.keys(errs).length) toast(Object.values(errs)[0], { kind: 'error', ms: 8000 });
        return !Object.keys(errs).length;
      };
      const lc = Lifecycle({
        host: () => $('#lc'), area: cfg.area, noun: cfg.noun, getRec: () => st.rec, getWorking: () => clone(st.working), isDirty: dirty, describe, validate,
        onSaved: rec => { st.rec = rec; reset(latestData(rec)); hist.update(rec.events); $('#lc-h').focus(); },
        onDiscard: () => { reset(base()); $('#lc-h').focus(); }, afterDelete: () => {}
      });
      hist = mountHistory({ getRec: () => st.rec, describe, onSaved: rec => { st.rec = rec; reset(latestData(rec)); hist.update(rec.events); } });
      if (cfg.preview) {
        pv = mountPreviewCard($('#sg-pv'), {
          title: `Mobile preview of ${cfg.title.toLowerCase()}`, sources: () => recSources(st.rec, dirty(), false),
          payload: src => cfg.preview(src === 'working' ? st.working : dataAt(st.rec, src), src, st),
          extras: cfg.previewExtras ? cfg.previewExtras(st) : '', onExtras: cfg.wireExtras ? (h, send) => cfg.wireExtras(h, send, st) : null
        });
        this.pv = pv;
      }
      if (cfg.afterRender) cfg.afterRender(st);
      refresh();
      Router.setGuard(async () => {
        if (!dirty() || ro) return true;
        const r = await confirmDialog({ title: 'Leave without saving?', body: `<p>Your changes to ${esc(cfg.title.toLowerCase())} aren’t saved. If you leave, they’re lost.</p>`, confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
        return r.ok;
      });
    },
    leave() { if (this.pv) { this.pv.destroy(); this.pv = null; } }
  };
}

/* ---- Global colors ---- */
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function contrast(a, b) {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return 0;
  const L = h => { const c = hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
const COLOR_CHECKS = d => [
  ['White text on the primary color (buttons, app bar)', contrast('#FFFFFF', d.primary), 4.5, 'primary'],
  ['Primary text on the background (headings, links)', contrast(d.primary, d.background), 4.5, 'primary'],
  ['Body text #333333 on the background', contrast('#333333', d.background), 4.5, 'background'],
  ['White text on the secondary color (campaign gradient)', contrast('#FFFFFF', d.secondary), 3, 'secondary'],
  ['Tertiary icons on the primary color', contrast(d.tertiary, d.primary), 3, 'tertiary']
];
defineSingleton({
  route: 'content-colors', id: 'global-colors', area: 'colors', section: 'Content and navigation', title: 'Global colors', noun: 'color set',
  lede: 'The approved global app colors. Every change is checked against WCAG 2.2 AA before it can be saved. Component-level styles stay in the app’s design system.',
  formTitle: 'Colors',
  sections: [{ note: 'Which tokens are editable, and the effect on dark mode, are pending confirmation (§10.9). In dark mode the app keeps its own page colors; the primary color still drives the brand surfaces.', fields: [
    { key: 'primary', label: 'Primary global app color', type: 'color', required: true, hint: 'App bar, hero, buttons and links. UT Southwestern Blue is #004278.' },
    { key: 'secondary', label: 'Secondary global app color', type: 'color', required: true, hint: 'Campaign gradient and supporting surfaces.' },
    { key: 'tertiary', label: 'Tertiary global app color', type: 'color', required: true, hint: 'Accents and icons on Blue.' },
    { key: 'background', label: 'Background global app color', type: 'color', required: true, hint: 'The page behind cards, in light mode.' }] }],
  validate: d => { const e = {}; COLOR_CHECKS(d).forEach(([l, r, need, key]) => { if (r && r < need && !e[key]) e[key] = `${l}: ${r.toFixed(2)}:1, needs ${need}:1.`; }); return e; },
  side: d => `<h2 class="side-h">Contrast checks</h2><ul class="checks">${COLOR_CHECKS(d).map(([l, r, need]) => `<li>${r >= need ? badge('live', 'Pass') : badge('error', 'Fail')}<span>${esc(l)}<br><b>${r ? r.toFixed(2) : '–'}:1</b> <span class="muted">needs ${need}:1</span></span></li>`).join('')}</ul>
    <p class="muted">Saving is blocked until every check passes.</p>`,
  preview: (d, src) => ({ screen: 'home', layout: layoutFor('guest'), content: appContent(), colors: d, focus: 'campaign', label: src === 'working' ? 'your colors, not live' : `${src} colors` })
});

/* ---- Drawer / More options ---- */
const FIXED_DRAWER = ['inbox', 'lang'];
defineSingleton({
  route: 'content-drawer', id: 'drawer', area: 'drawer', section: 'Content and navigation', title: 'Drawer / More options', noun: 'drawer',
  lede: 'The menu that opens from the home app bar. Items are grouped in sections. Which items are fixed and whether sections can be reordered is pending confirmation (§10.11).',
  formTitle: 'Menu items',
  describe: (a, b) => {
    const out = [], items = d => Object.fromEntries(d.sections.flatMap(s => s.items.map((it, i) => [it.id, { ...it, sec: s.label || 'Top', pos: i + 1 }])));
    const A = items(a), B = items(b);
    Object.values(B).forEach(it => { const was = A[it.id]; if (!was) out.push(`${it.label} is added to ${it.sec}`); else { if (was.visible !== it.visible) out.push(`${it.label} is ${it.visible ? 'shown' : 'hidden'}`); if (was.pos !== it.pos) out.push(`${it.label} moves from position ${was.pos} to ${it.pos}`); if (was.label !== it.label) out.push(`“${was.label}” is renamed “${it.label}”`); if (!same(was.destination, it.destination)) out.push(`${it.label} now opens ${destLabel(it.destination)}`); } });
    Object.values(A).forEach(it => { if (!B[it.id]) out.push(`${it.label} is removed`); });
    return out;
  },
  renderEditor(host, st, { ro, onChange }) {
    const draw = focusSel => {
      host.innerHTML = st.working.sections.map((s, si) => `<section class="dr-sec" aria-labelledby="ds-${s.id}"><h3 class="sub-h" id="ds-${s.id}">${esc(s.label || 'Top of the menu')}</h3>
        <ol class="mod-list">${s.items.map((it, i) => `<li class="mod-row${it.visible ? '' : ' is-off'}" data-s="${si}" data-i="${i}">
          <span class="mod-pos" aria-hidden="true">${i + 1}</span><span class="mod-ic">${ic(it.icon, 20)}</span>
          <span class="mod-txt"><span class="mod-t">${esc(it.label)}<span class="vh">, position ${i + 1} of ${s.items.length}</span></span><span class="mod-d">${esc(destLabel(it.destination))}${FIXED_DRAWER.includes(it.id) ? ' · Fixed by the app' : ''}</span></span>
          ${badge(it.visible ? 'visible' : 'hidden')}
          ${ro ? '' : `<span class="mod-ctl">${switchBtn({ id: `dv-${it.id}`, checked: it.visible, label: `Show ${it.label} in the menu`, attrs: 'data-d="vis"' })}
            <button type="button" class="btn btn-text btn-icon" data-d="up" aria-label="Move ${esc(it.label)} up" ${i === 0 ? 'disabled' : ''}>${ic('arrow_upward', 20)}</button>
            <button type="button" class="btn btn-text btn-icon" data-d="down" aria-label="Move ${esc(it.label)} down" ${i === s.items.length - 1 ? 'disabled' : ''}>${ic('arrow_downward', 20)}</button>
            <button type="button" class="btn btn-text btn-icon" data-d="edit" aria-label="Edit ${esc(it.label)}">${ic('edit', 20)}</button>
            ${FIXED_DRAWER.includes(it.id) ? '' : `<button type="button" class="btn btn-text btn-icon" data-d="remove" aria-label="Remove ${esc(it.label)}">${ic('remove_circle', 20)}</button>`}</span>`}
        </li>`).join('')}</ol>
        ${ro ? '' : btn({ label: `Add item to ${s.label || 'the top'}`, icon: 'add', variant: 'tonal', attrs: `data-add="${si}"` })}</section>`).join('');
      if (focusSel) { const el = $(focusSel, host); (el && !el.disabled ? el : $('h3', host)).focus(); }
    };
    const itemSecs = [{ fields: [
      { key: 'label', label: 'Label', required: true, max: 32 }, { key: 'sub', label: 'Subtitle', max: 40 },
      { key: 'icon', label: 'Icon', type: 'icon' }, { key: 'destination', label: 'Destination', type: 'destination', required: true, noNone: true },
      { key: 'visible', label: 'Show in the menu', type: 'switch' }] }];
    draw();
    host.onclick = async e => {
      const add = e.target.closest('[data-add]');
      if (add) {
        const d = await formModal({ title: 'Add a menu item', sections: itemSecs, data: { label: '', sub: '', icon: 'help', destination: { type: 'screen', value: 'Help and contact us' }, visible: true }, confirmLabel: 'Add item' });
        if (d) { const s = st.working.sections[+add.dataset.add]; d.id = uid('di'); s.items.push(d); draw(`[data-s="${add.dataset.add}"][data-i="${s.items.length - 1}"] [data-d="edit"]`); onChange(); announce(`${d.label} added`); } else add.focus();
        return;
      }
      const b = e.target.closest('[data-d]'); if (!b || b.disabled) return;
      const rowEl = b.closest('[data-s]'), si = +rowEl.dataset.s, i = +rowEl.dataset.i, list = st.working.sections[si].items, it = list[i];
      if (b.dataset.d === 'vis') { it.visible = !it.visible; draw(`[data-s="${si}"][data-i="${i}"] [data-d="vis"]`); announce(`${it.label} ${it.visible ? 'shown' : 'hidden'}`); }
      if (b.dataset.d === 'up' || b.dataset.d === 'down') { const j = i + (b.dataset.d === 'up' ? -1 : 1); [list[i], list[j]] = [list[j], list[i]]; draw(`[data-s="${si}"][data-i="${j}"] [data-d="${b.dataset.d}"]`); announce(`${it.label} moved to position ${j + 1}`); }
      if (b.dataset.d === 'edit') { const d = await formModal({ title: `Edit ${it.label}`, sections: itemSecs, data: it }); if (d) { list[i] = d; } draw(`[data-s="${si}"][data-i="${i}"] [data-d="edit"]`); }
      if (b.dataset.d === 'remove') { list.splice(i, 1); draw(`[data-add="${si}"]`); toast(`${it.label} removed.`, { action: 'Undo', onAction: () => { list.splice(i, 0, it); draw(); onChange(); } }); }
      onChange();
    };
  },
  previewExtras: () => checkbox({ id: 'pv-hidden', label: 'Show hidden items, dimmed' }),
  wireExtras: (h, send, st) => { $('#pv-hidden', h).onchange = e => { st.showHidden = e.target.checked; send(); }; },
  preview: (d, src, st) => ({ screen: 'drawer', layout: layoutFor('guest'), content: { ...appContent(), drawer: d, showHidden: !!st.showHidden }, label: src === 'working' ? 'your menu, not live' : `${src} menu` })
});

/* ---- App entry ---- */
defineSingleton({
  route: 'content-app-entry', id: 'app-entry', area: 'appEntry', section: 'Content and navigation', title: 'App entry', noun: 'app entry setting',
  lede: 'What people see when they first open MyCare: onboarding, the End User License Agreement, and how they are asked to sign in.',
  formTitle: 'First launch',
  sections: [
    { title: 'Onboarding', fields: [{ key: 'onboardingVisible', label: 'Show the four onboarding slides on first launch', type: 'switch' }] },
    { title: 'End User License Agreement', note: 'EULA source, versioning and re-acceptance are pending (§10.10). The prototype app has no EULA today.', fields: [
      { key: 'eulaVisible', label: 'Show the EULA before first use', type: 'switch', rerender: true },
      { key: 'eulaVersion', label: 'EULA version', required: true, max: 20, show: d => d.eulaVisible, wide: false },
      { key: 'eulaText', label: 'EULA summary text', type: 'textarea', rows: 5, required: true, max: 800, show: d => d.eulaVisible },
      { key: 'reacceptOnChange', label: 'Ask everyone to accept again when the version changes', type: 'switch', show: d => d.eulaVisible }] },
    { title: 'Sign-in prompt', fields: [
      { key: 'loginPromptVisible', label: 'Ask people to sign in', type: 'switch', rerender: true },
      { key: 'loginPromptType', label: 'Prompt type', type: 'radio', show: d => d.loginPromptVisible, options: [['choice', 'Sign-in choice screen at launch'], ['module', 'MyChart sign-in prompt on the home screen']] }] }
  ],
  preview: (d, src) => ({ screen: 'entry', layout: layoutFor('guest'), content: { ...appContent(), entry: d }, label: src === 'working' ? 'your first-launch settings, not live' : `${src} first launch` })
});

/* ---- Search: query mappings, synonyms, specialty mapping ---- */
const testerCard = (id, placeholder) => `<h2 class="side-h">Try a search</h2><p class="muted">Uses your working copy, including unsaved edits.</p>
  <div class="field"><label for="${id}">What a patient types</label><input class="input" id="${id}" type="search" placeholder="${esc(placeholder)}"></div><div id="${id}-out" class="tester-out" role="status"></div>`;
function rowsSingleton({ route, id, title, lede, noun, caption, columns, sections, blank, validate, searchText, rowTitle, tester }) {
  const tid = `${id}-try`;
  const run = st => { const inp = $(`#${tid}`), out = $(`#${tid}-out`); if (!inp || !out) return; const q = inp.value.trim().toLowerCase(); out.innerHTML = q ? tester.fn(st.working, q) : ''; };
  defineSingleton({
    route, id, area: 'search', section: 'Search configuration', title, noun: `${title.toLowerCase()} set`, lede, formTitle: title,
    describe: (a, b) => {
      const A = Object.fromEntries(a.rows.map(r => [r.id, r])), B = Object.fromEntries(b.rows.map(r => [r.id, r])), out = [];
      b.rows.forEach(r => { if (!A[r.id]) out.push(`Added: ${rowTitle(r)}`); else if (!same(A[r.id], r)) out.push(`Edited: ${rowTitle(r)}`); });
      a.rows.forEach(r => { if (!B[r.id]) out.push(`Removed: ${rowTitle(r)}`); });
      return out;
    },
    renderEditor(host, st, { ro, onChange }) {
      rowsEditor(host, { rows: st.working.rows, noun, caption, columns, sections, blank, ro, searchText, rowTitle,
        validate: (v, selfId) => validate(v, st.working.rows.filter(r => r.id !== selfId)), onChange });
    },
    sideStatic: () => testerCard(tid, tester.placeholder),
    afterRender: st => { $(`#${tid}`).addEventListener('input', () => run(st)); },
    onRefresh: st => run(st)
  });
}
const dupCheck = (key, label) => (v, others) => others.some(r => String(r[key]).trim().toLowerCase() === String(v[key]).trim().toLowerCase()) ? { [key]: `“${v[key]}” already has a ${label}.` } : {};
const SPECIALTY_LIST = () => ConfigService.peek('search-specialties') ? latestData(ConfigService.peek('search-specialties')).rows.map(r => r.specialty) : [];
rowsSingleton({
  route: 'search-query-mappings', id: 'search-mappings', title: 'Query mappings', noun: 'mapping', caption: 'Query mappings',
  lede: 'Send a patient phrase straight to a specialty, condition, scope, content or resource. Mapping semantics depend on the search engine, pending confirmation (§10.12).',
  columns: [
    { key: 'phrase', label: 'Patient phrase', sortable: true, render: r => `“${esc(r.phrase)}”` },
    { key: 'targetType', label: 'Goes to', sortable: true, render: r => esc(r.targetType) },
    { key: 'target', label: 'Target', sortable: true, render: r => esc(r.target) }],
  sections: [{ fields: [
    { key: 'phrase', label: 'Patient phrase', required: true, max: 60, hint: 'Lowercase, as patients type it.' },
    { key: 'targetType', label: 'Goes to', type: 'select', options: ['Specialty', 'Condition', 'Scope', 'Content', 'Resource', 'Location'] },
    { key: 'target', label: 'Target', required: true, max: 60 }] }],
  blank: () => ({ phrase: '', targetType: 'Specialty', target: '' }), validate: dupCheck('phrase', 'mapping'),
  searchText: r => `${r.phrase} ${r.target}`, rowTitle: r => `“${r.phrase}”`,
  tester: { placeholder: 'for example, flu shot', fn: (d, q) => { const hit = d.rows.find(r => q.includes(r.phrase.toLowerCase())); return hit ? `${badge('live', 'Mapped')}<p>“${esc(q)}” goes to <b>${esc(hit.targetType)}: ${esc(hit.target)}</b>.</p>` : `${badge('hidden', 'No mapping')}<p>The search engine handles “${esc(q)}” on its own.</p>`; } }
});
rowsSingleton({
  route: 'search-synonyms', id: 'search-synonyms', title: 'Synonyms', noun: 'synonym', caption: 'Synonyms',
  lede: 'Lay terms and abbreviations that mean a specialty or condition, seeded from the guest prototype’s plain-language search.',
  columns: [
    { key: 'term', label: 'Patients type', sortable: true, render: r => `“${esc(r.term)}”` },
    { key: 'to', label: 'Means', sortable: true, render: r => esc(r.to) }],
  sections: [{ fields: [
    { key: 'term', label: 'What patients type', required: true, max: 40 },
    { key: 'to', label: 'What it means', required: true, max: 60, hint: 'A specialty or condition name.' }] }],
  blank: () => ({ term: '', to: '' }), validate: dupCheck('term', 'synonym'),
  searchText: r => `${r.term} ${r.to}`, rowTitle: r => `“${r.term}”`,
  tester: { placeholder: 'for example, skin doc near Frisco', fn: (d, q) => { const hits = d.rows.filter(r => q.split(/\s+/).join(' ').includes(r.term.toLowerCase())).sort((a, b) => b.term.length - a.term.length); return hits.length ? `${badge('live', 'Understood')}<p>“${esc(q)}” searches for <b>${esc(hits[0].to)}</b>${hits.length > 1 ? ` (also matched ${hits.slice(1).map(h => `“${esc(h.term)}”`).join(', ')})` : ''}.</p>` : `${badge('hidden', 'No synonym')}<p>No synonym matches “${esc(q)}”.</p>`; } }
});
rowsSingleton({
  route: 'search-specialties', id: 'search-specialties', title: 'Specialty mapping', noun: 'specialty', caption: 'Specialty mapping',
  lede: 'Each specialty with the everyday words that should find it.',
  columns: [
    { key: 'specialty', label: 'Specialty', sortable: true, render: r => esc(r.specialty) },
    { key: 'terms', label: 'Patient terms', render: r => `<span class="chips-inline">${r.terms.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="tagchip">${esc(t)}</span>`).join('')}</span>`, cls: 'wrap' }],
  sections: [{ fields: [
    { key: 'specialty', label: 'Specialty', required: true, max: 60 },
    { key: 'terms', label: 'Patient terms', type: 'textarea', required: true, max: 300, hint: 'Separate terms with commas.' }] }],
  blank: () => ({ specialty: '', terms: '' }), validate: dupCheck('specialty', 'mapping'),
  searchText: r => `${r.specialty} ${r.terms}`, rowTitle: r => r.specialty,
  tester: { placeholder: 'for example, knee', fn: (d, q) => { const hits = d.rows.filter(r => r.terms.toLowerCase().split(',').some(t => t.trim() && q.includes(t.trim()))); return hits.length ? `${badge('live', 'Matched')}<p>Finds <b>${hits.map(h => esc(h.specialty)).join(', ')}</b>.</p>` : `${badge('hidden', 'No match')}<p>No specialty lists “${esc(q)}”.</p>`; } }
});

/* ---- Ranking: only approved parameters ---- */
defineSingleton({
  route: 'search-ranking', id: 'search-ranking', area: 'search', section: 'Search configuration', title: 'Ranking', noun: 'ranking setting',
  lede: 'How provider results are ordered under Best match. Only the parameters UTSW approved are shown; which of them the search platform really exposes is pending (§10.12).',
  formTitle: 'Best match weights',
  sections: [{ note: 'Weights are relative and must add up to 100.', fields: [
    { key: 'relevance', label: 'Relevance to the search (specialty and condition fit)', type: 'number', min: 0, maxNum: 100, wide: false },
    { key: 'distance', label: 'Distance from the patient', type: 'number', min: 0, maxNum: 100, wide: false },
    { key: 'availability', label: 'Availability (accepting new patients, online scheduling)', type: 'number', min: 0, maxNum: 100, wide: false },
    { key: 'language', label: 'Language and accessibility match', type: 'number', min: 0, maxNum: 100, wide: false },
    { key: 'defaultSort', label: 'Default sort', type: 'select', options: ['Best match', 'Distance', 'Last name A–Z', 'Featured first'] },
    { key: 'featuredLabelled', label: 'Always label featured providers', type: 'switch', readonly: true, hint: 'Required by the guest design: featured promotion is always labeled and only reorders under “Featured first”.' }] }],
  validate: d => { const sum = ['relevance', 'distance', 'availability', 'language'].reduce((s, k) => s + (+d[k] || 0), 0); return sum !== 100 ? { relevance: `The weights add up to ${sum}. Make them add up to 100.` } : {}; },
  side: d => { const rows = [['Relevance', d.relevance], ['Distance', d.distance], ['Availability', d.availability], ['Language and accessibility', d.language]]; const sum = rows.reduce((s, r) => s + (+r[1] || 0), 0);
    return `<h2 class="side-h">Weight split</h2>${barList(rows.map(([label, value]) => ({ label, value: +value || 0 })), { unit: '%', max: 100 })}<p class="${sum === 100 ? 'muted' : 'err'}">${sum === 100 ? '' : ic('error', 16)}<span>Total: ${sum} of 100</span></p>`; }
});

/* ---- Location-aware configuration ---- */
defineSingleton({
  route: 'admin-settings-locations', id: 'locations', area: 'locations', section: 'Administrative settings', title: 'Location-aware configuration', noun: 'location setting',
  lede: 'Approved, location-specific information patients see when they open or arrive at a facility. Geofencing and beacons are not MVP features and need discovery.',
  formTitle: 'Facilities',
  describe: (a, b) => b.rows.flatMap(r => { const o = a.rows.find(x => x.id === r.id); return !o ? [`Added: ${r.name}`] : same(o, r) ? [] : [`Edited: ${r.name}`]; }),
  renderEditor(host, st, { ro, onChange }) {
    rowsEditor(host, { rows: st.working.rows, noun: 'facility', caption: 'Facilities', ro, rowTitle: r => r.name, searchText: r => `${r.name} ${r.message}`,
      columns: [
        { key: 'name', label: 'Facility', sortable: true, render: r => `<span class="cell-2"><span>${esc(r.name)}</span><span class="muted">${esc(r.type)}</span></span>` },
        { key: 'message', label: 'Arrival message', render: r => r.message ? esc(r.message) : '<span class="muted">None</span>', cls: 'wrap' },
        { key: 'status', label: 'Status', render: r => `<span class="badges col">${badge(r.enabled ? 'visible' : 'hidden', r.enabled ? 'Shown' : 'Hidden')}${r.indoor ? badge('live', 'Indoor maps') : badge('hidden', 'No indoor maps')}</span>` }],
      extraActions: r => btn({ label: `Preview ${r.name}`, icon: 'smartphone', variant: 'text', iconOnly: true, attrs: `data-loc-pv="${r.id}"` }),
      sections: [{ fields: [
        { key: 'name', label: 'Facility name', required: true, max: 60 }, { key: 'type', label: 'Type', type: 'select', options: ['Hospital', 'Clinic', 'Building', 'Parking'] },
        { key: 'message', label: 'Arrival message', type: 'textarea', max: 140, hint: 'Shown on the location card, for example where to check in.' },
        { key: 'parking', label: 'Parking information', max: 80 }, { key: 'indoor', label: 'Indoor maps available (from the published wayfinding file)', type: 'switch' },
        { key: 'enabled', label: 'Show location-specific information', type: 'switch' }] }],
      blank: () => ({ name: '', type: 'Clinic', message: '', parking: '', indoor: false, enabled: true }), validate: (v, others) => dupCheck('name', 'record')(v, others),
      onChange, onExtraClick: e => { const b = e.target.closest('[data-loc-pv]'); if (b) { st.pvLoc = b.dataset.locPv; onChange(); announce(`Preview shows ${b.getAttribute('aria-label').replace('Preview ', '')}`); } } });
  },
  preview: (d, src, st) => { const l = d.rows.find(r => r.id === st.pvLoc) || d.rows[0]; return { screen: 'location', layout: layoutFor('guest'), content: { ...appContent(), location: l.enabled ? l : { ...l, message: '', parking: '' } }, label: `${l.name}, ${src === 'working' ? 'your edits' : src}` }; }
});
