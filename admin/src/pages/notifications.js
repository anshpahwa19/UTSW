/* ---------- Notifications: list, create and edit, details ----------
   Lifecycle: Draft → Scheduled (or Sent when immediate) → Sent; Cancel while scheduled.
   Admins and Super Admins schedule or send; cancel and edit rules are pending UTSW confirmation (§10.14). Sending is simulated. */
const NOTE_BADGE = { draft: 'draft', scheduled: 'demo', sent: 'live', cancelled: 'hidden' };
const noteBadge = s => badge(NOTE_BADGE[s], NOTE_STATUS[s]);
const NOTE_SECTIONS = [
  { title: 'Message', fields: [
    { key: 'title', label: 'Notification title', required: true, max: 50 },
    { key: 'description', label: 'Notification description', type: 'textarea', required: true, max: 178, hint: 'Push messages are cut off after about 178 characters.' },
    { key: 'image', label: 'Image', type: 'image', hint: 'Shown in rich push and the Inbox. Sample images only.' },
    { key: 'imageAlt', label: 'Image alternative text', required: true, max: 120, show: d => d.image && d.image !== 'none' },
    { key: 'videoUrl', label: 'Video URL', type: 'text', placeholder: 'https://', hint: 'Optional. Allowed video hosts are pending (§10.14).' },
    { key: 'destination', label: 'Opens', type: 'destination', hint: 'Where the app goes when the notification is tapped.' }] },
  { title: 'Delivery', fields: [
    { key: 'sendTo', label: 'Send to', type: 'segment' },
    { key: 'timing', label: 'When', type: 'radio', options: [['now', 'Immediately'], ['scheduled', 'At a scheduled time']], rerender: true },
    { key: 'scheduledAt', label: 'Scheduled date and time (Central Time)', type: 'datetime', required: true, show: d => d.timing === 'scheduled' }] }
];
const noteFields = fields(NOTE_SECTIONS);
const noteValidate = d => (d.timing === 'scheduled' && d.scheduledAt && d.scheduledAt <= nowLocal() ? { scheduledAt: 'Choose a time in the future.' } : {});
const noteData = n => Object.fromEntries(noteFields.map(f => [f.key, clone(n[f.key])]).concat([['timing', n.timing]]));

