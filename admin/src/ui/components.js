/* ==========================================================================================
   Core components. Each returns markup or wires behavior; styles live in styles/admin.css.
   Patterns follow designs/guest (buttons, switch, toast with Undo, states with retry, focus ring).
   ========================================================================================== */

/* ---------- Button ---------- variants: primary, secondary, tonal, text, danger; size: md (44) or lg (48) */
function btn({ label, icon, variant = 'secondary', size = 'md', attrs = '', iconOnly = false, type = 'button' }) {
  const cls = `btn btn-${variant}${size === 'lg' ? ' btn-lg' : ''}${iconOnly ? ' btn-icon' : ''}`;
  return `<button type="${type}" class="${cls}" ${iconOnly ? `aria-label="${esc(label)}" title="${esc(label)}"` : ''} ${attrs}>${icon ? ic(icon, 20) : ''}${iconOnly ? '' : `<span class="lbl">${esc(label)}</span>`}<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></button>`;
}
/* Busy state while a mock service call runs */
function setBusy(button, busy, busyLabel) {
  if (!button) return;
  button.classList.toggle('loading', busy);
  button.setAttribute('aria-busy', busy);
  if (busy) { button.dataset.label = button.getAttribute('aria-label') || ''; button.setAttribute('aria-label', busyLabel || 'Working'); }
  else if (button.dataset.label) button.setAttribute('aria-label', button.dataset.label); else button.removeAttribute('aria-label');
}

/* ---------- Status badge: always an icon and a word, never color alone ---------- */
const BADGES = {
  draft: ['edit_note', 'Draft'], demo: ['science', 'Demo'], production: ['public', 'Production'],
  unsaved: ['pending', 'Unsaved changes'], review: ['rate_review', 'Review requested'], changes: ['undo', 'Changes requested'],
  mock: ['database', 'Mock data'], simulated: ['sync_alt', 'Simulated'], planned: ['schedule', 'Planned'],
  visible: ['visibility', 'Visible'], hidden: ['visibility_off', 'Hidden'], fixed: ['lock', 'Fixed'],
  pending: ['help', 'Pending confirmation'], error: ['error', 'Error'], live: ['check_circle', 'Live']
};
function badge(kind, text) {
  const [icon, word] = BADGES[kind] || ['info', kind];
  return `<span class="badge badge-${kind}">${ic(icon, 16)}<span>${esc(text || word)}</span></span>`;
}

