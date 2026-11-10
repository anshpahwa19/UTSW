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
const effectiveTheme = () => 'light';   /* the Admin is light only; each preview card has its own Light/Dark toggle */

/* Preview card: source switch (your edits / demo / production), appearance, optional extras; payload(src) builds the message */
function mountPreviewCard(host, { title, sources, payload, extras = '', onExtras }) {
  const st = { src: sources()[0][0], theme: effectiveTheme() };
  host.innerHTML = `<section class="card pv-card" aria-labelledby="${host.id}-h"><div class="card-head"><h2 id="${host.id}-h">Mobile preview</h2><div class="card-actions pv-theme"></div></div><div class="card-body">
    <div class="pv-top"><div class="pv-ctl"></div>${extras ? `<div class="pv-extras">${extras}</div>` : ''}</div><div class="pv-host"></div>
    <p class="pv-note">${ic('info', 16)}<span>Sample content drawn with the guest app designs. Not the live app.</span></p></div></section>`;
  const pv = mountPreview($('.pv-host', host), { title });
  if (onExtras) onExtras($('.pv-extras', host), () => send());
  function controls() {
    const opts = sources();
    if (!opts.some(o => o[0] === st.src)) st.src = opts[0][0];
    const cur = opts.find(o => o[0] === st.src);
    $('.pv-theme', host).innerHTML = segmented({ id: `${host.id}-theme`, label: 'Preview appearance', options: [['light', 'Light'], ['dark', 'Dark']], value: st.theme });
    $('.pv-ctl', host).innerHTML = `${opts.length > 1 ? `<div class="pv-row">${segmented({ id: `${host.id}-src`, label: 'Preview source', options: opts.map(o => [o[0], o[1]]), value: st.src })}</div>` : ''}
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
  const fit = fitPreview(host);
  return { update: controls, destroy: () => { fit.stop(); pv.destroy(); } };
}
/* Size the phone so the preview card ends level with the editor column beside it, at any width. Never larger
   than the breakpoint's scale, never smaller than a readable minimum. Only the phone scales; the preview column
   keeps its width, so the editor never reflows because of this (no resize loop). Stacked layouts are left alone. */
function fitPreview(aside) {
  const grid = aside.closest('.ed-grid, .hl-grid');
  if (!grid || !window.ResizeObserver) return { stop() {} };
  const left = [...grid.children].find(c => c !== aside && !c.contains(aside));
  const phone = $('.pv-host', aside);
  if (!left || !phone) return { stop() {} };
  /* When the editor is shorter than even the smallest phone, its last card grows to meet the preview */
  const last = () => {
    const t = left.matches('.ed-main, .hl-main') ? left.lastElementChild : left;
    /* Grow the card itself, not a plain wrapper around it, so its border meets the preview's */
    return t && !t.matches('.card') ? (t.querySelector(':scope > .card:last-child') || t) : t;
  };
  const fit = () => {
    if (!grid.isConnected) { ro.disconnect(); return; }
    phone.style.removeProperty('--s'); phone.style.removeProperty('--ph');
    const tail = last(); if (tail) tail.style.removeProperty('min-height');
    if (getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length < 2) return;
    const max = parseFloat(getComputedStyle(phone).getPropertyValue('--s')) || .8;
    const chrome = aside.offsetHeight - 844 * max;
    /* Scale the whole phone (never below a readable size); the editor card grows if it is still shorter */
    const avail = left.offsetHeight - chrome;
    const s = Math.max(Math.min(max, .5), Math.min(max, avail / 844));
    if (s < max - .002) phone.style.setProperty('--s', s.toFixed(3));

    const short = aside.offsetHeight - left.offsetHeight;
    if (short > 1 && tail) tail.style.minHeight = `${tail.offsetHeight + short}px`;
  };
  const ro = new ResizeObserver(() => requestAnimationFrame(fit));
  ro.observe(left); const ctl = $('.pv-ctl', aside); if (ctl) ro.observe(ctl);
  fit();
  return { stop: () => ro.disconnect() };
}
/* Standard source options for a record being edited */
function recSources(rec, dirty, isNew) {
  const out = [['working', isNew ? 'New' : dirty ? 'Your edits' : rec && rec.draft ? 'Draft' : 'Current',
    isNew || dirty ? badge('unsaved', 'Unsaved edits – not live') : rec && rec.draft ? badge('draft', 'Saved draft – not live') : badge('production', `Same as production v${rec.production}`)]];
  if (rec && rec.demo && (dirty || rec.draft || rec.demo !== rec.production)) out.push(['demo', 'Demo', badge('demo', `Demo v${rec.demo} – demo environment only`)]);
  if (rec && rec.production && (dirty || rec.draft || rec.demo !== rec.production)) out.push(['production', 'Production', badge('production', `Production v${rec.production} – what patients see`)]);
  return out;
}
