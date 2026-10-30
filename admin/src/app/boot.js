/* ---------- Boot ---------- */
loadDb();
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
Router.resolve();