BUILT_PAGES.notifications = {
  async render(main) {
    const canEdit = can(Session.role(), 'notifications', 'draft');
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Notifications', null]], title: 'All notifications', lede: 'Push and Inbox messages to app users. Sending is simulated; no push provider is connected.',
      actions: canEdit ? `<a class="btn btn-primary" href="#notifications-new">${ic('add', 20)}<span class="lbl">Create notification</span></a>` : '' })}<div id="nt-body">${loadingState('Loading notifications')}</div></div>`;
    let list;
    try { list = await NotificationService.list(); } catch (err) { $('#nt-body').innerHTML = errorState(err.message); $('[data-retry]').onclick = () => this.render(main); return; }
    const c = k => list.filter(n => n.status === k).length;
    $('#nt-body').innerHTML = `<div class="stat-strip">
      <div class="stat">${ic('edit_note', 20)}<span><b>${c('draft')}</b> ${c('draft') === 1 ? 'draft' : 'drafts'}</span></div>
      <div class="stat">${ic('schedule', 20)}<span><b>${c('scheduled')}</b> scheduled</span></div>
      <div class="stat">${ic('send', 20)}<span><b>${c('sent')}</b> sent</span></div></div>
      <section class="card"><div class="card-body" id="nt-table"></div></section>`;
    dataTable($('#nt-table'), {
      id: 'nt', caption: 'Notifications', noun: 'notification', rows: list, defaultSort: { key: 'created', dir: 'desc' }, pageSize: 10, searchPlaceholder: 'Search titles and messages',
      searchText: n => `${n.title} ${n.description}`,
      filters: [
        { key: 'status', label: 'Status', options: Object.entries(NOTE_STATUS), match: (n, v) => n.status === v },
        { key: 'aud', label: 'Audience', options: segmentOptions(), match: (n, v) => n.sendTo === v }],
      empty: { icon: 'notifications', title: 'No notifications yet', text: canEdit ? 'Create the first one.' : '' },
      columns: [
        { key: 'title', label: 'Title', sortable: true, sortValue: n => n.title.toLowerCase(), render: n => `<a class="row-link" href="#notifications-${n.id}">${esc(n.title)}</a>` },
        { key: 'sendTo', label: 'Audience', render: n => esc(segmentName(n.sendTo)) },
        { key: 'when', label: 'Scheduled', sortable: true, sortValue: n => n.scheduledAt || '', render: n => n.timing === 'now' && !n.sentAt ? 'Immediately' : `<span class="nowrap">${esc(fmtLocal(n.scheduledAt))}</span>` },
        { key: 'created', label: 'Created', sortable: true, sortValue: n => n.createdAt, render: n => `<span class="nowrap">${esc(fmtDate(n.createdAt))}</span>` },
        { key: 'status', label: 'Status', sortable: true, sortValue: n => n.status, render: n => noteBadge(n.status) }]
    });
  }
};

const noteEditor = {
  async render(main, ctx) {
    const isNew = ctx.route.pattern === 'notifications-new';
    const role = Session.role();
    main.innerHTML = `<div class="page" id="ne">${loadingState('Loading the notification')}</div>`;
    let n = null;
    if (!isNew) {
      try { n = await NotificationService.get(ctx.params.id); }
      catch (err) { $('#ne').innerHTML = `${pageHead({ crumbs: [['Notifications', null], ['All notifications', 'notifications']], title: 'Notification not found' })}${errorState(err.message)}`; $('[data-retry]').onclick = () => this.render(main, ctx); return; }
    }
    const blank = { title: '', description: '', sendTo: 'seg-all', timing: 'scheduled', scheduledAt: '', image: 'none', imageAlt: '', videoUrl: '', destination: { type: 'none', value: '' } };
    const working = n ? noteData(n) : clone(blank);
    let errors = {};
    const editable = () => can(role, 'notifications', 'draft') && (!n || n.status === 'draft');
    const dirty = () => !same(working, n ? noteData(n) : blank);
    const title = () => working.title || 'Create notification';
    const steps = () => {
      const s = n ? n.status : 'draft', order = ['draft', 'scheduled', 'sent'];
      if (s === 'cancelled') return [{ title: 'Draft', state: 'done' }, { title: 'Cancelled', state: 'current', detail: badge('hidden', 'Cancelled – won’t be sent') }];
      const at = order.indexOf(s);
      return [['Draft', 'draft'], [working.timing === 'now' ? 'Send' : 'Scheduled', 'scheduled'], ['Sent', 'sent']].map(([t, k], i) => ({ title: t, state: i < at ? 'done' : i === at ? (k === 'sent' ? 'done' : 'current') : 'todo',
        detail: k === 'scheduled' && n && n.scheduledAt && working.timing === 'scheduled' ? esc(fmtLocal(n.scheduledAt)) : k === 'sent' && n && n.sentAt ? esc(fmtDateTime(n.sentAt)) : k === 'draft' && isNew ? badge('unsaved', 'New') : '' }));
    };
    $('#ne').innerHTML = `${pageHead({ crumbs: [['Notifications', null], ['All notifications', 'notifications']], title: title(), badges: `<span id="ne-b">${n ? noteBadge(n.status) : badge('unsaved', 'New')}</span>` })}
      <section class="card lc" aria-labelledby="lc-h"><div class="card-head"><h2 id="lc-h" tabindex="-1">Status</h2><div class="card-actions">${badge('simulated', 'Sending is simulated')}</div></div><div class="card-body" id="ne-lc"></div></section>
      ${n && n.stats ? `<section class="card" aria-labelledby="res-h"><div class="card-head"><h2 id="res-h">Results</h2><div class="card-actions">${badge('mock')}</div></div><div class="card-body"><div class="metric-row">
        ${[['Delivered', n.stats.delivered, null], ['Opened', n.stats.opened, n.stats.delivered], ['Took action', n.stats.actions, n.stats.delivered]].map(([l, v, of]) => `<div class="metric"><p class="metric-l">${l}</p><p class="metric-v">${v.toLocaleString('en-US')}</p><p class="metric-c">${of ? `${(v / of * 100).toFixed(1)}% of delivered` : n.sentAt ? `Sent ${esc(fmtDateTime(n.sentAt))}` : ''}</p></div>`).join('')}</div></div></section>` : ''}
      <div class="ed-grid">
        <section class="card" aria-labelledby="form-h"><div class="card-head"><h2 id="form-h">Notification</h2>${editable() ? '' : `<div class="card-actions">${badge('fixed', 'Locked')}</div>`}</div>
          ${!editable() && n ? `<p class="note-line in-card">${ic('lock', 20)}<span>${can(role, 'notifications', 'draft') ? `${NOTE_STATUS[n.status]} notifications can’t be edited. Duplicate it to send a new version.` : 'Your role can view notifications only.'}</span></p>` : ''}
          <form class="card-body form" id="ne-form" novalidate></form></section>
        <aside class="ed-side" id="ne-pv"></aside>
      </div>`;
    const form = $('#ne-form');
    const draw = () => { form.innerHTML = renderForm(NOTE_SECTIONS.map(s => ({ ...s, fields: s.fields.map(f => editable() ? f : { ...f, readonly: true }) })), working, errors, 'f'); };
    draw();
    form.addEventListener('submit', e => e.preventDefault());
    const pv = this.pv = mountPreviewCard($('#ne-pv'), {
      title: 'Mobile preview of the notification',
      sources: () => [['working', 'Lock screen', badge('draft', 'Push notification')]],
      payload: () => ({ screen: 'push', layout: layoutFor('guest'), content: { ...appContent(), push: { title: working.title, body: working.description, art: working.image !== 'none' ? ART[working.image] : null, delivery: 'push+inbox', when: working.timing === 'scheduled' && working.scheduledAt ? fmtLocal(working.scheduledAt).replace(/, \d{4},.*$/, '') : 'Thursday, Oct. 30' } }, label: 'notification preview' })
    });
    const renderActions = () => {
      const s = n ? n.status : 'new', acts = [];
      const can2 = l => can(role, 'notifications', l);
      if (editable() && (dirty() || isNew)) acts.push(btn({ label: isNew ? 'Save as draft' : 'Save changes', icon: 'save', variant: 'primary', attrs: 'data-n="save"' }));
      if (s === 'draft' && !dirty() && can2('publish')) acts.push(btn({ label: working.timing === 'now' ? 'Send now' : 'Schedule', icon: working.timing === 'now' ? 'send' : 'schedule', variant: 'primary', attrs: 'data-n="schedule"' }));
      if (s === 'scheduled' && can2('publish')) acts.push(btn({ label: 'Cancel notification', icon: 'cancel', variant: 'secondary', attrs: 'data-n="cancel"' }));
      if (n && can2('draft')) acts.push(btn({ label: 'Duplicate', icon: 'content_copy', variant: 'text', attrs: 'data-n="dup"' }));
      if (n && ['draft', 'cancelled'].includes(s) && can2('draft')) acts.push(btn({ label: 'Delete', icon: 'delete', variant: 'text', attrs: 'data-n="del"' }));
      const note = s === 'draft' && can2('draft') && !can2('publish') ? 'An Admin or Super Admin schedules or sends drafts. Who can send is pending confirmation.' : '';
      $('#ne-lc').innerHTML = `${stepper(steps(), 'Notification status')}<div class="lc-actions">${acts.join('')}</div>${note ? `<p class="role-note">${ic('info', 20)}<span>${note}</span></p>` : ''}`;
      $('#ne-b').innerHTML = `${n ? noteBadge(n.status) : badge('unsaved', 'New')}${n && dirty() ? badge('unsaved') : ''}`;
      $('#page-h').textContent = title();
    };
    const refresh = debounce(() => { renderActions(); pv.update(); }, 100);
    wireForm(form, () => noteFields, working, refresh, draw);
    renderActions();
    const reload = async (msg, go) => { Router.clearGuard(); toast(msg, { kind: 'success' }); if (go) Router.go(go); else this.render(main, ctx); };
    $('#ne-lc').onclick = async e => {
      const b = e.target.closest('[data-n]'); if (!b) return;
      const k = b.dataset.n;
      const run = async (fn, busy, msg, go) => { setBusy(b, true, busy); try { const r = await fn(); reload(typeof msg === 'function' ? msg(r) : msg, typeof go === 'function' ? go(r) : go); } catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); } };
      if (k === 'save') {
        errors = validateData(noteFields, working, noteValidate); draw();
        if (Object.keys(errors).length) { $('#f-errsum').focus(); return; }
        return run(() => NotificationService.save(n && n.id, working), 'Saving', can(role, 'notifications', 'publish') ? 'Saved as a draft. Schedule it when it’s ready.' : 'Saved as a draft.', r => isNew ? `notifications-${r.id}` : null);
      }
      if (k === 'schedule') {
        const c = await confirmDialog({ title: n.timing === 'now' ? 'Send this notification now?' : 'Schedule this notification?', body: `<div class="warn-box">${ic('notifications', 20)}<p>${n.timing === 'now' ? 'It goes out now' : `It goes out on ${esc(fmtLocal(n.scheduledAt))}`} to <b>${esc(segmentName(n.sendTo))}</b> as a push notification and an Inbox message. Sending is simulated in the prototype.</p></div>`, confirmLabel: n.timing === 'now' ? 'Send now' : 'Schedule', comment: { label: 'Comment', hint: 'Optional' } });
        if (c.ok) run(() => NotificationService.schedule(n.id, c.comment), n.timing === 'now' ? 'Sending' : 'Scheduling', r => r.status === 'sent' ? 'Sent (simulated).' : `Scheduled for ${fmtLocal(r.scheduledAt)}.`);
      }
      if (k === 'cancel') { const c = await confirmDialog({ title: 'Cancel this notification?', body: '<p>It won’t be sent. You can duplicate it later to send a new version.</p>', confirmLabel: 'Cancel notification', variant: 'danger', cancelLabel: 'Keep it', comment: { label: 'Reason', required: true } }); if (c.ok) run(() => NotificationService.cancel(n.id, c.comment), 'Cancelling', 'Notification cancelled.'); }
      if (k === 'dup') run(() => NotificationService.duplicate(n.id), 'Duplicating', 'Duplicated as a new draft.', r => `notifications-${r.id}`);
      if (k === 'del') { const c = await confirmDialog({ title: 'Delete this notification?', body: `<p>“${esc(n.title)}” is deleted for good. The audit log keeps a record.</p>`, confirmLabel: 'Delete', variant: 'danger' }); if (c.ok) run(() => NotificationService.remove(n.id), 'Deleting', 'Notification deleted.', 'notifications'); }
    };
    Router.setGuard(async () => {
      if (!dirty() || !editable()) return true;
      const r = await confirmDialog({ title: 'Leave without saving?', body: '<p>Your changes to this notification aren’t saved.</p>', confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
      return r.ok;
    });
  },
  leave() { if (this.pv) { this.pv.destroy(); this.pv = null; } }
};
BUILT_PAGES['notifications-new'] = noteEditor;
BUILT_PAGES['notifications-:id'] = noteEditor;
