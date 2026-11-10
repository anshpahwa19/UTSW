/* ---------- App shell: header, sidebar (role-filtered IA), page heading with breadcrumbs, user menu ---------- */
const navOpen = new Set();
/* Desktop sidebar can collapse to an icon rail. Remembered per browser; a convenience only. */
const RAIL_KEY = 'utsw-admin-nav-rail';
const Rail = {
  on: (() => { try { return localStorage.getItem(RAIL_KEY) === '1'; } catch (e) { return false; } })(),
  wide: () => window.matchMedia('(min-width: 1024px)').matches,
  active: () => Rail.on && Rail.wide()
};
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
      <button type="button" class="rail-toggle btn btn-text btn-icon" aria-controls="sidebar" aria-expanded="true" aria-label="Collapse navigation" title="Collapse navigation">${ic('left_panel_close')}</button>
      <a class="brand" href="#dashboard" aria-label="UTSW MyCare Admin, go to the dashboard"><img src="${LOGO_REVERSED}" alt="" width="200"><span class="brand-admin" aria-hidden="true">Admin</span></a>
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
  /* Desktop: collapse to an icon rail, or expand to the full sidebar */
  const railBtn = $('.rail-toggle');
  const syncRail = () => {
    app.classList.toggle('nav-rail', Rail.on);
    railBtn.setAttribute('aria-expanded', String(!Rail.on));
    const l = Rail.on ? 'Expand navigation' : 'Collapse navigation';
    railBtn.setAttribute('aria-label', l); railBtn.title = l;
    railBtn.innerHTML = Rail.on ? ic('left_panel_open') : ic('left_panel_close');
  };
  railBtn.onclick = () => {
    Rail.on = !Rail.on; try { localStorage.setItem(RAIL_KEY, Rail.on ? '1' : '0'); } catch (e) { /* not stored */ }
    syncRail(); closeFly(); renderSidebar(renderSidebar.route);
  };
  syncRail();
  window.matchMedia('(min-width: 1024px)').addEventListener('change', () => { closeFly(); renderSidebar(renderSidebar.route); });
  /* In the rail, a section opens as a flyout beside its icon */
  const closeFly = (focusHead) => {
    const open = $('.nav-sub.fly:not([hidden])', side); if (!open) return;
    open.hidden = true; const h = $(`[aria-controls="${open.id}"]`, side); h.setAttribute('aria-expanded', 'false');
    if (focusHead) h.focus();
  };
  document.addEventListener('click', e => { if (Rail.active() && !e.target.closest('.nav-sec')) closeFly(); });
  side.addEventListener('keydown', e => { if (e.key === 'Escape' && Rail.active() && $('.nav-sub.fly:not([hidden])', side)) { e.stopPropagation(); closeFly(true); } });
  side.addEventListener('scroll', () => closeFly());
  scrim.onclick = () => { setNav(false); toggle.focus(); };
  side.addEventListener('keydown', e => { if (e.key === 'Escape' && app.classList.contains('nav-open')) { setNav(false); toggle.focus(); } });
  side.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  side.addEventListener('click', e => {
    const b = e.target.closest('[data-sec]'); if (!b) return;
    const id = b.dataset.sec, open = b.getAttribute('aria-expanded') !== 'true';
    if (Rail.active()) {
      closeFly(); if (!open) return;
      const sub = $(`#nav-${id}`), r = b.getBoundingClientRect();
      sub.hidden = false; b.setAttribute('aria-expanded', 'true');
      sub.style.top = `${Math.max(8, Math.min(r.top, window.innerHeight - sub.offsetHeight - 8))}px`;
      const first = $('a', sub); if (first && e.detail === 0) first.focus();
      return;
    }
    open ? navOpen.add(id) : navOpen.delete(id);
    b.setAttribute('aria-expanded', open); $(`#nav-${id}`).hidden = !open;
  });
  renderUser();
}

function renderSidebar(currentRoute) {
  const side = $('#sidebar'); if (!side) return;
  renderSidebar.route = currentRoute;
  const role = Session.role(), rail = Rail.active();
  const cur = currentRoute && currentRoute.section ? currentRoute.section.id : null;
  /* Moving to another section closes the rest; toggles made by hand last until then */
  if (cur && cur !== renderSidebar.last) { navOpen.clear(); navOpen.add(cur); renderSidebar.last = cur; }
  const link = (item, label, nested) => {
    const here = currentRoute && currentRoute.item === item;
    return `<a href="#${item.route}" class="nav-link${nested ? ' nested' : ''}" ${here ? 'aria-current="page"' : ''}${rail && !nested ? ` title="${esc(label)}"` : ''}><span class="nav-l">${esc(label)}</span></a>`;
  };
  side.innerHTML = `<ul class="nav">${visibleNav(role).map(sec => {
    if (sec.items.length === 1 && NAV.find(s => s.id === sec.id).items.length === 1) {
      return `<li class="nav-sec single">${link(sec.items[0], sec.label).replace('<span class="nav-l">', `${ic(sec.icon, 20)}<span class="nav-l">`)}</li>`;
    }
    const open = navOpen.has(sec.id) && !rail;
    const here = cur === sec.id;
    return `<li class="nav-sec${here ? ' here' : ''}">
      <button type="button" class="nav-head" data-sec="${sec.id}" aria-expanded="${open}" aria-controls="nav-${sec.id}"${rail ? ` title="${esc(sec.label)}"` : ''}>${ic(sec.icon, 20)}<span class="nav-l">${esc(sec.label)}</span>${ic('expand_more', 20, 'chev')}</button>
      <ul class="nav-sub${rail ? ' fly' : ''}" id="nav-${sec.id}" data-label="${esc(sec.label)}" ${open ? '' : 'hidden'}>${sec.items.map(i => `<li>${link(i, i.label, true)}</li>`).join('')}</ul>
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
      <div class="um-id"><p class="um-n">${esc(u.first)} ${esc(u.last)}</p><p class="um-e">${esc(u.email)}</p><p class="um-s"><span class="role-tag">${esc(ROLES[role].label)}</span></p></div>
      <div class="um-acts">
        <button type="button" class="um-act" data-um="profile">${ic('person', 20)}<span>My profile</span></button>
        <button type="button" class="um-act" data-um="signout">${ic('logout', 20)}<span>Sign out</span></button>
      </div>
    </div>`;
  const b = $('.user-btn', host), menu = $('#user-menu');
  const set = open => { menu.hidden = !open; b.setAttribute('aria-expanded', open); if (open) $('.um-act', menu).focus(); };
  b.onclick = () => set(menu.hidden);
  host.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { set(false); b.focus(); } });
  document.onclick = e => { const m = $('#user-menu'); if (m && !m.hidden && !$('#user').contains(e.target)) { m.hidden = true; $('.user-btn').setAttribute('aria-expanded', 'false'); } };
  menu.addEventListener('click', async e => {
    const a = e.target.closest('[data-um]'); if (!a) return;
    set(false);
    if (a.dataset.um === 'profile') { Router.go('profile'); return; }
    if (a.dataset.um === 'signout') { if (await Router.canLeave()) { Session.end(); Router.go('signed-out', { force: true }); } else b.focus(); }
  });
}

/* Page heading with breadcrumbs */
function pageHead({ crumbs, title, lede = '', badges = '', actions = '' }) {
  return `<div class="page-head">
    ${crumbs.length ? `<nav aria-label="Breadcrumb" class="crumbs"><ol>${crumbs.map(([label, href]) => `<li>${href ? `<a href="#${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`}</li>`).join('')}<li><span aria-current="page">${esc(title)}</span></li></ol></nav>` : ''}
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
