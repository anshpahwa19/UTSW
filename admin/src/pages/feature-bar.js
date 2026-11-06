/* ---------- Feature publishing bar ----------
   On each feature's page (Layout, Campaigns, Emergency alerts, Quick links, Featured cards, Audience segments),
   a slim bar counts that feature's items by stage and moves several at once:
   - Deploy drafts to demo        (saved draft → new version on demo)
   - Publish demo to production   (the version on demo → production)
   - Publish drafts directly      (saved draft → new version on demo and production, skipping the demo check)
   Each batch opens a list of the items it can move, all ticked; untick any to leave them out.
   Only what the signed-in role may do is offered; the rest is named in a note. */
/* EXTRA_GLYPHS: edit_note science public rocket_launch bolt view_agenda campaign warning apps library_books groups */
const FB_ICONS = { homeLayout: 'view_agenda', campaign: 'campaign', alert: 'warning', quickLink: 'apps', featuredCard: 'library_books', segment: 'groups' };
let fbCurrent = null;          /* { types, noun } for the bar on the page now */

function featureBar(types, noun) { fbCurrent = { types, noun }; renderFeatureBar(); }
function fbStages(types) {
  const recs = types.flatMap(t => ConfigService.peekAll(t));
  return { drafts: recs.filter(r => r.draft), demo: recs.filter(r => r.demo && r.demo !== r.production), live: recs.filter(r => r.production) };
}
function renderFeatureBar() {
  const host = $('#hub-pub'); if (!host || !fbCurrent) return;
  const role = Session.role(), st = fbStages(fbCurrent.types), noun = fbCurrent.noun;
  const may = (r, a) => canAct(role, CONFIG_TYPES[r.type].area, a);
  const lists = {
    demo: st.drafts.filter(r => may(r, 'deployDemo')),
    prod: st.demo.filter(r => may(r, 'publish')),
    direct: st.drafts.filter(r => may(r, 'publish'))
  };
  const count = (k, icon, n, label) => `<li class="hub-c hub-${k}">${ic(icon, 20)}<b>${n}</b><span>${label}</span></li>`;
  const off = k => (lists[k].length ? '' : 'disabled');
  host.innerHTML = `<div class="hub-bar">
      <h2 id="hub-pub-h" class="hub-bar-h" tabindex="-1">Publishing</h2>
      <ul class="hub-counts" aria-label="${esc(noun)} items by stage">
        ${count('draft', 'edit_note', st.drafts.length, st.drafts.length === 1 ? 'draft' : 'drafts')}
        ${count('demo', 'science', st.demo.length, 'on demo')}
        ${count('prod', 'public', st.live.length, 'live')}
      </ul>
      <div class="hub-acts">
        ${btn({ label: lists.demo.length ? `Deploy ${plural(lists.demo.length, 'draft')} to demo` : 'Deploy to demo', icon: 'science', variant: 'secondary', size: 'sm', attrs: `data-hub="demo" ${off('demo')}` })}
        ${btn({ label: lists.prod.length ? `Publish ${lists.prod.length} to production` : 'Publish to production', icon: 'rocket_launch', variant: 'primary', size: 'sm', attrs: `data-hub="prod" ${off('prod')}` })}
        ${role === 'marketing' ? '' : btn({ label: lists.direct.length ? `Publish ${plural(lists.direct.length, 'draft')} directly` : 'Publish drafts directly', icon: 'bolt', variant: 'secondary', size: 'sm', attrs: `data-hub="direct" ${off('direct')}` })}
      </div>
    </div>
    ${st.drafts.length > lists.demo.length || st.demo.length > lists.prod.length ? `<p class="role-note">${ic('info', 20)}<span>${[
      st.drafts.length > lists.demo.length ? `${plural(st.drafts.length - lists.demo.length, 'draft')} need${st.drafts.length - lists.demo.length === 1 ? 's' : ''} a role that can deploy it` : '',
      st.demo.length > lists.prod.length ? `${plural(st.demo.length - lists.prod.length, 'item')} on demo need${st.demo.length - lists.prod.length === 1 ? 's' : ''} an Admin or Super Admin to publish` : ''].filter(Boolean).join('. ')}.</span></p>` : ''}`;

  host.onclick = async e => {
    const b = e.target.closest('[data-hub]'); if (!b || b.disabled) return;
    if ($('#main .lc .badge-unsaved')) { toast('Save or discard your changes first. Batches use saved drafts only.', { kind: 'error', ms: 7000 }); return; }
    const kind = b.dataset.hub, list = lists[kind];
    const T = {
      demo: { title: 'Deploy drafts to demo', verb: 'Deploy', lede: 'Each saved draft becomes a new version on demo, for checking on test devices. Production doesn’t change.', confirm: 'Deploy to demo', busy: 'Deploying', done: 'to demo' },
      prod: { title: 'Publish demo to production', verb: 'Publish', lede: 'Each item publishes the version that is on demo now. What patients see in the app changes.', confirm: 'Publish to production', busy: 'Publishing', done: 'to production' },
      direct: { title: 'Publish drafts directly to production', verb: 'Publish', lede: 'Each saved draft goes straight to production as a new version, skipping the check on demo. Use it for urgent or trivial changes.', confirm: 'Publish directly', busy: 'Publishing', done: 'directly to production' }
    }[kind];
    const needComment = kind !== 'demo' && DB.db.settings.requirePublishComment;
    /* Ticked items are tracked while the dialog is open */
    const picked = new Set(list.map(r => r.id));
    const onPick = ev => { const cb = ev.target.closest && ev.target.closest('[data-pick]'); if (cb) { cb.checked ? picked.add(cb.dataset.pick) : picked.delete(cb.dataset.pick); } };
    document.addEventListener('change', onPick, true);
    const c = await confirmDialog({
      title: `${T.title}?`, wide: true,
      body: `${kind === 'direct' ? `<div class="warn-box">${ic('bolt', 20)}<p>This skips demo: the drafts aren’t checked on test devices before patients see them.</p></div>` : ''}<p>${T.lede} Untick any you want to leave out.</p>
        <ul class="hub-confirm fb-pick">${list.map(r => `<li><label class="checkbox fb-row" for="pick-${r.id}"><input type="checkbox" id="pick-${r.id}" data-pick="${r.id}" checked>
          ${ic(FB_ICONS[r.type] || 'description', 20)}<span><b>${esc(r.name)}</b> <span class="muted">${kind === 'prod' ? `v${r.demo} on demo` : `draft saved ${esc(fmtDateTime(r.draft.updatedAt))}`}</span></span></label></li>`).join('')}</ul>`,
      confirmLabel: T.confirm, variant: kind === 'direct' ? 'danger' : 'primary',
      comment: { label: 'Comment', required: needComment, hint: needComment ? 'Required by Administrative settings. Added to each item’s history.' : 'Optional. Added to each item’s history.' }
    });
    document.removeEventListener('change', onPick, true);
    if (!c.ok) return;
    const chosen = list.filter(r => picked.has(r.id));
    if (!chosen.length) { toast('Nothing was selected, so nothing changed.'); return; }
    setBusy(b, true, T.busy);
    let done = 0; const failed = [];
    for (const r of chosen) {
      try { await (kind === 'demo' ? ConfigService.deployToDemo(r.id, c.comment) : kind === 'prod' ? ConfigService.publish(r.id, c.comment) : ConfigService.publishDirect(r.id, c.comment)); done++; }
      catch (err) { failed.push(`${r.name}: ${err.message}`); }
    }
    Router.clearGuard();
    toast(`${T.verb === 'Deploy' ? 'Deployed' : 'Published'} ${plural(done, 'item')} ${T.done}.${failed.length ? ` ${failed.length} didn’t: ${failed.join('; ')}` : ''}`, { kind: failed.length ? 'error' : 'success', ms: failed.length ? 9000 : 5000 });
    Router.refresh();
    const h = $('#hub-pub-h'); if (h) h.focus();
  };
}
