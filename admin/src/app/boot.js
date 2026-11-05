/* ---------- Boot ---------- */
loadDb();
startDropdowns();
/* Activity keeps the simulated session alive; a check every 30 seconds ends it after the idle limit */
let lastTouch = 0;
['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, () => {
  if (!Session.current() || Date.now() - lastTouch < 15000) return;
  lastTouch = Date.now(); Session.touch(); saveDb();
}, { passive: true }));
setInterval(() => { if (Session.expired()) { Session.end(); Router.go('expired', { force: true }); } }, 30000);
window.addEventListener('beforeunload', e => { if (Router.guardFn && $('.badge-unsaved')) { e.preventDefault(); e.returnValue = ''; } });
const markIcons = () => document.documentElement.classList.add('ms-ready');
if (document.fonts && document.fonts.load) {
  document.fonts.load('24px "Material Symbols Rounded"', 'home').then(f => { if (f.length) markIcons(); }).catch(() => {});
  setTimeout(markIcons, 3000);
} else markIcons();
/* ---------- Dashboard-only build (dashboard.html) ----------
   Signed in as the sample Super Admin, the Dashboard is the only page. Every other link and route is locked:
   links stay visible, marked unavailable, and a click explains instead of navigating. */
if (DASHBOARD_ONLY) {
  const ONLY = ['#dashboard', '#main'], MSG = 'Only the Dashboard is available in this preview.';
  const say = () => { if (!$$('.toast-msg').some(t => t.textContent === MSG)) toast(MSG); };
  const ensureSession = () => { if (!Session.current()) { Session.begin('u1'); Session.complete(); } };
  ensureSession();
  document.body.classList.add('dash-only');
  const resolve = Router.resolve.bind(Router);
  Router.resolve = function (isRefresh) {
    ensureSession();
    const name = location.hash.slice(1);
    if (name !== 'dashboard') { history.replaceState(null, '', '#dashboard'); if (this.loaded && name) say(); }
    return resolve(isRefresh);
  };
  const locked = a => a && !ONLY.includes(a.getAttribute('href'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'), um = e.target.closest('[data-um]'), sec = e.target.closest('#sidebar .nav-head');
    if ((a && locked(a)) || um || sec) { e.preventDefault(); e.stopImmediatePropagation(); say(); }
  }, true);
  const mark = () => {
    $$('a[href^="#"]').forEach(a => { if (locked(a) && !a.classList.contains('locked')) { a.classList.add('locked'); a.setAttribute('aria-disabled', 'true'); a.title = 'Not available in this preview'; } });
    $$('[data-um], #sidebar .nav-head').forEach(b => { if (!b.classList.contains('locked')) { b.classList.add('locked'); b.setAttribute('aria-disabled', 'true'); } });
    const head = $('#main .db .page-head');
    if (head && !$('.dash-note', head)) head.insertAdjacentHTML('beforeend', `<p class="note-line dash-note">${ic('lock', 20)}<span>Dashboard preview. Other pages aren’t available in this file.</span></p>`);
  };
  new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
}
Router.resolve();
