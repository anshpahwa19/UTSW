/* Mobile preview – runs inside the sandboxed preview iframe (srcdoc, no same-origin), never in the Admin page.
   Markup and classes come from designs/guest/src.html (home renderers R.alerts … R.news, lines 2124–2240; drawer
   lines 2667–2700; sign-in choice lines 1430–1446), fed by the configuration the Admin posts in.
   Every control is inert: the preview shows the configuration, it does not run the app. */
(function () {
  'use strict';
  /* Concept → glyph for the fixed chrome; configurable items post glyph names directly (approved icon list) */
  const ICONS = {
    home: 'home', findCare: 'stethoscope', place: 'location_on', wayfinding: 'directions_walk', signIn: 'login',
    search: 'search', alert: 'warning', expand: 'expand_more', lock: 'lock', refresh: 'refresh', next: 'chevron_right',
    prev: 'chevron_left', go: 'arrow_forward', addCal: 'calendar_add_on', close: 'close', external: 'open_in_new',
    guest: 'explore', nearMe: 'near_me', parking: 'local_parking', indoor: 'map', info: 'info', visits: 'calendar_month', directions: 'directions'
  };
  const APP_ICON = 'data:image/svg+xml;base64,__LOGO_ICON__';
  const LOGO = 'data:image/svg+xml;base64,__LOGO_REVERSED__';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = (key, size = 24, cls = '') => {
    const c = ['ms', size === 24 ? '' : 's' + size, key === 'alert' ? 'f1' : '', cls].filter(Boolean).join(' ');
    return `<span class="${c}" aria-hidden="true">${ICONS[key] || key}</span>`;
  };
  const circle = (key, size = 40, cls = '') => `<span class="dot${size === 48 ? '' : ' d' + size}${cls ? ' ' + cls : ''}" aria-hidden="true">${ico(key, size === 40 ? 20 : size === 56 ? 32 : 24)}</span>`;
  const row = ({ ic, lead, title, sub, ext, cls = '' }) =>
    `<li class="${cls}"><button class="row" type="button">${lead || circle(ic)}<span class="txt"><span class="rt">${esc(title)}</span>${sub ? `<span class="rs">${esc(sub)}</span>` : ''}</span>${ico(ext ? 'external' : 'next', 20, 'chev')}</button></li>`;
  const art = svg => `<svg viewBox="0 0 304 144" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${svg}</svg>`;

  const NB = [[/(\d) (a\.m\.|p\.m\.)/g, '$1 $2'], [/\b(Jan|Feb|Aug|Sept|Oct|Nov|Dec)\. (\d)/g, '$1. $2'], [/UT Southwestern/g, 'UT Southwestern']];
  function nbsp(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const v = NB.reduce((s, [re, to]) => s.replace(re, to), n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  }

  let C = null, M = null;
  const R = {
    alerts() {
      const list = (C.alerts || []).slice().sort((a, b) => a.priority - b.priority).slice(0, 2);
      if (!list.length) return '';
      return `<section class="alerts" aria-label="Emergency alerts"><div class="alert-wrap all">${list.map((al, i) => `<div class="alert ${i ? 'extra' : 'open'}">
        <div class="alert-row"><span class="alert-ico">${ico(al.icon === 'warning' ? 'alert' : al.icon)}</span>
          <div class="alert-txt"><p class="alert-kicker">Alert${list.length > 1 ? `<span class="pri">· Priority ${i + 1} of ${list.length}</span>` : ''}</p><p class="alert-title">${esc(al.title)}</p></div>
          ${i === 0 ? `<button class="alert-tog" type="button" aria-expanded="true" aria-label="Hide alert details">${ico('expand')}</button>` : ''}</div>
        ${i === 0 ? `<div class="alert-body"><div><p>${esc(al.message)}</p>${al.window ? `<p class="alert-meta">${esc(al.window)}</p>` : ''}
          <div class="alert-actions">${al.ctaLabel ? `<button class="alert-btn" type="button">${esc(al.ctaLabel)}</button>` : ''}${al.dismissible ? '<button class="alert-btn" type="button" style="background:transparent;color:#FFFFFF;box-shadow:inset 0 0 0 1.5px #FFFFFF">Dismiss</button>' : ''}</div></div></div>` : ''}
      </div>`).join('')}</div></section>`;
    },
    greeting() {
      const signed = M.audience === 'authenticated';
      return `<section class="greet" aria-labelledby="greet-h">
        <div class="greet-top"><p class="eyebrow">${signed ? 'Welcome back, Jordan' : 'Welcome to UT Southwestern'}</p><span class="upd-chip"><span class="pill">${ico('refresh', 16)}<span class="upd-time">Updated 9:41 a.m.</span></span></span></div>
        <h1 id="greet-h">How can we help today?</h1>
        <p class="sub">${signed ? 'Your visits, messages, and care in one place.' : 'Find a doctor, get directions, and check urgent care wait times – no account needed.'}</p>
      </section>`;
    },
    search() {
      return `<section aria-label="Search">
        <button class="search-field" type="button">${ico('search')}<span>Search doctors, care, and places</span><span class="go" aria-hidden="true">${ico('go', 20)}</span></button>
        <div class="ts-row" role="group" aria-label="Top searches"><span class="ts-k" aria-hidden="true">Top</span>${C.top.map(([t]) => `<button class="chip glass" type="button">${esc(t)}</button>`).join('')}</div>
      </section>`;
    },
    signin() {
      return `<section class="locked" aria-labelledby="locked-h">
        <div class="lk-hd" aria-hidden="true"><span class="sk w1"></span><span class="sk w2"></span><span class="sk w4"></span></div>
        <div class="lk-bd" aria-hidden="true"><span class="sk w3"></span><span class="sk w4"></span></div>
        <div class="locked-body">${circle('lock', 56)}
          <h2 id="locked-h">Already a patient? Sign in to MyChart</h2>
          <p>See your appointments, message your care team, get test results, and pay bills.</p>
          <div class="btns"><button class="btn btn-primary" type="button">Sign in</button><button class="btn btn-secondary" type="button">Create account</button></div>
        </div></section>`;
    },
    tiles() {
      const signed = M.audience === 'authenticated';
      const tile = t => t.locked && !signed
        ? `<button class="qa-tile lockd" type="button" aria-label="${esc(t.title)}. Needs MyChart sign-in">${circle(t.icon, 48)}<span class="qa-txt"><span class="qa-lbl">${esc(t.title)}</span></span><span class="qa-lock">${ico('lock', 16)}</span></button>`
        : `<button class="qa-tile" type="button">${circle(t.icon, 48, 'solid')}<span class="qa-txt"><span class="qa-lbl">${esc(t.title)}</span></span></button>`;
      const list = C.quickLinks || [];
      return `<section aria-labelledby="qa-h"><div class="sec-head"><h2 id="qa-h">Quick links</h2></div>
        ${list.length ? `<div class="qa">${list.map(tile).join('')}</div>` : '<p class="pv-empty">No quick links are on.</p>'}</section>`;
    },
    featured() {
      return `<section aria-labelledby="feat-h">
        <div class="sec-head"><h2 id="feat-h">MedBlog</h2><button class="link" type="button">See all</button></div>
        <div class="car" role="group" aria-roledescription="carousel" aria-label="Latest MedBlog articles">${C.featured.map(f => `
          <button class="feat" type="button"><span class="feat-art">${art(f.art)}</span>
            <span class="feat-body"><span class="kick">${esc(f.kick)}</span><span class="feat-title">${esc(f.title)}</span><span class="feat-meta">${esc(f.meta)}</span></span></button>`).join('')}
        </div>
        <div class="car-ctrl"><span class="car-track" aria-hidden="true"><span class="car-thumb" style="width:25%"></span></span>
          <div class="car-arrows"><button class="icon-btn" type="button" aria-label="Previous article">${ico('prev')}</button><button class="icon-btn" type="button" aria-label="Next article">${ico('next')}</button></div></div>
      </section>`;
    },
    services() {
      const list = C.resources || [];
      return `<section aria-labelledby="svc-h"><div class="sec-head"><h2 id="svc-h">UTSW resources</h2></div>
        ${list.length ? `<ul class="group">${list.map(s => row({ ic: s.icon, title: s.title, sub: s.subtitle, cls: s.highlight ? 'pv-hl' : '' })).join('')}</ul>` : '<p class="pv-empty">No featured cards are on.</p>'}</section>`;
    },
    campaign() {
      const k = C.campaign;
      if (!k) return '';
      return `<section class="camp" aria-labelledby="camp-h">
        ${k.art ? `<div class="camp-img">${art(k.art)}</div>` : ''}
        <div class="camp-top">
          <div><p class="camp-tag"><i></i>${esc(k.tag || k.type)}</p><h2 id="camp-h">${esc(k.title || 'Campaign title')}</h2></div>
          <div class="camp-art" aria-hidden="true"><svg viewBox="0 0 96 96"><g class="rings"><circle cx="48" cy="48" r="47" fill="#336893" opacity=".55"/><circle cx="48" cy="48" r="38" fill="none" stroke="#7BAFD4" stroke-width="1.5" stroke-dasharray="3 5" opacity=".8"/><circle cx="86" cy="22" r="5" fill="#00A9E0"/><circle cx="12" cy="74" r="3" fill="#7BAFD4"/></g></svg>${circle(k.icon || 'vaccines', 56)}</div>
          ${k.description ? `<p>${esc(k.description)}</p>` : ''}
        </div>
        ${k.fact1Label || k.fact2Label ? `<ul class="camp-facts">${[[k.fact1Label, k.fact1Value, 'countdown'], [k.fact2Label, k.fact2Value, 'place']].filter(f => f[0]).map(([kk, v, i]) => `<li>${ico(i === 'countdown' ? 'schedule' : 'location_on', 20)}<span class="k">${esc(kk)}</span><span class="v">${esc(v)}</span></li>`).join('')}</ul>` : ''}
        <div class="camp-cta">${k.ctaLabel ? `<button class="btn btn-light" type="button"><span class="lbl">${esc(k.ctaLabel)}</span>${ico('go', 20)}</button>` : ''}
          <button class="camp-cal" type="button" aria-pressed="false" aria-label="Add to calendar">${ico('addCal', 24)}</button></div>
      </section>`;
    },
    news() {
      return `<section aria-labelledby="ann-h"><div class="sec-head"><h2 id="ann-h">Announcements</h2><button class="link" type="button">See all</button></div>
        <ul class="group">${C.announcements.map(a => row({ lead: `<span class="datebox" aria-hidden="true"><span class="m">${esc(a.m)}</span><span class="d">${esc(a.d)}</span></span>`, title: a.t, sub: a.s })).join('')}</ul></section>`;
    },
    visits() {
      return `<section aria-labelledby="pv-h"><div class="sec-head"><h2 id="pv-h">Your next visits</h2><span class="tag">From MyChart</span></div>
        <ul class="group">${C.visits.map(v => row({ lead: `<span class="datebox" aria-hidden="true"><span class="m">${esc(v.m)}</span><span class="d">${esc(v.d)}</span></span>`, title: `${v.type} · ${v.t}`, sub: `${v.who} · ${v.where}` })).join('')}</ul></section>`;
    },
    near() {
      return `<section aria-labelledby="pn-h"><div class="sec-head"><h2 id="pn-h">Near Frisco</h2><button class="link" type="button">See all</button></div>
        <ul class="group">${C.near.map(n => row({ ic: 'location_on', title: n.t, sub: n.s })).join('')}</ul></section>`;
    }
  };

  /* Other screens */
  const S = {
    drawer() {
      const secs = C.drawer.sections;
      return `<div class="dr-bd pv"></div><aside class="drawer pv" aria-label="More">
        <div class="dr-hd"><div><h2>More</h2><p>UT Southwestern MyCare</p></div><button class="icon-btn ghost" type="button" aria-label="Close menu">${ico('close')}</button></div>
        <div class="dr-body">${secs.map((s, i) => `${s.label ? `<p class="ts-label">${esc(s.label)}</p>` : ''}
          <ul class="group"${i === 0 ? ' style="margin-top:var(--s2)"' : ''}>${s.items.filter(it => it.visible || C.showHidden).map(it => row({ ic: it.icon, title: it.label, sub: it.sub, ext: it.destination && it.destination.type === 'url', cls: it.visible ? '' : 'dr-off' })).join('') || '<li class="pv-empty" style="margin:var(--s3)">No visible items</li>'}</ul>`).join('')}
          <p class="dr-foot">MyCare 5.0 (sample) · Menu items come from the CMS</p></div></aside>`;
    },
    entry() {
      const e = C.entry;
      const choice = `<div class="lg-wrap"><div class="lg-top"><svg class="hero-art" viewBox="0 0 288 288" aria-hidden="true" style="right:-120px;top:20%;width:288px;height:288px"><circle cx="144" cy="144" r="140" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2"/><circle cx="144" cy="144" r="100" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="2"/></svg>
          <img class="logo" alt="UTSW MyCare" src="${LOGO}"><h2>Care that starts here</h2><p>Find doctors, places, and your way around – then sign in for MyChart.</p></div>
        <div class="lg-body"><h3>How do you want to start?</h3>
          <button class="choice primary" type="button"><span class="dot">${ico('signIn')}</span><span class="txt"><b>I’m a patient</b><small>Sign in with MyChart for visits, messages, test results, and bills.</small></span>${ico('next', 24, 'chev')}</button>
          <button class="choice" type="button"><span class="dot">${ico('guest')}</span><span class="txt"><b>Continue as guest</b><small>Find my Care, locations, and directions. No account needed.</small></span>${ico('next', 24, 'chev')}</button>
          <p class="lg-links">New to MyChart? <button class="link" type="button">Create an account</button></p></div></div>`;
      const eula = e.eulaVisible ? `<div class="pv-shade"></div><div class="sheet pv" role="dialog" aria-label="Terms of use"><div class="grab"></div><h2>Before you start</h2><p class="meta">Terms of use, version ${esc(e.eulaVersion)}</p><p>${esc(e.eulaText)}</p><button class="btn btn-primary" type="button">Accept and continue</button></div>` : '';
      if (!e.loginPromptVisible || e.loginPromptType === 'module') {
        return `<div class="pv-head"><h1>Home</h1><p>${e.loginPromptVisible ? 'No sign-in choice screen. Guests see the MyChart sign-in prompt on the home screen.' : 'No sign-in prompt at launch. People go straight to the home screen.'}</p></div>
          ${e.loginPromptVisible ? `<div class="mods" style="padding-top:var(--s6)"><div class="mod">${R.signin()}</div></div>` : ''}${eula}`;
      }
      return choice + eula;
    },
    push() {
      const p = C.push;
      const inbox = p.delivery === 'inbox';
      if (inbox) return `<div class="pv-head"><h1>Inbox</h1><p>App notifications</p></div><ul class="group" style="margin-top:var(--s4)">${row({ ic: 'inbox', title: p.title || 'Notification title', sub: `${p.body || ''}`.slice(0, 90) })}${row({ ic: 'inbox', title: 'New visitor hours start Nov. 1', sub: 'Two visitors at a time, 8 a.m. to 8 p.m.' })}</ul>`;
      return `<div class="lock"><p class="lock-time">9:41</p><p class="lock-date">${esc(p.when || 'Thursday, Oct. 30')}</p>
        <div class="push"><div class="push-top"><img src="${APP_ICON}" alt=""><span>MyCare</span><span class="when">now</span></div>
          <p class="push-t">${esc(p.title || 'Notification title')}</p><p class="push-b">${esc(p.body || '')}</p>
          ${p.art ? `<div class="push-img">${art(p.art)}</div>` : ''}</div>
        <p class="push-note">${p.delivery === 'push+inbox' ? 'Also saved in the app’s Inbox' : 'Push only'}</p></div>`;
    },
    location() {
      const l = C.location;
      return `<div class="pv-head"><h1>Locations</h1><p>Arriving at ${esc(l.name)}</p></div>
        <article class="loc-card"><div class="loc-map" aria-hidden="true"><i></i></div><div class="loc-body"><h2>${esc(l.name)}</h2>
          <p class="loc-row">${ico('location_on', 20)}<span>${esc(l.type)}</span></p>
          ${l.message ? `<p class="loc-tip">${ico('info', 20)}<span>${esc(l.message)}</span></p>` : ''}
          ${l.parking ? `<p class="loc-row">${ico('local_parking', 20)}<span>${esc(l.parking)}</span></p>` : ''}
          ${l.indoor ? `<button class="btn btn-primary" type="button">${ico('directions_walk', 20)}<span class="lbl">Indoor directions</span></button>` : ''}
        </div></article>`;
    }
  };

  const TABS = [['Home', 'home'], ['Find my Care', 'findCare'], ['Locations', 'place'], ['Wayfinding', 'wayfinding'], ['MyChart', 'signIn']];
  const phone = document.getElementById('phone');
  function tabs(active) {
    phone.querySelector('.tabbar').innerHTML = `<span class="tab-ind" aria-hidden="true"></span>` + TABS.map((t, i) =>
      `<button class="tab" type="button" aria-selected="${i === active}">${ico(t[1])}<span class="tl">${t[0].replace('Find my ', 'Find my ')}</span></button>`).join('');
    const bar = phone.querySelector('.tabbar'), t = bar.querySelectorAll('.tab')[active], ind = bar.querySelector('.tab-ind');
    bar.classList.toggle('wrap', bar.scrollWidth > bar.clientWidth + 1);
    ind.style.width = `${t.offsetWidth}px`; ind.style.transform = `translateX(${t.offsetLeft}px)`;
  }
  /* Global colors: only the approved set maps onto app tokens; dark mode keeps its own page colors */
  function applyColors(c) {
    const st = phone.style;
    ['--brand', '--ctl', '--blue', '--blue-80', '--pms542', '--bg'].forEach(k => st.removeProperty(k));
    if (!c) return;
    st.setProperty('--brand', c.primary);
    if (!phone.classList.contains('dark')) { st.setProperty('--ctl', c.primary); st.setProperty('--blue', c.primary); st.setProperty('--bg', c.background); }
    st.setProperty('--blue-80', c.secondary); st.setProperty('--pms542', c.tertiary);
  }

  function render(msg) {
    C = msg.content; M = msg;
    phone.classList.toggle('dark', msg.theme === 'dark');
    phone.classList.toggle('rm', matchMedia('(prefers-reduced-motion: reduce)').matches);
    applyColors(msg.colors);
    const screen = msg.screen || 'home';
    document.getElementById('scr-home').hidden = screen !== 'home' && screen !== 'drawer';
    document.getElementById('scr-alt').hidden = screen === 'home' || screen === 'drawer';
    document.getElementById('overlay').innerHTML = screen === 'drawer' ? S.drawer() : '';
    phone.classList.toggle('bar-light', ['home', 'drawer', 'entry', 'push', 'location'].includes(screen));
    phone.querySelector('.tabbar').hidden = screen === 'entry' || screen === 'push';
    document.getElementById('pv-signin').hidden = msg.audience === 'authenticated';
    if (screen === 'home' || screen === 'drawer') {
      const wrap = (id, i) => { const html = R[id] ? R[id]() : ''; return html ? `<div class="mod" data-m="${id}" style="--i:${i};animation:none">${html}</div>` : ''; };
      document.getElementById('hero-mods').innerHTML = msg.layout.head.map(wrap).join('');
      document.getElementById('modules').innerHTML = msg.layout.modules.filter(m => m.on).map((m, i) => wrap(m.id, i)).join('') || `<p class="pv-empty">No modules are visible on this layout.</p>`;
      tabs(0);
      if (msg.focus) { const el = phone.querySelector(`[data-m="${msg.focus}"]`); const sc = document.getElementById('scroller'); sc.scrollTop = 0; if (el) sc.scrollTop = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 120); }
      else document.getElementById('scroller').scrollTop = 0;
    } else {
      document.getElementById('alt').innerHTML = S[screen]();
      if (screen === 'location') tabs(2);
    }
    const sc = screen === 'home' || screen === 'drawer' ? document.getElementById('scroller') : document.getElementById('alt');
    sc.setAttribute('aria-label', `Mobile preview: ${msg.label}. Scroll with the arrow keys.`);
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
