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

const articleRows = days => STATIC_CONTENT.featured.map((f, i) => ({ t: f.title, kick: f.kick, views: [18420, 15230, 12110, 9870][i] * days / 30, read: [312, 268, 241, 196][i] }));
function extraFor(cat, days) {
  if (cat === 'search') {
    const z = [...DB.db.zeroResults].filter(x => x.status === 'open').sort((a, b) => b.count - a.count).slice(0, 6);
    return `<section class="card"><div class="card-head"><h2>Top zero-result searches</h2><div class="card-actions"><a class="text-link" href="#search-zero-results">Fix them</a></div></div><div class="card-body">${z.length ? barList(z.map(x => ({ label: `“${x.query}”`, value: x.count }))) : '<p class="muted">No open zero-result searches.</p>'}</div></section>`;
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
        $('#an-body').innerHTML = `<div class="metric-row">${ms.map(m => metricTile(m)).join('')}</div>
          <section class="card"><div class="card-head"><h2 id="an-ch-h">${esc(sel.label)}</h2>${ms.length > 1 ? `<div class="card-actions"><label class="vh" for="an-metric">Metric to chart</label><select class="input input-sm" id="an-metric">${ms.map(m => `<option value="${m.key}" ${m.key === sel.key ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}</select></div>` : ''}</div>
            <div class="card-body"><p class="chart-sub">Daily, last ${analyticsDays} days${sel.lowerBetter ? ' · lower is better' : ''}</p><div id="an-chart"></div></div></section>
          ${extraFor(def.cat, analyticsDays)}`;
        lineChart($('#an-chart'), { points: sel.series, unit: sel.unit, label: sel.label });
        const sm = $('#an-metric'); if (sm) sm.onchange = () => { this.metric = sm.value; load().then(() => $('#an-metric') && $('#an-metric').focus()); };
        if ($('#an-art')) {
          dataTable($('#an-art'), { id: 'art', caption: 'MedBlog articles', noun: 'article', rows: articleRows(analyticsDays), defaultSort: { key: 'views', dir: 'desc' }, searchText: r => `${r.t} ${r.kick}`,
            columns: [{ key: 't', label: 'Article', render: r => esc(r.t), cls: 'wrap' }, { key: 'kick', label: 'Topic', render: r => esc(r.kick) },
              { key: 'views', label: 'Views', sortable: true, render: r => Math.round(r.views).toLocaleString('en-US'), cls: 'num' }, { key: 'read', label: 'Avg. reading time', sortable: true, render: r => `${Math.floor(r.read / 60)} min ${String(r.read % 60).padStart(2, '0')} s`, cls: 'num' }] }); }
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

/* Home screen overview: how patients use each home module (sample data).
   One measure (share of taps), so one hue; values are printed on every row, the bars only help compare. */
const HOME_CLICK_SHARE = [
  { id: 'tiles', label: 'Quick links', icon: 'apps', share: 38.2 },
  { id: 'search', label: 'Search and top searches', icon: 'search', share: 31.5 },
  { id: 'campaign', label: 'Campaign banner', icon: 'campaign', share: 12.4 },
  { id: 'featured', label: 'MedBlog (featured)', icon: 'article', share: 9.8 },
  { id: 'services', label: 'UTSW resources', icon: 'library_books', share: 6.1 },
  { id: 'news', label: 'Announcements', icon: 'feed', share: 2.0 }
];
BUILT_PAGES['analytics-home'] = {
  async render(main) {
    const rows = [...HOME_CLICK_SHARE].sort((a, b) => b.share - a.share);
    const guest = (layoutFor('guest').modules || []).filter(m => m.on !== false).map(m => m.id);
    const where = r => r.id === 'search' ? 'Top of the screen' : guest.includes(r.id) ? `Position ${guest.indexOf(r.id) + 1} on the guest home` : 'Not on the guest home';
    const top = rows[0], top2 = rows[0].share + rows[1].share, low = rows[rows.length - 1], max = top.share;
    const tile = (k, v, sub) => `<div class="metric hs-stat"><p class="metric-l">${k}</p><p class="metric-v">${v}</p><p class="metric-c">${sub}</p></div>`;
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Analytics and reporting', null]], title: 'Home screen overview', badges: badge('mock'),
      lede: 'Which home screen modules patients tap, as a share of all home screen taps.' })}
      ${mockNote}
      <div class="metric-row">
        ${tile('Most tapped', esc(top.label), `${top.share.toFixed(1)}% of home screen taps`)}
        ${tile('Top two modules', `${top2.toFixed(1)}%`, `of home screen taps go to ${esc(rows[0].label.toLowerCase())} and ${esc(rows[1].label.split(' ')[0].toLowerCase())}`)}
        ${tile('Least tapped', esc(low.label), `${low.share.toFixed(1)}% of home screen taps`)}
      </div>
      <section class="card" aria-labelledby="hs-h"><div class="card-head"><h2 id="hs-h">Click-through share by module</h2><div class="card-actions"><a class="btn btn-text btn-sm" href="#home-layout">${ic('edit', 20)}<span class="lbl">Edit the layout</span></a></div></div>
        <div class="card-body">
          <ol class="hs-list" aria-label="Modules, most tapped first">${rows.map((r, i) => `
            <li class="hs-row" title="${esc(r.label)}: ${r.share.toFixed(1)}% of home screen taps">
              <span class="hs-rank" aria-hidden="true">${i + 1}</span>
              <span class="hs-ic" aria-hidden="true">${ic(r.icon, 20)}</span>
              <span class="hs-txt"><span class="hs-name">${esc(r.label)}</span><span class="hs-where">${esc(where(r))}</span></span>
              <span class="hs-track" aria-hidden="true"><span class="hs-fill" style="width:${(r.share / max * 100).toFixed(1)}%"></span></span>
              <span class="hs-v">${r.share.toFixed(1)}%<span class="vh"> of home screen taps</span></span>
            </li>`).join('')}</ol>
          <p class="chart-sub hs-foot">Share of all taps on the home screen in the last 30 days. Shares add up to 100%.</p>
        </div></section></div>`;
  }
};