/* ---------- Form field: label, hint and error tied by aria-describedby ---------- */
function field({ id, label, type = 'text', value = '', hint = '', error = '', required = false, textarea = false, rows = 3, attrs = '', options = null }) {
  const desc = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ');
  const common = `id="${id}" name="${id}" ${required ? 'required aria-required="true"' : ''} ${error ? 'aria-invalid="true"' : ''} ${desc ? `aria-describedby="${desc}"` : ''} ${attrs}`;
  let control;
  if (textarea) control = `<textarea class="input" rows="${rows}" ${common}>${esc(value)}</textarea>`;
  else if (options) control = `<select class="input" ${common}>${options.map(([v, l]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  else control = `<input class="input" type="${type}" value="${esc(value)}" ${common}>`;
  return `<div class="field${error ? ' has-error' : ''}">
    <label for="${id}">${esc(label)}${required ? ' <span class="req">(required)</span>' : ''}</label>
    ${hint ? `<p class="hint" id="${id}-hint">${esc(hint)}</p>` : ''}
    ${control}
    <p class="err" id="${id}-err" ${error ? '' : 'hidden'}>${ic('error', 16)}<span>${esc(error)}</span></p>
  </div>`;
}
function setFieldError(input, msg) {
  const f = input.closest('.field'), err = f.querySelector('.err');
  f.classList.toggle('has-error', !!msg);
  err.hidden = !msg; err.querySelector('span').textContent = msg || '';
  if (msg) {
    input.setAttribute('aria-invalid', 'true');
    const ids = new Set((input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)); ids.add(err.id);
    input.setAttribute('aria-describedby', [...ids].join(' '));
  } else input.removeAttribute('aria-invalid');
}

/* ---------- Switch (role="switch") and checkbox ---------- */
const switchBtn = ({ id, checked, label, labelledby, attrs = '' }) =>
  `<button type="button" class="switch" role="switch" id="${id}" aria-checked="${!!checked}" ${labelledby ? `aria-labelledby="${labelledby}"` : `aria-label="${esc(label)}"`} ${attrs}><span class="track" aria-hidden="true"></span></button>`;
const checkbox = ({ id, label, checked, attrs = '' }) =>
  `<label class="check" for="${id}"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} ${attrs}><span class="box" aria-hidden="true">${ic('check', 16)}</span><span>${esc(label)}</span></label>`;

/* ---------- Segmented control (radio group) ---------- */
function segmented({ id, label, options, value }) {
  return `<div class="seg" role="radiogroup" aria-label="${esc(label)}" id="${id}">${options.map(([v, l]) =>
    `<button type="button" role="radio" data-value="${esc(v)}" aria-checked="${v === value}" tabindex="${v === value ? 0 : -1}">${esc(l)}</button>`).join('')}</div>`;
}
/* Arrow keys move the selection, as radios do */
function wireSegmented(root, onChange) {
  const opts = $$('[role="radio"]', root);
  const pick = (b, focus) => {
    opts.forEach(o => { const on = o === b; o.setAttribute('aria-checked', on); o.tabIndex = on ? 0 : -1; });
    if (focus) b.focus(); onChange(b.dataset.value);
  };
  opts.forEach((b, i) => {
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', e => {
      const d = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 0;
      if (d) { e.preventDefault(); pick(opts[(i + d + opts.length) % opts.length], true); }
    });
  });
}

/* ---------- Card ---------- */
const card = ({ title, titleId, body, actions = '', cls = '', level = 2 }) =>
  `<section class="card ${cls}" ${title ? `aria-labelledby="${titleId}"` : ''}>
    ${title ? `<div class="card-head"><h${level} id="${titleId}">${title}</h${level}>${actions ? `<div class="card-actions">${actions}</div>` : ''}</div>` : ''}
    <div class="card-body">${body}</div>
  </section>`;

/* ---------- Loading, error and empty states ---------- */
const loadingState = (text = 'Loading') =>
  `<div class="state state-loading" role="status"><span class="vh">${esc(text)}…</span><div class="sk-stack" aria-hidden="true"><span class="sk sk-w1"></span><span class="sk sk-w2"></span><span class="sk sk-w3"></span><span class="sk sk-block"></span></div></div>`;
const errorState = (msg, retryAttr = 'data-retry') =>
  `<div class="state state-error" role="alert">${ic('error', 32, 'f1')}<h2>We couldn’t load this</h2><p>${esc(msg)}</p>${btn({ label: 'Try again', icon: 'refresh', variant: 'primary', attrs: retryAttr })}</div>`;
const emptyState = ({ icon = 'inbox', title, text, action = '', level = 2 }) =>
  `<div class="state state-empty">${ic(icon, 32)}<h${level}>${esc(title)}</h${level}>${text ? `<p>${text}</p>` : ''}${action}</div>`;

/* ---------- Stepper: ordered steps with a state word each ---------- */
function stepper(steps, label) {
  const word = { done: 'Completed', current: 'Current step', todo: 'Not started' };
  const glyph = { done: 'check_circle', current: 'radio_button_checked', todo: 'radio_button_unchecked' };
  return `<ol class="stepper" aria-label="${esc(label)}">${steps.map(s => `
    <li class="step step-${s.state}" ${s.state === 'current' ? 'aria-current="step"' : ''}>
      <span class="step-ic">${ic(glyph[s.state], 24, s.state === 'todo' ? '' : 'f1')}</span>
      <span class="step-txt"><span class="step-t">${esc(s.title)} <span class="vh">– ${word[s.state]}</span></span>${s.detail ? `<span class="step-d">${s.detail}</span>` : ''}</span>
    </li>`).join('')}</ol>`;
}

/* ---------- Table with search, a filter panel, sortable headers and pagination (8 rows a page) ----------
   Filters live behind one Filters button: the panel holds every filter and applies them together with Apply.
   Applied filters show as removable chips, so nothing is hidden from view once it's in effect. */
/* EXTRA_GLYPHS: arrow_upward arrow_downward unfold_more filter_list close */
const TABLE_PAGE_SIZE = 8;
function dataTable(outer, cfg) {
  /* A fresh root each time, so re-mounting on the same host never stacks listeners */
  const host = document.createElement('div'); host.className = 'tbl-root'; outer.replaceChildren(host);
  const st = { q: '', filters: {}, sort: cfg.defaultSort || null, rows: cfg.rows, page: 0 };
  const size = TABLE_PAGE_SIZE;
  const id = cfg.id, filters = cfg.filters || [];
  const fLabel = (f, v) => { const o = f.options.find(x => String(x[0]) === String(v)); return o ? o[1] : v; };
  host.innerHTML = `
    <div class="tbl-tools" role="search" aria-label="${esc(cfg.caption)}">
      <div class="tbl-search"><label for="${id}-q" class="vh">Search ${esc(cfg.caption.toLowerCase())}</label>${ic('search', 20)}<input class="input" type="search" id="${id}-q" placeholder="${esc(cfg.searchPlaceholder || 'Search')}"></div>
      ${filters.length ? `<div class="tbl-fwrap">
        <button type="button" class="tbl-fbtn" id="${id}-fbtn" aria-expanded="false" aria-controls="${id}-fp" aria-label="Filters" title="Filters">${ic('filter_list', 20)}<span class="tbl-fcount" hidden></span></button>
        <div class="tbl-fpanel" id="${id}-fp" role="dialog" aria-labelledby="${id}-fp-h" hidden>
          <h3 class="fp-h" id="${id}-fp-h">Filter ${esc(cfg.caption.toLowerCase())}</h3>
          <div class="fp-body">${filters.map(f => `<div class="field"><label class="label" for="${id}-f-${f.key}">${esc(f.label)}</label><select class="input" id="${id}-f-${f.key}" data-filter="${f.key}" multiple data-all-label="All">${f.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></div>`).join('')}</div>
          <div class="fp-foot">${btn({ label: 'Clear all', variant: 'text', attrs: 'data-fp="clear"' })}${btn({ label: 'Apply', variant: 'primary', attrs: 'data-fp="apply"' })}</div>
        </div></div>` : ''}
      <p class="tbl-count${cfg.hideCount ? ' vh' : ''}" id="${id}-count" role="status"></p>
      ${cfg.actions ? `<div class="tbl-actions">${cfg.actions}</div>` : ''}
    </div>
    ${filters.length ? `<div class="tbl-chips" aria-label="Applied filters" role="group" hidden></div>` : ''}
    <div class="tbl-wrap" tabindex="0" role="region" aria-labelledby="${id}-cap">
      <table class="tbl"><caption id="${id}-cap" class="vh">${esc(cfg.caption)}</caption><thead></thead><tbody></tbody></table>
    </div>
    <div class="tbl-empty" hidden></div>
    <nav class="pager" aria-label="${esc(cfg.caption)} pages" hidden></nav>`;
  const thead = $('thead', host), tbody = $('tbody', host), empty = $('.tbl-empty', host), wrap = $('.tbl-wrap', host);
  const visible = () => {
    const q = st.q.trim().toLowerCase();
    let rows = st.rows.filter(r => (!q || cfg.searchText(r).toLowerCase().includes(q)) &&
      filters.every(f => !(st.filters[f.key] || []).length || st.filters[f.key].some(v => f.match(r, v))));
    if (st.sort) {
      const col = cfg.columns.find(c => c.key === st.sort.key), v = col.sortValue || (r => r[col.key]);
      rows = [...rows].sort((a, b) => (v(a) > v(b) ? 1 : v(a) < v(b) ? -1 : 0) * (st.sort.dir === 'asc' ? 1 : -1));
    }
    return rows;
  };
  const head = () => {
    thead.innerHTML = `<tr>${cfg.columns.map(c => {
      const sorted = st.sort && st.sort.key === c.key;
      const aria = c.sortable ? `aria-sort="${sorted ? (st.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"` : '';
      const inner = c.sortable ? `<button type="button" class="th-sort" data-sort="${c.key}">${esc(c.label)}${ic(sorted ? (st.sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more', 16)}</button>` : (c.hideLabel ? `<span class="vh">${esc(c.label)}</span>` : esc(c.label));
      return `<th scope="col" ${aria} class="${c.cls || ''}">${inner}</th>`;
    }).join('')}</tr>`;
  };
  const body = () => {
    const all = visible();
    const pages = size ? Math.max(1, Math.ceil(all.length / size)) : 1;
    st.page = Math.min(st.page, pages - 1);
    const rows = size ? all.slice(st.page * size, st.page * size + size) : all;
    const pager = $('.pager', host);
    pager.hidden = pages < 2;
    if (pages > 1) {
      /* Page numbers: all of them up to 7, otherwise first, last and the pages around the current one */
      const nums = [];
      for (let k = 0; k < pages; k++) if (pages <= 7 || k === 0 || k === pages - 1 || Math.abs(k - st.page) <= 1) nums.push(k); else if (nums[nums.length - 1] !== '…') nums.push('…');
      pager.innerHTML = `<span class="pg-info">${st.page * size + 1}–${st.page * size + rows.length} of ${all.length}</span>
        <span class="pg-btns">${btn({ label: 'Previous page', icon: 'chevron_left', variant: 'text', iconOnly: true, attrs: `data-page="prev" ${st.page === 0 ? 'disabled' : ''}` })}
        ${nums.map(k => k === '…' ? '<span class="pg-gap" aria-hidden="true">…</span>' : `<button type="button" class="pg-n" data-page="${k}" aria-label="Page ${k + 1}" ${k === st.page ? 'aria-current="page"' : ''}>${k + 1}</button>`).join('')}
        ${btn({ label: 'Next page', icon: 'chevron_right', variant: 'text', iconOnly: true, attrs: `data-page="next" ${st.page >= pages - 1 ? 'disabled' : ''}` })}</span>`;
    }
    chips();
    tbody.innerHTML = rows.map(r => `<tr>${cfg.columns.map((c, i) => i === 0 ? `<th scope="row" class="${c.cls || ''}">${c.render(r)}</th>` : `<td class="${c.key === 'acts' || c.key === 'v' || c.key === 'details' ? 'acts' : c.cls || ''}">${c.render(r)}</td>`).join('')}</tr>`).join('');
    const filtered = st.q || Object.values(st.filters).some(v => v && v.length);
    $(`#${id}-count`, host).textContent = `${plural(all.length, cfg.noun || 'row')}${filtered ? ` of ${st.rows.length}` : ''}`;
    wrap.hidden = !all.length; empty.hidden = !!all.length;
    if (!all.length) empty.innerHTML = filtered
      ? emptyState({ icon: 'search_off', title: 'No matches', text: 'Nothing matches this search and these filters.', action: btn({ label: 'Clear search and filters', variant: 'secondary', attrs: 'data-clear' }), level: 3 })
      : emptyState({ ...cfg.empty, level: 3 });
    if (cfg.onRender) cfg.onRender(tbody);
  };
  host.addEventListener('input', e => {
    if (e.target.id === `${id}-q`) { st.q = e.target.value; st.page = 0; body(); }
  });
  /* Applied filters as chips, and the count on the Filters button */
  function chips() {
    if (!filters.length) return;
    const on = filters.flatMap(f => (st.filters[f.key] || []).map(v => [f, v]));
    const c = $('.tbl-chips', host), n = $('.tbl-fcount', host), b = $(`#${id}-fbtn`, host);
    n.hidden = !on.length; n.textContent = on.length;
    b.setAttribute('aria-label', on.length ? `Filters, ${on.length} applied` : 'Filters'); b.classList.toggle('on', !!on.length);
    c.hidden = !on.length;
    c.innerHTML = on.map(([f, v]) => `<button type="button" class="tbl-chip" data-chip="${f.key}" data-v="${esc(v)}" aria-label="Remove filter ${esc(f.label)}: ${esc(fLabel(f, v))}"><span><span class="chip-k">${esc(f.label)}:</span> ${esc(fLabel(f, v))}</span>${ic('close', 16)}</button>`).join('')
      + (on.length > 1 ? `<button type="button" class="text-link tbl-chip-clear" data-clear>Clear all</button>` : '');
  }
  const panel = () => $(`#${id}-fp`, host);
  function openPanel() {
    const fp = panel(); if (!fp) return;
    filters.forEach(f => { const s = $(`#${id}-f-${f.key}`, host); [...s.options].forEach(o => { o.selected = (st.filters[f.key] || []).includes(o.value); }); ddSync(s); });
    fp.hidden = false; $(`#${id}-fbtn`, host).setAttribute('aria-expanded', 'true');
    ($('.dd-btn', fp) || $('select', fp)).focus();
    document.addEventListener('pointerdown', openPanel.outside = e => { if (!host.isConnected) return document.removeEventListener('pointerdown', openPanel.outside, true); if (e.target.closest('.dd-list')) return; if (!e.target.closest('.tbl-fwrap') || !host.contains(e.target)) closePanel(false); }, true);
  }
  function closePanel(focusBtn) {
    const fp = panel(); if (!fp || fp.hidden) return;
    if (ddOpen && fp.contains(ddOpen.sel)) ddClose();
    fp.hidden = true; $(`#${id}-fbtn`, host).setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', openPanel.outside, true);
    if (focusBtn) $(`#${id}-fbtn`, host).focus();
  }
  function applyFilters(next) {
    st.filters = next; st.page = 0; body();
    const n = Object.values(next).reduce((a, v) => a + (v ? v.length : 0), 0), count = $(`#${id}-count`, host).textContent;
    announce(`${n ? plural(n, 'filter') + ' applied' : 'Filters cleared'}. ${count}.`);
  }
  host.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel() && !panel().hidden) { e.preventDefault(); e.stopPropagation(); closePanel(true); }
    if (e.key === 'Tab' && panel() && !panel().hidden) {   /* keep Tab inside the open panel */
      const f = $$('button', panel()).filter(x => !x.disabled), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  host.addEventListener('click', e => {
    if (e.target.closest(`#${id}-fbtn`)) { panel().hidden ? openPanel() : closePanel(true); return; }
    const fp = e.target.closest('[data-fp]');
    if (fp) {
      if (fp.dataset.fp === 'clear') { $$('[data-filter]', host).forEach(s => { [...s.options].forEach(o => { o.selected = false; }); ddSync(s); }); applyFilters({}); }
      else applyFilters(Object.fromEntries($$('[data-filter]', host).map(s => [s.dataset.filter, [...s.selectedOptions].map(o => o.value)]).filter(([, v]) => v.length)));
      closePanel(true); return;
    }
    const chip = e.target.closest('[data-chip]');
    if (chip) {
      const k = chip.dataset.chip, i = $$('[data-chip]', host).indexOf(chip), next = { ...st.filters };
      next[k] = (next[k] || []).filter(v => v !== chip.dataset.v); if (!next[k].length) delete next[k];
      applyFilters(next);
      const left = $$('[data-chip]', host); (left[Math.min(i, left.length - 1)] || $(`#${id}-fbtn`, host)).focus(); return;
    }
    const pg = e.target.closest('[data-page]');
    if (pg && !pg.disabled) {
      const v = pg.dataset.page;
      st.page = v === 'prev' ? st.page - 1 : v === 'next' ? st.page + 1 : +v; body();
      const again = $(`[data-page="${v}"]`, host) || $(`[data-page="${st.page}"]`, host);
      (again && !again.disabled ? again : $(`[data-page="${st.page}"]`, host)).focus();
      announce(`Page ${st.page + 1}`); return;
    }
    const s = e.target.closest('[data-sort]');
    if (s) {
      const k = s.dataset.sort;
      st.sort = { key: k, dir: st.sort && st.sort.key === k && st.sort.dir === 'asc' ? 'desc' : 'asc' };
      head(); body(); $(`[data-sort="${k}"]`, thead).focus();
      announce(`Sorted by ${s.textContent.trim()}, ${st.sort.dir === 'asc' ? 'ascending' : 'descending'}`);
    }
    if (e.target.closest('[data-clear]')) {
      st.q = ''; st.filters = {}; st.page = 0; $(`#${id}-q`, host).value = ''; $$('[data-filter]', host).forEach(s => { [...s.options].forEach(o => { o.selected = false; }); ddSync(s); });
      body(); $(`#${id}-q`, host).focus();
    }
  });
  if (cfg.initialFilters) Object.entries(cfg.initialFilters).forEach(([k, v]) => { st.filters[k] = [].concat(v); });
  head(); body();
  return { update(rows) { st.rows = rows; body(); } };
}

