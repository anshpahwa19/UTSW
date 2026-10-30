/* ---------- Audit and versioning, platform operations, administrative settings, audience rules and targeting, zero-result searches ---------- */
const TYPE_LABEL = t => (CONFIG_TYPES[t] || { label: { user: 'User', notification: 'Notification', wayfinding: 'Wayfinding', search: 'Search', settings: 'Settings', platform: 'Platform' }[t] || t }).label;
function diffTable(before, after) {
  const flat = (o, p = '') => !o || typeof o !== 'object' ? { [p || 'value']: o } : Object.entries(o).reduce((a, [k, v]) => Object.assign(a, v && typeof v === 'object' && !Array.isArray(v) ? flat(v, p ? `${p}.${k}` : k) : { [p ? `${p}.${k}` : k]: v }), {});
  const A = flat(before || {}), B = flat(after || {});
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].filter(k => !same(A[k], B[k]));
  const show = v => v == null ? '<span class="muted">–</span>' : esc(Array.isArray(v) ? (v.length && typeof v[0] === 'object' ? `${v.length} items` : v.join(', ')) : String(v));
  if (!before && !after) return '<p class="muted">No before-and-after detail is recorded for this action.</p>';
  if (!keys.length) return '<p class="muted">No field-level differences.</p>';
  return `<div class="tbl-wrap" tabindex="0" role="region" aria-label="Before and after"><table class="tbl diff"><caption class="vh">Before and after values</caption><thead><tr><th scope="col">Field</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
    <tbody>${keys.slice(0, 40).map(k => `<tr><th scope="row">${esc(k)}</th><td class="wrap">${show(A[k])}</td><td class="wrap">${show(B[k])}</td></tr>`).join('')}</tbody></table></div>${keys.length > 40 ? `<p class="muted">And ${keys.length - 40} more fields.</p>` : ''}`;
}

