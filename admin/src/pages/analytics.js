/* ---------- Analytics and reporting ----------
   MOCK DATA: deterministic sample series. No analytics source is connected and metric definitions are pending (§10.15).
   The presentation reads only AnalyticsService, so a real source replaces the service, not these pages. */
const ANALYTICS_PAGES = {
  'analytics-adoption': { cat: 'adoption', title: 'Adoption and engagement', chart: 'dau' },
  'analytics-search': { cat: 'search', title: 'Search', chart: 'searchSuccess' },
  'analytics-content': { cat: 'content', title: 'Content', chart: 'articleEng' },
  'analytics-care': { cat: 'care', title: 'Care and wayfinding', chart: 'findCareConv' },
  'analytics-notifications': { cat: 'notifications', title: 'Notifications', chart: 'notifConv' }
};
let analyticsDays = 30;
const rangeControl = () => `<div class="range"><span class="pv-k" id="rng-l">Date range</span>${segmented({ id: 'rng', label: 'Date range', options: [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']], value: String(analyticsDays) })}<span class="muted range-end">Ending ${fmtDay(ANALYTICS_END)}, 2026</span></div>`;
const mockNote = `<p class="note-line">${ic('database', 20)}<span>Sample data for the prototype. No analytics source is connected, and metric definitions are pending UTSW confirmation.</span></p>`;

const articleRows = days => STATIC_CONTENT.featured.map((f, i) => ({ t: f.title, kick: f.kick, views: [18420, 15230, 12110, 9870][i] * days / 30, eng: [27.4, 24.1, 21.8, 19.6][i] }));
function extraFor(cat, days) {
  if (cat === 'search') {
    const z = [...DB.db.zeroResults].filter(x => x.status === 'open').sort((a, b) => b.count - a.count).slice(0, 6);
    const mods = [['Quick links', 38.2], ['Search and top searches', 31.5], ['Campaign banner', 12.4], ['MedBlog (featured)', 9.8], ['UTSW resources', 6.1], ['Announcements', 2.0]];
    return `<div class="two-col"><section class="card"><div class="card-head"><h2>Home module click-through share</h2></div><div class="card-body">${barList(mods.map(([label, value]) => ({ label, value })), { unit: '%' })}</div></section>
      <section class="card"><div class="card-head"><h2>Top zero-result searches</h2><div class="card-actions"><a class="text-link" href="#search-zero-results">Fix them</a></div></div><div class="card-body">${z.length ? barList(z.map(x => ({ label: `“${x.query}”`, value: x.count }))) : '<p class="muted">No open zero-result searches.</p>'}</div></section></div>`;
  }
  if (cat === 'content') {
    return `<section class="card"><div class="card-head"><h2>MedBlog articles</h2></div><div class="card-body" id="an-art"></div></section>`;
  }
  if (cat === 'care') {
    const b = [['Clements University Hospital', 9120], ['Zale Lipshy Pavilion', 6340], ['Sample Outpatient Building', 4210], ['UTSW RedBird (sample)', 1180]].map(([label, v]) => ({ label, value: Math.round(v * days / 30) }));
    return `<section class="card"><div class="card-head"><h2>Indoor routes started, by building</h2></div><div class="card-body">${barList(b)}</div></section>`;
  }
  if (cat === 'notifications') {
    return `<section class="card"><div class="card-head"><h2>Sent notifications</h2></div><div class="card-body" id="an-notes"></div></section>`;
  }
  return '';
}

