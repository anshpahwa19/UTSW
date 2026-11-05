/* ---------- Home Screen → Layout ----------
   Order (drag, keyboard or the move menu) and visibility of the home modules for guests and signed-in patients, a live preview
   built from the designs/guest modules, and the shared Draft → Demo → Production lifecycle. */
/* EXTRA_GLYPHS: save rate_review science public vertical_align_top vertical_align_bottom arrow_upward arrow_downward */
const MOVES = [['top', 'Move to top', 'vertical_align_top'], ['up', 'Move up', 'arrow_upward'], ['down', 'Move down', 'arrow_downward'], ['bottom', 'Move to bottom', 'vertical_align_bottom']];
const AUDIENCES = [['guest', 'Guest'], ['authenticated', 'Authenticated']];
const modLabel = id => (HOME_MODULES[id] || {}).label || id;
function describeLayout(from, to) {
  if (!from) return ['New layout'];
  const out = [], pos = list => Object.fromEntries(list.map((m, i) => [m.id, i + 1]));
  const pf = pos(from.modules), pt = pos(to.modules);
  to.modules.forEach(m => {
    const was = from.modules.find(x => x.id === m.id);
    if (!was) { out.push(`${modLabel(m.id)} is added at position ${pt[m.id]}${m.on ? '' : ', hidden'}`); return; }
    if (pf[m.id] !== pt[m.id]) out.push(`${modLabel(m.id)} moves from position ${pf[m.id]} to ${pt[m.id]}`);
    if (was.on !== m.on) out.push(`${modLabel(m.id)} is ${m.on ? 'shown' : 'hidden'}`);
  });
  from.modules.forEach(m => { if (!pt[m.id]) out.push(`${modLabel(m.id)} is removed`); });
  return out;
}

