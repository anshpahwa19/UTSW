/* ---------- My profile ----------
   The signed-in person can change their own first and last name. Everything else on the account (email, role,
   status, dates) is shown read only: role and status are changed by a Super Admin in Admin management, and the
   email comes from the UTSW identity provider.
   PASSWORD – SIMULATED. Sign-in is UTSW SSO, so the real password lives with the identity provider (pending, §10.1).
   This form only checks what is typed against the sample rules; nothing is sent or stored, and the fields are
   cleared as soon as the check finishes. */
/* EXTRA_GLYPHS: person lock badge visibility visibility_off */
const PW_MIN = 12;
BUILT_PAGES.profile = {
  async render(main) {
    const u = Session.user(), role = Session.role();
    const name = { first: u.first, last: u.last };
    main.innerHTML = `<div class="page profile">
      ${pageHead({ crumbs: [], title: 'My profile', lede: 'Change your name and password. Your email, role and account status are managed for you.' })}
      <div class="pf-grid">
        <section class="card" aria-labelledby="pf-h">
          <div class="card-head"><h2 id="pf-h">Profile</h2></div>
          <form class="card-body form" id="pf-form" novalidate>
            <div class="pf-me"><span class="avatar lg" aria-hidden="true" id="pf-av">${esc(initials(u))}</span>
              <div><p class="pf-name" id="pf-name">${esc(u.first)} ${esc(u.last)}</p><p class="muted">${esc(u.email)}</p></div></div>
            <div class="form-grid">
              ${['first', 'last'].map(k => `<div class="field" id="pf-${k}-w"><label for="pf-${k}">${k === 'first' ? 'First name' : 'Last name'} <span class="req">(required)</span></label>
                <input class="input" id="pf-${k}" name="${k === 'first' ? 'given-name' : 'family-name'}" autocomplete="${k === 'first' ? 'given-name' : 'family-name'}" maxlength="40" value="${esc(u[k])}" required aria-describedby="pf-${k}-err">
                <p class="err" id="pf-${k}-err" hidden></p></div>`).join('')}
            </div>
            <dl class="facts pf-facts">
              <div><dt>Email</dt><dd>${esc(u.email)}</dd></div>
              <div><dt>Role</dt><dd><span class="role-tag">${esc(ROLES[role].label)}</span></dd></div>
              <div><dt>Status</dt><dd>${esc(u.status === 'active' ? 'Active' : u.status)}</dd></div>
              <div><dt>Member since</dt><dd>${esc(fmtDate(u.created))}</dd></div>
              <div><dt>Last sign-in</dt><dd>${esc(u.lastSignIn ? fmtDateTime(u.lastSignIn) : 'Never')}</dd></div>
            </dl>
            <p class="role-note">${ic('info', 20)}<span>Only your name can be changed here. A Super Admin changes roles and status in Admin management; your email comes from your UTSW account.</span></p>
            <div class="form-acts">${btn({ label: 'Save name', icon: 'save', variant: 'primary', type: 'submit', attrs: 'id="pf-save" disabled' })}</div>
          </form>
        </section>
        <section class="card" aria-labelledby="pw-h">
          <div class="card-head"><h2 id="pw-h">Password</h2><div class="card-actions">${badge('simulated', 'Simulated')}</div></div>
          <form class="card-body form" id="pw-form" novalidate>
            <p class="note-line">${ic('lock', 20)}<span>You sign in with UTSW SSO, so your real password belongs to your UTSW account. This prototype only checks the form: nothing is sent or stored.</span></p>
            ${[['cur', 'Current password', 'current-password'], ['new', 'New password', 'new-password'], ['cnf', 'Confirm new password', 'new-password']].map(([k, l, ac]) => `
              <div class="field" id="pw-${k}-w"><label for="pw-${k}">${l} <span class="req">(required)</span></label>
                <div class="pw-wrap"><input class="input" type="password" id="pw-${k}" autocomplete="${ac}" required aria-describedby="${k === 'new' ? 'pw-rules ' : ''}pw-${k}-err">
                <button type="button" class="pw-eye btn btn-text btn-icon" data-eye="pw-${k}" aria-label="Show ${l.toLowerCase()}" aria-pressed="false">${ic('visibility', 20)}</button></div>
                <p class="err" id="pw-${k}-err" hidden></p></div>`).join('')}
            <ul class="pw-rules" id="pw-rules" aria-label="Password rules">
              <li data-rule="len">At least ${PW_MIN} characters</li><li data-rule="mix">Letters and at least one number</li><li data-rule="diff">Different from your current password</li></ul>
            <div class="form-acts">${btn({ label: 'Change password', icon: 'lock', variant: 'primary', type: 'submit', attrs: 'id="pw-go"' })}</div>
          </form>
        </section>
      </div></div>`;

    /* ---- Name ---- */
    const f = $('#pf-form'), save = $('#pf-save');
    const val = () => ({ first: $('#pf-first').value.trim(), last: $('#pf-last').value.trim() });
    const dirty = () => { const v = val(); return v.first !== name.first || v.last !== name.last; };
    const setErr = (k, msg, pre = 'pf') => { const w = $(`#${pre}-${k}-w`), e = $(`#${pre}-${k}-err`), i = $(`#${pre}-${k}`); w.classList.toggle('has-error', !!msg); e.hidden = !msg; e.innerHTML = msg ? `${ic('error', 16)}<span>${esc(msg)}</span>` : ''; msg ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid'); };
    f.addEventListener('input', () => { save.disabled = !dirty(); ['first', 'last'].forEach(k => { if ($(`#pf-${k}`).value.trim()) setErr(k, ''); }); });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const v = val(), bad = [];
      ['first', 'last'].forEach(k => { const m = !v[k] ? `Enter your ${k} name.` : /[<>]/.test(v[k]) ? 'Use letters, spaces, hyphens or apostrophes.' : ''; setErr(k, m); if (m) bad.push(k); });
      if (bad.length) { $(`#pf-${bad[0]}`).focus(); return; }
      setBusy(save, true, 'Saving');
      try {
        await UserService.updateOwnName(v.first, v.last);
        Object.assign(name, v);
        $('#pf-name').textContent = `${v.first} ${v.last}`; $('#pf-av').textContent = `${v.first[0]}${v.last[0]}`;
        renderUser(); setBusy(save, false); save.disabled = true;
        toast('Your name is saved.', { kind: 'success' }); announce('Your name is saved.');
      } catch (err) { setBusy(save, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    });

    /* ---- Password (simulated) ---- */
    const pw = $('#pw-form');
    const rules = () => { const n = $('#pw-new').value, c = $('#pw-cur').value; return { len: n.length >= PW_MIN, mix: /[a-z]/i.test(n) && /\d/.test(n), diff: !!n && n !== c }; };
    const paint = () => { const r = rules(); $$('#pw-rules li').forEach(li => li.classList.toggle('met', r[li.dataset.rule])); };
    pw.addEventListener('input', paint);
    pw.addEventListener('click', e => {
      const b = e.target.closest('[data-eye]'); if (!b) return;
      const i = $(`#${b.dataset.eye}`), show = i.type === 'password';
      i.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', show); b.innerHTML = ic(show ? 'visibility_off' : 'visibility', 20);
      b.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} ${b.getAttribute('aria-label').replace(/^(Show|Hide) /, '')}`);
    });
    pw.addEventListener('submit', async e => {
      e.preventDefault();
      const cur = $('#pw-cur').value, nw = $('#pw-new').value, cnf = $('#pw-cnf').value, r = rules(), bad = [];
      const m = {
        cur: !cur ? 'Enter your current password.' : '',
        new: !nw ? 'Enter a new password.' : !r.len ? `Use at least ${PW_MIN} characters.` : !r.mix ? 'Use letters and at least one number.' : !r.diff ? 'Choose a password different from your current one.' : '',
        cnf: !cnf ? 'Enter the new password again.' : cnf !== nw ? 'The passwords don’t match.' : ''
      };
      Object.entries(m).forEach(([k, msg]) => { setErr(k, msg, 'pw'); if (msg) bad.push(k); });
      if (bad.length) { $(`#pw-${bad[0]}`).focus(); return; }
      const go = $('#pw-go'); setBusy(go, true, 'Checking');
      await new Promise(res => setTimeout(res, 500));
      ['cur', 'new', 'cnf'].forEach(k => { $(`#pw-${k}`).value = ''; $(`#pw-${k}`).type = 'password'; });
      $$('[data-eye]', pw).forEach(b => { b.setAttribute('aria-pressed', 'false'); b.innerHTML = ic('visibility', 20); });
      paint(); setBusy(go, false);
      toast('Password change simulated. Nothing was sent or stored; your real password is managed by your UTSW account.', { kind: 'success', ms: 7000 });
      announce('Password change simulated.');
      $('#pw-h').setAttribute('tabindex', '-1'); $('#pw-h').focus();
    });
  }
};
