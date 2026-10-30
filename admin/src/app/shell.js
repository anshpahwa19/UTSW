/* ---------- App shell: header, sidebar (role-filtered IA), page heading with breadcrumbs, user menu ---------- */
const navOpen = new Set();
const LOGO_REVERSED = 'data:image/svg+xml;base64,__LOGO_REVERSED__';
const LOGO_HORIZONTAL = 'data:image/svg+xml;base64,__LOGO_HORIZONTAL__';

function visibleNav(role) {
  return NAV.map(sec => ({ ...sec, items: sec.items.filter(i => can(role, i.area, 'view')) })).filter(sec => sec.items.length);
}
const initials = u => `${u.first[0]}${u.last[0]}`;

function renderShell() {
  const app = $('#app');
  app.className = 'app';
  app.innerHTML = `
    <a class="skip" href="#main" data-skip>Skip to main content</a>
    <header class="topbar">
      <button type="button" class="nav-toggle btn btn-text btn-icon" aria-controls="sidebar" aria-expanded="false" aria-label="Show navigation">${ic('menu')}</button>
      <a class="brand" href="#home-layout" aria-label="UTSW MyCare Admin, go to Home screen layout"><img src="${LOGO_REVERSED}" alt="" width="200"><span class="brand-admin" aria-hidden="true">Admin</span></a>
      <div class="env-pill" title="This Admin runs as a prototype">${ic('dns', 20)}<span><span class="env-k">Environment</span> <b>Prototype</b></span></div>
      <p class="mock-flag">${ic('database', 20)}<span><span class="mf-long">Prototype – mock data, not connected to MyCare</span><span class="mf-short" aria-hidden="true">Mock data</span></span></p>
      <div class="user" id="user"></div>
    </header>
    <div class="layout">
      <nav class="sidebar" id="sidebar" aria-label="Admin sections"></nav>
      <div class="scrim" id="scrim" hidden></div>
      <main id="main" tabindex="-1"></main>
    </div>`;
  $('[data-skip]').addEventListener('click', e => { e.preventDefault(); $('#main').focus(); });
  const toggle = $('.nav-toggle'), side = $('#sidebar'), scrim = $('#scrim');
  const setNav = open => {
    app.classList.toggle('nav-open', open); toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Hide navigation' : 'Show navigation'); scrim.hidden = !open;
    if (open) { const a = $('[aria-current="page"]', side) || $('a,button', side); a && a.focus(); }
  };
  toggle.onclick = () => setNav(!app.classList.contains('nav-open'));
  scrim.onclick = () => { setNav(false); toggle.focus(); };
  side.addEventListener('keydown', e => { if (e.key === 'Escape' && app.classList.contains('nav-open')) { setNav(false); toggle.focus(); } });
  side.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  side.addEventListener('click', e => {
    const b = e.target.closest('[data-sec]'); if (!b) return;
    const id = b.dataset.sec, open = b.getAttribute('aria-expanded') !== 'true';
    open ? navOpen.add(id) : navOpen.delete(id);
    b.setAttribute('aria-expanded', open); $(`#nav-${id}`).hidden = !open;
  });
  renderUser();
}

function renderSidebar(currentRoute) {
  const side = $('#sidebar'); if (!side) return;
  const role = Session.role();
  const cur = currentRoute && currentRoute.section ? currentRoute.section.id : null;
  if (cur) navOpen.add(cur);
  const link = (item, label, nested) => {
    const here = currentRoute && currentRoute.item === item;
    const tag = item.built ? '' : `<span class="nav-tag" aria-hidden="true">Phase ${item.phase}</span><span class="vh">, planned for Phase ${item.phase}</span>`;
    return `<a href="#${item.route}" class="nav-link${nested ? ' nested' : ''}" ${here ? 'aria-current="page"' : ''}><span class="nav-l">${esc(label)}</span>${tag}</a>`;
  };
  side.innerHTML = `<ul class="nav">${visibleNav(role).map(sec => {
    if (sec.items.length === 1 && NAV.find(s => s.id === sec.id).items.length === 1) {
      return `<li class="nav-sec single">${link(sec.items[0], sec.label).replace('<span class="nav-l">', `${ic(sec.icon, 20)}<span class="nav-l">`)}</li>`;
    }
    const open = navOpen.has(sec.id);
    return `<li class="nav-sec">
      <button type="button" class="nav-head" data-sec="${sec.id}" aria-expanded="${open}" aria-controls="nav-${sec.id}">${ic(sec.icon, 20)}<span class="nav-l">${esc(sec.label)}</span>${ic('expand_more', 20, 'chev')}</button>
      <ul class="nav-sub" id="nav-${sec.id}" ${open ? '' : 'hidden'}>${sec.items.map(i => `<li>${link(i, i.label, true)}</li>`).join('')}</ul>
    </li>`;
  }).join('')}</ul>
  <p class="nav-foot">${badge('pending', 'Role access: proposed')}<span>Navigation follows the proposed permission matrix for ${esc(ROLES[role].label)}.</span></p>`;
}

