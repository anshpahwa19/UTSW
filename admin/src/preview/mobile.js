/* Mobile preview – runs inside the sandboxed preview iframe (srcdoc, no same-origin), never in the Admin page.
   Markup follows the UTSW MyCare Guest Flow 2 design (stakeholder update): home renderers M.tiles … M.announcements,
   alert banners, the Find Care hero, the floating tab bar, the menu, onboarding and the welcome (sign-in choice) screen.
   It is fed by the configuration the Admin posts in. Every control is inert: the preview shows the configuration,
   it does not run the app. The app UI is light only. */
(function () {
  'use strict';
  /* Glyphs the fixed chrome uses (Material Symbols Rounded). Configurable items post glyph names from the approved list. */
  const ICONS = {
    home: 'home', findCare: 'stethoscope', search: 'search', wayfinding: 'directions_walk', favorites: 'favorite', signIn: 'login',
    menu: 'menu', close: 'close', back: 'arrow_back', expand: 'expand_more', next: 'chevron_right', external: 'open_in_new', go: 'arrow_forward',
    trending: 'trending_up', emergency: 'warning', advisory: 'error', time: 'schedule', place: 'location_on', info: 'info', parking: 'local_parking',
    indoor: 'directions_walk', guest: 'explore', checked: 'check_circle', lock: 'lock', inbox: 'inbox', visits: 'calendar_month', near: 'near_me',
    medicines: 'medication', joints: 'directions_run', heart: 'favorite', prevention: 'vaccines', cancer: 'health_and_safety', pregnancy: 'pregnant_woman',
    article: 'article', newspaper: 'newspaper'
  };
  const APP_ICON = 'data:image/svg+xml;base64,__LOGO_ICON__';
  const LOGO = 'data:image/svg+xml;base64,__LOGO_REVERSED__';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = (key, size = 24, cls = '') => `<span class="${['ms', size === 24 ? '' : 's' + size, cls].filter(Boolean).join(' ')}" aria-hidden="true">${ICONS[key] || key}</span>`;
  const well = (g, size = 40) => `<span class="well${size === 48 ? ' well-48' : ''}" aria-hidden="true">${ico(g)}</span>`;
  const art = svg => `<svg viewBox="0 0 304 144" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${svg}</svg>`;
  const row = ({ g, lead, title, sub, ext, cls = '', end }) => `<button class="row${cls ? ' ' + cls : ''}" type="button">${lead || well(g)}<span class="rt"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</span>${end || ico(ext ? 'external' : 'next', 20)}</button>`;
  /* MedBlog topic look: [glyph, art class] – from the design */
  const TOPIC = { 'Medicines': ['medicines', 't-blue'], 'Bones and joints': ['joints', 't-orange'], 'Heart health': ['heart', 't-clay'], 'Prevention': ['prevention', 't-green'], 'Cancer': ['cancer', 't-purple'], 'Pregnancy': ['pregnancy', 't-sky'] };

  const NB = [[/(\d) (a\.m\.|p\.m\.|mi\b)/g, '$1 $2'], [/\b(Jan|Feb|Aug|Sept|Oct|Nov|Dec)\. (\d)/g, '$1. $2'], [/UT Southwestern/g, 'UT Southwestern']];
  function nbsp(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const v = NB.reduce((s, [re, to]) => s.replace(re, to), n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  }

  let C = null, MSG = null;
  const guest = () => MSG.audience !== 'authenticated';

  /* ---------- Pinned: alerts, then the Find Care hero ---------- */
  function alertCard(a, open, stacked) {
    return `<article class="alert ${a.level === 'advisory' ? 'advisory' : 'emergency'}${open ? ' open' : ''}${stacked ? ' stacked' : ''}">
      <h2><button class="alert-toggle" type="button" aria-expanded="${open}"><span class="sev-ic">${ico(a.level === 'advisory' ? 'advisory' : 'emergency', 24, 'f')}</span>
        <span class="alert-txt"><span class="alert-meta"><b>${a.level === 'advisory' ? 'Advisory' : 'Emergency'}</b> · ${esc(a.posted)}</span><span class="alert-title">${esc(a.title)}</span></span>${ico('expand', 20, 'chev')}</button></h2>
      ${open ? `<div class="alert-body"><p>${esc(a.message)}</p>${a.window ? `<p>${esc(a.window)}</p>` : ''}
        <div class="row-btns"><button class="btn btn-primary btn-sm" type="button">Read full alert</button>${a.dismissible ? '<button class="btn btn-ghost btn-sm" type="button">Dismiss</button>' : ''}</div></div>` : ''}
    </article>`;
  }
  function alerts() {
    const list = (C.alerts || []).slice();
    if (!list.length) return '';
    const [first, ...rest] = list;
    return `<section class="alerts" aria-label="Active alerts">${alertCard(first, true, rest.length > 0)}
      ${rest.length ? `<button class="more-alerts" type="button" aria-expanded="false"><span>${rest.length} more alert${rest.length > 1 ? 's' : ''}</span>${ico('expand', 20)}</button>` : ''}</section>`;
  }
  function hero() {
    return `<section class="hero" aria-labelledby="h-hero"><span class="aurora" aria-hidden="true"><i></i></span>
      <div class="hero-copy"><h1 class="vh" id="h-hero">UTSW MyCare home</h1>
        <p class="fc-kick">${ico('findCare', 20)}Find Care</p><p class="sub">Search UTSW MyCare for doctors, locations, and more.</p></div>
      <button class="search-entry" type="button">${ico('search')}<span>Doctors, locations, and more</span></button>
      <div class="top-s"><span class="eyebrow" id="top-h">Top searches</span><div class="chips" role="group" aria-labelledby="top-h">${(C.top || []).slice(0, 4).map(t => `<button class="chip on-blue-chip" type="button">${ico('trending', 16)}${esc(Array.isArray(t) ? t[0] : t)}</button>`).join('')}</div></div>
    </section>`;
  }

  /* ---------- Modules, in the order the Admin sets ---------- */
  const M = {
    tiles() {
      const list = (C.quickLinks || []).slice(0, 4);
      return `<div class="mod-head"><h2 class="sec-h" id="h-tiles">Quick links</h2></div>
        ${list.length ? `<div class="tiles">${list.map(t => `<button class="tile${t.highlight ? ' pv-hl' : ''}" type="button">${well(t.icon)}<span>${esc(t.title)}</span></button>`).join('')}</div>` : '<p class="pv-empty">No quick links are on.</p>'}`;
    },
    mychart() {
      if (!guest()) return '';
      return `<div class="mychart"><span class="mc-glow" aria-hidden="true"></span>
        <div class="mc-txt"><span class="eyebrow">Already a patient?</span><h2 id="h-mychart">Sign in for more</h2></div>
        <p>Sign in to message your doctor, get your test results, manage your visits, and manage billing.</p>
        <div class="mc-btns"><button class="mc-b mc-solid" type="button">${ico('signIn', 20)}<span>Sign in</span></button><button class="mc-b mc-line" type="button">Create an account</button></div></div>`;
    },
    featured() {
      return `<div class="mod-head"><h2 class="sec-h" id="h-featured">MedBlog</h2><button class="btn btn-ghost btn-sm" type="button">See all</button></div>
        <ul class="h-scroll mb-row" aria-labelledby="h-featured">${(C.blog || []).map(b => { const [g, t] = TOPIC[b.cat] || ['article', 't-blue'];
          return `<li class="mb-item"><button class="card mb-card" type="button"><span class="mb-art ${t}" aria-hidden="true"><i class="r1"></i><i class="r2"></i><span class="mb-ic">${ico(g, 24, 'f')}</span><span class="mb-read">${ico('time', 16)}${esc(b.read)}</span></span>
            <span class="mb-txt"><span class="mb-cat">${esc(b.cat)}</span><span class="mb-t">${esc(b.t)}</span><span class="mb-d">${esc(b.d)}</span></span></button></li>`; }).join('')}</ul>`;
    },
    campaign() {
      const k = C.campaign;
      if (!k) return '';
      return `<div class="campaign"><span class="cp-glow" aria-hidden="true"></span><span class="cp-glass" aria-hidden="true"></span>
        <span class="cp-badge" aria-hidden="true"><i class="cp-ring"></i><span class="cp-core">${ico(k.icon || 'vaccines')}</span></span>
        ${k.tag ? `<span class="eyebrow">${esc(k.tag)}</span>` : ''}<h2 id="h-campaign">${esc(k.title || 'Campaign title')}</h2>
        ${k.description ? `<p>${esc(k.description)}</p>` : ''}
        ${k.ctaLabel ? `<button class="btn btn-white cp-cta" type="button"><span>${esc(k.ctaLabel)}</span>${ico('go', 20)}</button>` : ''}</div>`;
    },
    services() {
      const list = C.resources || [];
      return `<div class="mod-head"><h2 class="sec-h" id="h-services">Services and resources</h2></div>
        ${list.length ? `<div class="h-scroll">${list.map((s, i) => `<button class="card svc${s.highlight ? ' pv-hl' : ''}" type="button">
          <span class="svc-art a${i % 3}" aria-hidden="true"><i class="s1"></i><i class="s2"></i>${ico(s.icon, 40)}</span>
          <span class="svc-body">${s.category ? `<span class="svc-cat">${esc(s.category)}</span>` : ''}<b>${esc(s.title)}</b>${s.description ? `<span>${esc(s.description)}</span>` : ''}</span></button>`).join('')}</div>` : '<p class="pv-empty">No services or resources are on.</p>'}`;
    },
    news() {
      return `<div class="mod-head"><h2 class="sec-h" id="h-news">Announcements</h2></div>
        <div class="card list ann">${(C.announcements || []).map(a => row({ lead: `<span class="ann-date">${esc(a.d)}</span>`, title: a.t, sub: a.s, end: a.isNew ? '<span class="new-pill">New</span>' : ico('next', 20) })).join('')}</div>`;
    },
    saved() {
      const list = C.saved || [];
      return `<div class="mod-head"><h2 class="sec-h" id="h-saved">Your saved providers</h2><button class="btn btn-ghost btn-sm" type="button">See all</button></div>
        <div class="card list">${list.map(p => row({ lead: `<span class="avatar ${p.a}" aria-hidden="true">${esc(p.i)}</span>`, title: p.n, sub: p.s })).join('')}</div>
        <p class="fine">Shows only on devices with saved providers.</p>`;
    },
    visits() {
      return `<div class="mod-head"><h2 class="sec-h" id="h-visits">Your next visits</h2><span class="eyebrow">From MyChart</span></div>
        <div class="card list ann">${(C.visits || []).map(v => row({ lead: `<span class="ann-date">${esc(v.m)} ${esc(v.d)}</span>`, title: `${v.type} · ${v.t}`, sub: `${v.who} · ${v.where}` })).join('')}</div>`;
    },
    near() {
      return `<div class="mod-head"><h2 class="sec-h" id="h-near">Near you</h2><button class="btn btn-ghost btn-sm" type="button">See all</button></div>
        <div class="card list">${(C.near || []).map(n => row({ g: 'place', title: n.t, sub: n.s })).join('')}</div>`;
    }
  };

  function home() {
    const mods = MSG.layout.modules.filter(m => m.on).map(m => ({ id: m.id, html: M[m.id] ? M[m.id]() : '' })).filter(m => m.html);
    return `<div class="v-inner"><div class="top" data-m="alerts">${alerts()}${hero()}</div>
      ${mods.map(m => `<section class="mod" data-m="${m.id}" aria-labelledby="h-${m.id}">${m.html}</section>`).join('') || '<div class="mod"><p class="pv-empty">No modules are visible on this layout.</p></div>'}</div>`;
  }

  /* ---------- Other screens ---------- */
  function menu() {
    const secs = C.drawer.sections;
    return `<div class="drawer-layer"><div class="scrim"></div><aside class="drawer" aria-label="Menu">
      <div class="drawer-head"><h2>Menu</h2><button class="icon-btn" type="button" aria-label="Close menu">${ico('close')}</button></div>
      <div class="drawer-body"><div class="res-body">${secs.map(s => {
        const items = s.items.filter(it => it.visible || C.showHidden);
        if (s.style === 'chips') return `<section class="grp">${s.label ? `<h2 class="lbl-h">${esc(s.label)}</h2>` : ''}<div class="chips">${items.map(it => `<button class="chip${it.visible ? '' : ' off'}" type="button"${it.visible ? '' : ' style="opacity:.45"'}>${esc(it.label)}</button>`).join('') || '<p class="fine">No visible items</p>'}</div></section>`;
        return `<section class="grp">${s.label ? `<h2 class="lbl-h">${esc(s.label)}</h2>` : ''}<div class="card list">${items.map(it => row({ g: it.icon, title: it.label, sub: it.sub, ext: it.destination && it.destination.type === 'url', cls: it.visible ? '' : 'off' })).join('') || '<p class="fine" style="padding:var(--sp-12) var(--sp-16)">No visible items</p>'}</div></section>`;
      }).join('')}
      <p class="fine">UTSW MyCare version 2.0 (sample) · Menu items come from the CMS</p></div></div></aside></div>`;
  }
  function onboarding() {
    return `<div class="ob"><div class="ob-stage" aria-hidden="true"></div>
      <div class="ob-bar"><img class="logo" alt="UTSW MyCare" src="${LOGO}"><button class="ob-skip" type="button">Skip</button></div>
      <div class="ob-art"><div class="ob-scene" aria-hidden="true">
        <div class="sc sc-pill" style="left:24px;top:8px;width:248px">${ico('search', 20)}<span>Knee pain doctor</span></div>
        <div class="sc sc-card" style="left:12px;top:72px;width:272px;padding:16px;display:flex;flex-direction:column;gap:12px">
          <span style="display:flex;gap:12px;align-items:center"><span class="avatar a1" style="width:56px;height:56px;font-size:18px">AM</span><span style="display:flex;flex-direction:column;gap:4px"><b style="color:var(--c-blue)">Avery Morgan, M.D.</b><span style="font-size:14px;line-height:20px;color:var(--c-text-2)">Orthopaedic Surgery</span></span></span>
          <span class="sc-tag">${ico('checked', 16, 'f')}Accepting new patients</span><span class="sc-line" style="width:92%"></span><span class="sc-line" style="width:64%"></span></div>
        <div class="sc sc-card" style="left:36px;top:236px;width:224px;padding:12px;display:flex;gap:12px;align-items:center;opacity:.9"><span class="avatar a2">RS</span><span style="display:flex;flex-direction:column;gap:4px;min-width:0"><b style="font-size:14px;line-height:20px;color:var(--c-blue)">Rafael Santos, M.D.</b><span class="sc-line" style="width:96px"></span></span></div>
        <div class="sc sc-heart" style="left:236px;top:52px">${ico('favorites', 24, 'f')}</div></div></div>
      <div class="ob-copy"><h2>Find the right doctor</h2><p>Search by name, specialty, or condition, and read full profiles to choose the provider who fits your care.</p></div>
      <div class="ob-foot"><div class="ob-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div><button class="btn btn-primary" type="button"><span>Next</span>${ico('go', 20)}</button></div></div>`;
  }
  function welcome() {
    return `<div class="ob ob-welcome"><div class="ob-stage" aria-hidden="true"></div>
      <div class="ob-bar" aria-hidden="true"></div>
      <div class="ob-wel-art" aria-hidden="true"><span class="ob-wel-ring r2"></span><span class="ob-wel-ring"></span><span class="ob-wel-icon"><img src="${APP_ICON}" alt=""></span></div>
      <div class="ob-wel-body"><h2>Welcome to UTSW MyCare</h2><p>Sign in to MyChart for your health record, or continue as a guest to find care.</p>
        <div class="ob-choices">
          <button class="ob-choice primary" type="button"><span class="ob-ic">${ico('signIn')}</span><span class="rt"><b>Sign in as a patient</b><span>Messages, test results, visits, and bills</span></span>${ico('next')}</button>
          <button class="ob-choice secondary" type="button"><span class="ob-ic">${ico('guest')}</span><span class="rt"><b>Continue as guest</b><span>Find doctors, locations, and directions</span></span>${ico('next')}</button>
        </div>
        <button class="ob-wel-link" type="button">New to MyChart? <u>Create an account</u></button></div></div>`;
  }
  function entry() {
    const e = C.entry;
    const eula = e.eulaVisible ? `<div class="pv-shade"></div><div class="sheet" role="dialog" aria-label="Terms of use"><div class="grab"></div><h2>Before you start</h2><p class="meta">Terms of use, version ${esc(e.eulaVersion)}</p><p>${esc(e.eulaText)}</p><button class="btn btn-primary" type="button">Accept and continue</button></div>` : '';
    if (C.entryView === 'onboarding' && e.onboardingVisible) return { overlay: onboarding() + eula };
    if (e.loginPromptVisible && e.loginPromptType === 'choice') return { overlay: welcome() + eula };
    return { home: true, overlay: eula };
  }
  function push() {
    const p = C.push;
    if (p.delivery === 'inbox') return { title: 'Inbox', view: `<div class="res-body"><div class="card list">${row({ g: 'inbox', title: p.title || 'Notification title', sub: `${p.body || ''}`.slice(0, 90), end: '<span class="new-pill">New</span>' })}${row({ g: 'inbox', title: 'Saturday hours at Lakeview Primary Care', sub: 'Open 8 a.m. to noon starting Oct. 17.' })}</div></div>` };
    return { overlay: `<div class="lock"><p class="lock-time">9:41</p><p class="lock-date">${esc(p.when || 'Thursday, Oct. 30')}</p>
      <div class="push"><div class="push-top"><img src="${APP_ICON}" alt=""><span>UTSW MyCare</span><span class="when">now</span></div>
        <p class="push-t">${esc(p.title || 'Notification title')}</p><p class="push-b">${esc(p.body || '')}</p>${p.art ? `<div class="push-img">${art(p.art)}</div>` : ''}</div>
      <p class="push-note">${p.delivery === 'push+inbox' ? 'Also saved in the app’s Inbox' : 'Push only'}</p></div>`, dark: true };
  }
  function location() {
    const l = C.location;
    return { title: 'Locations', tab: -1, view: `<div class="res-body"><article class="card loc-card"><div class="loc-map" aria-hidden="true"><i></i></div><div class="loc-body"><h2>${esc(l.name)}</h2>
      <p class="loc-row">${ico('place', 20)}<span>${esc(l.type)}</span></p>
      ${l.message ? `<p class="loc-tip">${ico('info', 20)}<span>${esc(l.message)}</span></p>` : ''}
      ${l.parking ? `<p class="loc-row">${ico('parking', 20)}<span>${esc(l.parking)}</span></p>` : ''}
      ${l.indoor ? `<button class="btn btn-primary" type="button">${ico('indoor', 20)}<span>Indoor directions</span></button>` : ''}</div></article></div>` };
  }

  /* ---------- Chrome ---------- */
  const TABS = [['Home', 'home'], ['Find Care', 'findCare'], ['Search', 'search'], ['Wayfinding', 'wayfinding'], ['Favorites', 'favorites']];
  const phone = document.getElementById('phone');
  function appbar(title) {
    const menuBtn = `<button class="icon-btn ab-menu" type="button" aria-label="Menu, 2 new in Inbox">${ico('menu')}<i class="ab-dot" aria-hidden="true"></i></button>`;
    const bar = document.getElementById('appbar');
    bar.className = `appbar${title ? '' : ' home'}`;
    bar.innerHTML = title ? `<h1 class="ttl">${esc(title)}</h1>${menuBtn}`
      : `<img class="logo" alt="UTSW MyCare" src="${LOGO}"><span class="sp"></span>${guest() ? `<button class="ab-sign" type="button">${ico('signIn', 20)}<span>Sign in</span></button>` : ''}${menuBtn}`;
  }
  function tabs(active) {
    document.getElementById('tabbar').innerHTML = TABS.map(([l, g], i) => `<button class="tab" type="button"${i === active ? ' aria-current="page"' : ''}><span class="pill">${ico(g)}</span><span>${l}</span></button>`).join('');
  }
  /* Global colors: only the approved set maps onto app tokens */
  function applyColors(c) {
    const st = phone.style;
    ['--c-blue', '--c-mid-blue', '--c-muted-blue', '--c-bg'].forEach(k => st.removeProperty(k));
    if (!c) return;
    st.setProperty('--c-blue', c.primary); st.setProperty('--c-mid-blue', c.secondary); st.setProperty('--c-muted-blue', c.tertiary); st.setProperty('--c-bg', c.background);
  }

  function render(msg) {
    C = msg.content; MSG = msg;
    applyColors(msg.colors);
    const screen = msg.screen || 'home';
    const view = document.getElementById('view'), overlay = document.getElementById('overlay');
    let out = { home: true };
    if (screen === 'drawer') out = { home: true, overlay: menu() };
    else if (screen === 'entry') out = entry();
    else if (screen === 'push') out = push();
    else if (screen === 'location') out = location();
    phone.classList.toggle('st-dark', !!out.dark);
    appbar(out.home ? '' : out.title || '');
    view.innerHTML = out.home ? home() : out.view || '';
    overlay.innerHTML = out.overlay || '';
    tabs(out.home ? 0 : out.tab != null ? out.tab : -1);
    view.scrollTop = 0;
    if (out.home && msg.focus) { const el = view.querySelector(`[data-m="${msg.focus}"]`); if (el) view.scrollTop = Math.max(0, el.offsetTop - 96); }
    view.setAttribute('aria-label', `Mobile preview: ${msg.label}. Scroll with the arrow keys.`);
    nbsp(phone);
    phone.querySelectorAll('button').forEach(b => { b.tabIndex = -1; });
  }

  window.addEventListener('message', e => {
    if (e.source !== window.parent || !e.data || e.data.type !== 'mycare-preview') return;
    render(e.data);
    window.parent.postMessage({ type: 'mycare-preview-rendered' }, '*');
  });
  const markIcons = () => document.documentElement.classList.add('ms-ready');
  if (document.fonts && document.fonts.load) {
    document.fonts.load('24px "Material Symbols Rounded"', 'home').then(f => { if (f.length) markIcons(); }).catch(() => {});
    setTimeout(markIcons, 3000);
  } else markIcons();
  window.parent.postMessage({ type: 'mycare-preview-ready' }, '*');
})();
