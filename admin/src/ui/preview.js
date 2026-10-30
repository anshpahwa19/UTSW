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