/* ---------- Modal and confirm dialog (native <dialog>: inert background, Escape closes) ---------- */
function openModal({ title, body, actions, onOpen, wide = false }) {
  const from = document.activeElement;
  const d = document.createElement('dialog');
  d.className = `modal${wide ? ' wide' : ''}`;
  d.setAttribute('aria-labelledby', 'modal-h');
  d.innerHTML = `<form method="dialog" class="modal-form" novalidate>
    <div class="modal-head"><h2 id="modal-h" tabindex="-1">${esc(title)}</h2>${btn({ label: 'Close', icon: 'close', variant: 'text', iconOnly: true, attrs: 'data-close' })}</div>
    <div class="modal-body">${body}</div>
    <div class="modal-actions">${actions}</div>
  </form>`;
  document.body.appendChild(d);
  const close = () => { if (d.open) d.close(); };
  d.addEventListener('close', () => { d.remove(); if (from && from.isConnected) from.focus(); });
  d.addEventListener('click', e => { if (e.target.closest('[data-close]')) { e.preventDefault(); close(); } });
  d.showModal();
  (d.querySelector('[autofocus]') || d.querySelector('#modal-h')).focus();
  if (onOpen) onOpen(d, close);
  return { el: d, close };
}
/* Resolves { ok, comment }. A required comment is validated before confirming. */
function confirmDialog({ title, body, confirmLabel, variant = 'primary', comment = null, cancelLabel = 'Cancel', wide = false }) {
  return new Promise(resolve => {
    let done = false;
    const commentField = comment ? field({ id: 'cf-comment', label: comment.label, hint: comment.hint || '', required: !!comment.required, textarea: true, rows: 3, value: comment.value || '' }) : '';
    const m = openModal({
      title, wide,
      body: `${body}${commentField}`,
      actions: `${btn({ label: cancelLabel, variant: 'text', attrs: 'data-close' })}${btn({ label: confirmLabel, variant, type: 'submit', attrs: 'data-confirm' })}`,
      onOpen(d, close) {
        d.querySelector('form').addEventListener('submit', e => {
          e.preventDefault();
          const ta = d.querySelector('#cf-comment');
          if (comment && comment.required && !ta.value.trim()) { setFieldError(ta, `Enter ${comment.label.toLowerCase()} so others know why.`); ta.focus(); return; }
          done = true; resolve({ ok: true, comment: ta ? ta.value.trim() : '' }); close();
        });
        d.addEventListener('close', () => { if (!done) resolve({ ok: false }); });
      }
    });
    return m;
  });
}

