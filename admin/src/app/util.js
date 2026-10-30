/* ---------- Utilities: DOM, escaping, icons, dates, device storage, live announcements ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = v => JSON.parse(JSON.stringify(v));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let idSeq = 0;
const uid = p => `${p}-${Date.now().toString(36)}${(idSeq++).toString(36)}`;

/* Material Symbols Rounded only. build.py collects every glyph named as ic('…') or icon: '…' into the font subset. */
const ic = (name, size = 24, extra = '') => `<span class="ms${size === 24 ? '' : ' s' + size}${extra ? ' ' + extra : ''}" aria-hidden="true">${name}</span>`;

/* AP style dates and times in Central Time (Dallas): Oct. 30, 2026, 9:41 a.m. CT */
const AP_MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const TZ = 'America/Chicago';
function tzParts(iso) {
  const d = new Date(iso);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    .formatToParts(d).map(x => [x.type, x.value]));
  return { y: p.year, m: +p.month - 1, d: p.day, h: +p.hour, min: p.minute, pm: /p/i.test(p.dayPeriod) };
}
function apTime(p) {
  if (p.min === '00' && p.h === 12) return p.pm ? 'noon' : 'midnight';
  return `${p.h}${p.min === '00' ? '' : ':' + p.min} ${p.pm ? 'p.m.' : 'a.m.'}`;
}
const fmtDate = iso => { const p = tzParts(iso); return `${AP_MONTHS[p.m]} ${p.d}, ${p.y}`; };
const fmtDateTime = iso => { const p = tzParts(iso); return `${AP_MONTHS[p.m]} ${p.d}, ${p.y}, ${apTime(p)} CT`; };

/* Device storage: always wrapped, the page works without it (private windows, previews) */
const STORE_KEY = 'utsw-admin-mock-v1';
const store = {
  read() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch (e) { return null; } },
  write(v) { try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable: keep working in memory */ } },
  clear() { try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ } }
};

/* Screen reader announcements (polite) */
function announce(msg) {
  const el = $('#sr-live'); if (!el) return;
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 30);
}
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
