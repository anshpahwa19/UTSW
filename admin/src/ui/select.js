/* ---------- Dropdown: one design for every select in the portal ----------
   Each native <select> stays in the DOM as the source of truth (forms, validation and change listeners keep
   working) but is hidden from view and from assistive tech. A button shows the current choice and opens a
   listbox in the top layer (popover), so it is never clipped by a table, card or dialog.
   - Single select: pick one option, the list closes.
   - Multiple select (<select multiple>): options have checkboxes and the list stays open; an "All" row clears the
     choice. Used by every table filter.
   Keyboard: Enter, Space, Alt+Down or Down opens. Up, Down, Home, End and typing move. Enter or Space picks.
   Escape closes without picking, Tab closes. The listbox uses aria-activedescendant, so focus stays on the button. */
/* EXTRA_GLYPHS: expand_more check */
let ddSeq = 0, ddOpen = null;
const ddPopoverOk = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

function ddText(sel) {
  const on = [...sel.options].filter(o => o.selected);
  if (sel.multiple) {
    if (!on.length) return sel.dataset.allLabel || 'All';
    return on.length === 1 ? on[0].text : `${on[0].text} +${on.length - 1}`;
  }
  return on[0] ? on[0].text : '';
}
function ddSync(sel) {
  const b = sel && sel._dd; if (!b) return;
  $('.dd-v', b).textContent = ddText(sel);
  const icon = sel.dataset.ddIcons !== undefined ? sel.value : '';
  const lead = $('.dd-lead', b); if (lead) lead.innerHTML = icon ? ic(icon, 20) : '';
  b.disabled = sel.disabled;
  ['aria-invalid', 'aria-describedby', 'aria-required'].forEach(a => { sel.hasAttribute(a) ? b.setAttribute(a, sel.getAttribute(a)) : b.removeAttribute(a); });
  b.classList.toggle('dd-placeholder', !sel.multiple && sel.value === '' && !!sel.options[0] && sel.options[0].value === '' && !!sel.closest('[data-placeholder]'));
  b.classList.toggle('dd-on', sel.multiple && [...sel.selectedOptions].length > 0);
}
function ddSyncAll(root = document) { $$('select[data-dd]', root).forEach(ddSync); }

