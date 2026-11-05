/* ---------- Home Screen: one page, a tab per area, one publishing bar for all of them ----------
   The tabs are Layout, Campaigns, Emergency alerts, Quick links and Featured cards. Each tab keeps its own
   address (#home-layout, #home-campaigns…), so links, history and the leave-with-unsaved-changes guard work
   as before; the tabs are navigation links (aria-current), not an ARIA tablist.
   The publishing bar sums every Home Screen configuration by stage and moves them together:
   Deploy every saved draft to demo, then Publish everything on demo to production. One item at a time still
   works from its own editor. Batch actions only include what the signed-in role may do; the rest is named. */
/* EXTRA_GLYPHS: edit_note science public rocket_launch view_agenda campaign warning apps library_books */
const HUB_TYPES = ['homeLayout', 'campaign', 'alert', 'quickLink', 'featuredCard'];
const HUB_ICONS = { homeLayout: 'view_agenda', campaign: 'campaign', alert: 'warning', quickLink: 'apps', featuredCard: 'library_books' };
let HUB_TAB = false;          /* true while a Home Screen tab is rendering: page headings become h2 inside the hub */
let hubFromTab = false;

function hubRecords() { return HUB_TYPES.flatMap(t => ConfigService.peekAll(t)); }
function hubStages() {
  const recs = hubRecords();
  return {
    drafts: recs.filter(r => r.draft),
    demo: recs.filter(r => r.demo && r.demo !== r.production),
    live: recs.filter(r => r.production)
  };
}
const hubName = r => `${r.name} (${CONFIG_TYPES[r.type].label.toLowerCase()})`;

function homeHub(main, route) {
  const sec = NAV.find(s => s.id === route.section.id), role = Session.role();
  const tabs = sec.items.filter(i => can(role, i.area, 'view'));
  main.innerHTML = `<div class="page hub">
    <div class="page-head hub-head"><div class="ph-row"><div class="ph-main"><h1 id="hub-h" tabindex="-1">Home Screen</h1></div></div>
      <p class="lede">Everything on the MyCare home screen: its layout, campaigns, emergency alerts, quick links and featured cards.</p></div>
    <section class="card hub-pub" aria-labelledby="hub-pub-h" id="hub-pub"></section>
    <nav class="hub-tabs" aria-label="Home Screen sections"><ul>${tabs.map(i => `<li><a href="#${i.route}" ${i.route === route.pattern ? 'aria-current="page"' : ''}>${esc(i.label)}<span class="hub-n" data-n="${i.area}"></span></a></li>`).join('')}</ul></nav>
    <div class="hub-panel" id="hub-panel"></div>
  </div>`;
  $('.hub-tabs', main).addEventListener('click', e => { if (e.target.closest('a')) hubFromTab = true; });
  hubRenderBar();
  return $('#hub-panel', main);
}