BUILT_PAGES['home-layout'] = (() => {
  let st = { aud: 'guest', showAlert: true }, main, pv;
  const may = a => canAct(Session.role(), 'homeLayout', a);
  const base = () => latestData(st.rec);
  const dirty = () => !!st.rec && !same(st.working, base());

  function render(host) {
    main = host;
    main.innerHTML = `<div class="page hl">
      ${pageHead({ crumbs: [['Home Screen', null]], title: 'Home screen layout',
        lede: 'Choose which modules patients see on the MyCare home screen and in what order, for guests and for signed-in patients.' })}
      <div class="tabs" role="tablist" aria-label="Audience">${AUDIENCES.map(([k, l]) =>
        `<button type="button" role="tab" id="aud-${k}" aria-controls="aud-panel" aria-selected="${k === st.aud}" tabindex="${k === st.aud ? 0 : -1}" data-aud="${k}">${esc(l)}</button>`).join('')}</div>
      <div id="aud-panel" role="tabpanel" aria-labelledby="aud-${st.aud}"></div>
    </div>`;
    const tabs = $$('[role="tab"]', main);
    const pick = async (t, focus) => {
      if (t.dataset.aud === st.aud) return;
      if (dirty()) {
        const r = await confirmDialog({ title: 'Discard unsaved changes?', body: `<p>You have unsaved changes to the ${st.aud} layout. Switching audiences discards them.</p>`, confirmLabel: 'Discard and switch', variant: 'danger', cancelLabel: 'Keep editing' });
        if (!r.ok) return;
      }
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      if (focus) t.focus();
      st.aud = t.dataset.aud;
      $('#aud-panel').setAttribute('aria-labelledby', t.id);
      load();
    };
    tabs.forEach((t, i) => {
      t.onclick = () => pick(t);
      t.onkeydown = e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); } };
    });
    load();
  }

  async function load() {
    const panel = $('#aud-panel');
    panel.innerHTML = loadingState('Loading the layout');
    if (pv) { pv.destroy(); pv = null; }
    try { st.rec = await ConfigService.get(`home-layout-${st.aud}`); }
    catch (err) { panel.innerHTML = errorState(err.message); $('[data-retry]', panel).onclick = load; return; }
    st.working = clone(base());
    panel.innerHTML = `
      ${st.aud === 'authenticated' ? `<p class="note-line">${ic('info', 20)}<span>The signed-in home has no approved design yet (§10.5). These modules come from the personalised homepage prototype; “Your next visits” is read only from MyChart – Epic stays the source.</span></p>` : ''}
      <div class="hl-grid">
        <div class="hl-main">
          <section class="card lc" aria-labelledby="lc-h"><div class="card-head"><h2 id="lc-h" tabindex="-1">Publishing</h2><div id="lc-badges" class="card-actions"></div></div><div class="card-body" id="lc"></div></section>
          <div class="hl-edit" id="editor"></div>
        </div>
        <aside class="hl-preview" id="hl-pv"></aside>
      </div>
      ${historyCard()}`;
    const lc = Lifecycle({
      host: () => $('#lc'), area: 'homeLayout', noun: 'layout', getRec: () => st.rec, getWorking: () => clone(st.working), isDirty: dirty, describe: describeLayout,
      onSaved: rec => { st.rec = rec; st.working = clone(base()); update(); hist.update(rec.events); $('#lc-h').focus(); },
      onDiscard: () => { st.working = clone(base()); update(); $('#lc-h').focus(); }, afterDelete: () => {}
    });
    st.lc = lc;
    const hist = mountHistory({ getRec: () => st.rec, describe: describeLayout, onSaved: rec => { st.rec = rec; st.working = clone(base()); update(); hist.update(rec.events); } });
    pv = mountPreviewCard($('#hl-pv'), {
      title: `Mobile preview of the ${st.aud} home screen`,
      sources: () => recSources(st.rec, dirty(), false),
      extras: checkbox({ id: 'pv-alert', label: 'Show emergency alerts', checked: st.showAlert }),
      onExtras: (h, send) => { $('#pv-alert', h).onchange = e => { st.showAlert = e.target.checked; send(); }; },
      payload: src => {
        const data = src === 'working' ? st.working : dataAt(st.rec, src);
        const content = appContent({ audience: st.aud, allAlerts: true });
        if (!st.showAlert) content.alerts = [];
        return { screen: 'home', audience: st.aud, layout: clone(data), content, colors: colorsFor('production'),
          label: src === 'working' ? (dirty() ? 'unsaved edits, not live' : st.rec.draft ? 'saved draft, not live' : `production version ${st.rec.production}`) : `${src} version ${src === 'demo' ? st.rec.demo : st.rec.production}` };
      }
    });
    fitPhone(panel);
    Router.setGuard(async () => {
      if (!dirty()) return true;
      const r = await confirmDialog({ title: 'Leave without saving?', body: '<p>Your changes to the layout aren’t saved. If you leave, they’re lost.</p>', confirmLabel: 'Leave page', variant: 'danger', cancelLabel: 'Stay on this page' });
      return r.ok;
    });
    update();
  }

  function update(focus) {
    $('#lc-badges').innerHTML = `${badge('mock')}${dirty() ? badge('unsaved') : ''}`;
    st.lc.render(); renderEditor(focus); pv.update();
  }

  function renderEditor(focus) {
    const ro = !may('saveDraft');
    const n = st.working.modules.length;
    const row = (m, i) => {
      const meta = HOME_MODULES[m.id];
      return `<li class="mod-row${m.on ? '' : ' is-off'}${ro ? ' ro' : ''}" data-id="${m.id}">
        ${ro ? '' : `<button type="button" class="drag-h" data-act="drag" aria-haspopup="menu" aria-expanded="false" aria-label="Reorder ${esc(meta.label)}, position ${i + 1} of ${n}" aria-describedby="drag-help" title="Drag to reorder">${ic('drag_indicator', 20)}</button>`}
        <span class="mod-pos" aria-hidden="true">${i + 1}</span>
        <span class="mod-ic">${ic(meta.icon, 20)}</span>
        <span class="mod-txt"><span class="mod-t" id="mt-${m.id}">${esc(meta.label)}<span class="vh">, position ${i + 1} of ${n}</span></span><span class="mod-d">${esc(meta.desc)}${meta.link ? ` <a class="text-link" href="#${meta.link}">Manage</a>` : ''}</span></span>
        ${badge(m.on ? 'visible' : 'hidden')}
        ${ro ? '' : `<span class="mod-ctl">
          ${switchBtn({ id: `vis-${m.id}`, checked: m.on, label: `Show ${meta.label} on the home screen`, attrs: 'data-act="vis"' })}
        </span>`}
      </li>`;
    };
    $('#editor').innerHTML = card({ title: `${st.aud === 'guest' ? 'Guest' : 'Authenticated'} home modules`, titleId: 'ed-h', actions: ro ? badge('fixed', 'View only') : '', body: `
      <h3 class="sub-h" id="ord-h" tabindex="-1">Modules, in order</h3>
      <p class="hint-line" id="drag-help">${ro ? 'Hidden modules keep their place but patients don’t see them.' : 'Drag a module by its handle to reorder it, or select the handle for move options. With a keyboard, focus the handle and press the up or down arrow. Hidden modules keep their place but patients don’t see them.'}</p>
      ${n ? `<ol class="mod-list" aria-labelledby="ord-h">${st.working.modules.map(row).join('')}</ol>`
        : emptyState({ icon: 'view_agenda', title: 'No modules on this layout', text: '', level: 4 })}` });
    $('#editor').onclick = editorClick;
    const list = $('.mod-list', main);
    if (list && !ro) wireDrag(list);
    if (focus) {
      const el = focus.id && $(`[data-id="${focus.id}"] [data-act="${focus.act}"]`, main);
      (el || $('#ord-h')).focus();
    }
  }

  /* Move a module to a new index, then re-render with focus back on its handle */
  function moveTo(id, j, how = 'moved') {
    const list = st.working.modules, i = list.findIndex(m => m.id === id);
    j = Math.max(0, Math.min(list.length - 1, j));
    if (i < 0 || i === j) return false;
    const [m] = list.splice(i, 1); list.splice(j, 0, m);
    announce(`${modLabel(id)} ${how} to position ${j + 1} of ${list.length}`);
    update({ id, act: 'drag' });
    return true;
  }

  /* ---------- Move menu: the single-pointer and keyboard alternative to dragging (WCAG 2.5.7) ---------- */
  function closeMenu(returnFocus) {
    const m = $('.drag-menu', main); if (!m) return;
    const h = $('.drag-h', m.closest('.mod-row')); m.remove();
    if (h) { h.setAttribute('aria-expanded', 'false'); if (returnFocus) h.focus(); }
    document.removeEventListener('pointerdown', closeMenu.outside, true);
  }
  function openMenu(h) {
    closeMenu();
    const row = h.closest('.mod-row'), id = row.dataset.id, list = st.working.modules, i = list.findIndex(m => m.id === id), n = list.length;
    const off = { top: i === 0, up: i === 0, down: i === n - 1, bottom: i === n - 1 };
    const menu = document.createElement('div');
    menu.className = 'drag-menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', `Move ${modLabel(id)}`);
    menu.innerHTML = MOVES.map(([k, l, g]) => `<button type="button" role="menuitem" tabindex="-1" data-mv="${k}" ${off[k] ? 'aria-disabled="true"' : ''}>${ic(g, 20)}<span>${l}</span></button>`).join('');
    row.appendChild(menu); h.setAttribute('aria-expanded', 'true');
    const items = $$('[role="menuitem"]', menu), first = items.find(b => !b.hasAttribute('aria-disabled')) || items[0];
    first.focus();
    menu.addEventListener('keydown', e => {
      const k = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(k + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus(); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
      else if (e.key === 'Tab') closeMenu(false);
    });
    menu.addEventListener('click', e => {
      const b = e.target.closest('[data-mv]'); if (!b) return;
      e.stopPropagation();
      if (b.hasAttribute('aria-disabled')) return;
      const to = { top: 0, up: i - 1, down: i + 1, bottom: n - 1 }[b.dataset.mv];
      closeMenu(); moveTo(id, to);
    });
    closeMenu.outside = e => { if (!menu.contains(e.target) && e.target.closest('.drag-h') !== h) closeMenu(); };
    document.addEventListener('pointerdown', closeMenu.outside, true);
    /* Focus leaving the menu (Tab, or a click into the preview frame, which the page never sees) closes it too */
    menu.addEventListener('focusout', e => { if (!menu.contains(e.relatedTarget) && e.relatedTarget !== h) setTimeout(() => { if (menu.isConnected && !menu.contains(document.activeElement)) closeMenu(); }, 0); });
    addEventListener('blur', () => closeMenu(), { once: true });
  }

  /* ---------- Pointer drag (mouse, pen and touch on the handle; mouse anywhere on the row) ---------- */
  function wireDrag(list) {
    list.addEventListener('keydown', e => {
      const h = e.target.closest('.drag-h'); if (!h || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const id = h.closest('.mod-row').dataset.id, i = st.working.modules.findIndex(m => m.id === id);
      moveTo(id, { ArrowUp: i - 1, ArrowDown: i + 1, Home: 0, End: st.working.modules.length - 1 }[e.key]);
    });
    list.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.drag-menu')) return;
      const onHandle = !!e.target.closest('.drag-h');
      if (!onHandle && (e.pointerType !== 'mouse' || e.target.closest('a,button,input,label,[role="switch"]'))) return;
      const row = e.target.closest('.mod-row'); if (!row) return;
      const startY = e.clientY, grab = e.clientY - row.getBoundingClientRect().top;
      let dragging = false, lastY = e.clientY, raf = 0;
      const rows = () => $$('.mod-row', list);
      const place = () => {
        row.style.transform = '';
        const natural = row.getBoundingClientRect().top;
        row.style.transform = `translateY(${lastY - grab - natural}px)`;
      };
      const reorder = () => {
        const r = row.getBoundingClientRect(), mid = r.top + r.height / 2;
        const prev = row.previousElementSibling, next = row.nextElementSibling;
        let target = null, before = true;
        if (prev && mid < prev.getBoundingClientRect().top + prev.getBoundingClientRect().height / 2) target = prev;
        else if (next && mid > next.getBoundingClientRect().top + next.getBoundingClientRect().height / 2) { target = next; before = false; }
        if (!target) return;
        const first = new Map(rows().filter(x => x !== row).map(x => [x, x.getBoundingClientRect().top]));
        before ? list.insertBefore(row, target) : list.insertBefore(row, target.nextElementSibling);
        rows().forEach((x, k) => { $('.mod-pos', x).textContent = k + 1; });
        first.forEach((top, x) => {          /* FLIP: slide the displaced row into its new place */
          const dy = top - x.getBoundingClientRect().top; if (!dy) return;
          x.style.transition = 'none'; x.style.transform = `translateY(${dy}px)`;
          requestAnimationFrame(() => { x.style.transition = ''; x.style.transform = ''; });
        });
        place();
      };
      const edge = () => {                    /* scroll the page while dragging near the top or bottom edge */
        if (!dragging) return;
        const top = 120, bottom = innerHeight - 60;
        const v = lastY < top ? -(top - lastY) / 6 : lastY > bottom ? (lastY - bottom) / 6 : 0;
        if (v) { scrollBy(0, Math.max(-24, Math.min(24, v))); place(); reorder(); }
        raf = requestAnimationFrame(edge);
      };
      const move = ev => {
        lastY = ev.clientY;
        if (!dragging) {
          if (Math.abs(lastY - startY) < 5) return;
          dragging = true; closeMenu();
          row.classList.add('is-dragging'); list.classList.add('is-sorting');
          try { row.setPointerCapture(e.pointerId); } catch (_) {}
          raf = requestAnimationFrame(edge);
        }
        ev.preventDefault(); place(); reorder();
      };
      const end = ev => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', end); removeEventListener('pointercancel', end);
        cancelAnimationFrame(raf);
        if (!dragging) return;
        row.classList.remove('is-dragging'); list.classList.remove('is-sorting'); row.style.transform = '';
        const id = row.dataset.id, j = rows().indexOf(row);
        list.dataset.justDragged = '1'; setTimeout(() => { delete list.dataset.justDragged; }, 0);
        if (ev.type === 'pointercancel' || !moveTo(id, j)) update({ id, act: 'drag' });
      };
      addEventListener('pointermove', move, { passive: false }); addEventListener('pointerup', end); addEventListener('pointercancel', end);
    });
  }

  function editorClick(e) {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const rowEl = b.closest('[data-id]'), id = rowEl && rowEl.dataset.id, list = st.working.modules, i = list.findIndex(m => m.id === id);
    const label = modLabel(id);
    if (b.dataset.act === 'vis') { list[i].on = !list[i].on; announce(`${label} ${list[i].on ? 'shown' : 'hidden'}`); update({ id, act: 'vis' }); }
    if (b.dataset.act === 'drag') {
      if ($('#editor .mod-list').dataset.justDragged) return;
      b.getAttribute('aria-expanded') === 'true' ? closeMenu(true) : openMenu(b);
    }
  }

  /* Size the phone so the preview card ends level with the left column at any width, never larger than the
     breakpoint's scale or smaller than a readable minimum. Only the phone scales; the preview column keeps its
     width, so the left column never reflows because of this (no resize loop). */
  function fitPhone(panel) {
    if (fitPhone.ro) fitPhone.ro.disconnect();
    const grid = $('.hl-grid', panel), left = $('.hl-main', panel), aside = $('#hl-pv', panel);
    if (!grid || !window.ResizeObserver) return;
    const fit = () => {
      if (!grid.isConnected) { fitPhone.ro && fitPhone.ro.disconnect(); return; }
      aside.style.removeProperty('--s');
      if (getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length < 2) return;
      const max = parseFloat(getComputedStyle(grid).getPropertyValue('--s')) || .8;
      const chrome = aside.offsetHeight - 844 * max;
      const s = Math.max(.55, Math.min(max, (left.offsetHeight - chrome) / 844));
      if (s < max - .002) aside.style.setProperty('--s', s.toFixed(3));
    };
    fitPhone.ro = new ResizeObserver(() => requestAnimationFrame(fit));
    fitPhone.ro.observe(left); $('.pv-ctl', aside) && fitPhone.ro.observe($('.pv-ctl', aside));
    fit();
  }

  return { render, leave() { closeMenu(); if (pv) { pv.destroy(); pv = null; } if (fitPhone.ro) { fitPhone.ro.disconnect(); fitPhone.ro = null; } } };
})();