function analyticsPage(key) {
  const def = ANALYTICS_PAGES[key];
  return {
    async render(main) {
      main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Analytics and reporting', null]], title: def.title, badges: badge('mock') })}
        ${mockNote}${rangeControl()}<div id="an-body" aria-live="polite" aria-busy="true">${loadingState('Loading metrics')}</div></div>`;
      const load = async () => {
        $('#an-body').setAttribute('aria-busy', 'true');
        $('#an-body').innerHTML = loadingState('Loading metrics');
        let ms;
        try { ms = await AnalyticsService.get(def.cat, analyticsDays); }
        catch (err) { $('#an-body').innerHTML = errorState(err.message); $('[data-retry]').onclick = load; return; }
        $('#an-body').setAttribute('aria-busy', 'false');
        if (!ms.length) { $('#an-body').innerHTML = emptyState({ icon: 'monitoring', title: 'No data for this range', text: 'Try a longer date range.' }); return; }
        const sel = ms.find(m => m.key === (this.metric || def.chart)) || ms[0];
        $('#an-body').innerHTML = `<div class="metric-row">${ms.map(metricTile).join('')}</div>
          <section class="card"><div class="card-head"><h2 id="an-ch-h">${esc(sel.label)}</h2>${ms.length > 1 ? `<div class="card-actions"><label class="vh" for="an-metric">Metric to chart</label><select class="input input-sm" id="an-metric">${ms.map(m => `<option value="${m.key}" ${m.key === sel.key ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}</select></div>` : ''}</div>
            <div class="card-body"><p class="chart-sub">Daily, last ${analyticsDays} days${sel.lowerBetter ? ' · lower is better' : ''}</p><div id="an-chart"></div></div></section>
          ${extraFor(def.cat, analyticsDays)}`;
        lineChart($('#an-chart'), { points: sel.series, unit: sel.unit, label: sel.label });
        const sm = $('#an-metric'); if (sm) sm.onchange = () => { this.metric = sm.value; load().then(() => $('#an-metric') && $('#an-metric').focus()); };
        if ($('#an-art')) {
          dataTable($('#an-art'), { id: 'art', caption: 'MedBlog articles', noun: 'article', rows: articleRows(analyticsDays), defaultSort: { key: 'views', dir: 'desc' }, searchText: r => `${r.t} ${r.kick}`,
            columns: [{ key: 't', label: 'Article', render: r => esc(r.t), cls: 'wrap' }, { key: 'kick', label: 'Topic', render: r => esc(r.kick) },
              { key: 'views', label: 'Views', sortable: true, render: r => Math.round(r.views).toLocaleString('en-US'), cls: 'num' }, { key: 'eng', label: 'Engagement', sortable: true, render: r => `${r.eng.toFixed(1)}%`, cls: 'num' }] }); }
        if ($('#an-notes')) dataTable($('#an-notes'), { id: 'ann', caption: 'Sent notifications', noun: 'notification', rows: DB.db.notifications.filter(n => n.stats && n.stats.delivered), defaultSort: { key: 'conv', dir: 'desc' }, searchText: n => n.title,
          empty: { icon: 'notifications', title: 'No sent notifications', text: '' },
          columns: [{ key: 'title', label: 'Notification', render: n => `<a class="row-link" href="#notifications-${n.id}">${esc(n.title)}</a>` }, { key: 'sent', label: 'Sent', render: n => esc(fmtDate(n.sentAt)) },
            { key: 'delivered', label: 'Delivered', sortable: true, sortValue: n => n.stats.delivered, render: n => n.stats.delivered.toLocaleString('en-US'), cls: 'num' },
            { key: 'opened', label: 'Opened', sortable: true, sortValue: n => n.stats.opened / n.stats.delivered, render: n => `${(n.stats.opened / n.stats.delivered * 100).toFixed(1)}%`, cls: 'num' },
            { key: 'conv', label: 'Took action', sortable: true, sortValue: n => n.stats.actions / n.stats.delivered, render: n => `${(n.stats.actions / n.stats.delivered * 100).toFixed(1)}%`, cls: 'num' }] });
      };
      wireSegmented($('#rng'), v => { analyticsDays = +v; load(); });
      await load();
    }
  };
}
Object.keys(ANALYTICS_PAGES).forEach(k => { BUILT_PAGES[k] = analyticsPage(k); });

