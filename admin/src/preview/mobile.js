/* Mobile preview – runs inside the sandboxed preview iframe (srcdoc, no same-origin), never in the Admin page.
   Markup is adapted from the home renderers in designs/guest/src.html (R.alerts … R.news, lines 2124–2240):
   same classes and structure, fed by the configuration the Admin posts in instead of the prototype's own state.
   Every control is inert: the preview shows the layout, it does not run the app. */
(function () {
  'use strict';
  /* Concept → glyph, the subset of designs/guest ICON_MAP used on the home screen */
  const ICONS = {
    home: 'home', findCare: 'stethoscope', place: 'location_on', wayfinding: 'directions_walk', signIn: 'login',
    search: 'search', alert: 'warning', expand: 'expand_more', messages: 'chat', results: 'lab_profile',
    visits: 'calendar_month', bill: 'receipt_long', lock: 'lock', urgent: 'acute', video: 'videocam',
    vaccine: 'vaccines', rank: 'workspace_premium', aid: 'volunteer_activism', countdown: 'schedule',
    addCal: 'calendar_add_on', refresh: 'refresh', next: 'chevron_right', prev: 'chevron_left', go: 'arrow_forward', menu: 'menu'
  };
  const FILLED = { alert: 1 };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = (key, size = 24, cls = '') => {
    const c = ['ms', size === 24 ? '' : 's' + size, FILLED[key] ? 'f1' : '', cls].filter(Boolean).join(' ');
    return `<span class="${c}" aria-hidden="true">${ICONS[key] || key}</span>`;
  };
  const circle = (key, size = 40, cls = '') => `<span class="dot${size === 48 ? '' : ' d' + size}${cls ? ' ' + cls : ''}" aria-hidden="true">${ico(key, size === 40 ? 20 : size === 56 ? 32 : 24)}</span>`;
  const row = ({ ic, lead, title, sub }) =>
    `<li><button class="row" type="button">${lead || circle(ic)}<span class="txt"><span class="rt">${esc(title)}</span>${sub ? `<span class="rs">${esc(sub)}</span>` : ''}</span>${ico('next', 20, 'chev')}</button></li>`;

  /* Keep times, abbreviated dates and "UT Southwestern" from breaking across lines (designs/guest nbsp) */
  const NB = [[/(\d) (a\.m\.|p\.m\.)/g, '$1 $2'], [/\b(Jan|Feb|Aug|Sept|Oct|Nov|Dec)\. (\d)/g, '$1. $2'], [/UT Southwestern/g, 'UT Southwestern']];
  function nbsp(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const v = NB.reduce((s, [re, to]) => s.replace(re, to), n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  }

  let C = null; /* content posted by the Admin (sample content seeded from designs/guest) */
  let showAlert = false;

  const R = {
    alerts() {
      if (!showAlert || !C.alerts.length) return '';
      const al = C.alerts[0];
      return `<section class="alerts" aria-label="Emergency alerts"><div class="alert-wrap"><div class="alert">
        <div class="alert-row"><span class="alert-ico">${ico('alert')}</span>
          <div class="alert-txt"><p class="alert-kicker">Alert</p><p class="alert-title">${esc(al.title)}</p></div>
          <button class="alert-tog" type="button" aria-expanded="false" aria-label="Show alert details">${ico('expand')}</button></div>
        <div class="alert-body"><div><p>${esc(al.summary)}</p></div></div>
      </div></div></section>`;
    },
    greeting() {
      return `<section class="greet" aria-labelledby="greet-h">
        <div class="greet-top"><p class="eyebrow">Welcome to UT Southwestern</p><span class="upd-chip"><span class="pill">${ico('refresh', 16)}<span class="upd-time">Updated 9:41 a.m.</span></span></span></div>
        <h1 id="greet-h">How can we help today?</h1>
        <p class="sub">Find a doctor, get directions, and check urgent care wait times – no account needed.</p>
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
        <div class="locked-body">
          ${circle('lock', 56)}
          <h2 id="locked-h">Already a patient? Sign in to MyChart</h2>
          <p>See your appointments, message your care team, get test results, and pay bills.</p>
          <div class="btns"><button class="btn btn-primary" type="button">Sign in</button><button class="btn btn-secondary" type="button">Create account</button></div>
        </div>
      </section>`;
    },
    tiles() {
      const open = t => `<button class="qa-tile" type="button">${circle(t.ic, 48, 'solid')}<span class="qa-txt"><span class="qa-lbl">${esc(t.lbl)}</span></span></button>`;
      const locked = t => `<button class="qa-tile lockd" type="button" aria-label="${esc(t.lbl)}. Needs MyChart sign-in">${circle(t.ic, 48)}<span class="qa-txt"><span class="qa-lbl">${esc(t.lbl)}</span></span><span class="qa-lock">${ico('lock', 16)}</span></button>`;
      return `<section aria-labelledby="qa-h">
        <div class="sec-head"><h2 id="qa-h">Quick links</h2></div>
        <div class="qa">${[...C.locked.map(locked), ...C.tiles.map(open)].join('')}</div>
      </section>`;
    },
    featured() {
      return `<section aria-labelledby="feat-h">
        <div class="sec-head"><h2 id="feat-h">MedBlog</h2><button class="link" type="button">See all</button></div>
        <div class="car" role="group" aria-roledescription="carousel" aria-label="Latest MedBlog articles">${C.featured.map(f => `
          <button class="feat" type="button">
            <span class="feat-art"><svg viewBox="0 0 304 144" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${f.art}</svg></span>
            <span class="feat-body"><span class="kick">${esc(f.kick)}</span><span class="feat-title">${esc(f.title)}</span><span class="feat-meta">${esc(f.meta)}</span></span>
          </button>`).join('')}
        </div>
        <div class="car-ctrl">
          <span class="car-track" aria-hidden="true"><span class="car-thumb" style="width:25%"></span></span>
          <div class="car-arrows"><button class="icon-btn" type="button" aria-label="Previous article">${ico('prev')}</button><button class="icon-btn" type="button" aria-label="Next article">${ico('next')}</button></div>
        </div>
      </section>`;
    },
    services() {
      return `<section aria-labelledby="svc-h">
        <div class="sec-head"><h2 id="svc-h">UTSW resources</h2></div>
        <ul class="group">${C.resources.map(s => row({ ic: s.ic, title: s.t, sub: s.s })).join('')}</ul>
      </section>`;
    },
    campaign() {
      const k = C.campaign;
      return `<section class="camp" aria-labelledby="camp-h">
        <div class="camp-top">
          <div><p class="camp-tag"><i></i>${esc(k.tag)}</p><h2 id="camp-h">${esc(k.title)}</h2></div>
          <div class="camp-art" aria-hidden="true"><svg viewBox="0 0 96 96"><g class="rings"><circle cx="48" cy="48" r="47" fill="#336893" opacity=".55"/><circle cx="48" cy="48" r="38" fill="none" stroke="#7BAFD4" stroke-width="1.5" stroke-dasharray="3 5" opacity=".8"/><circle cx="86" cy="22" r="5" fill="#00A9E0"/><circle cx="12" cy="74" r="3" fill="#7BAFD4"/></g></svg>${circle(k.ic, 56)}</div>
          <p>${esc(k.text)}</p>
        </div>
        <ul class="camp-facts">${k.facts.map(([ic, kk, v]) => `<li>${ico(ic, 20)}<span class="k">${esc(kk)}</span><span class="v">${esc(v)}</span></li>`).join('')}</ul>
        <div class="camp-cta">
          <button class="btn btn-light" type="button"><span class="lbl">${esc(k.cta)}</span>${ico('go', 20)}</button>
          <button class="camp-cal" type="button" aria-pressed="false" aria-label="Add to calendar">${ico('addCal', 24)}</button>
        </div>
      </section>`;
    },
    news() {
      return `<section aria-labelledby="ann-h">
        <div class="sec-head"><h2 id="ann-h">Announcements</h2><button class="link" type="button">See all</button></div>
        <ul class="group">${C.announcements.map(a => row({ lead: `<span class="datebox" aria-hidden="true"><span class="m">${esc(a.m)}</span><span class="d">${esc(a.d)}</span></span>`, title: a.t, sub: a.s })).join('')}</ul>
      </section>`;
    }
  };

  const TABS = [['Home', 'home'], ['Find my Care', 'findCare'], ['Locations', 'place'], ['Wayfinding', 'wayfinding'], ['MyChart', 'signIn']];
  const phone = document.getElementById('phone');
  phone.querySelector('.tabbar').innerHTML = `<span class="tab-ind" aria-hidden="true"></span>` + TABS.map((t, i) =>
    `<button class="tab" type="button" aria-selected="${i === 0}">${ico(t[1])}<span class="tl">${t[0].replace('Find my ', 'Find my ')}</span></button>`).join('');
  function moveInd() {
    const bar = phone.querySelector('.tabbar'), t = bar.querySelector('.tab'), ind = bar.querySelector('.tab-ind');
    bar.classList.toggle('wrap', bar.scrollWidth > bar.clientWidth + 1);
    ind.style.width = `${t.offsetWidth}px`; ind.style.transform = `translateX(${t.offsetLeft}px)`;
  }

  function render(msg) {
    C = msg.content; showAlert = !!msg.showAlert;
    phone.classList.toggle('dark', msg.theme === 'dark');
    phone.classList.toggle('rm', matchMedia('(prefers-reduced-motion: reduce)').matches);
    const wrap = (id, i) => { const html = R[id] ? R[id]() : ''; return html ? `<div class="mod" data-m="${id}" style="--i:${i};animation:none">${html}</div>` : ''; };
    const head = msg.layout.head.map(wrap).join('');
    const mods = msg.layout.modules.filter(m => m.on).map((m, i) => wrap(m.id, i)).join('');
    document.getElementById('hero-mods').innerHTML = head;
    document.getElementById('modules').innerHTML = mods || `<p class="pv-empty">No modules are visible on this layout.</p>`;
    document.getElementById('scroller').setAttribute('aria-label', `Mobile preview: ${msg.label}. Scroll with the arrow keys.`);
    nbsp(phone);
    phone.querySelectorAll('button').forEach(b => { b.tabIndex = -1; });
    moveInd();
  }

  window.addEventListener('message', e => {
    if (e.source !== window.parent || !e.data || e.data.type !== 'mycare-preview') return;
    render(e.data);
    window.parent.postMessage({ type: 'mycare-preview-rendered' }, '*');
  });

  /* Icon font readiness, as in designs/guest */
  const markIcons = () => document.documentElement.classList.add('ms-ready');
  if (document.fonts && document.fonts.load) {
    document.fonts.load('24px "Material Symbols Rounded"', 'home').then(f => { if (f.length) markIcons(); }).catch(() => {});
    setTimeout(markIcons, 3000);
  } else markIcons();
  window.parent.postMessage({ type: 'mycare-preview-ready' }, '*');
})();
