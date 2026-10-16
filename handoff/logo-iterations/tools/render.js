// Render one or more SVG files to PNG with headless Chromium.
// Usage: node render.js <in.svg> <out.png> [--width 1200] [--bg "#F7F8FA"] [--pad 0]
//   --width  output width in CSS px (height follows the SVG's aspect ratio)
//   --bg     page background behind the SVG (default transparent)
//   --pad    padding in px around the SVG
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

(async () => {
  const argv = process.argv.slice(2);
  const pos = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
  const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
  const [inp, out] = pos;
  if (!inp || !out) { console.error('usage: node render.js in.svg out.png [--width N] [--bg COLOR] [--pad N]'); process.exit(2); }
  const width = Number(opt('width', 1200));
  const bg = opt('bg', 'transparent');
  const pad = Number(opt('pad', 0));
  const svg = fs.readFileSync(path.resolve(inp), 'utf8');
  const m = svg.match(/viewBox\s*=\s*"([\d.\-\s,]+)"/);
  if (!m) { console.error('SVG needs a viewBox'); process.exit(2); }
  const [, , vw, vh] = m[1].trim().split(/[\s,]+/).map(Number);
  const height = Math.round(width * vh / vw);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const page = await browser.newPage({ viewport: { width: width + 2 * pad, height: height + 2 * pad }, deviceScaleFactor: 1 });
  const inner = svg.replace(/<svg\b/, `<svg width="${width}" height="${height}" style="display:block"`);
  await page.setContent(`<html><body style="margin:0;padding:${pad}px;background:${bg}">${inner}</body></html>`);
  await page.screenshot({ path: out, omitBackground: bg === 'transparent' });
  await browser.close();
  console.log(`${out} ${width + 2 * pad}x${height + 2 * pad}`);
})().catch(e => { console.error(e); process.exit(1); });
