/* ---------- Collections: a list page plus an editor (new and :id) for each item type ----------
   Used by Campaigns, Emergency alerts, Quick links, Featured cards and Audience segments. Each item is a
   config record with its own Draft → Demo → Production lifecycle and history. */
const fields = sections => sections.flatMap(s => s.fields);
function lastChange(r) { const e = r.events[r.events.length - 1]; return e ? e.at : ''; }

function defineCollection(cfg) {
  const allFields = () => fields(cfg.sections);
  /* ---- List ---- */
  BUILT_PAGES[cfg.route] = {
    async render(main) {
      const role = Session.role(), canEdit = can(role, cfg.area, 'draft');
      main.innerHTML = `<div class="page ${cfg.cls || ''}">${pageHead({ crumbs: [[cfg.section, null]], title: cfg.title, lede: cfg.lede,
        actions: canEdit ? `<a class="btn btn-primary" href="#${cfg.route}-new">${ic('add', 20)}<span class="lbl">${esc(cfg.newLabel)}</span></a>` : '' })}
        <div id="col-body">${loadingState(`Loading ${cfg.title.toLowerCase()}`)}</div></div>`;
      let list;
      try { list = await ConfigService.list(cfg.type); }
      catch (err) { $('#col-body').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
      const counts = { live: list.filter(r => r.production && latestOn(r)).length, demo: list.filter(r => r.demo && r.demo !== r.production).length, draft: list.filter(r => r.draft).length, review: list.filter(r => r.review).length };
      $('#col-body').innerHTML = `${cfg.summary ? cfg.summary(list) : ''}
        <section class="card hub-pub" aria-labelledby="hub-pub-h" id="hub-pub"></section>
        <section class="card"><div class="card-body" id="col-table"></div></section>`;
      featureBar([cfg.type], cfg.title);
      dataTable($('#col-table'), {
        id: 'col', caption: cfg.title, noun: cfg.noun, searchPlaceholder: `Search ${cfg.title.toLowerCase()}`,
        rows: list, defaultSort: cfg.defaultSort || { key: 'updated', dir: 'desc' },
        searchText: r => `${r.name} ${cfg.searchExtra ? cfg.searchExtra(latestData(r)) : ''}`,
        filters: [
          { key: 'env', label: 'Publishing', options: [['production', 'Live, nothing pending'], ['demo', 'Waiting on demo'], ['draft', 'Open draft']], match: (r, v) => envRank(r) === v },
          ...(cfg.filters || [])
        ],
        empty: { icon: cfg.icon, title: `No ${cfg.title.toLowerCase()} yet`, text: canEdit ? `Create the first ${cfg.noun}.` : '' },
        columns: [
          { key: 'name', label: cfg.nameLabel || 'Title', sortable: true, sortValue: r => r.name.toLowerCase(), render: r => { const sub = cfg.nameSub && cfg.nameSub(latestData(r)); const link = `<a class="row-link" href="#${cfg.route}-${r.id}">${cfg.nameIcon ? ic(cfg.nameIcon(latestData(r)), 20) : ''}<span>${esc(r.name)}</span></a>`;
            return sub ? `<div class="name-cell${cfg.nameIcon ? ' has-ic' : ''}">${link}<span class="name-sub">${esc(sub)}</span></div>` : link; } },
          ...cfg.columns.map(c => ({ ...c, render: r => c.render(latestData(r), r), sortValue: c.sortValue ? r => c.sortValue(latestData(r)) : undefined })),
          { key: 'status', label: 'Publishing', render: envBadges },
          { key: 'updated', label: 'Last change', sortable: true, sortValue: lastChange, render: r => `<span class="nowrap">${esc(fmtDateTime(lastChange(r)))}</span>` }
        ]
      });
    }
  };
  const latestOn = r => { const d = dataAt(r, 'production'); return d && d.enabled !== false; };

  /* ---- Editor ---- */
  const editor = {
    st: null,
    async render(main, ctx) {
      const isNewRoute = ctx.route.pattern.endsWith('-new');
      const st = this.st = { rec: null, working: null, errors: {}, isNew: isNewRoute, items: null, itemErrors: null, active: 0, open: 0 };
      const crumbs = [[cfg.section, null], [cfg.title, cfg.route]];
      main.innerHTML = `<div class="page ${cfg.cls || ''}" id="ed-page">${loadingState(`Loading the ${cfg.noun}`)}</div>`;
      if (!isNewRoute) {
        try { st.rec = await ConfigService.get(ctx.params.id); }
        catch (err) { $('#ed-page').innerHTML = `${pageHead({ crumbs, title: `${cfg.noun[0].toUpperCase()}${cfg.noun.slice(1)} not found` })}${errorState(err.message)}`; $('[data-retry]').onclick = () => this.render(main, ctx); return; }
        st.working = clone(latestData(st.rec));
      } else { st.items = [cfg.defaults()]; st.itemErrors = [{}]; st.working = st.items[0]; }
      const base = () => st.isNew ? cfg.defaults() : latestData(st.rec);
      const blankJson = JSON.stringify(cfg.defaults());
      const dirty = () => st.isNew ? st.items.some(d => JSON.stringify(d) !== blankJson) : !same(st.working, base());
      const one = cfg.noun, cap = one[0].toUpperCase() + one.slice(1);
      const ro = !can(Session.role(), cfg.area, 'draft');
      const title = () => st.isNew && st.items.length > 1 ? `New ${cfg.title.toLowerCase()} (${st.items.length})` : recName(st.working) || (st.isNew ? cfg.newLabel : cfg.title);
      const secs = () => cfg.sections.map(s => ({ ...s, fields: s.fields.map(f => ro ? { ...f, readonly: true } : f) }));
      $('#ed-page').innerHTML = `${pageHead({ crumbs, title: title(), badges: `<span id="ed-badges">${st.isNew ? badge('unsaved', 'New') : envBadges(st.rec)}</span>`, lede: cfg.editorLede || '' })}
        ${cfg.banner ? cfg.banner : ''}
        <section class="card lc lc-slim" aria-labelledby="lc-h"><div class="card-body" id="lc"></div></section>
        <div class="ed-grid${cfg.preview || cfg.side ? '' : ' single'}">
          <section class="card ${cfg.formCls || ''}" aria-labelledby="form-h"><div class="card-head"><h2 id="form-h">${esc(cfg.formTitle || 'Details')}</h2>${ro ? `<div class="card-actions">${badge('fixed', 'View only')}</div>` : ''}</div>
            <form class="card-body form" id="ed-form" novalidate></form></section>
          ${cfg.preview ? '<aside class="ed-side" id="ed-preview"></aside>' : cfg.side ? '<aside class="ed-side"><section class="card"><div class="card-body" id="ed-side"></div></section></aside>' : ''}
        </div>
        ${st.isNew ? '' : historyCard()}`;
      const form = $('#ed-form');
      /* New items: an accordion, one panel per item, Add more at the bottom. The open panel drives the preview.
         Item 1 keeps the f- ids of the single form; item n uses f<n>-. */
      const pre = i => (i === 0 ? 'f' : `f${i}`);
      const accHead = i => { const d = st.items[i], n = Object.keys(st.itemErrors[i]).length;
        return `${ic('expand_more', 20, 'acc-chev')}<span class="acc-t">${esc(cap)} ${i + 1}</span>${d.title || d.name ? `<span class="acc-name">${esc(d.title || d.name)}</span>` : '<span class="acc-name muted">Untitled</span>'}${n ? `<span class="acc-err">${ic('error', 16)}${plural(n, 'problem')}</span>` : ''}`; };
      const drawPanel = i => { const host = $(`#acc-f${i}`); if (host) host.innerHTML = renderForm(secs(), st.items[i], st.itemErrors[i], pre(i)); };
      const drawAcc = () => {
        form.innerHTML = `<div class="acc">${st.items.map((d, i) => `<section class="acc-item${st.open === i ? ' open' : ''}" data-i="${i}">
            <div class="acc-row"><h3 class="acc-h"><button type="button" class="acc-btn" id="acc-b${i}" data-acc="${i}" aria-expanded="${st.open === i}" aria-controls="acc-p${i}">${accHead(i)}</button></h3>
              ${st.items.length > 1 ? btn({ label: `Remove ${one} ${i + 1}`, icon: 'delete', variant: 'text', size: 'sm', iconOnly: true, attrs: `data-acc-rm="${i}"` }) : ''}</div>
            <div class="acc-panel" id="acc-p${i}" role="region" aria-labelledby="acc-b${i}" ${st.open === i ? '' : 'hidden'}><div id="acc-f${i}"></div></div></section>`).join('')}</div>
          <div class="acc-more">${btn({ label: `Add more`, icon: 'add', variant: 'secondary', attrs: `data-acc-add ${st.items.length >= 10 ? 'disabled title="Up to 10 at a time"' : ''}` })}<span class="muted small">${st.items.length > 1 ? `${plural(st.items.length, one)} will be saved as drafts together.` : `Add more to create several ${cfg.title.toLowerCase()} at once.`}</span></div>`;
        st.items.forEach((d, i) => { drawPanel(i); wireForm($(`#acc-f${i}`), allFields, st.items[i], debounce(() => { onItemChange(i); }, 120), () => drawPanel(i)); });
      };
      const onItemChange = i => {
        const errs = st.itemErrors[i];
        if (Object.keys(errs).length) { const fresh = validateData(allFields(), st.items[i], cfg.validate); const before = Object.keys(errs).length; Object.keys(errs).forEach(k => { if (!fresh[k]) delete errs[k]; });
          if (Object.keys(errs).length !== before) { const id = document.activeElement && document.activeElement.id; drawPanel(i); const el = id && document.getElementById(id); if (el) el.focus(); } }
        const b = $(`#acc-b${i}`); if (b) b.innerHTML = accHead(i);
        refresh();
      };
      const openItem = (i, focusField) => {
        st.open = st.open === i && !focusField ? -1 : i;
        if (st.open >= 0) { st.active = i; st.working = st.items[i]; st.errors = st.itemErrors[i]; }
        $$('.acc-item', form).forEach((el, k) => { const on = k === st.open; el.classList.toggle('open', on); $('.acc-btn', el).setAttribute('aria-expanded', on); $('.acc-panel', el).hidden = !on; });
        refresh();
        if (focusField) { const f = $(`#${pre(i)}-${allFields()[0].key}`); f && f.focus(); }
      };
      const drawForm = () => { if (st.isNew) drawAcc(); else form.innerHTML = renderForm(secs(), st.working, st.errors, 'f'); };
      let pvCard = null;
      const refresh = () => {
        $('#ed-badges').innerHTML = st.isNew ? badge('unsaved', 'New') : `${envBadges(st.rec)}${dirty() ? badge('unsaved') : ''}`;
        $('#page-h').textContent = title();
        lc.render();
        if (pvCard) pvCard.update();
        if (cfg.side) $('#ed-side').innerHTML = cfg.side(st.working, st.rec);
      };
      const validate = () => {
        if (st.isNew) {
          st.items.forEach((d, i) => { st.itemErrors[i] = validateData(allFields(), d, cfg.validate); });
          const bad = st.itemErrors.findIndex(x => Object.keys(x).length);
          if (bad < 0) return true;
          st.open = bad; st.active = bad; st.working = st.items[bad]; st.errors = st.itemErrors[bad]; drawForm(); refresh();
          const n = st.itemErrors.filter(x => Object.keys(x).length).length;
          if (st.items.length > 1) toast(`Fix ${plural(n, one)} before saving. Nothing was saved.`, { kind: 'error', ms: 7000 });
          $(`#${pre(bad)}-errsum`).focus(); return false;
        }
        st.errors = validateData(allFields(), st.working, cfg.validate);
        drawForm();
        if (Object.keys(st.errors).length) { $('#f-errsum').focus(); return false; }
        return true;
      };
      form.addEventListener('submit', e => e.preventDefault());
      if (st.isNew) form.addEventListener('click', e => {
        const h = e.target.closest('[data-acc]'), rm = e.target.closest('[data-acc-rm]'), add = e.target.closest('[data-acc-add]');
        if (h) openItem(+h.dataset.acc);
        if (add && !add.disabled) {
          const last = st.items[st.items.length - 1];
          st.items.push(cfg.defaults()); st.itemErrors.push({});
          st.open = st.items.length - 1; st.active = st.open; st.working = st.items[st.open]; st.errors = st.itemErrors[st.open];
          drawForm(); refresh(); const f = $(`#${pre(st.open)}-${allFields()[0].key}`); f && f.focus();
          announce(`${cap} ${st.items.length} added and opened`); void last;
        }
        if (rm) {
          const i = +rm.dataset.accRm; st.items.splice(i, 1); st.itemErrors.splice(i, 1);
          st.open = Math.min(Math.max(0, i - 1), st.items.length - 1); st.active = st.open; st.working = st.items[st.open]; st.errors = st.itemErrors[st.open];
          drawForm(); refresh(); $(`#acc-b${st.open}`).focus(); announce(`${cap} ${i + 1} removed`);
        }
      });
      drawForm();
      if (!st.isNew) wireForm(form, allFields, st.working, debounce(() => {
        if (Object.keys(st.errors).length) { const fresh = validateData(allFields(), st.working, cfg.validate); Object.keys(st.errors).forEach(k => { if (!fresh[k]) { delete st.errors[k]; const el = $(`[data-field="${k}"]`, form); if (el) { el.classList.remove('has-error'); const er = $('.err', el); if (er) er.hidden = true; $$('[aria-invalid]', el).forEach(x => x.removeAttribute('aria-invalid')); } } }); }
        refresh();
      }, 120), drawForm);
      const describe = (a, b) => cfg.describe ? cfg.describe(a, b) : describeData(a, b, allFields());
      const lc = Lifecycle({
        host: () => $('#lc'), area: cfg.area, noun: cfg.noun,
        getRec: () => st.rec, getWorking: () => clone(st.working), isDirty: dirty, isNew: () => st.isNew, describe, validate,
        newSaveLabel: () => st.items && st.items.length > 1 ? `Save ${plural(st.items.length, one)} as drafts` : 'Save as draft',
        createdMsg: () => st.items && st.items.length > 1 ? `${plural(st.items.length, one)} saved as drafts. Deploy or publish them together from the Publishing bar.` : null,
        /* New items: save every accordion item, in order; positions follow the existing ones */
        create: async () => {
          const recs = [];
          for (const d of st.items) { const data = clone(d); if ('order' in data) data.order = ConfigService.peekAll(cfg.type).length + 1; recs.push(await ConfigService.create(cfg.type, data, 'Created in the Admin')); }
          return recs.length === 1 ? recs[0] : { many: recs };
        },
        onSaved: (rec, kind) => {
          if (kind === 'created') { Router.clearGuard(); Router.go(rec.many ? cfg.route : `${cfg.route}-${rec.id}`); return; }
          st.rec = rec; const fresh = clone(latestData(rec)); Object.keys(st.working).forEach(k => delete st.working[k]); Object.assign(st.working, fresh);
          drawForm(); refresh(); if (hist) hist.update(rec.events); $('#lc-h').focus();
        },
        onDiscard: () => { const fresh = clone(base()); Object.keys(st.working).forEach(k => delete st.working[k]); Object.assign(st.working, fresh); st.errors = {}; drawForm(); refresh(); $('#lc-h').focus(); },
        afterDelete: () => { Router.clearGuard(); Router.go(cfg.route); }
      });
      let hist = null;
      if (!st.isNew) hist = mountHistory({ getRec: () => st.rec, describe, onSaved: (rec) => { st.rec = rec; Object.keys(st.working).forEach(k => delete st.working[k]); Object.assign(st.working, clone(latestData(rec))); drawForm(); refresh(); hist.update(rec.events); } });
      if (cfg.preview) {
        $('#ed-preview').id = 'ed-pv';
        pvCard = mountPreviewCard($('#ed-pv'), {
          title: `Mobile preview of the ${cfg.noun}`,
          sources: () => recSources(st.rec, dirty(), st.isNew),
          payload: src => cfg.preview(src === 'working' ? st.working : dataAt(st.rec, src), st.rec ? st.rec.id : '__new__', src)
        });
      }
      this.pv = pvCard;
      refresh();
      Router.setGuard(async () => {
        if (!dirty() || ro) return true;
        const r = await confirmDialog({ title: 'Leave without saving?', body: `<p>Your changes to “${esc(title())}” aren’t saved. If you leave, they’re lost.</p>`, confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
        return r.ok;
      });
    },
    leave() { if (this.pv) { this.pv.destroy(); this.pv = null; } }
  };
  BUILT_PAGES[`${cfg.route}-new`] = editor;
  BUILT_PAGES[`${cfg.route}-:id`] = editor;
}

/* Shared field groups */
const TZ_OPTIONS = [['America/Chicago', 'Central Time – Dallas (default)'], ['America/New_York', 'Eastern Time'], ['America/Denver', 'Mountain Time'], ['America/Los_Angeles', 'Pacific Time']];
const scheduleFields = [
  { key: 'audience', label: 'Audience', type: 'segment', hint: 'Who sees it. Segments are managed in Audience management.' },
  { key: 'startMode', label: 'Starts', type: 'radio', options: [['now', 'Instant'], ['scheduled', 'Scheduled']], default: 'scheduled', rerender: true,
    hint: 'Instant starts it as soon as it’s published.', onSet: d => { if (d.startMode === 'now') d.start = nowLocal().slice(0, 16); } },
  { key: 'start', label: 'Start', type: 'datetime', required: true, show: d => d.startMode !== 'now' },
  { key: 'end', label: 'End', type: 'datetime', required: true },
  { key: 'timeZone', label: 'Time zone', type: 'select', options: TZ_OPTIONS, hint: 'Pending confirmation: Central is the assumed default.' }
];
const windowCheck = d => d.start && d.end && d.end <= d.start ? { end: 'The end must be after the start.' } : {};
const WINDOW_BADGE = { active: ['live', 'Active now'], upcoming: ['planned', 'Upcoming'], ended: ['hidden', 'Ended'], off: ['hidden', 'Turned off'] };
const windowBadge = d => { const [k, l] = WINDOW_BADGE[windowStatus(d)]; return badge(k, l); };
const homePreview = (audience = 'guest', type = null) => (data, id, src, focus, extra = {}) => ({
  screen: 'home', audience, layout: layoutFor(audience), colors: colorsFor('production'), focus,
  content: appContent({ overrides: data && id !== '__new__' ? { [id]: data } : {}, newItem: id === '__new__' && data ? { type, data } : null, audience, ...extra }),
  label: src === 'working' ? 'your edits, not live' : `${src} version`
});

/* ---- Campaigns ---- */
defineCollection({
  route: 'home-campaigns', type: 'campaign', area: 'campaigns', section: 'Home Screen', title: 'Campaigns', noun: 'campaign', newLabel: 'New campaign', icon: 'campaign',
  lede: 'Promotional banners on the home screen. The SOW proposes three to five campaigns for the MVP, pending confirmation. One active campaign shows at a time; emergency alerts are managed separately.',
  summary: list => { const n = list.length; return n > 5 ? `<p class="note-line">${ic('info', 20)}<span>${n} campaigns – more than the five the SOW proposes.</span></p>` : ''; },
  defaults: () => ({ title: '', type: 'Seasonal', tag: '', icon: 'vaccines', description: '', image: 'none', imageAlt: '', fact1Label: '', fact1Value: '', fact2Label: '', fact2Value: '', ctaLabel: '', destination: { type: 'screen', value: 'Find my Care' }, audience: 'seg-all', start: nowLocal().slice(0, 11) + '08:00', end: '', timeZone: TZ, enabled: true }),
  sections: [
    { title: 'Content', fields: [
      { key: 'title', label: 'Campaign title', required: true, max: 60 },
      { key: 'type', label: 'Campaign type', type: 'select', options: ['Seasonal', 'Service', 'Awareness', 'Announcement', 'Event'], wide: false },
      { key: 'tag', label: 'Label above the title', max: 30, hint: 'Short, for example “Flu season”.', wide: false },
      { key: 'description', label: 'Description', type: 'textarea', max: 160, required: true },
      { key: 'icon', label: 'Icon', type: 'icon', hint: 'From the approved icon list.' },
      { key: 'image', label: 'Banner image', type: 'image', hint: 'Sample images only in the prototype. Image upload needs the approved storage.' },
      { key: 'imageAlt', label: 'Image alternative text', max: 120, required: true, show: d => d.image && d.image !== 'none', hint: 'Describe what the image shows for screen reader users.' },
      { key: 'fact1Label', label: 'Fact 1 label', max: 16, wide: false }, { key: 'fact1Value', label: 'Fact 1 text', max: 32, wide: false },
      { key: 'fact2Label', label: 'Fact 2 label', max: 16, wide: false }, { key: 'fact2Value', label: 'Fact 2 text', max: 32, wide: false }] },
    { title: 'Call to action', fields: [
      { key: 'ctaLabel', label: 'Button label', required: true, max: 24 },
      { key: 'destination', label: 'Destination', type: 'destination', required: true, noNone: true }] },
    { title: 'Audience and schedule', fields: [...scheduleFields] }
  ],
  validate: d => ({ ...windowCheck(d), ...((d.fact1Label && !d.fact1Value) ? { fact1Value: 'Add the text for fact 1, or clear its label.' } : {}), ...((d.fact2Label && !d.fact2Value) ? { fact2Value: 'Add the text for fact 2, or clear its label.' } : {}) }),
  searchExtra: d => `${d.type} ${d.description}`,
  columns: [
    { key: 'type', label: 'Type', render: d => esc(d.type) },
    { key: 'audience', label: 'Audience', render: d => esc(segmentName(d.audience)) },
    { key: 'window', label: 'Schedule', sortable: true, sortValue: d => d.start, render: d => `<div class="cell-stack"><span class="sched">${esc(fmtLocal(d.start, false))} – ${esc(fmtLocal(d.end, false))}</span>${windowBadge(d)}</div>` }
  ],
  filters: [{ key: 'type', label: 'Type', options: ['Seasonal', 'Service', 'Awareness', 'Announcement', 'Event'].map(x => [x, x]), match: (r, v) => latestData(r).type === v }],
  preview: (d, id, src) => homePreview(d && d.audience === 'seg-signedin' ? 'authenticated' : 'guest', 'campaign')(d, id, src, 'campaign')
});

/* ---- Emergency alerts: styled and worded apart from campaigns ---- */
defineCollection({
  route: 'home-alerts', type: 'alert', area: 'alerts', section: 'Home Screen', title: 'Emergency alerts', noun: 'emergency alert', newLabel: 'New emergency alert', icon: 'warning', cls: 'alert-page',
  lede: 'Urgent safety and service messages that sit above everything on the home screen. Use them only for emergencies and disruptions – never for promotions.',
  banner: `<div class="alert-banner" role="note">${ic('warning', 24, 'f1')}<div><p class="ab-t">Emergency alerts reach every patient in the audience as soon as they’re active</p><p>Check the wording on demo first. Two alerts can show at once; priority 1 shows on top.</p></div></div>`,
  formCls: 'alert-form', formTitle: 'Alert details',
  nameIcon: d => d.icon,
  defaults: () => ({ title: '', type: 'Weather', icon: 'warning', message: '', details: '', ctaLabel: '', destination: { type: 'none', value: '' }, audience: 'seg-all', priority: 1, start: nowLocal(), end: '', timeZone: TZ, duration: 'window', dismissible: false, enabled: true }),
  sections: [
    { title: 'Message', fields: [
      { key: 'title', label: 'Alert title', required: true, max: 80 },
      { key: 'type', label: 'Alert type', type: 'select', options: ['Weather', 'Facility', 'Safety', 'Service disruption', 'Public health'], wide: false },
      { key: 'icon', label: 'Alert icon', type: 'alertIcon', wide: false },
      { key: 'message', label: 'Alert message', type: 'textarea', required: true, max: 200, hint: 'Shown on the banner. Say what is happening and what to do.' },
      { key: 'details', label: 'Full alert', type: 'textarea', rows: 4, max: 600, hint: 'Shown when patients open the alert. Include a phone number if they need help.' }] },
    { title: 'Call to action', fields: [
      { key: 'ctaLabel', label: 'Button label', max: 24, hint: 'Optional, for example “Call us”.' },
      { key: 'destination', label: 'Button destination', type: 'destination' }] },
    { title: 'Audience and timing', fields: [
      { key: 'priority', label: 'Priority', type: 'select', options: [[1, 'Priority 1 – shows first'], [2, 'Priority 2'], [3, 'Priority 3']], wide: false },
      { key: 'duration', label: 'Display duration', type: 'select', wide: false, options: [['window', 'For the whole active window'], ['1h', '1 hour after a patient first sees it'], ['4h', '4 hours after first seen'], ['24h', '24 hours after first seen']], hint: 'Meaning pending confirmation (§10.6).' },
      ...scheduleFields,
      { key: 'dismissible', label: 'Patients can dismiss it', type: 'switch' }] }
  ],
  validate: d => ({ ...windowCheck(d), ...(d.ctaLabel && d.destination.type === 'none' ? { destination: 'Choose where the button goes, or clear the button label.' } : {}), ...(!d.ctaLabel && d.destination.type !== 'none' ? { ctaLabel: 'Add a button label for this destination.' } : {}) }),
  searchExtra: d => `${d.type} ${d.message}`,
  columns: [
    { key: 'type', label: 'Type', render: d => esc(d.type) },
    { key: 'priority', label: 'Priority', sortable: true, sortValue: d => +d.priority, render: d => `<span class="ord-chip">P${d.priority}</span>`, cls: 'ord' },
    { key: 'window', label: 'Active window', sortable: true, sortValue: d => d.start, render: d => `<div class="cell-stack"><span class="sched">${esc(fmtLocal(d.start, false))} – ${esc(fmtLocal(d.end, false))}</span>${windowBadge(d)}</div>` }
  ],
  preview: (d, id, src) => homePreview('guest', 'alert')(d, id, src, null)
});

/* ---- Quick links ---- */
defineCollection({
  route: 'home-quick-links', type: 'quickLink', area: 'quickLinks', section: 'Home Screen', title: 'Quick links', noun: 'quick link', newLabel: 'New quick link', icon: 'apps',
  lede: 'Tiles in the Quick links module. MyChart links hand off to MyChart sign-in; the Admin never edits MyChart content.',
  nameIcon: d => d.icon, defaultSort: { key: 'order', dir: 'asc' },
  defaults: () => ({ title: '', icon: 'stethoscope', iconAlt: '', destination: { type: 'screen', value: 'Find my Care' }, requiresSignIn: false, order: ConfigService.peekAll('quickLink').length + 1, enabled: true }),
  sections: [{ title: 'Tile', fields: [
    { key: 'title', label: 'Title', required: true, max: 28, hint: 'Fits on two lines in a tile.' },
    { key: 'icon', label: 'Icon', type: 'icon' },
    { key: 'iconAlt', label: 'Icon alternative text', max: 60, hint: 'Leave empty when the title already says it – the icon is then decorative.' },
    { key: 'destination', label: 'Destination', type: 'destination', required: true, noNone: true },
    { key: 'requiresSignIn', label: 'Needs MyChart sign-in', type: 'switch', hint: 'Guests see a lock and go to MyChart sign-in first.' },
    { key: 'order', label: 'Position', type: 'number', min: 1, maxNum: 12, wide: false }] }],
  validate: d => d.destination.type === 'mychart' && !d.requiresSignIn ? { requiresSignIn: 'MyChart destinations need sign-in. Turn on “Needs MyChart sign-in”.' } : {},
  columns: [
    { key: 'destination', label: 'Destination', render: d => esc(destLabel(d.destination)).replace(/\//g, '/<wbr>'), cls: 'dest' },
    { key: 'order', label: 'Position', sortable: true, sortValue: d => d.order, render: d => `<span class="ord-chip">${d.order}</span>`, cls: 'ord' },
    { key: 'signin', label: 'Sign-in', render: d => d.requiresSignIn ? badge('fixed', 'MyChart') : '<span class="muted">Open</span>' },
  ],
  preview: (d, id, src) => homePreview('guest', 'quickLink')(d, id, src, 'tiles')
});

/* ---- Featured cards (UTSW resources rows, §10.4) ---- */
defineCollection({
  route: 'home-featured-cards', type: 'featuredCard', area: 'featuredCards', section: 'Home Screen', title: 'Featured cards', noun: 'featured card', newLabel: 'New featured card', icon: 'library_books',
  lede: 'Rows in the UTSW resources module. Assumed to be these rows rather than the MedBlog carousel – pending confirmation.',
  nameIcon: d => d.icon, nameSub: d => d.subtitle, defaultSort: { key: 'order', dir: 'asc' },
  defaults: () => ({ title: '', subtitle: '', icon: 'library_books', iconAlt: '', destination: { type: 'screen', value: 'Find my Care' }, order: ConfigService.peekAll('featuredCard').length + 1, enabled: true }),
  sections: [{ title: 'Card', fields: [
    { key: 'title', label: 'Title', required: true, max: 40 },
    { key: 'subtitle', label: 'Subtitle', max: 60 },
    { key: 'icon', label: 'Icon', type: 'icon' },
    { key: 'iconAlt', label: 'Icon alternative text', max: 60, hint: 'Leave empty when the title already says it.' },
    { key: 'destination', label: 'Destination', type: 'destination', required: true, noNone: true },
    { key: 'order', label: 'Position', type: 'number', min: 1, maxNum: 12, wide: false }] }],
  columns: [
    { key: 'destination', label: 'Destination', render: d => esc(destLabel(d.destination)).replace(/\//g, '/<wbr>'), cls: 'dest' },
    { key: 'order', label: 'Position', sortable: true, sortValue: d => d.order, render: d => `<span class="ord-chip">${d.order}</span>`, cls: 'ord' },
  ],
  preview: (d, id, src) => homePreview('guest', 'featuredCard')(d, id, src, 'services')
});

/* ---- Audience segments ---- */
const ruleText = r => `${AUDIENCE_ATTRS[r.attr].label} ${r.op} ${r.value}`;
const segmentSummary = d => !d.rules.length ? 'Everyone who uses MyCare' : `People where ${d.rules.map(ruleText).join(d.match === 'all' ? ' and ' : ' or ')}`;
function segmentConflicts(d) {
  if (d.match !== 'all') return [];
  const out = [], by = {};
  d.rules.forEach(r => { if (r.op === 'is') (by[r.attr] = by[r.attr] || new Set()).add(r.value); });
  Object.entries(by).forEach(([a, vals]) => { if (vals.size > 1) out.push(`${AUDIENCE_ATTRS[a].label} can’t be ${[...vals].join(' and ')} at the same time, so nobody matches. Use “Any rule” or remove one.`); });
  return out;
}
const segmentUsers = id => [
  ...ConfigService.peekAll('campaign').filter(r => latestData(r).audience === id).map(r => ['Campaign', r.name, `home-campaigns-${r.id}`]),
  ...ConfigService.peekAll('alert').filter(r => latestData(r).audience === id).map(r => ['Emergency alert', r.name, `home-alerts-${r.id}`]),
  ...DB.db.notifications.filter(n => n.sendTo === id && !['sent', 'cancelled'].includes(n.status)).map(n => ['Notification', n.title, `notifications-${n.id}`])
];
defineCollection({
  route: 'audiences', type: 'segment', area: 'audiences', section: 'Audience management', title: 'Audience segments', noun: 'segment', newLabel: 'New segment', icon: 'groups', nameLabel: 'Segment',
  lede: 'Groups of app users that campaigns, alerts and notifications can target. Only approved, non-clinical attributes are available – no PHI.',
  defaults: () => ({ name: '', description: '', match: 'all', rules: [{ attr: 'signedIn', op: 'is', value: 'Guest' }], reach: 0 }),
  sections: [{ title: 'Segment', fields: [
    { key: 'name', label: 'Segment name', required: true, max: 40 },
    { key: 'description', label: 'Description', type: 'textarea', max: 160 },
    { key: 'match', label: 'Include people who match', type: 'radio', options: [['all', 'All rules'], ['any', 'Any rule']] },
    { key: 'rules', label: 'Eligibility rules', type: 'rules', hint: 'Attributes and values are pending UTSW approval (§10.13).' }] }],
  validate: d => { const c = segmentConflicts(d); return c.length ? { rules: c[0] } : {}; },
  describe: (a, b) => !a ? ['New segment'] : [
    ...(a.name !== b.name ? [`Name: “${a.name}” → “${b.name}”`] : []), ...(a.description !== b.description ? ['Description is edited'] : []),
    ...(a.match !== b.match || !same(a.rules, b.rules) ? [`Rules: ${segmentSummary(a)} → ${segmentSummary(b)}`] : [])],
  searchExtra: d => d.description,
  columns: [
    { key: 'rules', label: 'Who’s included', render: d => `<span class="wrap-txt">${esc(segmentSummary(d))}</span>`, cls: 'wrap' },
    { key: 'reach', label: 'Estimated reach', sortable: true, sortValue: d => d.reach, render: d => d.reach ? `${d.reach.toLocaleString('en-US')} <span class="muted">(sample)</span>` : '<span class="muted">Estimated after publishing</span>', cls: 'num' }
  ],
  side: (d, rec) => {
    const used = rec ? segmentUsers(rec.id) : [], conf = segmentConflicts(d);
    return `<h2 class="side-h">Who’s in this segment</h2><p>${esc(segmentSummary(d))}.</p>
      ${conf.length ? `<p class="err">${ic('error', 16)}<span>${esc(conf[0])}</span></p>` : ''}
      <p class="side-k">Estimated reach</p><p class="side-v">${d.reach ? `${d.reach.toLocaleString('en-US')} people` : 'Calculated after publishing'} <span class="muted">(sample)</span></p>
      <p class="side-k">Used by</p>${used.length ? `<ul class="plain">${used.map(([t, n, href]) => `<li><span class="muted">${t}:</span> <a href="#${href}">${esc(n)}</a></li>`).join('')}</ul>` : '<p class="muted">Nothing targets this segment yet. Assign it in Targeting.</p>'}
      <p><a class="text-link" href="#audiences-rules">${ic('science', 20)}Test a person against every segment</a></p>`;
  }
});