/* Stage tiles and the two batch actions */
function hubRenderBar() {
  const host = $('#hub-pub'); if (!host) return;
  const role = Session.role(), st = hubStages();
  const may = (r, a) => canAct(role, CONFIG_TYPES[r.type].area, a);
  const dep = st.drafts.filter(r => may(r, 'deployDemo')), pub = st.demo.filter(r => may(r, 'publish'));
  const names = list => list.length ? `<ul class="hub-names">${list.slice(0, 3).map(r => `<li><a href="#${recLink(r)}">${esc(r.name)}</a></li>`).join('')}${list.length > 3 ? `<li class="muted">and ${list.length - 3} more</li>` : ''}</ul>` : '';
  const tile = (k, icon, label, list, note) => `<div class="hub-stage hub-${k}">
      <span class="hub-st-ic" aria-hidden="true">${ic(icon, 20)}</span>
      <div class="hub-st-t"><p class="hub-st-l">${label}</p><p class="hub-st-v"><b>${list.length}</b> <span>${note}</span></p>${names(list)}</div></div>`;
  host.innerHTML = `<div class="card-head"><h2 id="hub-pub-h">Publishing</h2><div class="card-actions">${badge('mock')}</div></div>
    <div class="card-body">
      <div class="hub-stages">
        ${tile('draft', 'edit_note', 'Draft', st.drafts, st.drafts.length === 1 ? 'saved draft' : 'saved drafts')}
        ${tile('demo', 'science', 'Demo', st.demo, 'waiting for production')}
        ${tile('prod', 'public', 'Production', [], 'live in the app').replace('<b>0</b>', `<b>${st.live.length}</b>`)}
      </div>
      <div class="hub-acts">
        ${btn({ label: dep.length ? `Deploy ${plural(dep.length, 'draft')} to demo` : 'Deploy drafts to demo', icon: 'science', variant: 'secondary', attrs: `data-hub="demo" ${dep.length ? '' : 'disabled'}` })}
        ${btn({ label: pub.length ? `Publish ${pub.length} to production` : 'Publish to production', icon: 'rocket_launch', variant: 'primary', attrs: `data-hub="prod" ${pub.length ? '' : 'disabled'}` })}
      </div>
      ${st.drafts.length > dep.length || st.demo.length > pub.length ? `<p class="role-note">${ic('info', 20)}<span>${[
        st.drafts.length > dep.length ? `${plural(st.drafts.length - dep.length, 'draft')} need${st.drafts.length - dep.length === 1 ? 's' : ''} a role that can deploy it` : '',
        st.demo.length > pub.length ? `${plural(st.demo.length - pub.length, 'item')} on demo need${st.demo.length - pub.length === 1 ? 's' : ''} an Admin or Super Admin to publish` : ''].filter(Boolean).join('. ')}.</span></p>` : ''}
    </div>`;
  /* Counts on the tabs: anything waiting in that area */
  $$('.hub-n').forEach(n => {
    const area = n.dataset.n, c = [...st.drafts, ...st.demo].filter((r, i, a) => CONFIG_TYPES[r.type].area === area && a.indexOf(r) === i).length;
    n.textContent = c || ''; n.hidden = !c;
    n.setAttribute('aria-label', c ? `, ${plural(c, 'item')} waiting` : '');
  });
  host.onclick = async e => {
    const b = e.target.closest('[data-hub]'); if (!b || b.disabled) return;
    if ($('#hub-panel .badge-unsaved')) { toast('Save or discard the changes on this tab first. Batch actions use saved drafts only.', { kind: 'error', ms: 7000 }); return; }
    const toDemo = b.dataset.hub === 'demo', list = toDemo ? dep : pub;
    const needComment = !toDemo && DB.db.settings.requirePublishComment;
    const c = await confirmDialog({
      title: toDemo ? `Deploy ${plural(list.length, 'draft')} to demo?` : `Publish ${plural(list.length, 'item')} to production?`,
      body: `<p>${toDemo ? 'Each saved draft becomes a new version on demo, where you can check it on test devices. Production doesn’t change.' : 'What patients see in the app changes for each of these. Each one publishes the version that is on demo now.'}</p>
        <ul class="hub-confirm">${list.map(r => `<li>${ic(HUB_ICONS[r.type], 20)}<span><b>${esc(r.name)}</b> <span class="muted">${esc(CONFIG_TYPES[r.type].label)}${toDemo ? '' : ` · v${r.demo}`}</span></span></li>`).join('')}</ul>`,
      confirmLabel: toDemo ? 'Deploy to demo' : 'Publish to production',
      comment: { label: 'Comment', required: needComment, hint: needComment ? 'Required by Administrative settings. Added to each item’s history.' : 'Optional. Added to each item’s history.' }
    });
    if (!c.ok) return;
    setBusy(b, true, toDemo ? 'Deploying' : 'Publishing');
    let done = 0; const failed = [];
    for (const r of list) {
      try { await (toDemo ? ConfigService.deployToDemo(r.id, c.comment) : ConfigService.publish(r.id, c.comment)); done++; }
      catch (err) { failed.push(`${r.name}: ${err.message}`); }
    }
    Router.clearGuard();
    toast(`${toDemo ? 'Deployed' : 'Published'} ${plural(done, 'item')} ${toDemo ? 'to demo' : 'to production'}.${failed.length ? ` ${failed.length} didn’t: ${failed.join('; ')}` : ''}`, { kind: failed.length ? 'error' : 'success', ms: failed.length ? 9000 : 5000 });
    Router.refresh();
    const again = $(`[data-hub="${toDemo ? 'prod' : 'demo'}"]`); if (again && !again.disabled) again.focus(); else { const h = $('#hub-pub-h'); if (h) { h.tabIndex = -1; h.focus(); } }
  };
}