function enhanceSelect(sel) {
  if (sel.dataset.dd !== undefined || sel.dataset.native !== undefined) return;
  sel.dataset.dd = '';
  const id = sel.id || (sel.id = `dd-${++ddSeq}`);
  const b = document.createElement('button');
  b.type = 'button';
  b.id = `${id}-dd`;
  b.className = `${sel.className} dd-btn`.replace(/\binput\b/, 'input');
  b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false');
  b.innerHTML = `${sel.dataset.ddIcons !== undefined ? '<span class="dd-lead" aria-hidden="true"></span>' : ''}<span class="dd-v"></span>${ic('expand_more', 20, 'dd-chev')}`;
  /* Name: the visible label (moved to the button) or the select's own aria-label, then the current value */
  const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
  if (lab) { lab.htmlFor = b.id; if (!lab.id) lab.id = `${id}-lbl`; }
  const vid = `${id}-ddv`; $('.dd-v', b).id = vid;
  if (lab) b.setAttribute('aria-labelledby', `${lab.id} ${vid}`);
  else if (sel.getAttribute('aria-label')) { b.setAttribute('aria-label', sel.getAttribute('aria-label')); b.setAttribute('aria-describedby', vid); }
  if (sel.multiple) b.dataset.multi = '';
  sel.classList.add('dd-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
  sel.after(b); sel._dd = b; b._sel = sel;
  if (document.activeElement === sel) b.focus();
  sel.addEventListener('change', () => ddSync(sel));
  sel.addEventListener('focus', () => b.focus());        /* error-summary links and label clicks land on the button */
  new MutationObserver(() => ddSync(sel)).observe(sel, { attributes: true, attributeFilter: ['disabled', 'aria-invalid', 'aria-describedby', 'aria-required'] });
  b.addEventListener('click', () => { ddOpen && ddOpen.sel === sel ? ddClose() : ddShow(sel); });
  b.addEventListener('keydown', e => ddKey(e, sel));
  ddSync(sel);
}

function ddShow(sel) {
  ddClose();
  const b = sel._dd, multi = sel.multiple, icons = sel.dataset.ddIcons !== undefined;
  const list = document.createElement('div');
  list.className = 'dd-list'; list.id = `${sel.id}-lb`;
  list.setAttribute('role', 'listbox'); list.setAttribute('aria-labelledby', b.getAttribute('aria-labelledby') || b.id);
  if (!b.getAttribute('aria-labelledby') && b.getAttribute('aria-label')) list.setAttribute('aria-label', b.getAttribute('aria-label'));
  if (multi) list.setAttribute('aria-multiselectable', 'true');
  const opts = [...sel.options].filter(o => !o.hidden);
  const rows = (multi ? [{ all: true, text: sel.dataset.allLabel || 'All' }] : []).concat(opts.map(o => ({ o, text: o.text })));
  list.innerHTML = rows.map((r, k) => {
    const on = r.all ? !sel.selectedOptions.length : r.o.selected;
    return `<div class="dd-opt${r.all ? ' dd-all' : ''}" role="option" id="${sel.id}-o${k}" data-k="${k}" aria-selected="${on}" ${r.o && r.o.disabled ? 'aria-disabled="true"' : ''}>
      ${multi ? `<span class="dd-box" aria-hidden="true">${ic('check', 16)}</span>` : ''}
      ${icons && r.o ? `<span class="dd-oic" aria-hidden="true">${ic(r.o.value, 20)}</span>` : ''}
      <span class="dd-t">${esc(r.text)}</span>
      ${!multi ? `<span class="dd-tick" aria-hidden="true">${ic('check', 20)}</span>` : ''}</div>`;
  }).join('');
  /* Inside a modal dialog the list must live in the dialog, or the dialog makes it inert */
  const host = sel.closest('dialog') || document.body;
  host.appendChild(list);
  if (ddPopoverOk) { list.setAttribute('popover', 'manual'); list.showPopover(); }
  ddOpen = { sel, list, rows, active: Math.max(0, rows.findIndex(r => (r.all ? !sel.selectedOptions.length : r.o.selected))) };
  b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-controls', list.id);
  ddPlace(); ddActive(ddOpen.active);
  list.addEventListener('pointerdown', e => e.preventDefault());   /* keep focus on the button */
  list.addEventListener('click', e => { const o = e.target.closest('.dd-opt'); if (o) ddPick(+o.dataset.k); });
  list.addEventListener('pointermove', e => { const o = e.target.closest('.dd-opt'); if (o && +o.dataset.k !== ddOpen.active) ddActive(+o.dataset.k, false); });
  document.addEventListener('pointerdown', ddOutside, true);
  addEventListener('resize', ddPlace); addEventListener('scroll', ddScroll, true);
}
function ddPlace() {
  if (!ddOpen) return;
  const { sel, list } = ddOpen, r = sel._dd.getBoundingClientRect(), gap = 4, vh = innerHeight;
  list.style.minWidth = `${Math.max(r.width, 200)}px`;
  list.style.maxWidth = `${Math.min(420, innerWidth - 16)}px`;
  const below = vh - r.bottom - gap - 8, above = r.top - gap - 8, need = Math.min(list.scrollHeight, 320);
  const up = below < need && above > below;
  list.style.maxHeight = `${Math.max(120, Math.min(320, up ? above : below))}px`;
  const left = Math.max(8, Math.min(r.left, innerWidth - list.offsetWidth - 8));
  list.style.left = `${left}px`;
  list.style.top = up ? `${Math.max(8, r.top - gap - list.offsetHeight)}px` : `${r.bottom + gap}px`;
  list.classList.toggle('up', up);
}
function ddScroll(e) { if (ddOpen && !ddOpen.list.contains(e.target)) ddPlace(); }
function ddOutside(e) { if (ddOpen && !ddOpen.list.contains(e.target) && e.target !== ddOpen.sel._dd && !ddOpen.sel._dd.contains(e.target)) ddClose(); }
function ddClose(focus) {
  if (!ddOpen) return;
  const { sel, list } = ddOpen;
  try { if (ddPopoverOk) list.hidePopover(); } catch (_) {}
  list.remove();
  sel._dd.setAttribute('aria-expanded', 'false'); sel._dd.removeAttribute('aria-controls'); sel._dd.removeAttribute('aria-activedescendant');
  document.removeEventListener('pointerdown', ddOutside, true);
  removeEventListener('resize', ddPlace); removeEventListener('scroll', ddScroll, true);
  ddOpen = null;
  if (focus) sel._dd.focus();
}
function ddActive(k, scroll = true) {
  const { list, sel } = ddOpen, opts = $$('.dd-opt', list);
  ddOpen.active = k = Math.max(0, Math.min(opts.length - 1, k));
  opts.forEach((o, i) => o.classList.toggle('active', i === k));
  sel._dd.setAttribute('aria-activedescendant', opts[k].id);
  if (scroll) opts[k].scrollIntoView({ block: 'nearest' });
}
function ddPick(k) {
  const { sel, rows, list } = ddOpen, r = rows[k];
  if (r.o && r.o.disabled) return;
  if (sel.multiple) {
    if (r.all) [...sel.options].forEach(o => { o.selected = false; }); else r.o.selected = !r.o.selected;
    $$('.dd-opt', list).forEach((el, i) => el.setAttribute('aria-selected', rows[i].all ? !sel.selectedOptions.length : rows[i].o.selected));
    sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true }));
    ddActive(k, false);
    announce(r.all ? 'All selected' : `${r.text} ${r.o.selected ? 'selected' : 'not selected'}`);
    return;
  }
  const changed = sel.value !== r.o.value;
  sel.value = r.o.value; ddClose(true);
  if (changed) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
  ddSync(sel);
}
let ddType = '', ddTypeT = 0;
function ddKey(e, sel) {
  const open = ddOpen && ddOpen.sel === sel;
  if (!open) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); ddShow(sel); }
    return;
  }
  const n = ddOpen.rows.length;
  if (e.key === 'ArrowDown') { e.preventDefault(); ddActive(ddOpen.active + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); e.altKey ? ddClose(true) : ddActive(ddOpen.active - 1); }
  else if (e.key === 'Home' || e.key === 'PageUp') { e.preventDefault(); ddActive(0); }
  else if (e.key === 'End' || e.key === 'PageDown') { e.preventDefault(); ddActive(n - 1); }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ddPick(ddOpen.active); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); ddClose(true); }
  else if (e.key === 'Tab') ddClose(false);
  else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {        /* type to jump */
    clearTimeout(ddTypeT); ddType += e.key.toLowerCase(); ddTypeT = setTimeout(() => { ddType = ''; }, 600);
    const k = ddOpen.rows.findIndex((r, i) => r.text.toLowerCase().startsWith(ddType) && (ddType.length > 1 || i > ddOpen.active))
      ; const k2 = k >= 0 ? k : ddOpen.rows.findIndex(r => r.text.toLowerCase().startsWith(ddType));
    if (k2 >= 0) ddActive(k2);
  }
}
/* Enhance every select as it appears, wherever it is rendered */
function startDropdowns() {
  $$('select').forEach(enhanceSelect);
  new MutationObserver(ms => {
    for (const m of ms) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.tagName === 'SELECT') enhanceSelect(n); else if (n.querySelector) n.querySelectorAll('select').forEach(enhanceSelect);
    }
    if (ddOpen && !ddOpen.sel.isConnected) ddClose();
  }).observe(document.body, { childList: true, subtree: true });
}