function renderUser() {
  const u = Session.user(), role = Session.role(), host = $('#user');
  host.innerHTML = `
    <button type="button" class="user-btn" aria-expanded="false" aria-controls="user-menu">
      <span class="avatar" aria-hidden="true">${esc(initials(u))}</span>
      <span class="user-txt"><span class="user-n">${esc(u.first)} ${esc(u.last)}</span><span class="user-r">${esc(ROLES[role].label)}</span></span>
      ${ic('expand_more', 20)}
    </button>
    <div class="user-menu" id="user-menu" hidden>
      <div class="um-id"><p class="um-n">${esc(u.first)} ${esc(u.last)}</p><p class="um-e">${esc(u.email)}</p><p class="um-s">${badge('simulated', 'Simulated SSO session')}</p></div>
      <fieldset class="um-roles"><legend>Role <span class="proto">Prototype only</span></legend>
        ${Object.entries(ROLES).map(([k, r]) => `<label class="radio" for="um-role-${k}"><input type="radio" name="um-role" id="um-role-${k}" value="${k}" ${k === role ? 'checked' : ''}><span>${esc(r.label)}</span></label>`).join('')}
        <p class="um-note">Switching roles lets reviewers see each role’s navigation and actions. The real role comes from the approved identity provider.</p>
      </fieldset>
      <div class="um-row"><span id="um-err-l">Simulate service errors <span class="proto">Prototype only</span></span>${switchBtn({ id: 'um-err', checked: MockSettings.simulateErrors, labelledby: 'um-err-l' })}</div>
      <div class="um-acts">
        <button type="button" class="um-act" data-um="expire">${ic('timer_off', 20)}<span>Simulate session expiry</span></button>
        <button type="button" class="um-act" data-um="reset">${ic('restart_alt', 20)}<span>Reset mock data</span></button>
        <button type="button" class="um-act" data-um="signout">${ic('logout', 20)}<span>Sign out</span></button>
      </div>
    </div>`;
  const b = $('.user-btn', host), menu = $('#user-menu');
  const set = open => { menu.hidden = !open; b.setAttribute('aria-expanded', open); if (open) $('input:checked', menu).focus(); };
  b.onclick = () => set(menu.hidden);
  host.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { set(false); b.focus(); } });
  document.onclick = e => { const m = $('#user-menu'); if (m && !m.hidden && !$('#user').contains(e.target)) { m.hidden = true; $('.user-btn').setAttribute('aria-expanded', 'false'); } };
  menu.addEventListener('change', e => {
    if (e.target.name !== 'um-role') return;
    Session.switchRole(e.target.value);
    set(false); renderUser(); $('.user-btn').focus();
    toast(`Role switched to ${ROLES[e.target.value].label} (prototype only).`);
    Router.refresh();
  });
  $('#um-err').onclick = e => {
    const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
    e.currentTarget.setAttribute('aria-checked', on);
    MockSettings.simulateErrors = on; DB.prefs.simulateErrors = on; saveDb();
    toast(on ? 'Simulated service errors are on. The next mock calls fail.' : 'Simulated service errors are off.');
  };
  menu.addEventListener('click', async e => {
    const a = e.target.closest('[data-um]'); if (!a) return;
    set(false);
    if (a.dataset.um === 'expire') { Session.end(); Router.go('expired', { force: true }); }
    if (a.dataset.um === 'signout') { if (await Router.canLeave()) { Session.end(); Router.go('signed-out', { force: true }); } else b.focus(); }
    if (a.dataset.um === 'reset') {
      const r = await confirmDialog({ title: 'Reset mock data?', body: '<p>This puts every mock configuration, version and history entry back to the seeded sample data on this device. Your simulated session stays signed in.</p>', confirmLabel: 'Reset mock data', variant: 'danger' });
      if (r.ok) { Router.clearGuard(); resetMockData(); renderUser(); Router.refresh(); toast('Mock data reset to the sample seed.', { kind: 'success' }); }
    }
  });
}

/* Page heading with breadcrumbs */
function pageHead({ crumbs, title, lede = '', badges = '', actions = '' }) {
  return `<div class="page-head">
    <nav aria-label="Breadcrumb" class="crumbs"><ol>${crumbs.map(([label, href]) => `<li>${href ? `<a href="#${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`}</li>`).join('')}<li><span aria-current="page">${esc(title)}</span></li></ol></nav>
    <div class="ph-row"><div class="ph-main"><h1 id="page-h" tabindex="-1">${esc(title)}</h1>${badges ? `<div class="ph-badges">${badges}</div>` : ''}</div>${actions ? `<div class="ph-actions">${actions}</div>` : ''}</div>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </div>`;
}
const crumbsFor = r => {
  const c = [];
  if (r.section.items.length > 1) c.push([r.section.label, null]);
  if (r.parent) c.push([r.parent.label, r.parent.route]);
  return c;
};
