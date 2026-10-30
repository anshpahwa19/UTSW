/* ---------- User management: list, create, details ----------
   Invitation and activation follow the approved identity provider (§10.16); here an invite is simulated. */
const USER_STATUS = { active: ['live', 'Active'], invited: ['review', 'Invited'], deactivated: ['hidden', 'Deactivated'] };
const userBadge = s => badge(USER_STATUS[s][0], USER_STATUS[s][1]);
const fullName = u => `${u.first} ${u.last}`;
const USER_FIELDS = [
  { key: 'first', label: 'First name', required: true, max: 40, wide: false },
  { key: 'last', label: 'Last name', required: true, max: 40, wide: false },
  { key: 'email', label: 'Email address', required: true, max: 80, hint: 'Their UT Southwestern email. They sign in with UTSW SSO – there is no Admin password.' },
  { key: 'role', label: 'Role', type: 'radio', options: Object.entries(ROLES).map(([k, r]) => [k, r.label]) }
];
const userValidate = (d, selfId) => {
  const e = {};
  if (d.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(d.email.trim())) e.email = 'Enter an email address like name@utsw.example.';
  else if (d.email && UserService.emailTaken(d.email, selfId)) e.email = `An account already exists for ${d.email.trim().toLowerCase()}.`;
  return e;
};
const roleHelp = `<div class="role-help">${Object.entries(ROLES).map(([k, r]) => `<p><b>${r.label}:</b> ${esc(Object.entries(PERMISSIONS.areas).filter(([, a]) => LEVELS.indexOf(a[k]) >= LEVELS.indexOf('publish')).length)} areas to publish, ${esc(Object.entries(PERMISSIONS.areas).filter(([, a]) => a[k] === 'none').length)} areas hidden</p>`).join('')}<p class="muted">The full matrix is under Administrative settings. Proposed, pending confirmation.</p></div>`;

BUILT_PAGES.users = {
  async render(main) {
    const canManage = can(Session.role(), 'users', 'manage');
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['User management', null]], title: 'All users', lede: 'People who can sign in to MyCare Admin, with their role and account status.',
      actions: canManage ? `<a class="btn btn-primary" href="#users-new">${ic('person_add', 20)}<span class="lbl">Create user</span></a>` : '' })}<div id="us-body">${loadingState('Loading users')}</div></div>`;
    let list;
    try { list = await UserService.list(); } catch (err) { $('#us-body').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    $('#us-body').innerHTML = `${canManage ? '' : `<p class="note-line">${ic('info', 20)}<span>Your role can view users. A Super Admin manages accounts.</span></p>`}<section class="card"><div class="card-body" id="us-table"></div></section>`;
    dataTable($('#us-table'), {
      id: 'us', caption: 'Admin users', noun: 'user', rows: list, defaultSort: { key: 'name', dir: 'asc' }, searchPlaceholder: 'Search names and emails',
      searchText: u => `${fullName(u)} ${u.email}`,
      filters: [
        { key: 'role', label: 'Role', options: Object.entries(ROLES).map(([k, r]) => [k, r.label]), match: (u, v) => u.role === v },
        { key: 'status', label: 'Status', options: Object.entries(USER_STATUS).map(([k, v]) => [k, v[1]]), match: (u, v) => u.status === v }],
      empty: { icon: 'group', title: 'No users', text: '' },
      columns: [
        { key: 'name', label: 'Name', sortable: true, sortValue: u => `${u.last} ${u.first}`.toLowerCase(), render: u => `<a class="row-link" href="#users-${u.id}"><span class="avatar sm" aria-hidden="true">${esc(initials(u))}</span><span>${esc(fullName(u))}${u.id === Session.current().userId ? ' <span class="muted">(you)</span>' : ''}</span></a>` },
        { key: 'email', label: 'Email', sortable: true, render: u => esc(u.email) },
        { key: 'role', label: 'Role', sortable: true, sortValue: u => ROLES[u.role].label, render: u => esc(ROLES[u.role].label) },
        { key: 'status', label: 'Status', sortable: true, render: u => userBadge(u.status) },
        { key: 'created', label: 'Created', sortable: true, render: u => `<span class="nowrap">${esc(fmtDate(u.created))}</span>` },
        { key: 'lastSignIn', label: 'Last sign-in', sortable: true, sortValue: u => u.lastSignIn || '', render: u => u.lastSignIn ? `<span class="nowrap">${esc(fmtDateTime(u.lastSignIn))}</span>` : '<span class="muted">Never</span>' }]
    });
  }
};

BUILT_PAGES['users-new'] = {
  render(main) {
    const d = { first: '', last: '', email: '', role: 'marketing' }; let errors = {};
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['User management', null], ['All users', 'users']], title: 'Create user', lede: 'The person gets an invitation (simulated) and signs in with UTSW SSO and MFA.' })}
      <div class="ed-grid"><section class="card"><div class="card-head"><h2>New user</h2></div><form class="card-body form" id="un" novalidate></form></section>
      <aside class="ed-side"><section class="card"><div class="card-body"><h2 class="side-h">Roles</h2>${roleHelp}</div></section></aside></div></div>`;
    const form = $('#un');
    const draw = () => { form.innerHTML = `${renderForm([{ fields: USER_FIELDS }], d, errors, 'f')}<div class="form-actions"><a class="btn btn-text" href="#users"><span class="lbl">Cancel</span></a>${btn({ label: 'Create and send invitation', icon: 'send', variant: 'primary', type: 'submit', attrs: 'id="un-go"' })}</div>`; };
    draw();
    wireForm(form, () => USER_FIELDS, d, () => {}, draw);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      errors = validateData(USER_FIELDS, d, x => userValidate(x));
      if (Object.keys(errors).length) { draw(); $('#f-errsum').focus(); return; }
      const b = $('#un-go'); setBusy(b, true, 'Creating');
      try { const u = await UserService.create(d); Router.clearGuard(); toast(`Invitation sent to ${u.email} (simulated).`, { kind: 'success' }); Router.go(`users-${u.id}`); }
      catch (err) { setBusy(b, false); errors = err.message.includes('already') ? { email: err.message } : {}; draw(); toast(err.message, { kind: 'error', ms: 8000 }); }
    });
    Router.setGuard(async () => {
      if (!d.first && !d.last && !d.email) return true;
      const r = await confirmDialog({ title: 'Leave without creating the user?', body: '<p>What you entered is lost.</p>', confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
      return r.ok;
    });
  }
};

