/* ---------- Dashboard ----------
   A Blue hero like the app's own home (greeting, live status, headline numbers), then the work:
   your queue beside a live phone preview of what patients see now, the usage trend beside what's coming up,
   and recent activity beside the publishing pipeline. Metrics are sample data; the rest reads the mock services.
   Numbers count up, the trend draws in and cards ease in – all skipped under reduced motion. */
/* EXTRA_GLYPHS: trending_flat event_available bolt favorite */
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const localDay = s => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const longDate = s => { const dt = localDay(s); return `${WEEKDAYS[dt.getUTCDay()]}, ${AP_MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`; };
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
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
function delta(m, onBlue = false) {
  const pct = m.change * 100;
  const cls = onBlue ? 'delta on-blue' : 'delta';
  if (Math.abs(pct) < .05) return `<span class="${cls} flat">${ic('trending_flat', 16)}No change</span>`;
  const up = pct > 0, good = m.lowerBetter ? !up : up;
  return `<span class="${cls} ${good ? 'good' : 'bad'}">${ic(up ? 'trending_up' : 'trending_down', 16)}${up ? '+' : '−'}${Math.abs(pct).toFixed(1)}%<span class="vh">, ${good ? 'better' : 'worse'} than the previous 30 days</span></span>`;
}
/* Audit actions read as sentences after the person's name */
const VERBS = { 'Draft saved': 'saved a draft of', 'Review requested': 'requested a review of', 'Created as draft': 'created', 'Draft discarded': 'discarded the draft of', 'Deleted draft': 'deleted', 'Changes requested': 'requested changes to', 'User invited': 'invited', 'Role changed': 'changed the role of', 'User updated': 'updated', 'User deactivated': 'deactivated', 'User reactivated': 'reactivated', 'User deleted': 'deleted the account of', 'Invitation resent': 'resent the invitation to', 'Notification created': 'created the notification', 'Notification edited': 'edited the notification', 'Submitted for approval': 'submitted for approval', 'Notification scheduled': 'scheduled', 'Notification cancelled': 'cancelled', 'Notification duplicated': 'duplicated', 'Notification deleted': 'deleted the notification', 'Wayfinding file uploaded': 'uploaded the wayfinding file', 'Administrative settings changed': 'changed', 'Integration check run (simulated)': 'ran a check on' };
const activityVerb = a => VERBS[a] || a.charAt(0).toLowerCase() + a.slice(1);
/* Each person keeps one avatar style */
const AVATAR_TONES = ['tone-a', 'tone-b', 'tone-c'];
const avatarTone = id => AVATAR_TONES[[...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_TONES.length];

/* Count up to each [data-count] value */
function countUp(root) {
  $$('[data-count]', root).forEach(el => {
    const end = +el.dataset.count, unit = el.dataset.unit;
    if (reducedMotion()) { el.textContent = fmtNum(end, unit); return; }
    const t0 = performance.now(), dur = 900;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmtNum(unit === 'count' ? Math.round(end * e) : end * e, unit);
      if (k < 1 && el.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
const num = (v, unit) => `<span data-count="${v}" data-unit="${unit}">${fmtNum(v, unit)}</span>`;

BUILT_PAGES.dashboard = {
  async render(main) {
    const role = Session.role(), u = Session.user(), hour = +nowLocal().slice(11, 13);
    const greet = `Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${u.first}`;
    const quick = [
      ['home-alerts-new', 'Emergency alert', 'alerts'],
      ['home-campaigns-new', 'Campaign', 'campaigns'],
      ['notifications-new', 'Notification', 'notifications']
    ].filter(q => can(role, q[2], 'draft'));
    main.innerHTML = `<div class="page db">
      <section class="db-hero" aria-labelledby="page-h">
        <svg class="db-rings" viewBox="0 0 288 288" aria-hidden="true"><circle cx="144" cy="144" r="140"/><circle cx="144" cy="144" r="100"/><circle cx="144" cy="144" r="60"/></svg>
        <div class="db-hero-top">
          <div class="db-hello"><p class="db-date">${esc(longDate(nowLocal()))}</p><h1 id="page-h" tabindex="-1">${esc(greet)}</h1><div class="db-chips" id="db-chips"></div></div>
          ${quick.length ? `<nav class="db-quick" aria-label="Create">${quick.map(([href, label]) => `<a class="db-qbtn" href="#${href}">${ic('add', 20)}<span>${label}</span></a>`).join('')}</nav>` : ''}
        </div>
        <div class="db-stats" id="db-stats"></div>
      </section>
      <div id="db" class="db-body">${loadingState('Loading the dashboard')}</div></div>`;
    let recs, metrics, notes, way;
    try { [recs, metrics, notes, way] = await Promise.all([ConfigService.list(), Promise.all(['adoption', 'content', 'search'].map(c => AnalyticsService.get(c, 30))), NotificationService.list(), WayfindingService.get()]); }
    catch (err) { $('#db').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const flat = metrics.flat(), pick = k => flat.find(m => m.key === k);
    const now = nowLocal();

    const live = recs.filter(r => r.type === 'alert').map(r => ({ r, d: dataAt(r, 'production') })).filter(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');
    const canPub = a => can(role, a, 'publish');
    const queue = [
      ...recs.filter(r => r.review).map(r => ({ tone: 'review', icon: 'rate_review', kind: 'Review requested', t: r.name, type: CONFIG_TYPES[r.type].label, s: `${UserService.name(r.review.by)} · ${ago(r.review.at)}`, href: recLink(r), act: canPub(CONFIG_TYPES[r.type].area) ? 'Review' : 'View' })),
      ...recs.filter(r => r.demo && r.demo !== r.production).map(r => ({ tone: 'publish', icon: 'rocket_launch', kind: 'Ready to publish', t: r.name, type: CONFIG_TYPES[r.type].label, s: `v${r.demo} checked on demo`, href: recLink(r), act: canPub(CONFIG_TYPES[r.type].area) ? 'Publish' : 'View' })),
      ...notes.filter(n => n.status === 'pending').map(n => ({ tone: 'approve', icon: 'notifications', kind: 'Needs approval', t: n.title, type: 'Notification', s: `Sends ${fmtLocal(n.scheduledAt)}`, href: `notifications-${n.id}`, act: canPub('notifications') ? 'Approve' : 'View' })),
      ...way.versions.filter(v => v.status === 'validated').map(v => ({ tone: 'approve', icon: 'upload_file', kind: 'Ready for demo', t: v.fileName, type: 'Wayfinding file', s: `v${v.version} validated`, href: 'wayfinding', act: 'Open' }))
    ];
    const drafts = recs.filter(r => r.draft).length, onDemo = recs.filter(r => r.demo && r.demo !== r.production).length, livec = recs.filter(r => r.production).length;
    const liveCamp = recs.filter(r => r.type === 'campaign').map(r => ({ r, d: dataAt(r, 'production') })).find(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');
    const guest = recs.find(r => r.id === 'home-layout-guest');
    const prodWay = way.versions.find(v => v.version === way.production);
    const in30 = (() => { const d = localDay(now); d.setUTCDate(d.getUTCDate() + 30); return d.toISOString().slice(0, 10); })();
    const soon = s => s && s > now && s.slice(0, 10) <= in30;
    const upcoming = [
      ...notes.filter(n => ['scheduled', 'pending'].includes(n.status) && soon(n.scheduledAt)).map(n => ({ at: n.scheduledAt, icon: 'notifications', what: n.status === 'pending' ? 'Notification, awaiting approval' : 'Notification sends', t: n.title, href: `notifications-${n.id}` })),
      ...recs.filter(r => r.type === 'campaign').flatMap(r => { const d = latestData(r); return [
        ...(soon(d.start) ? [{ at: d.start, icon: 'campaign', what: 'Campaign starts', t: r.name, href: recLink(r) }] : []),
        ...(soon(d.end) && windowStatus(d) === 'active' ? [{ at: d.end, icon: 'campaign', what: 'Campaign ends', t: r.name, href: recLink(r) }] : [])]; }),
      ...recs.filter(r => r.type === 'alert').map(r => ({ r, d: latestData(r) })).filter(x => x.d.enabled && soon(x.d.start)).map(x => ({ at: x.d.start, icon: 'warning', what: 'Emergency alert starts', t: x.r.name, href: recLink(x.r) }))
    ].sort((a, b) => a.at.localeCompare(b.at)).slice(0, 4);
    const recent = [...DB.db.audit].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
    const dau = pick('dau'), heroStats = ['dau', 'mau', 'searchSuccess', 'crashFree'].map(pick);
    const healthy = pick('crashFree').value >= 99;

    /* Hero: status chips and the headline numbers */
    $('#db-chips').innerHTML = `
      <a class="db-chip" href="#home-alerts">${live.length ? `<i class="pulse alert" aria-hidden="true"></i>${plural(live.length, 'emergency alert')} live` : `${ic('check_circle', 16)}No emergency alerts`}</a>
      <span class="db-chip">${queue.length ? `${ic('bolt', 16)}${plural(queue.length, 'item')} need you` : `${ic('task_alt', 16)}Queue clear`}</span>
      <a class="db-chip" href="#platform-monitoring">${ic(healthy ? 'favorite' : 'error', 16)}${healthy ? 'App healthy' : 'Check app health'}</a>`;
    $('#db-stats').innerHTML = heroStats.map((m, i) => `<a class="db-stat" href="#${['analytics-adoption', 'analytics-adoption', 'analytics-search', 'analytics-content'][i]}">
        <span class="db-stat-l">${esc(m.label)}</span>
        <span class="db-stat-v">${num(m.value, m.unit)}</span>
        <span class="db-stat-f">${delta(m, true)}${sparkline(m.series)}</span></a>`).join('');

    const total = Math.max(1, livec + onDemo + drafts), C = 2 * Math.PI * 42;
    let acc = 0;
    const arc = (n, cls) => { const len = n / total * C, gap = n && n < total ? 3 : 0, s = `<circle r="42" cx="56" cy="56" class="ring ${cls}" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-acc}"/>`; acc += len; return s; };

    $('#db').innerHTML = `
      ${live.length ? `<section class="db-live db-in" style="--i:0" aria-labelledby="dl-h"><span class="db-live-ic">${ic('warning', 20, 'f1')}</span><h2 id="dl-h" class="vh">Live emergency alerts</h2>
        <ul>${live.map(x => `<li><span class="db-live-k"><i class="pulse white" aria-hidden="true"></i>Live now</span><a href="#home-alerts-${x.r.id}">${esc(x.d.title)}</a><span class="db-live-t">until ${esc(fmtLocal(x.d.end).split(', ').pop())}</span></li>`).join('')}</ul></section>` : ''}

      <div class="db-grid">
        <section class="card db-card db-in ga-q" style="--i:1" aria-labelledby="dq-h">
          <div class="db-card-head"><h2 id="dq-h">Your queue</h2><span class="db-count">${queue.length}</span></div>
          ${queue.length ? `<ul class="db-queue">${queue.map(q => `<li class="q-${q.tone}">
              <span class="db-tile">${ic(q.icon, 20)}</span>
              <span class="db-q-t"><span class="db-q-k">${esc(q.kind)} · ${esc(q.type)}</span><a href="#${q.href}">${esc(q.t)}</a><span class="muted">${esc(q.s)}</span></span>
              <a class="btn ${q.act === 'View' || q.act === 'Open' ? 'btn-secondary' : 'btn-primary'} btn-sm" href="#${q.href}" aria-label="${esc(q.act)}: ${esc(q.t)}"><span class="lbl">${esc(q.act)}</span></a></li>`).join('')}</ul>`
            : `<div class="db-empty">${ic('task_alt', 24)}<p>You’re all caught up. Nothing is waiting for review, publishing or approval.</p></div>`}
        </section>

        <section class="card db-card db-now db-in ga-n" style="--i:2" aria-labelledby="dn-h">
          <div class="db-card-head"><h2 id="dn-h"><i class="pulse" aria-hidden="true"></i>Right now in the app</h2><a class="text-link small" href="#home-layout">Edit layout</a></div>
          <div class="db-now-body">
            <div class="db-phone" id="db-phone"></div>
            <ul class="db-facts">
              <li><span class="db-f-k">Campaign showing</span><span class="db-f-v">${liveCamp ? `<a href="#${recLink(liveCamp.r)}">${esc(liveCamp.r.name)}</a>` : 'None'}</span></li>
              <li><span class="db-f-k">Emergency alerts</span><span class="db-f-v">${live.length ? `${plural(live.length, 'alert')} live` : 'None live'}</span></li>
              <li><span class="db-f-k">Guest layout</span><span class="db-f-v"><a href="#home-layout">Version ${guest.production}</a></span></li>
              <li><span class="db-f-k">Indoor maps</span><span class="db-f-v"><a href="#wayfinding">Version ${prodWay.version}</a></span></li>
            </ul>
          </div>
        </section>

        <section class="card db-card db-in ga-t" style="--i:3" aria-labelledby="dt-h">
          <div class="db-card-head"><h2 id="dt-h">Daily active users</h2>${badge('mock', 'Sample data')}</div>
          <p class="db-trend"><span class="db-trend-v">${num(dau.value, 'count')}</span>${delta(dau)}<span class="muted small">30-day average</span></p>
          <div id="db-chart" class="db-chart"></div>
        </section>

        <section class="card db-card db-in ga-u" style="--i:4" aria-labelledby="du-h">
          <div class="db-card-head"><h2 id="du-h">Coming up</h2><span class="muted small">Next 30 days</span></div>
          ${upcoming.length ? `<ol class="db-time">${upcoming.map(x => { const d = localDay(x.at); return `<li>
              <span class="db-date-tile" aria-hidden="true"><span>${AP_MONTHS[d.getUTCMonth()].replace('.', '')}</span><b>${d.getUTCDate()}</b></span>
              <span class="db-q-t"><span class="db-q-k">${ic(x.icon, 16)}${esc(x.what)}</span><a href="#${x.href}">${esc(x.t)}</a><span class="muted">${esc(WEEKDAYS[d.getUTCDay()])}, ${esc(fmtLocal(x.at).split(', ').pop())}</span></span></li>`; }).join('')}</ol>`
            : `<div class="db-empty">${ic('event_available', 24)}<p>Nothing scheduled in the next 30 days.</p></div>`}
        </section>

        <section class="card db-card db-in ga-a" style="--i:5" aria-labelledby="dr-h">
          <div class="db-card-head"><h2 id="dr-h">Recent activity</h2>${can(role, 'audit', 'view') ? '<a class="text-link small" href="#audit">Audit log</a>' : ''}</div>
          <ul class="db-feed">${recent.map(a => { const who = UserService.byId(a.by); return `<li>
              <span class="avatar sm ${avatarTone(a.by)}" aria-hidden="true">${who ? esc(initials(who)) : '?'}</span>
              <span class="db-feed-t"><span><b>${esc(UserService.name(a.by))}</b> ${esc(activityVerb(a.action))}</span><span class="db-feed-o">${esc(a.target)}</span></span>
              <time class="db-feed-w" datetime="${esc(a.at)}">${esc(ago(a.at))}</time></li>`; }).join('')}</ul>
        </section>

        <section class="card db-card db-in ga-p" style="--i:6" aria-labelledby="dp-h">
          <div class="db-card-head"><h2 id="dp-h">Publishing pipeline</h2></div>
          <div class="db-donut">
            <svg viewBox="0 0 112 112" role="img" aria-label="${livec} configurations live, ${onDemo} on demo, ${drafts} with an open draft">
              <circle r="42" cx="56" cy="56" class="ring track"/>${arc(livec, 'live')}${arc(onDemo, 'demo')}${arc(drafts, 'draft')}
              <text x="56" y="54" text-anchor="middle" class="ring-n">${livec + onDemo + drafts}</text><text x="56" y="70" text-anchor="middle" class="ring-l">items</text>
            </svg>
            <ul class="db-legend">
              <li><i class="key live"></i><span>Live in production</span><b>${num(livec, 'count')}</b></li>
              <li><i class="key demo"></i><span>On demo, waiting</span><b>${num(onDemo, 'count')}</b></li>
              <li><i class="key draft"></i><span>Open drafts</span><b>${num(drafts, 'count')}</b></li>
            </ul>
          </div>
          <a class="text-link small" href="#audit-history">Configuration history ${ic('arrow_forward', 16)}</a>
        </section>
      </div>`;
    lineChart($('#db-chart'), { points: dau.series, unit: 'count', label: 'Daily active users', height: 190 });
    countUp(main);
    this.pv = mountPreview($('#db-phone'), { title: 'What patients see on the guest home screen now' });
    this.pv.render({ screen: 'home', audience: 'guest', theme: effectiveTheme(), layout: layoutFor('guest'), colors: colorsFor('production'), content: appContent({ audience: 'guest' }), label: 'production guest home, live now' });
  },
  leave() { if (this.pv) { this.pv.destroy(); this.pv = null; } }
};