BUILT_PAGES.audit = {
  async render(main) {
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Audit and versioning', null]], title: 'Audit logs', lede: 'Every administrative action in MyCare Admin: who did it, when, and what changed. Retention is pending confirmation (§10.16).' })}<div id="au">${loadingState('Loading the audit log')}</div></div>`;
    let rows;
    try { rows = await AuditService.list(); } catch (err) { $('#au').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    $('#au').innerHTML = `<section class="card"><div class="card-body" id="au-t"></div></section>`;
    const types = [...new Set(rows.map(r => r.targetType))].filter(Boolean);
    dataTable($('#au-t'), {
      id: 'au', caption: 'Audit log', noun: 'entry', rows, defaultSort: { key: 'at', dir: 'desc' }, pageSize: 15, searchPlaceholder: 'Search actions, items and comments',
      searchText: r => `${r.action} ${r.target} ${r.comment} ${UserService.name(r.by)}`,
      filters: [
        { key: 'by', label: 'Actor', options: DB.db.users.map(u => [u.id, `${u.first} ${u.last}`]), match: (r, v) => r.by === v },
        { key: 'type', label: 'Item type', options: types.map(t => [t, TYPE_LABEL(t)]), match: (r, v) => r.targetType === v },
        { key: 'env', label: 'Environment', options: [['draft', 'Draft'], ['demo', 'Demo'], ['production', 'Production']], match: (r, v) => r.environment === v }],
      columns: [
        { key: 'at', label: 'When', sortable: true, render: r => `<span class="nowrap">${esc(fmtDateTime(r.at))}</span>` },
        { key: 'by', label: 'Actor', sortable: true, sortValue: r => UserService.name(r.by), render: r => esc(UserService.name(r.by)) },
        { key: 'action', label: 'Action', sortable: true, render: r => esc(r.action) },
        { key: 'target', label: 'Item', render: r => `${esc(r.target)}<br><span class="muted">${esc(TYPE_LABEL(r.targetType))}${r.version ? ` · v${r.version}` : ''}</span>`, cls: 'wrap' },
        { key: 'env', label: 'Environment', render: r => r.environment ? badge(r.environment) : '<span class="muted">–</span>' },
        { key: 'details', label: 'Details', hideLabel: true, render: r => btn({ label: `Details for ${r.action}`, icon: 'difference', variant: 'text', iconOnly: true, attrs: `data-au="${r.id}"` }) }],
      onRender: tb => { tb.onclick = e => { const b = e.target.closest('[data-au]'); if (!b) return; const r = rows.find(x => x.id === b.dataset.au);
        openModal({ title: `${r.action}: ${r.target}`, wide: true, actions: btn({ label: 'Close', variant: 'primary', attrs: 'data-close' }), body: `<dl class="facts cols"><dt>When</dt><dd>${esc(fmtDateTime(r.at))}</dd><dt>Actor</dt><dd>${esc(UserService.name(r.by))}</dd><dt>Item</dt><dd>${esc(TYPE_LABEL(r.targetType))}${r.targetId && DB.db.records[r.targetId] ? ` – <a href="#${recLink(DB.db.records[r.targetId])}">open</a>` : ''}</dd><dt>Environment</dt><dd>${r.environment ? badge(r.environment) : '–'}${r.version ? ` v${r.version}` : ''}</dd><dt>Comment</dt><dd>${r.comment ? esc(r.comment) : 'None'}</dd></dl><h3 class="sub-h">Before and after</h3>${diffTable(r.before, r.after)}` }); }; }
    });
  }
};

BUILT_PAGES['audit-history'] = {
  async render(main) {
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Audit and versioning', null]], title: 'Configuration history', lede: 'Every configuration with its versions. Rollback is offered only for types that support it – all flags are assumptions pending confirmation (§10.17).' })}<div id="ch">${loadingState('Loading configurations')}</div></div>`;
    let recs;
    const load = async () => {
      try { recs = await ConfigService.list(); } catch (err) { $('#ch').innerHTML = errorState(err.message); $('[data-retry]').onclick = load; return; }
      $('#ch').innerHTML = `<section class="card"><div class="card-body" id="ch-t"></div></section>`;
      dataTable($('#ch-t'), {
        id: 'ch', caption: 'Configurations', noun: 'configuration', rows: recs, defaultSort: { key: 'updated', dir: 'desc' }, pageSize: 15, searchText: r => `${r.name} ${TYPE_LABEL(r.type)}`,
        filters: [{ key: 'type', label: 'Type', options: [...new Set(recs.map(r => r.type))].map(t => [t, TYPE_LABEL(t)]), match: (r, v) => r.type === v },
          { key: 'rb', label: 'Rollback', options: [['yes', 'Supported'], ['no', 'Not supported']], match: (r, v) => CONFIG_TYPES[r.type].supportsRollback === (v === 'yes') }],
        columns: [
          { key: 'name', label: 'Configuration', sortable: true, sortValue: r => r.name.toLowerCase(), render: r => `<a class="row-link" href="#${recLink(r)}">${esc(r.name)}</a>` },
          { key: 'type', label: 'Type', sortable: true, sortValue: r => TYPE_LABEL(r.type), render: r => esc(TYPE_LABEL(r.type)) },
          { key: 'versions', label: 'Versions', sortable: true, sortValue: r => Object.keys(r.versions).length, render: r => String(Object.keys(r.versions).length), cls: 'num' },
          { key: 'status', label: 'Publishing', render: envBadges },
          { key: 'rb', label: 'Rollback', render: r => CONFIG_TYPES[r.type].supportsRollback ? badge('pending', 'Supported') : '<span class="muted">Not supported</span>' },
          { key: 'updated', label: 'Last change', sortable: true, sortValue: lastChange, render: r => `<span class="nowrap">${esc(fmtDateTime(lastChange(r)))}</span>` },
          { key: 'v', label: 'Versions', hideLabel: true, render: r => Object.keys(r.versions).length ? btn({ label: `Versions of ${r.name}`, icon: 'history', variant: 'text', iconOnly: true, attrs: `data-ver="${r.id}"` }) : '' }],
        onRender: tb => { tb.onclick = e => { const b = e.target.closest('[data-ver]'); if (b) versions(recs.find(r => r.id === b.dataset.ver)); }; }
      });
    };
    const versions = r => {
      const canRb = CONFIG_TYPES[r.type].supportsRollback && canAct(Session.role(), CONFIG_TYPES[r.type].area, 'rollback');
      const m = openModal({ title: `Versions of ${r.name}`, wide: true, actions: `<a class="btn btn-secondary" href="#${recLink(r)}" data-close-nav><span class="lbl">Open the editor</span></a>${btn({ label: 'Close', variant: 'primary', attrs: 'data-close' })}`,
        body: `<ol class="versions">${Object.values(r.versions).sort((a, b) => b.version - a.version).map(v => `<li><div class="v-h"><b>v${v.version}</b> ${v.version === r.production ? badge('production') : ''}${v.version === r.demo && r.demo !== r.production ? badge('demo') : ''}<span class="muted">${esc(fmtDateTime(v.updatedAt))} · ${esc(UserService.name(v.updatedBy))}</span>
          ${canRb && v.version !== r.production ? btn({ label: `Roll back to v${v.version}`, icon: 'history', variant: 'text', attrs: `data-rb="${v.version}"` }) : ''}</div>${v.comment ? `<p>${esc(v.comment)}</p>` : ''}
          ${v.version !== r.production && r.production ? `<details><summary>Compare with production v${r.production}</summary>${diffTable(r.versions[r.production].data, v.data)}</details>` : ''}</li>`).join('')}</ol>
          ${CONFIG_TYPES[r.type].supportsRollback ? '' : `<p class="note-line">${ic('info', 20)}<span>${esc(TYPE_LABEL(r.type))}s don’t support rollback. Edit and publish a new version instead.</span></p>`}`,
        onOpen: (dlg, close) => {
          $$('[data-close-nav]', dlg).forEach(a => a.addEventListener('click', () => close()));
          dlg.addEventListener('click', async e => {
            const b = e.target.closest('[data-rb]'); if (!b) return;
            const v = +b.dataset.rb; close();
            const c = await confirmDialog({ title: `Roll back ${r.name} to v${v}?`, body: `<p>This creates version ${r.nextVersion} with the contents of v${v} on demo and production.</p>`, confirmLabel: `Roll back to v${v}`, variant: 'danger', comment: { label: 'Reason for the rollback', required: true } });
            if (!c.ok) return;
            try { await ConfigService.rollback(r.id, v, c.comment); toast(`${r.name} rolled back to v${v}.`, { kind: 'success' }); load(); }
            catch (err) { toast(err.message, { kind: 'error', ms: 8000 }); }
          });
        } });
      return m;
    };
    load();
  }
};

/* ---- Platform operations (simulated; scope requires discovery) ---- */
const INTEG = { simulated: ['simulated', 'Simulated – not connected'], manual: ['pending', 'Manual process'] };
BUILT_PAGES['platform-integrations'] = {
  async render(main) {
    const canRun = can(Session.role(), 'platform', 'publish');
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Platform operations', null]], title: 'Integration status', lede: 'The systems MyCare Admin depends on. Nothing is connected in the prototype, so every status is simulated. Credential management is out of scope.' })}<div id="pi">${loadingState('Checking integrations')}</div></div>`;
    const draw = list => {
      $('#pi').innerHTML = `<div class="integ-grid">${list.map(i => `<section class="card integ" aria-labelledby="ig-${i.id}"><div class="card-body">
        <h2 id="ig-${i.id}" class="side-h">${esc(i.name)}</h2><p class="muted">${esc(i.purpose)}</p>${badge(...INTEG[i.status])}
        <p>${esc(i.detail)}</p><p class="muted small">${i.lastCheck ? `Last checked ${esc(fmtDateTime(i.lastCheck))} (simulated)` : 'Not checked yet'}</p>
        ${canRun ? `<button type="button" class="btn btn-secondary" data-chk="${i.id}" aria-label="Run check on ${esc(i.name)}">${ic('refresh', 20)}<span class="lbl">Run check</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></button>` : ''}</div></section>`).join('')}</div>`;
    };
    let list;
    try { list = await PlatformService.integrations(); } catch (err) { $('#pi').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    draw(list);
    $('#pi').addEventListener('click', async e => {
      const b = e.target.closest('[data-chk]'); if (!b) return;
      setBusy(b, true, 'Checking');
      try { const i = await PlatformService.check(b.dataset.chk); list = list.map(x => x.id === i.id ? i : x); draw(list); toast(`${i.name}: still simulated – nothing to connect to yet.`); $(`[data-chk="${i.id}"]`).focus(); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    });
  }
};
BUILT_PAGES['platform-monitoring'] = {
  async render(main) {
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Platform operations', null]], title: 'Operational monitoring', badges: badge('mock'), lede: 'Errors and performance for the configuration the app loads. Sample data; advanced observability tooling needs discovery and approval.' })}<div id="pm">${loadingState('Loading monitoring')}</div></div>`;
    let m;
    try { m = await PlatformService.monitoring(30); } catch (err) { $('#pm').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    $('#pm').innerHTML = `<div class="two-col">
      <section class="card"><div class="card-head"><h2>Configuration fetch errors</h2></div><div class="card-body"><p class="chart-sub">Percent of app launches, last 30 days</p><div id="pm-err"></div></div></section>
      <section class="card"><div class="card-head"><h2>Configuration fetch time</h2></div><div class="card-body"><p class="chart-sub">Median, last 30 days · lower is better</p><div id="pm-lat"></div></div></section></div>
      <section class="card"><div class="card-head"><h2>Incidents</h2></div><div class="card-body" id="pm-inc"></div></section>`;
    lineChart($('#pm-err'), { points: m.errors, unit: '%', label: 'Configuration fetch errors', zeroBase: true });
    lineChart($('#pm-lat'), { points: m.latency, unit: 'ms', label: 'Configuration fetch time' });
    dataTable($('#pm-inc'), { id: 'inc', caption: 'Incidents', noun: 'incident', rows: m.incidents, defaultSort: { key: 'at', dir: 'desc' }, searchText: i => i.title,
      columns: [{ key: 'at', label: 'Started', sortable: true, render: i => esc(fmtDateTime(i.at)) }, { key: 'title', label: 'Incident', render: i => esc(i.title), cls: 'wrap' },
        { key: 'severity', label: 'Severity', render: i => badge(i.severity === 'Moderate' ? 'review' : 'pending', i.severity) }, { key: 'minutes', label: 'Duration', sortable: true, render: i => `${i.minutes} min`, cls: 'num' },
        { key: 'status', label: 'Status', render: i => badge('live', i.status) }] });
  }
};

/* ---- Administrative settings ---- */
const SETTINGS_FIELDS = [
  { key: 'sessionTimeout', label: 'Sign out after inactivity', type: 'select', options: [[15, '15 minutes'], [30, '30 minutes'], [60, '60 minutes']], hint: 'Pending the approved UTSW timeout.' },
  { key: 'timeZone', label: 'Default time zone for schedules', type: 'select', options: TZ_OPTIONS },
  { key: 'requirePublishComment', label: 'Require a comment to publish to production', type: 'switch' },
  { key: 'previewDefault', label: 'Default preview appearance', type: 'radio', options: [['light', 'Light'], ['dark', 'Dark']] }
];
BUILT_PAGES['admin-settings'] = {
  async render(main) {
    const ro = !can(Session.role(), 'adminSettings', 'publish');
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Administrative settings', null]], title: 'Approved settings', lede: 'Settings for MyCare Admin itself. Changes apply right away and are recorded in the audit log.' })}<div id="as">${loadingState('Loading settings')}</div></div>`;
    let s;
    try { s = await SettingsService.get(); } catch (err) { $('#as').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const d = { ...s, sessionTimeout: String(s.sessionTimeout) };
    $('#as').innerHTML = `<div class="ed-grid"><section class="card"><div class="card-head"><h2>Settings</h2>${ro ? `<div class="card-actions">${badge('fixed', 'View only')}</div>` : ''}</div><form class="card-body form" id="as-f" novalidate></form></section>
      <aside class="ed-side"><section class="card"><div class="card-head"><h2>Roles and permissions</h2><div class="card-actions">${badge('pending', 'Proposed')}</div></div><div class="card-body">
        <div class="tbl-wrap" tabindex="0" role="region" aria-label="Permission matrix"><table class="tbl matrix"><caption class="vh">Permission matrix, proposed</caption><thead><tr><th scope="col">Area</th>${Object.values(ROLES).map(r => `<th scope="col">${r.label}</th>`).join('')}</tr></thead>
        <tbody>${Object.entries(PERMISSIONS.areas).map(([a, lv]) => `<tr><th scope="row">${esc(AREA_NAMES[a] || a)}</th>${Object.keys(ROLES).map(r => `<td>${esc(LEVEL_LABEL[lv[r]])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <p class="muted">Pending UTSW confirmation. The matrix lives in one place so the confirmed version replaces it without screen changes.</p></div></section></aside></div>`;
    const f = $('#as-f');
    const fs = () => SETTINGS_FIELDS.map(x => ro ? { ...x, readonly: true } : x);
    const draw = () => { f.innerHTML = `${renderForm([{ fields: fs() }], d, {}, 'f')}${ro ? '' : `<div class="form-actions">${btn({ label: 'Save settings', icon: 'save', variant: 'primary', type: 'submit', attrs: 'id="as-save"' })}</div>`}`; };
    draw(); wireForm(f, fs, d, () => {}, draw);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const b = $('#as-save'); setBusy(b, true, 'Saving');
      try { await SettingsService.save({ ...d, sessionTimeout: +d.sessionTimeout }); toast('Settings saved.', { kind: 'success' }); setBusy(b, false); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    });
  }
};
const AREA_NAMES = { dashboard: 'Dashboard', analytics: 'Analytics', homeLayout: 'Home layout', quickLinks: 'Quick links', featuredCards: 'Featured cards', drawer: 'Drawer', appEntry: 'App entry', campaigns: 'Campaigns', alerts: 'Emergency alerts', colors: 'Global colors', search: 'Search', audiences: 'Audiences', wayfinding: 'Wayfinding', notifications: 'Notifications', users: 'Users', audit: 'Audit and versioning', platform: 'Platform operations', adminSettings: 'Administrative settings', locations: 'Location-aware configuration' };

/* ---- Segment rules: every rule, conflicts, and a tester ---- */
BUILT_PAGES['audiences-rules'] = {
  async render(main) {
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Audience management', null]], title: 'Segment rules', lede: 'Every eligibility rule across segments, checked for conflicts, and a tester to see which segments a person would fall into.' })}<div id="sr">${loadingState('Loading rules')}</div></div>`;
    let segs;
    try { segs = await ConfigService.list('segment'); } catch (err) { $('#sr').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const rows = segs.flatMap(r => { const d = latestData(r); return d.rules.length ? d.rules.map((ru, i) => ({ id: `${r.id}-${i}`, seg: r, d, ru, i })) : [{ id: r.id, seg: r, d, ru: null, i: 0 }]; });
    const person = { signedIn: 'Guest', language: 'English', region: 'Dallas', locationShared: 'On', platform: 'iOS', appVersion: '5.2' };
    const matchRule = (ru, p) => { const v = p[ru.attr]; if (ru.op === 'is') return v === ru.value; if (ru.op === 'is not') return v !== ru.value; if (ru.op === 'at least') return +v >= +ru.value; if (ru.op === 'below') return +v < +ru.value; return false; };
    const matches = (d, p) => !d.rules.length || (d.match === 'all' ? d.rules.every(r => matchRule(r, p)) : d.rules.some(r => matchRule(r, p)));
    $('#sr').innerHTML = `<div class="ed-grid"><section class="card"><div class="card-head"><h2>All rules</h2></div><div class="card-body" id="sr-t"></div></section>
      <aside class="ed-side"><section class="card"><div class="card-head"><h2>Test a person</h2></div><div class="card-body"><p class="muted">Pick attributes for a sample person. Nothing about real users is looked up.</p><form id="sr-p" class="form" novalidate></form><div id="sr-out" role="status" class="tester-out"></div></div></section></aside></div>`;
    dataTable($('#sr-t'), { id: 'sr', caption: 'Segment rules', noun: 'rule', rows, searchText: r => `${r.seg.name} ${r.ru ? ruleText(r.ru) : ''}`,
      filters: [{ key: 'attr', label: 'Attribute', options: Object.entries(AUDIENCE_ATTRS).map(([k, a]) => [k, a.label]), match: (r, v) => r.ru && r.ru.attr === v }],
      columns: [
        { key: 'seg', label: 'Segment', sortable: true, sortValue: r => r.seg.name, render: r => `<a class="row-link" href="#audiences-${r.seg.id}">${esc(r.seg.name)}</a>` },
        { key: 'rule', label: 'Rule', render: r => r.ru ? esc(ruleText(r.ru)) : '<span class="muted">No rules – everyone</span>', cls: 'wrap' },
        { key: 'match', label: 'Combine', render: r => r.d.rules.length > 1 ? (r.d.match === 'all' ? 'All rules' : 'Any rule') : '<span class="muted">–</span>' },
        { key: 'check', label: 'Check', render: r => segmentConflicts(r.d).length ? badge('error', 'Conflict') : badge('live', 'OK') }] });
    const pf = Object.entries(AUDIENCE_ATTRS).map(([k, a]) => ({ key: k, label: a.label, type: 'select', options: a.values, wide: false }));
    const run = () => { const hits = segs.filter(r => matches(latestData(r), person)); $('#sr-out').innerHTML = `<h3 class="sub-h">In ${plural(hits.length, 'segment')}</h3><ul class="plain">${segs.map(r => `<li>${hits.includes(r) ? badge('live', 'In') : badge('hidden', 'Out')} <a href="#audiences-${r.id}">${esc(latestData(r).name)}</a></li>`).join('')}</ul>`; };
    $('#sr-p').innerHTML = renderForm([{ fields: pf }], person, {}, 'p');
    wireForm($('#sr-p'), () => pf, person, run, () => {});
    run();
  }
};

/* ---- Targeting: assign segments to campaigns and alerts (saved as drafts on each item) ---- */
BUILT_PAGES['audiences-targeting'] = {
  async render(main) {
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Audience management', null]], title: 'Targeting', lede: 'Which segment each campaign and emergency alert targets. A change saves a draft on that item, which then goes through demo and production as usual.' })}<div id="tg">${loadingState('Loading targeting')}</div></div>`;
    let recs;
    try { recs = (await ConfigService.list()).filter(r => r.type === 'campaign' || r.type === 'alert'); } catch (err) { $('#tg').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const opts = segmentOptions();
    $('#tg').innerHTML = `<section class="card"><div class="card-body" id="tg-t"></div></section><p class="note-line">${ic('info', 20)}<span>Home module visibility by segment and notification targeting are set on the Home screen layout (per audience) and on each notification.</span></p>`;
    const draw = () => dataTable($('#tg-t'), { id: 'tg', caption: 'Targeting', noun: 'item', rows: recs, searchText: r => r.name, defaultSort: { key: 'name', dir: 'asc' },
      filters: [{ key: 'type', label: 'Type', options: [['campaign', 'Campaigns'], ['alert', 'Emergency alerts']], match: (r, v) => r.type === v }],
      columns: [
        { key: 'name', label: 'Item', sortable: true, sortValue: r => r.name.toLowerCase(), render: r => `<a class="row-link" href="#${recLink(r)}">${esc(r.name)}</a><br><span class="muted">${esc(TYPE_LABEL(r.type))}</span>` },
        { key: 'seg', label: 'Segment', render: r => { const area = CONFIG_TYPES[r.type].area, ok = can(Session.role(), area, 'draft'); return ok ? `<label class="vh" for="tg-${r.id}">Segment for ${esc(r.name)}</label><select class="input input-sm" id="tg-${r.id}" data-tg="${r.id}">${opts.map(([v, l]) => `<option value="${v}" ${v === latestData(r).audience ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>` : esc(segmentName(latestData(r).audience)); } },
        { key: 'live', label: 'In production', render: r => { const d = dataAt(r, 'production'); return d ? esc(segmentName(d.audience)) : '<span class="muted">Not published</span>'; } },
        { key: 'status', label: 'Publishing', render: envBadges }] });
    draw();
    $('#tg').addEventListener('change', async e => {
      const sel = e.target.closest('[data-tg]'); if (!sel) return;
      const r = recs.find(x => x.id === sel.dataset.tg), data = { ...clone(latestData(r)), audience: sel.value };
      sel.disabled = true;
      try { const nr = await ConfigService.saveDraft(r.id, data, `Audience changed to ${segmentName(sel.value)}`); recs = recs.map(x => x.id === nr.id ? nr : x); draw(); toast(`${r.name}: draft saved with audience ${segmentName(sel.value)}. Deploy it to demo from the item.`, { kind: 'success' }); const again = $(`#tg-${r.id}`); again && again.focus(); }
      catch (err) { sel.disabled = false; toast(err.message, { kind: 'error', ms: 8000 }); }
    });
  }
};

/* ---- Zero-result queries → add a synonym or mapping, or dismiss ---- */
BUILT_PAGES['search-zero-results'] = {
  async render(main) {
    const canFix = can(Session.role(), 'search', 'publish');
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Search configuration', null]], title: 'Zero-result queries', badges: badge('mock'), lede: 'Searches that returned nothing in the last 30 days. Add a synonym or mapping so they find something next time. The data source is pending (§10.12).' })}<div id="zr">${loadingState('Loading searches')}</div></div>`;
    let list;
    const load = async () => {
      try { list = await ZeroResultService.list(); } catch (err) { $('#zr').innerHTML = errorState(err.message); $('[data-retry]').onclick = load; return; }
      $('#zr').innerHTML = `<section class="card"><div class="card-body" id="zr-t"></div></section>`;
      dataTable($('#zr-t'), { id: 'zr', caption: 'Zero-result queries', noun: 'query', rows: list, defaultSort: { key: 'count', dir: 'desc' }, searchText: z => z.query, initialFilters: { status: 'open' },
        filters: [{ key: 'status', label: 'Status', options: [['open', 'Open'], ['resolved', 'Fixed'], ['dismissed', 'Dismissed']], match: (z, v) => z.status === v }],
        empty: { icon: 'task_alt', title: 'No zero-result searches', text: '' },
        columns: [
          { key: 'query', label: 'Search', sortable: true, render: z => `“${esc(z.query)}”` },
          { key: 'count', label: 'Times searched', sortable: true, render: z => z.count.toLocaleString('en-US'), cls: 'num' },
          { key: 'lastSeen', label: 'Last seen', sortable: true, render: z => esc(fmtDate(z.lastSeen)) },
          { key: 'status', label: 'Status', render: z => badge(...({ open: ['review', 'Open'], resolved: ['live', 'Fixed'], dismissed: ['hidden', 'Dismissed'] })[z.status]) },
          { key: 'acts', label: 'Actions', hideLabel: true, render: z => canFix && z.status === 'open' ? `<span class="row-acts">${btn({ label: 'Add synonym', variant: 'text', attrs: `data-z="syn" data-id="${z.id}"` })}${btn({ label: 'Add mapping', variant: 'text', attrs: `data-z="map" data-id="${z.id}"` })}${btn({ label: `Dismiss “${z.query}”`, icon: 'close', variant: 'text', iconOnly: true, attrs: `data-z="dismiss" data-id="${z.id}"` })}</span>` : '' }] });
    };
    $('#zr').addEventListener('click', async e => {
      const b = e.target.closest('[data-z]'); if (!b) return;
      const z = list.find(x => x.id === b.dataset.id);
      if (b.dataset.z === 'dismiss') { try { await ZeroResultService.setStatus(z.id, 'dismissed'); toast(`Dismissed “${z.query}”.`); load(); } catch (err) { toast(err.message, { kind: 'error' }); } return; }
      const syn = b.dataset.z === 'syn', recId = syn ? 'search-synonyms' : 'search-mappings';
      const sections = syn ? [{ fields: [{ key: 'term', label: 'What patients type', required: true, max: 40 }, { key: 'to', label: 'What it means', required: true, max: 60, type: 'select', options: SPECIALTY_LIST() }] }]
        : [{ fields: [{ key: 'phrase', label: 'Patient phrase', required: true, max: 60 }, { key: 'targetType', label: 'Goes to', type: 'select', options: ['Specialty', 'Condition', 'Scope', 'Content', 'Resource', 'Location'] }, { key: 'target', label: 'Target', required: true, max: 60 }] }];
      const d = await formModal({ title: syn ? `Add a synonym for “${z.query}”` : `Add a mapping for “${z.query}”`, sections, data: syn ? { term: z.query, to: SPECIALTY_LIST()[0] } : { phrase: z.query, targetType: 'Specialty', target: '' }, confirmLabel: 'Save to draft',
        note: `<p class="muted">This saves a draft of ${syn ? 'Synonyms' : 'Query mappings'}. Deploy it to demo and publish it from that page.</p>` });
      if (!d) { b.focus(); return; }
      try {
        const r = ConfigService.peek(recId), data = clone(latestData(r)); data.rows.push({ ...d, id: uid('r') });
        await ConfigService.saveDraft(recId, data, `Fix zero-result search “${z.query}”`);
        await ZeroResultService.setStatus(z.id, 'resolved');
        toast(`Saved to the ${syn ? 'Synonyms' : 'Query mappings'} draft.`, { kind: 'success', action: 'Open', onAction: () => Router.go(syn ? 'search-synonyms' : 'search-query-mappings') });
        load();
      } catch (err) { toast(err.message, { kind: 'error', ms: 8000 }); }
    });
    load();
  }
};