/* ---------- Toast: polite live region, optional action (Undo), 5 seconds ---------- */
function toast(msg, { kind = 'info', action, onAction, ms = 5000 } = {}) {
  const host = $('#toasts');
  const t = document.createElement('div');
  t.className = `toast toast-${kind}`;
  t.innerHTML = `${ic(kind === 'error' ? 'error' : kind === 'success' ? 'check_circle' : 'info', 20, 'f1')}<span class="toast-msg">${esc(msg)}</span>${action ? `<button type="button" class="toast-act">${esc(action)}</button>` : ''}<button type="button" class="toast-x" aria-label="Dismiss notification">${ic('close', 20)}</button>`;
  host.appendChild(t);
  let timer;
  const kill = () => { clearTimeout(timer); t.classList.add('out'); setTimeout(() => t.remove(), 200); };
  const arm = () => { clearTimeout(timer); timer = setTimeout(kill, ms); };
  t.addEventListener('mouseenter', () => clearTimeout(timer)); t.addEventListener('mouseleave', arm);
  t.addEventListener('focusin', () => clearTimeout(timer)); t.addEventListener('focusout', arm);
  t.querySelector('.toast-x').onclick = kill;
  if (action) t.querySelector('.toast-act').onclick = () => { kill(); onAction && onAction(); };
  arm();
}
