/* ---------- Declarative forms: render, read, validate ----------
   Field: { key, label, type, hint, required, max, options, show(data), placeholder, min, maxNum, readonly }
   Types: text, textarea, select, number, datetime, switch, color, icon, alertIcon, image, destination, segment, radio */
const segmentOptions = () => ConfigService.peekAll('segment').map(r => [r.id, (latestData(r) || {}).name || r.name]);
const segmentName = id => { const r = ConfigService.peek(id); return r ? (latestData(r) || {}).name || r.name : 'Unknown audience'; };

function renderField(f, data, err, prefix) {
  const id = `${prefix}-${f.key}`, v = data[f.key];
  const desc = [f.hint && `${id}-hint`, `${id}-err`].filter(Boolean).join(' ');
  const errP = `<p class="err" id="${id}-err" ${err ? '' : 'hidden'}>${ic('error', 16)}<span>${esc(err || '')}</span></p>`;
  const hint = f.hint ? `<p class="hint" id="${id}-hint">${esc(f.hint)}</p>` : '';
  const req = f.required ? ' <span class="req">(required)</span>' : '';
  const a = `id="${id}" data-key="${f.key}" aria-describedby="${desc}" ${err ? 'aria-invalid="true"' : ''} ${f.required ? 'aria-required="true"' : ''} ${f.readonly ? 'disabled' : ''}`;
  /* Long text always shows its count; short fields only once they near the limit */
  const counter = f.max ? `<p class="count-line" id="${id}-cnt" ${f.type === 'textarea' || (v || '').length >= f.max * .7 ? '' : 'hidden'}>${(v || '').length} of ${f.max} characters</p>` : '';
  const wrap = control => `<div class="field${err ? ' has-error' : ''}" data-field="${f.key}"><label for="${id}">${esc(f.label)}${req}</label>${hint}${control}${counter}${errP}</div>`;
  switch (f.type) {
    case 'textarea': return wrap(`<textarea class="input" rows="${f.rows || 3}" ${a}>${esc(v || '')}</textarea>`);
    case 'number': return wrap(`<input class="input input-num" type="number" inputmode="numeric" value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.maxNum != null ? `max="${f.maxNum}"` : ''} ${a}>`);
    case 'datetime': return wrap(`<input class="input input-dt" type="datetime-local" value="${esc(v || '')}" ${a}>`);
    case 'color': return wrap(`<div class="color-row"><input type="color" class="swatch" value="${esc(v)}" data-key="${f.key}" aria-label="${esc(f.label)} picker" tabindex="-1"><input class="input input-hex" type="text" value="${esc(v)}" spellcheck="false" ${a}></div>`);
    case 'select': case 'segment': {
      const opts = f.type === 'segment' ? segmentOptions() : (typeof f.options === 'function' ? f.options(data) : f.options);
      return wrap(`<select class="input" ${a}>${f.placeholder ? `<option value="">${esc(f.placeholder)}</option>` : ''}${opts.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`);
    }
    case 'icon': case 'alertIcon': {
      const list = f.type === 'icon' ? APPROVED_ICONS : ALERT_ICONS;
      return wrap(`<div class="icon-row"><span class="icon-prev" aria-hidden="true">${ic(v || 'help')}</span><select class="input" ${a}>${list.map(i => `<option value="${i.glyph}" ${i.glyph === v ? 'selected' : ''}>${esc(i.label)}</option>`).join('')}</select></div>`);
    }
    case 'switch':
      return `<div class="field field-switch" data-field="${f.key}"><span class="sw-txt"><span class="sw-l" id="${id}-l">${esc(f.label)}</span>${f.hint ? `<span class="hint" id="${id}-hint">${esc(f.hint)}</span>` : ''}</span>
        <button type="button" class="switch" role="switch" id="${id}" data-key="${f.key}" aria-checked="${!!v}" aria-labelledby="${id}-l" ${f.hint ? `aria-describedby="${id}-hint"` : ''} ${f.readonly ? 'disabled' : ''}><span class="track" aria-hidden="true"></span></button></div>`;
    case 'radio':
      return `<fieldset class="field field-radio${err ? ' has-error' : ''}" data-field="${f.key}"><legend>${esc(f.label)}${req}</legend>${hint}<div class="radio-row">${f.options.map(([ov, ol]) =>
        `<label class="radio-card" for="${id}-${ov}"><input type="radio" name="${id}" id="${id}-${ov}" value="${esc(ov)}" data-key="${f.key}" ${ov === v ? 'checked' : ''} ${f.readonly ? 'disabled' : ''}><span>${esc(ol)}</span></label>`).join('')}</div>${errP}</fieldset>`;
    case 'image':
      return `<fieldset class="field" data-field="${f.key}"><legend>${esc(f.label)}</legend>${hint}<div class="img-grid">${['none', ...Object.keys(ART)].map(k =>
        `<label class="img-opt" for="${id}-${k}"><input type="radio" name="${id}" id="${id}-${k}" value="${k}" data-key="${f.key}" ${k === (v || 'none') ? 'checked' : ''} ${f.readonly ? 'disabled' : ''}>
          <span class="img-th">${k === 'none' ? `${ic('hide_image', 24)}` : `<svg viewBox="0 0 304 144" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ART[k]}</svg>`}</span>
          <span class="img-l">${k === 'none' ? 'No image' : `Sample ${k.toUpperCase()}`}</span></label>`).join('')}</div></fieldset>`;
    case 'destination': {
      const d = v || { type: 'none', value: '' };
      const valueCtl = d.type === 'screen' ? `<select class="input" id="${id}-v" data-key="${f.key}" data-part="value" aria-label="${esc(f.label)}: app screen" aria-describedby="${id}-err">${APP_SCREENS.map(s => `<option ${s === d.value ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>`
        : d.type === 'mychart' ? `<select class="input" id="${id}-v" data-key="${f.key}" data-part="value" aria-label="${esc(f.label)}: MyChart destination" aria-describedby="${id}-err">${MYCHART_TARGETS.map(s => `<option ${s === d.value ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>`
        : d.type === 'url' ? `<input class="input" type="url" id="${id}-v" data-key="${f.key}" data-part="value" value="${esc(d.value)}" placeholder="https://" aria-label="${esc(f.label)}: web address" aria-describedby="${id}-err" ${err ? 'aria-invalid="true"' : ''}>`
        : d.type === 'phone' ? `<input class="input" type="tel" id="${id}-v" data-key="${f.key}" data-part="value" value="${esc(d.value)}" placeholder="214-555-0100" aria-label="${esc(f.label)}: phone number" aria-describedby="${id}-err" ${err ? 'aria-invalid="true"' : ''}>` : '';
      return `<fieldset class="field${err ? ' has-error' : ''}" data-field="${f.key}"><legend>${esc(f.label)}${req}</legend>${hint}
        <div class="dest-row"><select class="input" id="${id}" data-key="${f.key}" data-part="type" aria-label="${esc(f.label)}: type" data-rerender ${f.readonly ? 'disabled' : ''}>${DEST_TYPES.filter(([k]) => !f.noNone || k !== 'none').map(([k, l]) => `<option value="${k}" ${k === d.type ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${valueCtl}</div>
        ${d.type === 'mychart' ? `<p class="hint">${ic('lock', 16)} Opens MyChart sign-in, then the MyChart screen. The Admin never edits MyChart content.</p>` : ''}${errP}</fieldset>`;
    }
    case 'rules': {
      const rules = v || [];
      return `<fieldset class="field${err ? ' has-error' : ''}" data-field="${f.key}"><legend>${esc(f.label)}</legend>${hint}
        ${rules.length ? `<ol class="rules">${rules.map((r, i) => { const A = AUDIENCE_ATTRS[r.attr]; return `<li class="rule-row">
          <span class="rule-n" aria-hidden="true">${i + 1}</span>
          <select class="input" id="${id}-a${i}" data-key="${f.key}" data-rule="${i}" data-part="attr" aria-label="Rule ${i + 1}: attribute" data-rerender ${f.readonly ? 'disabled' : ''}>${Object.entries(AUDIENCE_ATTRS).map(([k, a]) => `<option value="${k}" ${k === r.attr ? 'selected' : ''}>${esc(a.label)}</option>`).join('')}</select>
          <select class="input" id="${id}-o${i}" data-key="${f.key}" data-rule="${i}" data-part="op" aria-label="Rule ${i + 1}: condition" ${f.readonly ? 'disabled' : ''}>${A.ops.map(o => `<option ${o === r.op ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
          <select class="input" id="${id}-v${i}" data-key="${f.key}" data-rule="${i}" data-part="value" aria-label="Rule ${i + 1}: value" ${f.readonly ? 'disabled' : ''}>${A.values.map(o => `<option ${o === r.value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
          ${f.readonly ? '' : `<button type="button" class="btn btn-text btn-icon" data-rule-remove="${i}" data-key="${f.key}" aria-label="Remove rule ${i + 1}">${ic('remove_circle', 20)}</button>`}</li>`; }).join('')}</ol>`
          : `<p class="hint-line">No rules: this segment includes every app user.</p>`}
        ${f.readonly ? '' : `<button type="button" class="btn btn-tonal" data-rule-add data-key="${f.key}" id="${id}-add">${ic('add', 20)}<span class="lbl">Add rule</span></button>`}${errP}</fieldset>`;
    }
    default: return wrap(`<input class="input" type="text" value="${esc(v == null ? '' : v)}" ${f.max ? `maxlength="${f.max + 20}"` : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${a}>`);
  }
}
/* sections: [{ title, fields }] */
function renderForm(sections, data, errors = {}, prefix = 'f') {
  const errs = Object.entries(errors);
  return `${errs.length ? `<div class="err-summary" role="alert" tabindex="-1" id="${prefix}-errsum"><h3>${ic('error', 20)} Fix ${plural(errs.length, 'problem')} before saving</h3><ul>${errs.map(([k, m]) => `<li><a href="#${prefix}-${k}" data-jump="${prefix}-${k}">${esc(m)}</a></li>`).join('')}</ul></div>` : ''}
    ${sections.map(s => {
      const fs = s.fields.filter(f => !f.show || f.show(data));
      if (!fs.length) return '';
      return `<div class="form-sec">${s.title ? `<h3 class="sub-h">${esc(s.title)}</h3>` : ''}${s.note ? `<p class="hint-line">${s.note}</p>` : ''}<div class="form-grid">${fs.map(f => `<div class="${f.wide === false ? '' : 'span-2'}">${renderField(f, data, errors[f.key], prefix)}</div>`).join('')}</div></div>`;
    }).join('')}`;
}
/* Reads the changed control into data (returns true if the form must re-render) */
function applyInput(e, data, fields) {
  const t = e.target, key = t.dataset.key; if (!key) return false;
  const f = fields.find(x => x.key === key); if (!f) return false;
  if (f.type === 'destination') {
    const d = { ...(data[key] || { type: 'none', value: '' }) };
    if (t.dataset.part === 'type') { d.type = t.value; d.value = t.value === 'screen' ? APP_SCREENS[0] : t.value === 'mychart' ? MYCHART_TARGETS[0] : ''; data[key] = d; return true; }
    d.value = t.value; data[key] = d; return false;
  }
  if (f.type === 'rules') {
    const rules = clone(data[key] || []), i = +t.dataset.rule, part = t.dataset.part;
    rules[i][part] = t.value;
    if (part === 'attr') { const A = AUDIENCE_ATTRS[t.value]; rules[i].op = A.ops[0]; rules[i].value = A.values[0]; }
    data[key] = rules; return part === 'attr';
  }
  if (f.type === 'switch') { data[key] = t.getAttribute('aria-checked') === 'true'; return !!f.rerender; }
  if (f.type === 'number') { data[key] = t.value === '' ? '' : Number(t.value); return false; }
  if (f.type === 'color') { const v = t.value.trim(); data[key] = v; const other = t.type === 'color' ? t.parentElement.querySelector('.input-hex') : t.parentElement.querySelector('.swatch'); if (/^#[0-9a-f]{6}$/i.test(v)) { other.value = v; } return false; }
  data[key] = t.value;
  if (f.type === 'icon' || f.type === 'alertIcon') t.parentElement.querySelector('.icon-prev').innerHTML = ic(t.value);
  if (f.max) { const c = document.getElementById(`${t.id}-cnt`); if (c) { c.textContent = `${t.value.length} of ${f.max} characters`; c.hidden = f.type !== 'textarea' && t.value.length < f.max * .7; } }
  return !!f.rerender;
}
/* Wires a form host: input/change/switch clicks update data and call onChange; error summary links focus fields */
function wireForm(host, getFields, data, onChange, rerender) {
  const handle = e => {
    if (e.type === 'click') {
      const sw = e.target.closest('.switch[data-key]');
      const jump = e.target.closest('[data-jump]');
      if (jump) { e.preventDefault(); const el = document.getElementById(jump.dataset.jump) || document.getElementById(`${jump.dataset.jump}-v`); el && el.focus(); return; }
      const add = e.target.closest('[data-rule-add]'), rm = e.target.closest('[data-rule-remove]');
      if (add || rm) {
        const key = (add || rm).dataset.key, rules = clone(data[key] || []);
        if (add) rules.push({ attr: 'signedIn', op: 'is', value: 'Guest' }); else rules.splice(+rm.dataset.ruleRemove, 1);
        data[key] = rules; rerender(); onChange();
        const focusEl = add ? document.getElementById(`${add.id.replace(/-add$/, '')}-a${rules.length - 1}`) : host.querySelector('[data-rule-add]');
        focusEl && focusEl.focus(); announce(add ? `Rule ${rules.length} added` : 'Rule removed');
        return;
      }
      if (!sw || sw.disabled) return;
      sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true');
      e = { target: sw };
    }
    const fsNow = getFields(), visBefore = fsNow.map(f => !f.show || f.show(data)).join();
    const re = applyInput(e, data, fsNow) || visBefore !== fsNow.map(f => !f.show || f.show(data)).join();
    if (re || (e.type === 'change' && e.target.hasAttribute('data-rerender'))) { const id = e.target.id; rerender(); const el = document.getElementById(id); el && el.focus(); }
    onChange();
  };
  host.addEventListener('input', e => { if (e.target.tagName !== 'SELECT' && e.target.type !== 'radio') handle(e); });
  host.addEventListener('change', e => { if (e.target.type === 'radio' || e.target.tagName === 'SELECT') handle(e); });
  host.addEventListener('click', handle);
}
/* Generic validation from field rules, plus a custom hook */
function validateData(fields, data, custom) {
  const errors = {};
  fields.filter(f => !f.show || f.show(data)).forEach(f => {
    const v = data[f.key];
    if (f.required && (v == null || v === '' || (f.type === 'destination' && v.type !== 'none' && !String(v.value || '').trim()))) { errors[f.key] = `Enter ${f.label.toLowerCase()}.`; return; }
    if (f.max && typeof v === 'string' && v.length > f.max) errors[f.key] = `${f.label} is ${v.length - f.max} characters too long. Keep it to ${f.max}.`;
    if (f.type === 'number' && v !== '' && v != null && ((f.min != null && v < f.min) || (f.maxNum != null && v > f.maxNum))) errors[f.key] = `${f.label} must be between ${f.min} and ${f.maxNum}.`;
    if (f.type === 'color' && !/^#[0-9a-f]{6}$/i.test(v || '')) errors[f.key] = `${f.label} must be a hex color like #004278.`;
    if (f.type === 'destination' && v) {
      if (v.type === 'url' && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v.value || '')) errors[f.key] = 'Enter a full web address that starts with https://.';
      if (v.type === 'phone' && !/^\d{3}-\d{3}-\d{4}$/.test(v.value || '')) errors[f.key] = 'Enter the phone number as 214-555-0100.';
      if (f.required && v.type === 'none') errors[f.key] = `Choose ${f.label.toLowerCase()}.`;
    }
    if (f.key === 'videoUrl' && v && !/^https:\/\/\S+$/.test(v)) errors[f.key] = 'Enter a video address that starts with https://.';
  });
  Object.assign(errors, custom ? custom(data) || {} : {});
  return errors;
}
/* Plain-language change list between two data objects */
function describeData(from, to, fields) {
  if (!from) return ['New item – everything is added'];
  const out = [];
  const label = k => (fields.find(f => f.key === k) || { label: k }).label;
  const show = (k, v) => { const f = fields.find(x => x.key === k) || {}; if (f.type === 'destination') return destLabel(v); if (f.type === 'segment') return segmentName(v); if (f.type === 'switch' || typeof v === 'boolean') return v ? 'on' : 'off'; if (f.type === 'datetime') return fmtLocal(v); if (f.type === 'image') return v === 'none' ? 'no image' : ART_NAMES[v]; return String(v); };
  new Set([...Object.keys(from), ...Object.keys(to)]).forEach(k => {
    if (same(from[k], to[k])) return;
    const a = show(k, from[k]), b = show(k, to[k]);
    out.push(a.length + b.length < 90 ? `${label(k)}: “${a || 'empty'}” → “${b || 'empty'}”` : `${label(k)} is edited`);
  });
  return out;
}