BUILT_PAGES.analytics = {
  async render(main) {
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Analytics and reporting', null]], title: 'Analytics overview', badges: badge('mock') })}${mockNote}${rangeControl()}<div id="an-body">${loadingState('Loading metrics')}</div></div>`;
    const load = async () => {
      $('#an-body').innerHTML = loadingState('Loading metrics');
      let all;
      try { all = await Promise.all(Object.entries(ANALYTICS_PAGES).map(async ([route, d]) => [route, d, await AnalyticsService.get(d.cat, analyticsDays)])); }
      catch (err) { $('#an-body').innerHTML = errorState(err.message); $('[data-retry]').onclick = load; return; }
      $('#an-body').innerHTML = all.map(([route, d, ms]) => `<section class="card" aria-labelledby="ov-${d.cat}"><div class="card-head"><h2 id="ov-${d.cat}">${esc(d.title)}</h2><div class="card-actions"><a class="btn btn-text" href="#${route}"><span class="lbl">Open ${esc(d.title.toLowerCase())}</span>${ic('chevron_right', 20)}</a></div></div>
        <div class="card-body"><div class="metric-row">${ms.map(metricTile).join('')}</div></div></section>`).join('');
    };
    wireSegmented($('#rng'), v => { analyticsDays = +v; load(); });
    await load();
  }
};

