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
