/* ---------- Dashboard ----------
   One reading order: anything live and urgent, app health, your queue, what's live in the app, what's coming up,
   and recent activity. Metrics are sample data; everything else reads the mock services. */
/* EXTRA_GLYPHS: trending_flat event_available */
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const localDay = s => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const longDate = s => { const dt = localDay(s); return `${WEEKDAYS[dt.getUTCDay()]}, ${AP_MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`; };
function ago(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${plural(mins, 'minute')} ago`;
  if (mins < 60 * 24) return `${plural(Math.round(mins / 60), 'hour')} ago`;
  if (mins < 60 * 48) return 'Yesterday';
  if (mins < 60 * 24 * 7) return `${Math.round(mins / 1440)} days ago`;
  return fmtDate(iso).replace(/, \d{4}$/, '');
}
/* Change versus the previous period: an arrow and a word as well as color */
function delta(m) {
  const pct = m.change * 100;
  if (Math.abs(pct) < .05) return `<span class="delta flat">${ic('trending_flat', 16)}No change</span>`;
  const up = pct > 0, good = m.lowerBetter ? !up : up;
  return `<span class="delta ${good ? 'good' : 'bad'}">${ic(up ? 'trending_up' : 'trending_down', 16)}${up ? '+' : '−'}${Math.abs(pct).toFixed(1)}%<span class="vh">, ${good ? 'better' : 'worse'} than the previous 30 days</span></span>`;
}

/* Audit actions read as sentences after the person's name */
const VERBS = { 'Draft saved': 'saved a draft of', 'Review requested': 'requested a review of', 'Created as draft': 'created', 'Draft discarded': 'discarded the draft of', 'Deleted draft': 'deleted', 'Changes requested': 'requested changes to', 'User invited': 'invited', 'Role changed': 'changed the role of', 'User updated': 'updated', 'User deactivated': 'deactivated', 'User reactivated': 'reactivated', 'User deleted': 'deleted the account of', 'Invitation resent': 'resent the invitation to', 'Notification created': 'created the notification', 'Notification edited': 'edited the notification', 'Submitted for approval': 'submitted for approval', 'Notification scheduled': 'scheduled', 'Notification cancelled': 'cancelled', 'Notification duplicated': 'duplicated', 'Notification deleted': 'deleted the notification', 'Wayfinding file uploaded': 'uploaded the wayfinding file', 'Administrative settings changed': 'changed', 'Integration check run (simulated)': 'ran a check on' };
const activityVerb = a => VERBS[a] || a.charAt(0).toLowerCase() + a.slice(1);

BUILT_PAGES.dashboard = {
  async render(main) {
    const role = Session.role(), u = Session.user(), hour = +nowLocal().slice(11, 13);
    const greet = `Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${u.first}`;
    const quick = [
      ['home-alerts-new', 'warning', 'Emergency alert', 'alerts'],
      ['home-campaigns-new', 'campaign', 'Campaign', 'campaigns'],
      ['notifications-new', 'notifications', 'Notification', 'notifications']
    ].filter(q => can(role, q[3], 'draft'));
    main.innerHTML = `<div class="page db">
      <header class="db-head">
        <div><p class="db-date">${esc(longDate(nowLocal()))}</p><h1 id="page-h" tabindex="-1">${esc(greet)}</h1></div>
        ${quick.length ? `<nav class="db-quick" aria-label="Create">${quick.map(([href, icon, label]) => `<a class="btn btn-secondary" href="#${href}">${ic('add', 20)}<span class="lbl">${label}</span></a>`).join('')}</nav>` : ''}
      </header>
      <div id="db" class="db-body">${loadingState('Loading the dashboard')}</div></div>`;
    let recs, metrics, notes, way;
    try { [recs, metrics, notes, way] = await Promise.all([ConfigService.list(), Promise.all(['adoption', 'content', 'search'].map(c => AnalyticsService.get(c, 30))), NotificationService.list(), WayfindingService.get()]); }
    catch (err) { $('#db').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const flat = metrics.flat(), pick = k => flat.find(m => m.key === k);
    const now = nowLocal();

    /* Live emergency alerts lead the page */
    const live = recs.filter(r => r.type === 'alert').map(r => ({ r, d: dataAt(r, 'production') })).filter(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');

    /* Queue: what needs this person */
    const canPub = a => can(role, a, 'publish');
    const queue = [
      ...recs.filter(r => r.review).map(r => ({ icon: 'rate_review', kind: 'Review requested', t: r.name, type: CONFIG_TYPES[r.type].label, s: `${UserService.name(r.review.by)} · ${ago(r.review.at)}`, href: recLink(r), act: canPub(CONFIG_TYPES[r.type].area) ? 'Review' : 'View' })),
      ...recs.filter(r => r.demo && r.demo !== r.production).map(r => ({ icon: 'science', kind: 'Ready to publish', t: r.name, type: CONFIG_TYPES[r.type].label, s: `v${r.demo} on demo`, href: recLink(r), act: canPub(CONFIG_TYPES[r.type].area) ? 'Publish' : 'View' })),
      ...notes.filter(n => n.status === 'pending').map(n => ({ icon: 'notifications', kind: 'Needs approval', t: n.title, type: 'Notification', s: `Scheduled for ${fmtLocal(n.scheduledAt)}`, href: `notifications-${n.id}`, act: canPub('notifications') ? 'Approve' : 'View' })),
      ...way.versions.filter(v => v.status === 'validated').map(v => ({ icon: 'upload_file', kind: 'Ready for demo', t: v.fileName, type: 'Wayfinding file', s: `v${v.version} validated`, href: 'wayfinding', act: 'Open' }))
    ];

    /* Pipeline counts across every configuration */
    const drafts = recs.filter(r => r.draft).length, onDemo = recs.filter(r => r.demo && r.demo !== r.production).length, livec = recs.filter(r => r.production).length;
    const pipeTotal = Math.max(1, drafts + onDemo + livec);
    const liveCamp = recs.filter(r => r.type === 'campaign').map(r => ({ r, d: dataAt(r, 'production') })).find(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');
    const guest = recs.find(r => r.id === 'home-layout-guest');
    const prodWay = way.versions.find(v => v.version === way.production);

    /* Coming up in the next 30 days */
    const in30 = (() => { const d = localDay(now); d.setUTCDate(d.getUTCDate() + 30); return d.toISOString().slice(0, 10); })();
    const soon = s => s && s > now && s.slice(0, 10) <= in30;
    const upcoming = [
      ...notes.filter(n => ['scheduled', 'pending'].includes(n.status) && soon(n.scheduledAt)).map(n => ({ at: n.scheduledAt, icon: 'notifications', what: n.status === 'pending' ? 'Notification, awaiting approval' : 'Notification sends', t: n.title, href: `notifications-${n.id}` })),
      ...recs.filter(r => r.type === 'campaign').flatMap(r => { const d = latestData(r); return [
        ...(soon(d.start) ? [{ at: d.start, icon: 'campaign', what: 'Campaign starts', t: r.name, href: recLink(r) }] : []),
        ...(soon(d.end) && windowStatus(d) === 'active' ? [{ at: d.end, icon: 'campaign', what: 'Campaign ends', t: r.name, href: recLink(r) }] : [])]; }),
      ...recs.filter(r => r.type === 'alert').map(r => ({ r, d: latestData(r) })).filter(x => x.d.enabled && soon(x.d.start)).map(x => ({ at: x.d.start, icon: 'warning', what: 'Emergency alert starts', t: x.r.name, href: recLink(x.r) }))
    ].sort((a, b) => a.at.localeCompare(b.at)).slice(0, 5);

    const recent = [...DB.db.audit].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
    const dau = pick('dau');
    const kpis = ['mau', 'searchSuccess', 'crashFree'].map(pick);

    $('#db').innerHTML = `
      ${live.length ? `<section class="db-live" aria-labelledby="dl-h"><span class="db-live-ic">${ic('warning', 20, 'f1')}</span>
        <h2 id="dl-h" class="vh">Live emergency alerts</h2>
        <ul>${live.map(x => `<li><span class="db-live-k">Live now</span><a href="#home-alerts-${x.r.id}">${esc(x.d.title)}</a><span class="db-live-t">until ${esc(fmtLocal(x.d.end, false).replace(/^[A-Z][a-z]+\.? \d+, /, ''))}</span></li>`).join('')}</ul></section>` : ''}

      <section class="card db-health" aria-labelledby="dh-h">
        <div class="db-main">
          <div class="db-card-head"><h2 id="dh-h">Daily active users</h2>${badge('mock', 'Sample data')}</div>
          <p class="db-big">${fmtNum(dau.value, 'count')}</p>
          <p class="db-sub">${delta(dau)}<span class="muted">30-day average</span></p>
          <div id="db-chart"></div>
        </div>
        <ul class="db-kpis" aria-label="Other health metrics">${kpis.map(m => `<li>
          <a class="db-kpi" href="#${m.key === 'mau' ? 'analytics-adoption' : m.key === 'searchSuccess' ? 'analytics-search' : 'analytics-content'}">
            <span class="db-kpi-l">${esc(m.label)}</span>
            <span class="db-kpi-v">${fmtNum(m.value, m.unit)}</span>
            ${delta(m)}
            ${sparkline(m.series)}
          </a></li>`).join('')}
          <li class="db-kpi-more"><a class="text-link" href="#analytics">All analytics ${ic('arrow_forward', 16)}</a></li>
        </ul>
      </section>

      <div class="db-row db-row-a">
        <section class="card db-card" aria-labelledby="dq-h">
          <div class="db-card-head"><h2 id="dq-h">Your queue</h2><span class="db-count">${queue.length}</span></div>
          ${queue.length ? `<ul class="db-queue">${queue.map(q => `<li>
              <span class="db-tile">${ic(q.icon, 20)}</span>
              <span class="db-q-t"><span class="db-q-k">${esc(q.kind)} · ${esc(q.type)}</span><a href="#${q.href}">${esc(q.t)}</a><span class="muted">${esc(q.s)}</span></span>
              <a class="btn btn-secondary btn-sm" href="#${q.href}" aria-label="${esc(q.act)}: ${esc(q.t)}"><span class="lbl">${esc(q.act)}</span></a></li>`).join('')}</ul>`
            : `<div class="db-empty">${ic('task_alt', 24)}<p>You’re all caught up. Nothing is waiting for review, publishing or approval.</p></div>`}
        </section>

        <section class="card db-card" aria-labelledby="dp-h">
          <div class="db-card-head"><h2 id="dp-h">Live in the app</h2></div>
          <div class="db-pipe" role="img" aria-label="${livec} configurations live, ${onDemo} on demo, ${drafts} open drafts">
            <span class="seg live" style="flex:${livec / pipeTotal}"></span><span class="seg demo" style="flex:${onDemo / pipeTotal}"></span><span class="seg draft" style="flex:${drafts / pipeTotal}"></span>
          </div>
          <dl class="db-pipe-k">
            <div><dt><i class="key live"></i>Live</dt><dd>${livec}</dd></div>
            <div><dt><i class="key demo"></i>On demo</dt><dd>${onDemo}</dd></div>
            <div><dt><i class="key draft"></i>Drafts</dt><dd>${drafts}</dd></div>
          </dl>
          <ul class="db-facts">
            <li><span class="db-f-k">Campaign showing</span><span class="db-f-v">${liveCamp ? `<a href="#${recLink(liveCamp.r)}">${esc(liveCamp.r.name)}</a>` : '<span class="muted">None</span>'}</span></li>
            <li><span class="db-f-k">Emergency alerts</span><span class="db-f-v">${live.length ? `${plural(live.length, 'alert')} live` : '<span class="muted">None live</span>'}</span></li>
            <li><span class="db-f-k">Guest home layout</span><span class="db-f-v"><a href="#home-layout">Version ${guest.production}</a></span></li>
            <li><span class="db-f-k">Indoor maps</span><span class="db-f-v"><a href="#wayfinding">Version ${prodWay.version}</a> <span class="muted">· ${prodWay.destinations.toLocaleString('en-US')} destinations</span></span></li>
          </ul>
        </section>
      </div>

      <div class="db-row db-row-b">
        <section class="card db-card" aria-labelledby="du-h">
          <div class="db-card-head"><h2 id="du-h">Coming up</h2><span class="muted small">Next 30 days</span></div>
          ${upcoming.length ? `<ol class="db-time">${upcoming.map(x => { const d = localDay(x.at); return `<li>
              <span class="db-date-tile" aria-hidden="true"><span>${AP_MONTHS[d.getUTCMonth()].replace('.', '')}</span><b>${d.getUTCDate()}</b></span>
              <span class="db-q-t"><span class="db-q-k">${esc(x.what)}</span><a href="#${x.href}">${esc(x.t)}</a><span class="muted">${esc(WEEKDAYS[d.getUTCDay()])}, ${esc(fmtLocal(x.at).split(', ').pop())}</span></span></li>`; }).join('')}</ol>`
            : `<div class="db-empty">${ic('event_available', 24)}<p>Nothing scheduled in the next 30 days.</p></div>`}
        </section>

        <section class="card db-card" aria-labelledby="dr-h">
          <div class="db-card-head"><h2 id="dr-h">Recent activity</h2>${can(role, 'audit', 'view') ? '<a class="text-link small" href="#audit">Audit log</a>' : ''}</div>
          <ul class="db-feed">${recent.map(a => { const who = UserService.byId(a.by); return `<li>
              <span class="avatar sm" aria-hidden="true">${who ? esc(initials(who)) : '?'}</span>
              <span class="db-feed-t"><span><b>${esc(UserService.name(a.by))}</b> ${esc(activityVerb(a.action))}</span><span class="db-feed-o">${esc(a.target)}</span></span>
              <time class="db-feed-w" datetime="${esc(a.at)}">${esc(ago(a.at))}</time></li>`; }).join('')}</ul>
        </section>
      </div>`;
    lineChart($('#db-chart'), { points: dau.series, unit: 'count', label: 'Daily active users', height: 200 });
  }
};
