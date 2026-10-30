/* ---------- Sign-in and system pages ----------
   SIMULATED SSO and MFA. No identity provider is connected and no credentials are collected or stored.
   The real flow (SAML or OIDC, the approved MFA mechanism) replaces these screens' service calls only. */
function authLayout(inner) {
  const app = $('#app');
  app.className = 'auth';
  app.innerHTML = `<main id="main" class="auth-main" tabindex="-1">
    <div class="auth-card">
      <img class="auth-logo" src="${LOGO_HORIZONTAL}" alt="UTSW MyCare" width="232">
      ${inner}
    </div>
    <p class="auth-flag">${ic('database', 20)}<span>Prototype – mock data, not connected to MyCare</span></p>
    ${themeControl('auth-theme')}
  </main>`;
  wireThemeControl($('#auth-theme'));
  const h = $('#page-h'); if (h && Router.loaded) h.focus();
}
const simNote = text => `<p class="sim-note">${badge('simulated')}<span>${text}</span></p>`;

PUBLIC_PAGES.login = function login(step = 'start') {
  document.title = 'Sign in – MyCare Admin (prototype)';
  if (Session.current()) { location.hash = DEFAULT_ROUTE; return; }
  if (step === 'start') {
    authLayout(`<h1 id="page-h" tabindex="-1">MyCare Admin</h1>
      <p class="auth-lede">Manage the MyCare app’s home screen, content and notifications. Sign in with your UT Southwestern account.</p>
      ${btn({ label: 'Sign in with UTSW SSO', icon: 'login', variant: 'primary', size: 'lg', attrs: 'id="sso"' })}
      ${simNote('No identity provider is connected. Next, you pick a sample account to sign in as.')}`);
    $('#sso').onclick = () => PUBLIC_PAGES.login('idp');
    return;
  }
  authLayout(`<h1 id="page-h" tabindex="-1">Choose a sample account</h1>
    <p class="auth-lede">This step stands in for the UTSW identity provider. Each account has one of the planned roles.</p>
    <form id="idp" class="idp" novalidate>
      <fieldset><legend class="vh">Sample accounts</legend>
        ${DB.db.users.filter(u => u.status === 'active').map((u, i) => `<label class="acct" for="acct-${u.id}"><input type="radio" name="acct" id="acct-${u.id}" value="${u.id}" ${i === 0 ? 'checked' : ''}>
          <span class="avatar" aria-hidden="true">${esc(initials(u))}</span><span class="acct-t"><span class="acct-n">${esc(u.first)} ${esc(u.last)}</span><span class="acct-r">${esc(ROLES[u.role].label)} · ${esc(u.email)}</span></span></label>`).join('')}
      </fieldset>
      <div class="auth-acts">${btn({ label: 'Back', variant: 'text', attrs: 'id="idp-back"' })}${btn({ label: 'Continue', variant: 'primary', type: 'submit', size: 'lg' })}</div>
    </form>
    ${simNote('Sample accounts only. There is no username or password.')}`);
  $('#idp-back').onclick = () => PUBLIC_PAGES.login('start');
  $('#idp').onsubmit = e => { e.preventDefault(); Session.begin($('input[name="acct"]:checked').value); location.hash = 'mfa'; };
};

PUBLIC_PAGES.mfa = function mfa() {
  document.title = 'Verify it’s you – MyCare Admin (prototype)';
  if (!Session.pending) { location.hash = 'login'; return; }
  const u = UserService.byId(Session.pending);
  authLayout(`<h1 id="page-h" tabindex="-1">Verify it’s you</h1>
    <p class="auth-lede">We sent a sign-in request to the approved MFA app for ${esc(u.first)} ${esc(u.last)}. Approve it to continue.</p>
    <div class="mfa-wait">${ic('phonelink_lock', 32)}<p>Waiting for approval</p></div>
    <div class="auth-acts">${btn({ label: 'Cancel', variant: 'text', attrs: 'id="mfa-cancel"' })}${btn({ label: 'Approve (simulated)', icon: 'check', variant: 'primary', size: 'lg', attrs: 'id="mfa-ok"' })}</div>
    ${simNote('The approval happens here instead of on a phone. The real MFA mechanism is pending UTSW confirmation.')}`);
  $('#mfa-cancel').onclick = () => { Session.pending = null; location.hash = 'login'; };
  $('#mfa-ok').onclick = async e => {
    setBusy(e.currentTarget, true, 'Signing in');
    await wait(400);
    Session.complete();
    const to = Router.returnTo && !PUBLIC_PAGES[Router.returnTo] ? Router.returnTo : DEFAULT_ROUTE;
    Router.returnTo = null;
    location.hash = to;
  };
};

const exitPage = (title, text, icon) => () => {
  document.title = `${title} – MyCare Admin (prototype)`;
  authLayout(`<div class="exit-ic">${ic(icon, 32)}</div><h1 id="page-h" tabindex="-1">${esc(title)}</h1><p class="auth-lede">${text}</p>
    <a class="btn btn-primary btn-lg" href="#login"><span class="lbl">Sign in again</span></a>`);
};
PUBLIC_PAGES['signed-out'] = exitPage('You’re signed out', 'You signed out of MyCare Admin. Unsaved changes were not kept.', 'logout');
PUBLIC_PAGES.expired = () => exitPage('Your session ended', `For security, MyCare Admin signs you out after ${(DB.db.settings && DB.db.settings.sessionTimeout) || 30} minutes without activity. Sign in again to continue. Unsaved changes were not kept.`, 'timer_off')();

function deniedView(route) {
  const role = Session.role();
  const what = route ? `${route.section.label}${route.section.items.length > 1 ? ` – ${route.item.label}` : ''}` : 'this page';
  return `<div class="page sys-page">${emptyState({ icon: 'lock', level: 1, title: 'You don’t have access to this page',
    text: `Your role, ${esc(ROLES[role].label)}, can’t open ${esc(what)}. Access follows the proposed permission matrix, which is pending UTSW confirmation. Ask a Super Admin if you need access.`,
    action: `<a class="btn btn-primary" href="#${DEFAULT_ROUTE}"><span class="lbl">Go to the dashboard</span></a>` }).replace('<h1>', '<h1 id="page-h" tabindex="-1">')}</div>`;
}
function notFoundView(name) {
  return `<div class="page sys-page">${emptyState({ icon: 'search_off', level: 1, title: 'Page not found',
    text: `There is no page at “#${esc(name)}”. Check the link, or use the navigation.`,
    action: `<a class="btn btn-primary" href="#${DEFAULT_ROUTE}"><span class="lbl">Go to the dashboard</span></a>` }).replace('<h1>', '<h1 id="page-h" tabindex="-1">')}</div>`;
}
