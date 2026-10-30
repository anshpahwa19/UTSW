/* ---------- Wayfinding: manual Gozio JSON export → upload → validate → demo → production ----------
   Uploading and publishing are separate actions. No direct Gozio connection. The file format checked here is a
   placeholder until UTSW shares a real Gozio export (§8). Files are read in the browser and never leave it. */
const WF_STATUS = { production: ['production', 'Production'], demo: ['demo', 'Demo'], validated: ['draft', 'Validated – not published'], superseded: ['hidden', 'Superseded'], retired: ['hidden', 'Retired'] };
const SAMPLE_GOZIO = () => JSON.stringify({
  schemaVersion: '1.0 (sample)', exportedAt: '2026-10-30T09:00:00-05:00',
  venue: { id: 'utsw-main', name: 'UT Southwestern main campus (sample)' },
  buildings: [
    { id: 'cuh', name: 'Clements University Hospital', floors: [
      { id: 'cuh-1', level: 1, name: 'Level 1', destinations: [{ id: 'cuh-lobby', name: 'Main lobby', category: 'Entrance' }, { id: 'cuh-pharm', name: 'Outpatient pharmacy', category: 'Pharmacy' }, { id: 'cuh-cafe', name: 'Café', category: 'Food' }] },
      { id: 'cuh-2', level: 2, name: 'Level 2', destinations: [{ id: 'cuh-img', name: 'Imaging', category: 'Imaging' }, { id: 'cuh-lab', name: 'Lab draw station', category: 'Lab' }] }] },
    { id: 'zale', name: 'Zale Lipshy Pavilion', floors: [
      { id: 'zale-1', level: 1, name: 'Level 1', destinations: [{ id: 'zale-east', name: 'East entrance', category: 'Entrance' }, { id: 'zale-info', name: 'Information desk', category: 'Information' }] }] },
    { id: 'obb', name: 'Sample Outpatient Building', floors: [
      { id: 'obb-3', level: 3, name: 'Level 3', destinations: [{ id: 'obb-derm', name: 'Dermatology clinic', category: 'Clinic' }, { id: 'obb-ortho', name: 'Orthopaedics clinic', category: 'Clinic' }] },
      { id: 'obb-4', level: 4, name: 'Level 4', destinations: [{ id: 'obb-store', category: 'Other' }] }] }
  ]
}, null, 2);
const SAMPLE_BAD = () => SAMPLE_GOZIO().replace('"level": 2', '"level": "2"').replace('"obb-ortho"', '"obb-derm"').replace('"Food"', '"Snacks"');

