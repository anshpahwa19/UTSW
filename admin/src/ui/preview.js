/* ---------- Preview frame ----------
   An isolated iframe (srcdoc, sandbox="allow-scripts" without same-origin) so the designs/guest CSS can't leak into
   the Admin and the Admin can't reach into it. The Admin posts the configuration in; the frame renders it.
   PREVIEW_CSS, PREVIEW_JS and PREVIEW_HTML are inlined by build.py from src/preview/. */
function previewDoc() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=390">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&display=swap">
<link rel="stylesheet" href="${ICON_FONT_URL}">
<style>${PREVIEW_CSS}</style></head><body>${PREVIEW_HTML}<script>${PREVIEW_JS}<\/script></body></html>`;
}
/* Mounts a phone frame in host; returns { render(payload) } */
function mountPreview(host, { title }) {
  host.innerHTML = `<div class="pv-device"><div class="pv-screen"><iframe class="pv-frame" sandbox="allow-scripts" title="${esc(title)}"></iframe></div></div>`;
  const frame = $('iframe', host);
  let ready = false, pending = null;
  const send = p => frame.contentWindow && frame.contentWindow.postMessage({ type: 'mycare-preview', ...p }, '*');
  const onMsg = e => {
    if (e.source !== frame.contentWindow || !e.data) return;
    if (e.data.type === 'mycare-preview-ready') { ready = true; if (pending) send(pending); }
    if (e.data.type === 'mycare-preview-rendered') host.dataset.rendered = String(Date.now());
  };
  window.addEventListener('message', onMsg);
  frame.srcdoc = previewDoc();
  return {
    render(payload) { pending = payload; if (ready) send(payload); },
    destroy() { window.removeEventListener('message', onMsg); }
  };
}

/* ---------- What the app shows: assembles preview content from the config records ----------
   env picks the snapshot of every other record (production by default); overrides replace one record's data. */
const ENV_PICK = (r, env) => (env === 'draft' ? latestData(r) : env === 'demo' ? dataAt(r, 'demo') || dataAt(r, 'production') : dataAt(r, 'production'));
const campaignView = d => ({ ...d, art: d.image && d.image !== 'none' ? ART[d.image] : null });
const alertView = d => ({ title: d.title, message: d.message, icon: d.icon, priority: +d.priority, dismissible: d.dismissible, ctaLabel: d.ctaLabel, window: d.start ? `Active ${fmtLocal(d.start, false)} – ${fmtLocal(d.end, false)}` : '' });
function appContent({ env = 'production', overrides = {}, audience = 'guest', allAlerts = false, newItem = null } = {}) {
  const pick = r => overrides[r.id] !== undefined ? overrides[r.id] : ENV_PICK(r, env);
  const of = type => ConfigService.peekAll(type).map(r => ({ r, d: pick(r) })).filter(x => x.d);
  const forAudience = d => !d.audience || d.audience === 'seg-all' || (audience === 'guest' ? d.audience !== 'seg-signedin' : d.audience !== 'seg-guests');
  const ordered = type => of(type).filter(x => x.d.enabled !== false).sort((a, b) => a.d.order - b.d.order);
  const camps = of('campaign').filter(x => x.d.enabled !== false && forAudience(x.d));
  const editedCamp = camps.find(x => overrides[x.r.id] !== undefined);
  const camp = editedCamp || camps.find(x => windowStatus(x.d) === 'active') || null;
  const alerts = of('alert').filter(x => x.d.enabled !== false && (allAlerts || overrides[x.r.id] !== undefined || windowStatus(x.d) === 'active'));
  const drawer = ConfigService.peek('drawer'), entry = ConfigService.peek('app-entry');
  /* An item that isn't saved yet has no record, so it joins its list here */
  const add = type => newItem && newItem.type === type ? [{ r: { id: '__new__' }, d: newItem.data }] : [];
  const camp2 = newItem && newItem.type === 'campaign' ? { d: newItem.data } : camp;
  const withNew = (type, list) => [...list, ...add(type).filter(x => x.d.enabled !== false)].sort((a, b) => a.d.order - b.d.order);
  return {
    ...STATIC_CONTENT,
    quickLinks: withNew('quickLink', ordered('quickLink')).map(x => ({ title: x.d.title || 'New quick link', icon: x.d.icon, locked: x.d.requiresSignIn })),
    resources: withNew('featuredCard', ordered('featuredCard')).map(x => ({ title: x.d.title || 'New featured card', subtitle: x.d.subtitle, icon: x.d.icon })),
    campaign: camp2 ? campaignView(camp2.d) : null,
    alerts: [...alerts, ...add('alert')].map(x => alertView(x.d)),
    drawer: overrides.drawer || pick(drawer),
    entry: overrides['app-entry'] || pick(entry)
  };
}
const layoutFor = (audience, env = 'production') => { const r = ConfigService.peek(`home-layout-${audience}`); return ENV_PICK(r, env) || { head: [], modules: [] }; };
const colorsFor = env => ENV_PICK(ConfigService.peek('global-colors'), env);
const effectiveTheme = () => DB.prefs.theme === 'dark' || (DB.prefs.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

/* Preview card: source switch (your edits / demo / production), appearance, optional extras; payload(src) builds the message */
function mountPreviewCard(host, { title, sources, payload, extras = '', onExtras }) {
  const st = { src: sources()[0][0], theme: effectiveTheme() };
  host.innerHTML = `<section class="card pv-card" aria-labelledby="${host.id}-h"><div class="card-head"><h2 id="${host.id}-h">Mobile preview</h2></div><div class="card-body">
    <div class="pv-ctl"></div>${extras ? `<div class="pv-row pv-extras">${extras}</div>` : ''}<div class="pv-host"></div>
    <p class="pv-note">${ic('info', 16)}<span>Drawn with the designs/guest app components and sample content. It is not the live app.</span></p></div></section>`;
  const pv = mountPreview($('.pv-host', host), { title });
  if (onExtras) onExtras($('.pv-extras', host), () => send());
  function controls() {
    const opts = sources();
    if (!opts.some(o => o[0] === st.src)) st.src = opts[0][0];
    const cur = opts.find(o => o[0] === st.src);
    $('.pv-ctl', host).innerHTML = `<div class="pv-row">${opts.length > 1 ? segmented({ id: `${host.id}-src`, label: 'Preview source', options: opts.map(o => [o[0], o[1]]), value: st.src }) : ''}
        ${segmented({ id: `${host.id}-theme`, label: 'Preview appearance', options: [['light', 'Light'], ['dark', 'Dark']], value: st.theme })}</div>
      <p class="pv-what">${cur[2]}</p>`;
    if (opts.length > 1) wireSegmented($(`#${host.id}-src`), v => { st.src = v; controls(); $(`#${host.id}-src [aria-checked="true"]`).focus(); });
    wireSegmented($(`#${host.id}-theme`), v => { st.theme = v; send(); });
    send();
  }
  function send() {
    const p = payload(st.src);
    if (!p) return;
    const f = $('iframe', host); if (f) f.title = `${title}: ${p.label}`;
    pv.render({ theme: st.theme, audience: 'guest', ...p });
  }
  controls();
  return { update: controls, destroy: () => pv.destroy() };
}
/* Standard source options for a record being edited */
function recSources(rec, dirty, isNew) {
  const out = [['working', isNew ? 'New' : dirty ? 'Your edits' : rec && rec.draft ? 'Draft' : 'Current',
    isNew || dirty ? badge('unsaved', 'Unsaved edits – not live') : rec && rec.draft ? badge('draft', 'Saved draft – not live') : badge('production', `Same as production v${rec.production}`)]];
  if (rec && rec.demo && (dirty || rec.draft || rec.demo !== rec.production)) out.push(['demo', 'Demo', badge('demo', `Demo v${rec.demo} – demo environment only`)]);
  if (rec && rec.production && (dirty || rec.draft || rec.demo !== rec.production)) out.push(['production', 'Production', badge('production', `Production v${rec.production} – what patients see`)]);
  return out;
}
