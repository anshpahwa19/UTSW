/* ---------- Dashboard ----------
   Headline numbers, then what patients see now (a live phone and the facts behind it) beside what's coming up
   and recent activity. Metrics are sample data; the rest reads the mock services.
   Numbers count up and cards ease in – both skipped under reduced motion. */
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
const VERBS = { 'Draft saved': 'saved a draft of', 'Review requested': 'requested a review of', 'Created as draft': 'created', 'Draft discarded': 'discarded the draft of', 'Deleted draft': 'deleted', 'Changes requested': 'requested changes to', 'User invited': 'invited', 'Role changed': 'changed the role of', 'User updated': 'updated', 'Profile updated': 'updated their profile:', 'User deactivated': 'deactivated', 'User reactivated': 'reactivated', 'User deleted': 'deleted the account of', 'Invitation resent': 'resent the invitation to', 'Notification created': 'created the notification', 'Notification edited': 'edited the notification', 'Notification scheduled': 'scheduled', 'Notification cancelled': 'cancelled', 'Notification duplicated': 'duplicated', 'Notification deleted': 'deleted the notification', 'Wayfinding file uploaded': 'uploaded the wayfinding file', 'Administrative settings changed': 'changed', 'Integration check run (simulated)': 'ran a check on' };
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
    const role = Session.role();
    const quick = [
      ['home-alerts-new', 'Emergency alert', 'alerts'],
      ['home-campaigns-new', 'Campaign', 'campaigns'],
      ['notifications-new', 'Notification', 'notifications']
    ].filter(q => can(role, q[2], 'draft'));
    main.innerHTML = `<div class="page db">
      ${pageHead({ crumbs: [], title: 'Dashboard', lede: esc(longDate(nowLocal())), actions: quick.map(([href, label]) => `<a class="btn btn-secondary" href="#${href}">${ic('add', 20)}<span class="lbl">${label}</span></a>`).join('') })}
      <div class="db-stats" id="db-stats"></div>
      <div id="db" class="db-body">${loadingState('Loading the dashboard')}</div></div>`;
    let recs, metrics, notes, way;
    try { [recs, metrics, notes, way] = await Promise.all([ConfigService.list(), Promise.all(['adoption', 'content', 'search'].map(c => AnalyticsService.get(c, 30))), NotificationService.list(), WayfindingService.get()]); }
    catch (err) { $('#db').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const flat = metrics.flat(), pick = k => flat.find(m => m.key === k);
    const now = nowLocal();

    const live = recs.filter(r => r.type === 'alert').map(r => ({ r, d: dataAt(r, 'production') })).filter(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');
    const liveCamp = recs.filter(r => r.type === 'campaign').map(r => ({ r, d: dataAt(r, 'production') })).find(x => x.d && x.d.enabled && windowStatus(x.d) === 'active');
    const guest = recs.find(r => r.id === 'home-layout-guest');
    const prodWay = way.versions.find(v => v.version === way.production);
    const in30 = (() => { const d = localDay(now); d.setUTCDate(d.getUTCDate() + 30); return d.toISOString().slice(0, 10); })();
    const soon = s => s && s > now && s.slice(0, 10) <= in30;
    const upcoming = [
      ...notes.filter(n => n.status === 'scheduled' && soon(n.scheduledAt)).map(n => ({ at: n.scheduledAt, icon: 'notifications', what: 'Notification sends', t: n.title, href: `notifications-${n.id}` })),
      ...recs.filter(r => r.type === 'campaign').flatMap(r => { const d = latestData(r); return [
        ...(soon(d.start) ? [{ at: d.start, icon: 'campaign', what: 'Campaign starts', t: r.name, href: recLink(r) }] : []),
        ...(soon(d.end) && windowStatus(d) === 'active' ? [{ at: d.end, icon: 'campaign', what: 'Campaign ends', t: r.name, href: recLink(r) }] : [])]; }),
      ...recs.filter(r => r.type === 'alert').map(r => ({ r, d: latestData(r) })).filter(x => x.d.enabled && soon(x.d.start)).map(x => ({ at: x.d.start, icon: 'warning', what: 'Emergency alert starts', t: x.r.name, href: recLink(x.r) }))
    ].sort((a, b) => a.at.localeCompare(b.at)).slice(0, 4);
    const recent = [...DB.db.audit].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
    const heroStats = ['dau', 'mau', 'searchSuccess', 'crashFree'].map(pick);

    /* Headline numbers */
    $('#db-stats').innerHTML = heroStats.map((m, i) => `<a class="db-stat" href="#${['analytics-adoption', 'analytics-adoption', 'analytics-search', 'analytics-content'][i]}">
        <span class="db-stat-l">${esc(m.label)}</span>
        <span class="db-stat-v">${num(m.value, m.unit)}</span>
        <span class="db-stat-f">${delta(m)}</span></a>`).join('');

    $('#db').innerHTML = `
      ${live.length ? `<section class="db-live db-in" style="--i:0" aria-labelledby="dl-h"><span class="db-live-ic">${ic('warning', 20, 'f1')}</span><h2 id="dl-h" class="vh">Live emergency alerts</h2>
        <ul>${live.map(x => `<li><span class="db-live-k"><i class="pulse white" aria-hidden="true"></i>Live now</span><a href="#home-alerts-${x.r.id}">${esc(x.d.title)}</a><span class="db-live-t">until ${esc(fmtLocal(x.d.end).split(', ').pop())}</span></li>`).join('')}</ul></section>` : ''}

      <div class="db-grid">
        <section class="card db-card db-now db-in ga-n" style="--i:1" aria-labelledby="dn-h">
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

        <section class="card db-card db-in ga-u" style="--i:2" aria-labelledby="du-h">
          <div class="db-card-head"><h2 id="du-h">Coming up</h2><span class="muted small">Next 30 days</span></div>
          ${upcoming.length ? `<ol class="db-time">${upcoming.map(x => { const d = localDay(x.at); return `<li>
              <span class="db-date-tile" aria-hidden="true"><span>${AP_MONTHS[d.getUTCMonth()].replace('.', '')}</span><b>${d.getUTCDate()}</b></span>
              <span class="db-q-t"><span class="db-q-k">${ic(x.icon, 16)}${esc(x.what)}</span><a href="#${x.href}">${esc(x.t)}</a><span class="muted">${esc(WEEKDAYS[d.getUTCDay()])}, ${esc(fmtLocal(x.at).split(', ').pop())}</span></span></li>`; }).join('')}</ol>`
            : `<div class="db-empty">${ic('event_available', 24)}<p>Nothing scheduled in the next 30 days.</p></div>`}
        </section>

        <section class="card db-card db-in ga-a" style="--i:3" aria-labelledby="dr-h">
          <div class="db-card-head"><h2 id="dr-h">Recent activity</h2>${can(role, 'audit', 'view') ? '<a class="text-link small" href="#audit">Audit log</a>' : ''}</div>
          <ul class="db-feed">${recent.map(a => { const who = UserService.byId(a.by); return `<li>
              <span class="avatar sm ${avatarTone(a.by)}" aria-hidden="true">${who ? esc(initials(who)) : '?'}</span>
              <span class="db-feed-t"><span><b>${esc(UserService.name(a.by))}</b> ${esc(activityVerb(a.action))}</span><span class="db-feed-o">${esc(a.target)}</span></span>
              <time class="db-feed-w" datetime="${esc(a.at)}">${esc(ago(a.at))}</time></li>`; }).join('')}</ul>
        </section>

      </div>`;
    countUp(main);
    this.pv = mountPreview($('#db-phone'), { title: 'What patients see on the guest home screen now' });
    this.pv.render({ screen: 'home', audience: 'guest', layout: layoutFor('guest'), colors: colorsFor('production'), content: appContent({ audience: 'guest' }), label: 'production guest home, live now' });
  },
  leave() { if (this.pv) { this.pv.destroy(); this.pv = null; } }
};