BUILT_PAGES.wayfinding = {
  async render(main) {
    const canPub = can(Session.role(), 'wayfinding', 'publish');
    main.innerHTML = `<div class="page">${pageHead({ crumbs: [['Wayfinding', null]], title: 'Wayfinding files', lede: 'Indoor maps come from a JSON file exported by hand from Gozio. Upload and validate a file, check it on demo, then publish it to production.' })}<div id="wf">${loadingState('Loading wayfinding')}</div></div>`;
    let w;
    const st = this.st = { file: null };
    const load = async () => {
      try { w = await WayfindingService.get(); } catch (err) { $('#wf').innerHTML = errorState(err.message); $('[data-retry]').onclick = load; return; }
      draw();
    };
    const vOf = v => w.versions.find(x => x.version === v);
    const pendingVal = () => w.versions.filter(x => x.status === 'validated').slice(-1)[0];
    const draw = () => {
      const prod = vOf(w.production), demo = vOf(w.demo), val = pendingVal();
      const stage = val ? 1 : w.demo !== w.production ? 2 : 3;
      const stepState = i => i < stage ? 'done' : i === stage && stage < 3 ? 'current' : i === 3 && stage === 3 ? 'done' : 'todo';
      $('#wf').innerHTML = `
        <section class="card" aria-labelledby="wf-cur-h"><div class="card-head"><h2 id="wf-cur-h" tabindex="-1">Current version</h2><div class="card-actions">${badge('mock')}</div></div><div class="card-body">
          ${stepper([
            { title: 'Upload', state: stepState(0), detail: 'Export from Gozio, then upload here' },
            { title: 'Validate', state: stepState(1), detail: val ? `${badge('draft', `v${val.version} validated`)}` : 'Checked automatically on upload' },
            { title: 'Demo', state: stepState(2), detail: demo ? `${badge('demo', `v${demo.version}`)} ${esc(demo.fileName)}` : 'Nothing on demo' },
            { title: 'Production', state: stepState(3), detail: prod ? `${badge('production', `v${prod.version}`)} ${esc(prod.fileName)}` : 'Nothing published' }], 'Wayfinding publication steps')}
          <div class="wf-cur">${prod ? `<dl class="facts cols"><dt>Published version</dt><dd>v${prod.version} · ${esc(prod.fileName)}</dd><dt>Last updated</dt><dd>${esc(fmtDateTime((w.history.filter(h => h.version === prod.version && h.environment === 'production').slice(-1)[0] || prod).at))}</dd>
            <dt>Contents</dt><dd>${prod.buildings} buildings · ${prod.floors} floors · ${prod.destinations.toLocaleString('en-US')} destinations</dd><dt>Uploaded by</dt><dd>${esc(UserService.name(prod.by))}${prod.comment ? ` – “${esc(prod.comment)}”` : ''}</dd></dl>` : ''}</div>
          ${canPub ? `<div class="lc-actions">
            ${val ? btn({ label: `Publish v${val.version} to demo`, icon: 'science', variant: 'primary', attrs: `data-w="demo" data-v="${val.version}"` }) : ''}
            ${w.demo !== w.production ? btn({ label: `Publish demo v${w.demo} to production`, icon: 'public', variant: val ? 'secondary' : 'primary', attrs: `data-w="prod" data-v="${w.demo}"` }) : ''}
          </div>` : `<p class="role-note">${ic('info', 20)}<span>Your role can view wayfinding. Admins and Super Admins upload and publish.</span></p>`}
        </div></section>
        ${canPub ? `<section class="card" aria-labelledby="wf-up-h"><div class="card-head"><h2 id="wf-up-h" tabindex="-1">Upload a file</h2></div><div class="card-body">
          <div class="drop" id="wf-drop">
            ${ic('upload_file', 32)}
            <p class="drop-t">Drag a Gozio JSON export here, or</p>
            <label class="btn btn-primary" for="wf-file">${ic('folder_open', 20)}<span class="lbl">Choose a file</span></label>
            <input type="file" id="wf-file" accept=".json,application/json" class="vh">
            <p class="hint">JSON only, up to 10 MB. The file is checked in your browser and isn’t sent anywhere.</p>
            <p class="drop-or">No export to hand? ${btn({ label: 'Use a valid sample file', variant: 'text', attrs: 'data-sample="ok"' })} ${btn({ label: 'Use a sample with errors', variant: 'text', attrs: 'data-sample="bad"' })}</p>
          </div>
          <div id="wf-progress"></div><div id="wf-result" tabindex="-1"></div>
        </div></section>` : ''}
        <section class="card" aria-labelledby="wf-v-h"><div class="card-head"><h2 id="wf-v-h" tabindex="-1">Published versions</h2><div class="card-actions">${badge('pending', 'Rollback supported – assumed, pending confirmation')}</div></div><div class="card-body" id="wf-versions"></div></section>
        <section class="card" aria-labelledby="wf-h-h"><div class="card-head"><h2 id="wf-h-h">Publication history</h2></div><div class="card-body" id="wf-hist"></div></section>`;
      dataTable($('#wf-versions'), {
        id: 'wfv', caption: 'Wayfinding versions', noun: 'version', rows: w.versions, defaultSort: { key: 'version', dir: 'desc' }, searchText: v => `${v.fileName} ${v.comment}`,
        columns: [
          { key: 'version', label: 'Version', sortable: true, render: v => `v${v.version}`, cls: 'num' },
          { key: 'fileName', label: 'File', render: v => `<span class="mono">${esc(v.fileName)}</span><br><span class="muted">${v.sizeKb.toLocaleString('en-US')} KB</span>` },
          { key: 'contents', label: 'Contents', render: v => `${v.buildings} buildings · ${v.floors} floors · ${v.destinations.toLocaleString('en-US')} destinations${v.warnings ? `<br>${badge('pending', `${v.warnings} warnings`)}` : ''}` },
          { key: 'status', label: 'Status', render: v => badge(...(WF_STATUS[v.status] || ['hidden', v.status])) },
          { key: 'at', label: 'Uploaded', sortable: true, render: v => `<span class="nowrap">${esc(fmtDateTime(v.at))}</span><br><span class="muted">${esc(UserService.name(v.by))}</span>` },
          { key: 'acts', label: 'Actions', hideLabel: true, render: v => canPub && v.version !== w.production && ['retired', 'demo'].includes(v.status) ? btn({ label: `Roll back to v${v.version}`, icon: 'history', variant: 'text', attrs: `data-w="rollback" data-v="${v.version}"` }) : '' }]
      });
      dataTable($('#wf-hist'), {
        id: 'wfh', caption: 'Publication history', noun: 'event', rows: w.history, defaultSort: { key: 'at', dir: 'desc' }, pageSize: 8, searchText: h => `${h.action} ${h.comment} ${UserService.name(h.by)}`,
        filters: [{ key: 'env', label: 'Environment', options: [['draft', 'Upload'], ['demo', 'Demo'], ['production', 'Production']], match: (h, v) => h.environment === v }],
        columns: [
          { key: 'at', label: 'When', sortable: true, render: h => `<span class="nowrap">${esc(fmtDateTime(h.at))}</span>` },
          { key: 'action', label: 'Event', render: h => esc(h.action) },
          { key: 'version', label: 'Version', render: h => `v${h.version}`, cls: 'num' },
          { key: 'environment', label: 'Environment', render: h => h.environment === 'draft' ? badge('draft', 'Upload') : badge(h.environment) },
          { key: 'by', label: 'By', render: h => esc(UserService.name(h.by)) },
          { key: 'comment', label: 'Comment', render: h => h.comment ? esc(h.comment) : '<span class="muted">None</span>', cls: 'wrap' }]
      });
      if (canPub) wireUpload();
    };
    const publish = async (b, env, v) => {
      const ver = vOf(v);
      const c = await confirmDialog({ title: env === 'demo' ? `Publish v${v} to demo?` : `Publish v${v} to production?`, body: env === 'demo'
        ? `<p>Demo devices get ${esc(ver.fileName)} (${ver.destinations.toLocaleString('en-US')} destinations). Production stays on v${w.production}.</p>`
        : `<div class="warn-box">${ic('public', 20)}<p>Patients get these indoor maps in the app. Walk a few routes on demo first. Publishing is simulated in the prototype.</p></div>`,
        confirmLabel: env === 'demo' ? 'Publish to demo' : 'Publish to production', comment: { label: 'Comment', hint: env === 'demo' ? 'Optional' : 'Optional, for example which routes you checked' } });
      if (!c.ok) return;
      setBusy(b, true, 'Publishing');
      try { w = await WayfindingService.publish(v, env, c.comment); toast(`v${v} is on ${env}.`, { kind: 'success' }); draw(); $('#wf-cur-h').focus(); }
      catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
    };
    const wireUpload = () => {
      const drop = $('#wf-drop'), input = $('#wf-file');
      const take = (name, size, text) => process(name, size, text);
      input.onchange = () => { const f = input.files[0]; if (!f) return; if (f.size > 10 * 1024 * 1024) { showResult({ ok: false, errors: [`${f.name} is ${(f.size / 1048576).toFixed(1)} MB. The limit is 10 MB.`], warnings: [] }, f.name, f.size); return; } const r = new FileReader(); r.onload = () => take(f.name, f.size, r.result); r.readAsText(f); };
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
      drop.ondragleave = () => drop.classList.remove('over');
      drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (!f) return; if (!/\.json$/i.test(f.name)) { showResult({ ok: false, errors: [`${f.name} isn’t a JSON file. Export the wayfinding data from Gozio as JSON.`], warnings: [] }, f.name, f.size); return; } const r = new FileReader(); r.onload = () => take(f.name, f.size, r.result); r.readAsText(f); };
      drop.onclick = e => { const s = e.target.closest('[data-sample]'); if (!s) return; const text = s.dataset.sample === 'ok' ? SAMPLE_GOZIO() : SAMPLE_BAD(); take(s.dataset.sample === 'ok' ? 'gozio-export-sample.json' : 'gozio-export-with-errors.json', text.length, text); };
    };
    const process = async (name, size, text) => {
      const prog = $('#wf-progress'); $('#wf-result').innerHTML = '';
      prog.innerHTML = `<div class="upl"><p><span class="mono">${esc(name)}</span> · ${(size / 1024).toFixed(1)} KB</p><div class="bar" role="progressbar" aria-label="Uploading ${esc(name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><p class="hint" id="wf-pt">Uploading…</p></div>`;
      const bar = $('.bar', prog);
      for (let p = 0; p <= 100; p += 20) { bar.setAttribute('aria-valuenow', p); $('span', bar).style.width = `${p}%`; await wait(140); }
      $('#wf-pt').textContent = 'Checking the file…';
      try { const res = await WayfindingService.validate(text); prog.innerHTML = ''; showResult(res, name, size); }
      catch (err) { prog.innerHTML = ''; showResult({ ok: false, errors: [err.message], warnings: [] }, name, size); }
    };
    const showResult = (res, name, size) => {
      st.file = res.ok ? { name, size, res } : null;
      const out = $('#wf-result');
      out.innerHTML = res.ok
        ? `<div class="val ok"><h3>${ic('check_circle', 24, 'f1')} ${esc(name)} passed validation</h3>
            <p>${res.stats.buildings} buildings · ${res.stats.floors} floors · ${res.stats.destinations} destinations${res.stats.venue ? ` · ${esc(res.stats.venue)}` : ''}</p>
            ${res.warnings.length ? `<details open><summary>${plural(res.warnings.length, 'warning')} – you can still continue</summary><ul>${res.warnings.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
            <div class="field"><label for="wf-comment">Comment for the history</label><input class="input" id="wf-comment" type="text" maxlength="120" placeholder="For example, what changed in this export"></div>
            <div class="lc-actions">${btn({ label: 'Discard file', variant: 'text', attrs: 'data-up="discard"' })}${btn({ label: 'Save as a validated version', icon: 'save', variant: 'primary', attrs: 'data-up="save"' })}</div>
            <p class="muted">Saving doesn’t publish anything. Publish to demo is a separate step.</p></div>`
        : `<div class="val bad"><h3>${ic('error', 24, 'f1')} ${esc(name)} didn’t pass validation</h3><p>Fix these in Gozio, export again and upload the new file. Nothing was saved.</p>
            <ul class="val-errs">${res.errors.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${res.moreErrors ? `<p>And ${res.moreErrors} more.</p>` : ''}
            ${res.warnings && res.warnings.length ? `<details><summary>${plural(res.warnings.length, 'warning')}</summary><ul>${res.warnings.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}</div>`;
      out.focus();
      announce(res.ok ? 'File passed validation' : `File failed validation with ${plural(res.errors.length, 'error')}`);
      out.onclick = async e => {
        const b = e.target.closest('[data-up]'); if (!b) return;
        if (b.dataset.up === 'discard') { out.innerHTML = ''; st.file = null; $('#wf-file').value = ''; $('[for="wf-file"]').focus(); return; }
        setBusy(b, true, 'Saving');
        try { w = await WayfindingService.upload(name, Math.max(1, Math.round(size / 1024)), { ...res.stats, warnings: res.warnings.length }, $('#wf-comment').value.trim()); toast('Saved as a validated version. Publish it to demo when you’re ready.', { kind: 'success' }); draw(); $('#wf-cur-h').focus(); }
        catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
      };
    };
    $('#wf').addEventListener('click', async e => {
      const b = e.target.closest('[data-w]'); if (!b) return;
      const v = +b.dataset.v;
      if (b.dataset.w === 'demo') publish(b, 'demo', v);
      if (b.dataset.w === 'prod') publish(b, 'production', v);
      if (b.dataset.w === 'rollback') {
        const c = await confirmDialog({ title: `Roll back to v${v}?`, body: `<p>Demo and production go back to ${esc(vOf(v).fileName)}. v${w.production} stays in the history.</p>`, confirmLabel: `Roll back to v${v}`, variant: 'danger', comment: { label: 'Reason for the rollback', required: true } });
        if (!c.ok) return;
        setBusy(b, true, 'Rolling back');
        try { w = await WayfindingService.rollback(v, c.comment); toast(`Rolled back. Production is v${v}.`, { kind: 'success' }); draw(); $('#wf-v-h').focus(); }
        catch (err) { setBusy(b, false); toast(err.message, { kind: 'error', ms: 8000 }); }
      }
    });
    load();
  }
};
