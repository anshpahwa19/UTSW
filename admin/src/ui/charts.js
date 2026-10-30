/* ---------- Charts: inline SVG, colored from theme tokens, single series per chart (one axis) ----------
   Line: 2px line, light area, recessive grid, endpoint marker with its value, crosshair + tooltip on hover
   and with the arrow keys, and a data table for screen readers and anyone who wants the numbers. */
function niceTicks(min, max, n = 4) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0);
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(6));
  return out;
}
const tickFmt = (v, unit) => unit === 'count' ? (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v)) : unit === '%' ? `${+v.toFixed(1)}%` : unit === 's' ? `${+v.toFixed(2)} s` : unit === 'ms' ? `${v} ms` : String(v);

function lineChart(host, { points, unit, label, height = 220, zeroBase = false }) {
  let idx = points.length - 1;
  host.classList.add('chart');
  host.innerHTML = `<div class="chart-plot" tabindex="0" role="img" aria-label="${esc(label)}: ${points.length} days, from ${fmtNum(points[0].y, unit)} on ${fmtDay(points[0].x)} to ${fmtNum(points[points.length - 1].y, unit)} on ${fmtDay(points[points.length - 1].x)}. Use the left and right arrow keys to read each day."></div>
    <div class="chart-tip" hidden></div>
    <details class="chart-table"><summary>Show data table</summary><div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(label)} data"><table class="tbl"><caption class="vh">${esc(label)}</caption><thead><tr><th scope="col">Date</th><th scope="col" class="num">${esc(label)}</th></tr></thead>
      <tbody>${points.map(p => `<tr><th scope="row">${fmtDay(p.x)}</th><td class="num">${fmtNum(p.y, unit)}</td></tr>`).join('')}</tbody></table></div></details>`;
  const plot = $('.chart-plot', host), tip = $('.chart-tip', host);
  let geom;
  const draw = () => {
    const W = Math.max(280, plot.clientWidth), H = height, m = { l: 52, r: 56, t: 14, b: 28 };
    const ys = points.map(p => p.y);
    const ticks = niceTicks(zeroBase ? 0 : Math.min(...ys), Math.max(...ys));
    const y0 = ticks[0], y1 = ticks[ticks.length - 1];
    const X = i => m.l + (i / Math.max(1, points.length - 1)) * (W - m.l - m.r), Y = v => m.t + (1 - (v - y0) / (y1 - y0)) * (H - m.t - m.b);
    geom = { X, Y, W, H, m };
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
    const xt = [...new Set([0, Math.round((points.length - 1) / 3), Math.round(2 * (points.length - 1) / 3), points.length - 1])];
    const last = points[points.length - 1];
    plot.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      ${ticks.map(t => `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" class="c-grid"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end" class="c-axis">${tickFmt(t, unit)}</text>`).join('')}
      ${xt.map(i => `<text x="${X(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}" class="c-axis">${fmtDay(points[i].x)}</text>`).join('')}
      <path d="${line}L${X(points.length - 1)},${Y(y0)}L${X(0)},${Y(y0)}Z" class="c-area"/>
      <path d="${line}" class="c-line"/>
      <circle cx="${X(points.length - 1)}" cy="${Y(last.y)}" r="4" class="c-end"/>
      <text x="${X(points.length - 1) + 8}" y="${Y(last.y) + 4}" class="c-endl">${tickFmt(+last.y.toFixed(unit === 'count' ? 0 : 1), unit)}</text>
      <g class="c-cross" hidden><line class="c-xline" y1="${m.t}" y2="${H - m.b}"/><circle r="5" class="c-dot"/></g>
    </svg>`;
  };
  const show = (i, fromKey) => {
    idx = Math.max(0, Math.min(points.length - 1, i));
    const p = points[idx], g = $('.c-cross', plot), x = geom.X(idx), y = geom.Y(p.y);
    g.removeAttribute('hidden'); $('.c-xline', g).setAttribute('x1', x); $('.c-xline', g).setAttribute('x2', x);
    $('.c-dot', g).setAttribute('cx', x); $('.c-dot', g).setAttribute('cy', y);
    tip.hidden = false; tip.innerHTML = `<span class="tip-d">${fmtDay(p.x)}</span><span class="tip-v">${fmtNum(p.y, unit)}</span>`;
    tip.style.left = `${Math.min(Math.max(x, 70), geom.W - 70)}px`; tip.style.top = `${Math.max(0, y - 56)}px`;
    if (fromKey) announce(`${fmtDay(p.x)}: ${fmtNum(p.y, unit)}`);
  };
  const hide = () => { tip.hidden = true; const g = $('.c-cross', plot); g && g.setAttribute('hidden', ''); };
  plot.addEventListener('pointermove', e => { const r = plot.getBoundingClientRect(), x = e.clientX - r.left; show(Math.round((x - geom.m.l) / (geom.W - geom.m.l - geom.m.r) * (points.length - 1))); });
  plot.addEventListener('pointerleave', hide);
  plot.addEventListener('blur', hide);
  plot.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1, Home: -1e9, End: 1e9 }[e.key];
    if (d != null) { e.preventDefault(); show(Math.abs(d) > 1 ? (d < 0 ? 0 : points.length - 1) : idx + d, true); }
  });
  draw();
  if (window.ResizeObserver) { const ro = new ResizeObserver(debounce(() => { if (!host.isConnected) { ro.disconnect(); return; } draw(); }, 80)); ro.observe(plot); }
}
/* Sparkline for metric tiles (decorative; the tile states the value in text) */
function sparkline(points) {
  const W = 120, H = 32, ys = points.map(p => p.y), lo = Math.min(...ys), hi = Math.max(...ys) || 1;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1) * W).toFixed(1)},${(H - 3 - (p.y - lo) / ((hi - lo) || 1) * (H - 6)).toFixed(1)}`).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><path d="${d}" class="c-line"/></svg>`;
}
/* Horizontal bars: a labeled list, readable without the bars */
function barList(rows, { unit = 'count', max } = {}) {
  const top = max || Math.max(...rows.map(r => r.value), 1);
  return `<ul class="bars">${rows.map(r => `<li><span class="bar-l">${esc(r.label)}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${Math.max(2, r.value / top * 100)}%"></span></span><span class="bar-v">${fmtNum(r.value, unit)}</span></li>`).join('')}</ul>`;
}
/* EXTRA_GLYPHS: trending_up trending_down */
function metricTile(m, link) {
  const up = m.change >= 0, good = m.lowerBetter ? !up : up;
  return `<div class="metric">
    <p class="metric-l">${esc(m.label)}</p>
    <p class="metric-v">${fmtNum(m.value, m.unit)}</p>
    <p class="metric-c ${good ? 'good' : 'bad'}">${ic(up ? 'trending_up' : 'trending_down', 16)}<span>${up ? '+' : '−'}${Math.abs(m.change * 100).toFixed(1)}%<span class="vh"> compared with the previous period, ${good ? 'an improvement' : 'a decline'}</span></span><span class="metric-p" aria-hidden="true">vs. previous period</span></p>
    ${sparkline(m.series)}
    ${link ? `<a class="metric-link" href="#${link}" aria-label="${esc(m.label)} details">Details</a>` : ''}
  </div>`;
}
