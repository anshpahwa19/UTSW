/* ---------- Hash router with session and role guards ----------
   Public routes: login, mfa, signed-out, expired. Everything else needs the simulated session,
   and a role that can view the page's area; otherwise the access-denied view shows in place. */
const DEFAULT_ROUTE = 'dashboard';
const PUBLIC_PAGES = {};  /* filled by pages/auth.js */
const BUILT_PAGES = {};   /* filled by built pages, keyed by route */

function matchRoute(name) {
  const exact = ROUTES.find(r => r.pattern === name);
  if (exact) return { route: exact, params: {} };
  for (const r of ROUTES) {
    if (!r.pattern.endsWith('-:id')) continue;
    const pre = r.pattern.slice(0, -3);
    if (name.startsWith(pre) && name.length > pre.length && !ROUTES.some(x => x.pattern === name)) return { route: r, params: { id: name.slice(pre.length) } };
  }
  return null;
}

const Router = {
  current: null, active: null, loaded: false, guardFn: null, returnTo: null, skipNext: false,
  setGuard(fn) { this.guardFn = fn; },
  clearGuard() { this.guardFn = null; },
  async canLeave() { return this.guardFn ? await this.guardFn() : true; },
  go(name, { force = false } = {}) {
    if (force) this.clearGuard();
    if (location.hash.slice(1) === name) this.resolve(); else location.hash = name;
  },
  refresh() { this.resolve(true); },
  async onHash() {
    if (this.skipNext) { this.skipNext = false; return; }
    const next = location.hash.slice(1);
    if (this.guardFn && next !== this.current) {
      const ok = await this.guardFn();
      if (!ok) { history.replaceState(null, '', `#${this.current}`); return; }
      this.clearGuard();
    }
    this.resolve();
  },
  resolve(isRefresh = false) {
    const name = location.hash.slice(1) || DEFAULT_ROUTE;
    if (this.active && this.active.leave) this.active.leave();
    this.active = null;
    this.current = name;
    if (PUBLIC_PAGES[name]) { document.body.classList.remove('signed-in'); PUBLIC_PAGES[name](); this.loaded = true; return; }
    if (!Session.current()) { this.returnTo = name; history.replaceState(null, '', '#login'); this.current = 'login'; PUBLIC_PAGES.login(); this.loaded = true; return; }
    if (Session.expired()) { Session.end(); history.replaceState(null, '', '#expired'); this.current = 'expired'; return PUBLIC_PAGES.expired(); }
    Session.touch(); saveDb();
    if (!document.body.classList.contains('signed-in') || !$('#main')) { document.body.classList.add('signed-in'); renderShell(); }
    const main = $('#main');
    const role = Session.role();
    const m = name === 'denied' ? null : matchRoute(name);
    let title;
    if (name === 'denied') { title = 'Access denied'; renderSidebar(null); main.innerHTML = deniedView(null); }
    else if (!m) { title = 'Page not found'; renderSidebar(null); main.innerHTML = notFoundView(name); }
    else if (!can(role, m.route.item.area, 'view')) { title = 'Access denied'; renderSidebar(m.route); main.innerHTML = deniedView(m.route); }
    else {
      renderSidebar(m.route);
      title = m.route.title;
      const page = BUILT_PAGES[m.route.pattern];
      if (page) { this.active = page; page.render(main, { route: m.route, params: m.params, role }); }
      else { title = 'Page not found'; main.innerHTML = notFoundView(name); }
    }
    document.title = `${title} – MyCare Admin (prototype)`;
    /* Move focus to the new heading on navigation, but not on first load, so Tab starts at the skip link */
    if (!isRefresh && this.loaded) { const h = $('#page-h'); (h || main).focus({ preventScroll: true }); window.scrollTo(0, 0); }
    this.loaded = true;
    announce(`${title} page`);
  }
};
window.addEventListener('hashchange', () => Router.onHash());