/* ---------- Dashboard ---------- */
BUILT_PAGES.dashboard = {
  async render(main) {
    const role = Session.role(), u = Session.user();
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [], title: `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${u.first}`, lede: `What needs attention in MyCare today, ${fmtLocal(nowLocal()).replace(/, \d{4},.*$/, '')}.` })}<div id="db">${loadingState('Loading the dashboard')}</div></div>`;
    let recs, metrics, notes, way;
    try { [recs, metrics, notes, way] = await Promise.all([ConfigService.list(), Promise.all(['adoption', 'content', 'search'].map(c => AnalyticsService.get(c, 30))), NotificationService.list(), WayfindingService.get()]); }
    catch (err) { $('#db').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const flat = metrics.flat(), pick = k => flat.find(m => m.key === k);
    const label = r => `${CONFIG_TYPES[r.type].label}: ${r.name}`;
    const reviews = recs.filter(r => r.review), demo = recs.filter(r => r.demo && r.demo !== r.production), drafts = recs.filter(r => r.draft && !r.review);
    const pendingNotes = notes.filter(n => n.status === 'pending');
    const canPub = a => can(role, a, 'publish');
    const todo = [
      ...reviews.map(r => ({ icon: 'rate_review', t: `Review requested: ${label(r)}`, s: `By ${UserService.name(r.review.by)} · ${fmtDateTime(r.review.at)}`, href: recLink(r), act: canPub(CONFIG_TYPES[r.type].area) ? 'Review' : 'View' })),
      ...demo.map(r => ({ icon: 'science', t: `On demo, not published: ${label(r)}`, s: `v${r.demo} waiting for production`, href: recLink(r), act: canPub(CONFIG_TYPES[r.type].area) ? 'Publish' : 'View' })),
      ...pendingNotes.map(n => ({ icon: 'notifications', t: `Notification waiting for approval: ${n.title}`, s: `Scheduled for ${fmtLocal(n.scheduledAt)}`, href: `notifications-${n.id}`, act: canPub('notifications') ? 'Approve' : 'View' })),
      ...(way.versions.some(v => v.status === 'validated') ? [{ icon: 'upload_file', t: 'Validated wayfinding file not published', s: 'Publish it to demo to check it', href: 'wayfinding', act: 'Open' }] : [])
    ];
    const alerts = recs.filter(r => r.type === 'alert').map(r => ({ r, d: dataAt(r, 'production') })).filter(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');
    const camps = recs.filter(r => r.type === 'campaign').map(r => ({ r, d: latestData(r) }));
    const sched = notes.filter(n => n.status === 'scheduled').sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const recent = [...DB.db.audit].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
    const prodWay = way.versions.find(v => v.version === way.production);
    $('#db').innerHTML = `
      ${alerts.length ? `<section class="dash-alert" aria-labelledby="da-h">${ic('warning', 24, 'f1')}<div><h2 id="da-h">${plural(alerts.length, 'emergency alert')} live now</h2><ul>${alerts.map(x => `<li><a href="#home-alerts-${x.r.id}">${esc(x.d.title)}</a> <span>until ${esc(fmtLocal(x.d.end, false))}</span></li>`).join('')}</ul></div></section>` : ''}
      <div class="metric-row">${['dau', 'mau', 'searchSuccess', 'crashFree'].map(k => metricTile(pick(k), 'analytics')).join('')}</div>
      <p class="note-line small">${ic('database', 16)}<span>Metrics are sample data for the prototype.</span></p>
      <div class="dash-grid">
        <section class="card" aria-labelledby="todo-h"><div class="card-head"><h2 id="todo-h">Needs attention</h2><div class="card-actions">${badge(todo.length ? 'review' : 'live', todo.length ? `${todo.length} open` : 'All clear')}</div></div><div class="card-body">
          ${todo.length ? `<ul class="todo">${todo.map(t => `<li>${ic(t.icon, 20)}<span class="todo-t"><span>${esc(t.t)}</span><span class="muted">${esc(t.s)}</span></span><a class="btn btn-secondary" href="#${t.href}"><span class="lbl">${t.act}</span></a></li>`).join('')}</ul>` : emptyState({ icon: 'task_alt', title: 'Nothing waiting', text: 'No reviews, demo versions or approvals are pending.', level: 3 })}
          ${drafts.length ? `<p class="muted">${plural(drafts.length, 'open draft')} not yet submitted for review.</p>` : ''}</div></section>
        <section class="card" aria-labelledby="dau-h"><div class="card-head"><h2 id="dau-h">Daily active users</h2><div class="card-actions"><a class="text-link" href="#analytics-adoption">Adoption details</a></div></div><div class="card-body"><p class="chart-sub">Last 30 days · sample data</p><div id="db-chart"></div></div></section>
        <section class="card" aria-labelledby="camp-h"><div class="card-head"><h2 id="camp-h">Campaigns</h2><div class="card-actions"><a class="text-link" href="#home-campaigns">All campaigns</a></div></div><div class="card-body">
          <ul class="mini">${camps.map(x => `<li><a href="#home-campaigns-${x.r.id}">${esc(x.r.name)}</a><span>${windowBadge(x.d)} ${envBadges(x.r)}</span></li>`).join('')}</ul></div></section>
        <section class="card" aria-labelledby="sn-h"><div class="card-head"><h2 id="sn-h">Scheduled notifications</h2><div class="card-actions"><a class="text-link" href="#notifications">All notifications</a></div></div><div class="card-body">
          ${sched.length ? `<ul class="mini">${sched.map(n => `<li><a href="#notifications-${n.id}">${esc(n.title)}</a><span class="muted">${esc(fmtLocal(n.scheduledAt))} · ${esc(segmentName(n.sendTo))}</span></li>`).join('')}</ul>` : '<p class="muted">Nothing scheduled.</p>'}</div></section>
        <section class="card" aria-labelledby="wf-h"><div class="card-head"><h2 id="wf-h">Wayfinding</h2><div class="card-actions"><a class="text-link" href="#wayfinding">Manage files</a></div></div><div class="card-body">
          <dl class="facts"><dt>Production</dt><dd>${badge('production', `v${way.production}`)} ${esc(prodWay.fileName)}</dd><dt>Demo</dt><dd>${way.demo === way.production ? 'Same as production' : badge('demo', `v${way.demo}`)}</dd><dt>Contents</dt><dd>${prodWay.buildings} buildings · ${prodWay.destinations.toLocaleString('en-US')} destinations</dd></dl></div></section>
        <section class="card" aria-labelledby="ra-h"><div class="card-head"><h2 id="ra-h">Recent activity</h2>${can(role, 'audit', 'view') ? '<div class="card-actions"><a class="text-link" href="#audit">Audit log</a></div>' : ''}</div><div class="card-body">
          <ul class="activity">${recent.map(a => `<li><span class="act-w">${esc(fmtDateTime(a.at))}</span><span><b>${esc(UserService.name(a.by))}</b> ${esc(a.action.toLowerCase())} – ${esc(a.target)}</span></li>`).join('')}</ul></div></section>
      </div>`;
    lineChart($('#db-chart'), { points: pick('dau').series, unit: 'count', label: 'Daily active users', height: 200 });
  }
};