BUILT_PAGES['users-:id'] = {
  async render(main, ctx) {
    main.innerHTML = `<div class="page" id="ud">${loadingState('Loading the user')}</div>`;
    let u;
    try { u = await UserService.get(ctx.params.id); }
    catch (err) { $('#ud').innerHTML = `${pageHead({ crumbs: [['User management', null], ['All users', 'users']], title: 'User not found' })}${errorState(err.message)}`; $('[data-retry]').onclick = () => this.render(main, ctx); return; }
    const me = u.id === Session.current().userId, manage = can(Session.role(), 'users', 'manage');
    const d = { first: u.first, last: u.last, email: u.email, role: u.role }; let errors = {};
    const dirty = () => d.first !== u.first || d.last !== u.last || d.email !== u.email || d.role !== u.role;
    const activity = DB.db.audit.filter(a => a.by === u.id || a.targetId === u.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
    $('#ud').innerHTML = `${pageHead({ crumbs: [['User management', null], ['All users', 'users']], title: fullName(u), badges: userBadge(u.status) })}
      <div class="ed-grid">
        <div class="ed-main">
          <section class="card"><div class="card-head"><h2>Profile and role</h2>${manage ? '' : `<div class="card-actions">${badge('fixed', 'View only')}</div>`}</div><form class="card-body form" id="ud-form" novalidate></form></section>
          <section class="card"><div class="card-head"><h2>Recent activity</h2></div><div class="card-body">${activity.length ? `<ul class="activity">${activity.map(a => `<li><span class="act-w">${esc(fmtDateTime(a.at))}</span><span>${a.by === u.id ? '' : `${esc(UserService.name(a.by))}: `}${esc(a.action)} – ${esc(a.target)}</span></li>`).join('')}</ul><p><a class="text-link" href="#audit">Open the audit log</a></p>` : '<p class="muted">No activity yet.</p>'}</div></section>
        </div>
        <aside class="ed-side"><section class="card"><div class="card-body">
          <h2 class="side-h">Account</h2>
          <dl class="facts"><dt>Status</dt><dd>${userBadge(u.status)}</dd><dt>Created</dt><dd>${esc(fmtDateTime(u.created))}</dd><dt>Last sign-in</dt><dd>${u.lastSignIn ? esc(fmtDateTime(u.lastSignIn)) : 'Never'}</dd><dt>Sign-in</dt><dd>UTSW SSO with MFA (simulated)</dd></dl>
          ${manage ? `<div class="stack-acts">
            ${u.status === 'invited' ? btn({ label: 'Resend invitation', icon: 'send', variant: 'secondary', attrs: 'data-u="resend"' }) : ''}
            ${u.status === 'deactivated' ? btn({ label: 'Reactivate account', icon: 'how_to_reg', variant: 'secondary', attrs: 'data-u="reactivate"' }) : me ? '' : btn({ label: 'Deactivate account', icon: 'person_off', variant: 'secondary', attrs: 'data-u="deactivate"' })}
            ${me ? '<p class="muted">You can’t deactivate, delete or change the role of your own account.</p>' : btn({ label: 'Delete account', icon: 'delete', variant: 'danger', attrs: 'data-u="delete"' })}</div>` : ''}
        </div></section></aside>
      </div>`;
    const form = $('#ud-form');
    const fieldsFor = () => USER_FIELDS.map(f => (!manage || (me && f.key === 'role')) ? { ...f, readonly: true } : f);
    const draw = () => { form.innerHTML = `${renderForm([{ fields: fieldsFor() }], d, errors, 'f')}${manage ? `<div class="form-actions">${btn({ label: 'Save changes', icon: 'save', variant: 'primary', type: 'submit', attrs: 'id="ud-save"' })}</div>` : ''}`; };
    draw();
    wireForm(form, fieldsFor, d, () => {}, draw);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!dirty()) { toast('There are no changes to save.'); return; }
      errors = validateData(USER_FIELDS, d, x => userValidate(x, u.id));
      if (Object.keys(errors).length) { draw(); $('#f-errsum').focus(); return; }
      if (d.role !== u.role) { const c = await confirmDialog({ title: `Change role to ${ROLES[d.role].label}?`, body: `<p>${esc(fullName(u))} goes from ${ROLES[u.role].label} to ${ROLES[d.role].label}. What they can see and do changes the next time they open a page.</p>`, confirmLabel: 'Change role' }); if (!c.ok) return; }
      const b = $('#ud-save'); setBusy(b, true, 'Saving');
      try { await UserService.update(u.id, { ...d, email: d.email.trim().toLowerCase() }); Router.clearGuard(); toast('Changes saved.', { kind: 'success' }); this.render(main, ctx); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    });
    $('#ud').addEventListener('click', async e => {
      const b = e.target.closest('[data-u]'); if (!b) return;
      const k = b.dataset.u;
      const run = async (fn, busy, msg, go) => { setBusy(b, true, busy); try { await fn(); Router.clearGuard(); toast(msg, { kind: 'success' }); if (go) Router.go(go); else this.render(main, ctx); } catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); } };
      if (k === 'resend') run(() => UserService.resendInvite(u.id), 'Sending', `Invitation sent again to ${u.email} (simulated).`);
      if (k === 'deactivate') { const c = await confirmDialog({ title: `Deactivate ${fullName(u)}?`, body: '<p>They can’t sign in until the account is reactivated. Their history stays in the audit log.</p>', confirmLabel: 'Deactivate', variant: 'danger', comment: { label: 'Reason', required: true } }); if (c.ok) run(() => UserService.setStatus(u.id, 'deactivated', c.comment), 'Deactivating', `${fullName(u)} is deactivated.`); }
      if (k === 'reactivate') { const c = await confirmDialog({ title: `Reactivate ${fullName(u)}?`, body: `<p>They can sign in again as ${ROLES[u.role].label}.</p>`, confirmLabel: 'Reactivate' }); if (c.ok) run(() => UserService.setStatus(u.id, 'active', ''), 'Reactivating', `${fullName(u)} is active again.`); }
      if (k === 'delete') { const c = await confirmDialog({ title: `Delete ${fullName(u)}’s account?`, body: '<p>This removes the account for good. Consider deactivating instead – deletion vs. deactivation is pending confirmation (§10.16). The audit log keeps their past actions.</p>', confirmLabel: 'Delete account', variant: 'danger' }); if (c.ok) run(() => UserService.remove(u.id), 'Deleting', `${fullName(u)}’s account is deleted.`, 'users'); }
    });
    Router.setGuard(async () => {
      if (!dirty()) return true;
      const r = await confirmDialog({ title: 'Leave without saving?', body: '<p>Your changes to this user aren’t saved.</p>', confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
      return r.ok;
    });
  }
};
