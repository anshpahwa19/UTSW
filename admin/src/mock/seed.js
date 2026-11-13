/* ==========================================================================================
   MOCK DATA – fictional sample records for the prototype. Nothing here comes from or goes to
   MyCare, Epic/MyChart, Gozio or any UTSW system. Content follows the UTSW MyCare Guest Flow 2 design
   (the stakeholder update) so the preview matches the patient prototype. People are fictional;
   emails use the reserved .example domain; phone numbers use the prototype's sample numbers.
   ========================================================================================== */

/* Approved icon list: the designs/guest ICON_MAP concepts (line 1712) that CMS tiles may use. One concept, one glyph. */
const APPROVED_ICONS = [
  { key: 'findCare', glyph: 'stethoscope', label: 'Find Care – doctors' },
  { key: 'place', glyph: 'location_on', label: 'Locations' },
  { key: 'wayfinding', glyph: 'directions_walk', label: 'Wayfinding' },
  { key: 'route', glyph: 'route', label: 'Directions on campus' },
  { key: 'messages', glyph: 'chat', label: 'Message your doctor' },
  { key: 'results', glyph: 'labs', label: 'Test results' },
  { key: 'visits', glyph: 'calendar_month', label: 'Visits' },
  { key: 'bill', glyph: 'credit_card', label: 'Billing' },
  { key: 'receipt', glyph: 'receipt_long', label: 'Billing and insurance' },
  { key: 'urgent', glyph: 'acute', label: 'Urgent care' },
  { key: 'video', glyph: 'videocam', label: 'Video visits' },
  { key: 'vaccine', glyph: 'vaccines', label: 'Vaccines' },
  { key: 'syringe', glyph: 'syringe', label: 'Flu shots and injections' },
  { key: 'rank', glyph: 'workspace_premium', label: 'Recognition – Why UT Southwestern' },
  { key: 'aid', glyph: 'volunteer_activism', label: 'Financial assistance' },
  { key: 'article', glyph: 'article', label: 'Articles and guides' },
  { key: 'newspaper', glyph: 'newspaper', label: 'MedBlog' },
  { key: 'records', glyph: 'folder_open', label: 'Records and forms' },
  { key: 'help', glyph: 'support_agent', label: 'Help and contact' },
  { key: 'privacy', glyph: 'privacy_tip', label: 'Privacy policy' },
  { key: 'terms', glyph: 'description', label: 'Terms of use' },
  { key: 'a11y', glyph: 'accessibility_new', label: 'Accessibility' },
  { key: 'inbox', glyph: 'inbox', label: 'Inbox' },
  { key: 'favorite', glyph: 'favorite', label: 'Favorites – saved providers' },
  { key: 'signin', glyph: 'login', label: 'Sign in to MyChart' },
  { key: 'shuttle', glyph: 'airport_shuttle', label: 'Shuttle' },
  { key: 'guide', glyph: 'menu_book', label: 'Patient resource guide' },
  { key: 'physicianRes', glyph: 'medical_information', label: 'Resources for physicians' },
  { key: 'covid', glyph: 'coronavirus', label: 'COVID-19 resources' },
  { key: 'website', glyph: 'language', label: 'Full website' },
  { key: 'parking', glyph: 'local_parking', label: 'Parking' },
  { key: 'countdown', glyph: 'schedule', label: 'Hours and times' }
];
/* Alert icons: the alert concept plus situation glyphs (no crosses, per the brand rules) */
const ALERT_ICONS = [
  { glyph: 'warning', label: 'Warning (default)' }, { glyph: 'thunderstorm', label: 'Severe weather' }, { glyph: 'ac_unit', label: 'Ice and snow' },
  { glyph: 'construction', label: 'Construction or repair' }, { glyph: 'local_parking', label: 'Parking' }, { glyph: 'water_drop', label: 'Water' }, { glyph: 'power_off', label: 'Power outage' },
  { glyph: 'coronavirus', label: 'Public health' }, { glyph: 'no_transfer', label: 'Transport disruption' }
];
const iconLabel = g => (APPROVED_ICONS.find(i => i.glyph === g) || ALERT_ICONS.find(i => i.glyph === g) || { label: g }).label;

/* Destinations. Types and targets are pending UTSW confirmation (HANDOVER §10.8). */
const DEST_TYPES = [['screen', 'App screen'], ['mychart', 'MyChart (sign-in hand-off)'], ['url', 'Web page'], ['phone', 'Phone number'], ['none', 'No destination']];
const APP_SCREENS = ['Find Care', 'Search', 'Locations', 'Wayfinding', 'MyChart sign-in', 'MedBlog', 'Inbox', 'Favorites', 'New patient guide', 'Billing and insurance', 'Patient resources', 'Shuttle', 'Urgent care wait times', 'Price estimates', 'Visitor guidelines', 'Flu shot locations', 'Financial assistance', 'Video visit device test', 'Virtual urgent care', 'Help and contact us', 'Privacy policy', 'Language'];
const MYCHART_TARGETS = ['Messages', 'Test results', 'Visits', 'Billing', 'Create an account'];
const destLabel = d => !d || d.type === 'none' ? 'No destination' : d.type === 'screen' ? `App: ${d.value}` : d.type === 'mychart' ? `MyChart: ${d.value}` : d.type === 'phone' ? `Call ${d.value}` : d.value;

/* Article art, designs/guest ART (line 1985). Campaign and notification images pick from these sample images. */
const ART = {
  a: '<rect width="304" height="144" fill="#004278"/><circle cx="268" cy="8" r="120" fill="#336893"/><path d="M160 -12v72a56 56 0 0 0 112 0v-72" fill="none" stroke="#7BAFD4" stroke-width="20" stroke-linecap="round"/><circle cx="216" cy="64" r="12" fill="#00A9E0"/><circle cx="56" cy="112" r="40" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>',
  b: '<rect width="304" height="144" fill="#D6E4F0"/><circle cx="212" cy="72" r="52" fill="#004278"/><circle cx="236" cy="56" r="44" fill="#D6E4F0"/><g fill="#336893"><circle cx="72" cy="40" r="3"/><circle cx="104" cy="88" r="2"/><circle cx="56" cy="104" r="2"/><circle cx="132" cy="36" r="2"/></g><circle cx="168" cy="100" r="8" fill="#00A9E0"/>',
  c: '<rect width="304" height="144" fill="#336893"/><rect x="96" y="28" width="148" height="96" rx="16" fill="#004278"/><circle cx="170" cy="70" r="20" fill="#7BAFD4"/><path d="M136 124a34 34 0 0 1 68 0" fill="#7BAFD4"/><circle cx="226" cy="44" r="6" fill="#00A9E0"/><circle cx="40" cy="24" r="64" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>',
  d: '<rect width="304" height="144" fill="#7BAFD4"/><circle cx="232" cy="64" r="64" fill="#D6E4F0"/><circle cx="232" cy="64" r="36" fill="none" stroke="#004278" stroke-width="10"/><circle cx="72" cy="120" r="48" fill="#336893" opacity=".5"/><circle cx="232" cy="64" r="8" fill="#00A9E0"/>',
  e: '<rect width="304" height="144" fill="#004278"/><path d="M-20 150L120 40L200 110L330 0V150Z" fill="#336893"/><circle cx="120" cy="40" r="22" fill="#7BAFD4"/><circle cx="200" cy="110" r="22" fill="#7BAFD4"/><circle cx="252" cy="36" r="10" fill="#00A9E0"/>',
  f: '<rect width="304" height="144" fill="#EBF0F5"/><circle cx="96" cy="72" r="58" fill="#D6E4F0"/><circle cx="96" cy="72" r="58" fill="none" stroke="#004278" stroke-width="8" stroke-dasharray="10 12"/><circle cx="220" cy="48" r="30" fill="#7BAFD4"/><circle cx="96" cy="72" r="10" fill="#00A9E0"/><circle cx="252" cy="108" r="16" fill="#336893"/>'
};
const ART_NAMES = { a: 'Sample image A – arcs on Blue', b: 'Sample image B – circles on sky', c: 'Sample image C – card on Blue', d: 'Sample image D – ring on light blue', e: 'Sample image E – peaks on Blue', f: 'Sample image F – dashed ring on tint' };

/* Content that stays outside the Admin (MedBlog feed, announcements, sample saved providers) – Guest Flow 2 sample content.
   Top and popular searches are managed in Search configuration. */
const STATIC_CONTENT = {
  blog: [
    { t: 'Starting a new medicine? Five questions to ask your pharmacist', cat: 'Medicines', d: 'Oct. 7', read: '4 min' },
    { t: 'Knee pain when you run: when to see a doctor', cat: 'Bones and joints', d: 'Oct. 5', read: '5 min' },
    { t: 'Inflammation and your heart: what the research says', cat: 'Heart health', d: 'Oct. 1', read: '6 min' },
    { t: 'Five ways to get ready for flu season', cat: 'Prevention', d: 'Sept. 28', read: '3 min' },
    { t: 'Skin checks at home: what to look for and when to call', cat: 'Cancer', d: 'Sept. 23', read: '4 min' }
  ],
  announcements: [
    { d: 'Oct. 9', t: 'Saturday hours at Lakeview Primary Care', s: 'Open 8 a.m. to noon starting Oct. 17.', isNew: true },
    { d: 'Oct. 2', t: 'Updated visitor guidelines', s: 'Two visitors per patient on inpatient units.' },
    { d: 'Sept. 28', t: 'Find a doctor by language', s: 'Filter providers by the languages they speak.' }
  ],
  /* Shown only on devices that have saved providers (fictional providers from the design) */
  saved: [
    { n: 'Avery Morgan, M.D.', s: 'Orthopaedic Surgery · Lakeview University Hospital', i: 'AM', a: 'a1' },
    { n: 'Priya Shah, M.D.', s: 'Cardiology · Northgate Heart and Skin Clinic', i: 'PS', a: 'a2' }
  ],
  /* Personalised homepage sample patient (designs/guest lines 2072–2090), used by the authenticated preview */
  visits: [
    { m: 'Oct.', d: '21', t: '9:30 a.m.', who: 'Avery Morgan, M.D.', type: 'Follow-up visit – knee', where: 'Lakeview University Hospital' },
    { m: 'Oct.', d: '28', t: '4:15 p.m.', who: 'Sam Okafor, M.D.', type: 'Sports medicine visit', where: 'Riverside Sports Medicine' }
  ],
  near: [
    { t: 'Lakeview Primary Care', s: '2.1 mi · Open until 5 p.m.' },
    { t: 'Northgate Heart and Skin Clinic', s: '5.8 mi · Open until 6 p.m.' },
    { t: 'Lakeview University Hospital', s: '2.4 mi · Open 24 hours' }
  ]
};

/* Home modules – the Guest Flow 2 CMS module layout. Alerts and the Find Care hero are pinned; the rest are ordered by the Admin.
   Authenticated modules come from the personalised homepage prototype until the signed-in home is designed. */
const HOME_FIXED = [
  { id: 'alerts', label: 'Emergency alerts', desc: 'Pinned to top while active · Emergency before advisory, then newest. Managed in Emergency alerts.', icon: 'warning', link: 'home-alerts' },
  { id: 'hero', label: 'Welcome, search, and top searches', desc: 'Pinned below alerts · Find Care search and four top searches. Top searches are managed in Search configuration.', icon: 'search', link: 'search-top' }
];
const HOME_MODULES = {
  tiles: { label: 'Quick links', desc: 'Four tiles in a 2 × 2 grid, managed in Quick links. All open MyChart.', icon: 'apps', link: 'home-quick-links' },
  mychart: { label: 'MyChart sign-in card', desc: 'Guest only · Sign in or create a MyChart account.', icon: 'login', guestOnly: true },
  featured: { label: 'MedBlog', desc: 'Story cards for the newest MedBlog stories, with See all.', icon: 'newspaper' },
  campaign: { label: 'Campaign banner', desc: 'The live campaign, managed in Campaigns. Ended campaigns hide automatically.', icon: 'campaign', link: 'home-campaigns' },
  services: { label: 'Services and resources', desc: 'Swipeable cards managed in Services and resources.', icon: 'library_books', link: 'home-featured-cards' },
  news: { label: 'Announcements', desc: 'Newest first, with a New tag on recent ones.', icon: 'feed' },
  saved: { label: 'Your saved providers', desc: 'Shows only when this device has saved providers.', icon: 'favorite' },
  visits: { label: 'Your next visits', desc: 'Upcoming visits from MyChart. Read only – Epic stays the source.', icon: 'calendar_month' },
  near: { label: 'Near you', desc: 'Closest UT Southwestern locations to the patient.', icon: 'near_me' }
};
const AUDIENCE_MODULES = {
  guest: ['tiles', 'mychart', 'featured', 'campaign', 'services', 'news', 'saved'],
  authenticated: ['visits', 'tiles', 'near', 'featured', 'campaign', 'services', 'news', 'saved']
};

/* Audience attributes – only non-clinical, device or account-state attributes (no PHI). Pending UTSW approval (§10.13). */
const AUDIENCE_ATTRS = {
  signedIn: { label: 'Sign-in state', ops: ['is'], values: ['Guest', 'Signed in to MyChart'] },
  language: { label: 'App language', ops: ['is', 'is not'], values: ['English', 'Spanish'] },
  region: { label: 'Region (from shared location or ZIP)', ops: ['is', 'is not'], values: ['Dallas', 'Collin County', 'Denton County', 'Tarrant County', 'Outside North Texas'] },
  locationShared: { label: 'Location sharing', ops: ['is'], values: ['On', 'Off'] },
  platform: { label: 'Platform', ops: ['is'], values: ['iOS', 'Android'] },
  appVersion: { label: 'App version', ops: ['at least', 'below'], values: ['5.0', '5.1', '5.2'] }
};

const ROLE_USERS = [
  { id: 'u1', first: 'Dana', last: 'Whitfield', email: 'dana.whitfield@utsw.example', role: 'superAdmin', status: 'active', created: '2026-06-02T15:00:00Z', lastSignIn: '2026-10-30T13:10:00Z' },
  { id: 'u2', first: 'Chris', last: 'Okoro', email: 'chris.okoro@utsw.example', role: 'admin', status: 'active', created: '2026-06-02T15:20:00Z', lastSignIn: '2026-10-29T21:40:00Z' },
  { id: 'u3', first: 'Priya', last: 'Raman', email: 'priya.raman@utsw.example', role: 'marketing', status: 'active', created: '2026-07-14T14:00:00Z', lastSignIn: '2026-10-30T12:05:00Z' }
];

function seedDb() {
  const t = s => new Date(s).toISOString();
  const evt = (action, environment, version, by, at, comment) => ({ id: uid('ev'), action, environment, version, by, at: t(at), comment });
  const ver = (version, data, by, at, comment) => ({ version, data, updatedBy: by, updatedAt: t(at), comment });
  /* states: live (v1 on demo and production), ahead (v1 production, v2 on demo), draft (never published), live+draft */
  const rec = (id, type, name, data, { state = 'live', by = 'u2', at = '2026-10-01T15:00:00Z', next = null, comment = 'Initial version' } = {}) => {
    const r = { id, type, name, versions: {}, production: null, demo: null, draft: null, review: null, nextVersion: 1, events: [] };
    if (state === 'draft') {
      r.draft = { data, updatedBy: by, updatedAt: t(at), comment, baseVersion: null };
      r.events.push(evt('Draft saved', 'draft', null, by, at, comment));
      return r;
    }
    r.versions[1] = ver(1, data, by, at, comment); r.production = 1; r.demo = 1; r.nextVersion = 2;
    r.events.push(evt('Deployed to demo', 'demo', 1, by, at, comment), evt('Published to production', 'production', 1, 'u1', new Date(new Date(at).getTime() + 36e5).toISOString(), 'Checked on demo devices'));
    if (state === 'ahead' && next) {
      r.versions[2] = ver(2, next, 'u2', '2026-10-28T16:00:00Z', 'Updated copy for review'); r.demo = 2; r.nextVersion = 3;
      r.events.push(evt('Deployed to demo', 'demo', 2, 'u2', '2026-10-28T16:00:00Z', 'Updated copy for review'));
    }
    if (state === 'live+draft' && next) {
      r.draft = { data: next, updatedBy: 'u3', updatedAt: t('2026-10-29T18:30:00Z'), comment: 'Holiday hours', baseVersion: 1 };
      r.review = { by: 'u3', at: t('2026-10-29T18:32:00Z'), comment: 'Ready for review' };
      r.events.push(evt('Draft saved', 'draft', null, 'u3', '2026-10-29T18:30:00Z', 'Holiday hours'), evt('Review requested', 'draft', null, 'u3', '2026-10-29T18:32:00Z', 'Ready for review'));
    }
    return r;
  };
  const records = [];

  /* ---- Home layouts ---- */
  const mods = (order, off = []) => order.map(id => ({ id, on: !off.includes(id) }));
  const head = ['alerts', 'hero'];
  const g = rec('home-layout-guest', 'homeLayout', 'Guest home layout', { head, modules: mods(['tiles', 'mychart', 'featured', 'services', 'news', 'campaign', 'saved'], ['campaign']) }, { by: 'u1', at: '2026-09-08T14:05:00Z', comment: 'Initial guest home from the approved design' });
  g.versions[2] = ver(2, { head, modules: mods(['tiles', 'campaign', 'mychart', 'featured', 'services', 'news', 'saved']) }, 'u2', '2026-09-29T15:30:00Z', 'Turn on the flu campaign and move it up for launch week');
  g.versions[3] = ver(3, { head, modules: mods(['tiles', 'mychart', 'featured', 'campaign', 'services', 'news', 'saved']) }, 'u2', '2026-10-14T13:45:00Z', 'Guest Flow 2 order: campaign after MedBlog, then Services and resources');
  g.production = 3; g.demo = 3; g.nextVersion = 4;
  g.events.push(
    evt('Draft saved', 'draft', null, 'u3', '2026-09-26T19:12:00Z', 'Flu campaign launch'), evt('Review requested', 'draft', null, 'u3', '2026-09-26T19:14:00Z', 'Please review for the Sept. 29 launch'),
    evt('Deployed to demo', 'demo', 2, 'u2', '2026-09-29T15:30:00Z', 'Turn on the flu campaign and move it up for launch week'), evt('Published to production', 'production', 2, 'u2', '2026-09-29T17:00:00Z', 'Flu campaign launch'),
    evt('Deployed to demo', 'demo', 3, 'u2', '2026-10-14T13:45:00Z', 'Guest Flow 2 order: campaign after MedBlog, then Services and resources'), evt('Published to production', 'production', 3, 'u1', '2026-10-14T15:20:00Z', 'Checked on demo devices'));
  records.push(g);
  records.push(rec('home-layout-authenticated', 'homeLayout', 'Authenticated home layout', { head, modules: mods(['visits', 'tiles', 'near', 'featured', 'campaign', 'services', 'news', 'saved']) }, { by: 'u1', at: '2026-10-20T15:00:00Z', comment: 'From the personalised homepage prototype – pending the signed-in design' }));

  /* ---- Campaigns (SOW: three to five for the MVP) ---- */
  const camp = (o) => ({ type: 'Seasonal', tag: 'Flu season', icon: 'vaccines', description: '', ctaLabel: 'Learn more', destination: { type: 'screen', value: 'Find Care' }, audience: 'seg-all', start: '2026-10-01T08:00', end: '2026-12-31T23:59', timeZone: TZ, enabled: true, ...o });
  records.push(rec('campaign-flu', 'campaign', 'Flu shots are here', camp({ title: 'Flu shots are here', tag: 'Flu season', icon: 'syringe', description: 'Walk-in flu shot clinics are open weekdays, 8 a.m. to 5 p.m., through Dec. 18.', ctaLabel: 'Find a flu shot clinic', destination: { type: 'screen', value: 'Flu shot locations' }, start: '2026-10-01T06:00', end: '2026-11-30T23:59' }), { at: '2026-09-28T15:00:00Z' }));
  records.push(rec('campaign-summer', 'campaign', 'Summer safety', camp({ type: 'Seasonal', tag: 'Summer safety', icon: 'health_and_safety', title: 'Beat the heat this summer', description: 'Know the signs of heat illness and when to get care.', ctaLabel: 'Read the tips', destination: { type: 'screen', value: 'MedBlog' }, start: '2026-06-01T08:00', end: '2026-09-30T23:59' }), { at: '2026-05-28T15:00:00Z' }));
  records.push(rec('campaign-estimates', 'campaign', 'Know your costs before your visit', camp({ type: 'Service', tag: 'New online', icon: 'receipt_long', title: 'Know your costs before your visit', description: 'Get a price estimate based on your insurance in about 5 minutes.', ctaLabel: 'Get an estimate', destination: { type: 'screen', value: 'Price estimates' }, start: '2027-01-04T08:00', end: '2027-02-26T23:59' }),
    { state: 'ahead', at: '2026-10-20T15:00:00Z', next: camp({ type: 'Service', tag: 'New online', icon: 'receipt_long', title: 'Know your costs before your visit', description: 'Get a price estimate based on your insurance in about 5 minutes, in English or Spanish.', ctaLabel: 'Get an estimate', destination: { type: 'screen', value: 'Price estimates' }, start: '2027-01-04T08:00', end: '2027-02-26T23:59' }) }));
  records.push(rec('campaign-mammogram', 'campaign', 'Schedule your mammogram', camp({ type: 'Awareness', tag: 'Breast cancer awareness', icon: 'calendar_month', title: 'Schedule your mammogram', description: 'Screening finds cancer early, when it’s easiest to treat. Most plans cover a yearly mammogram.', ctaLabel: 'Schedule now', destination: { type: 'mychart', value: 'Visits' }, audience: 'seg-signedin', start: '2026-10-01T08:00', end: '2026-10-31T23:59' }), { at: '2026-09-25T15:00:00Z' }));
  records.push(rec('campaign-frisco', 'campaign', 'Now open in Frisco', camp({ type: 'Announcement', tag: 'New location', icon: 'location_on', title: 'Now open in Frisco', description: 'Primary care, imaging, and physical therapy under one roof at our new Frisco clinic.', ctaLabel: 'Get directions', destination: { type: 'screen', value: 'Locations' }, audience: 'seg-all', start: '2026-12-01T08:00', end: '2027-02-28T23:59' }), { state: 'draft', by: 'u3', at: '2026-10-29T20:00:00Z', comment: 'First draft for review' }));

  /* ---- Emergency alerts (ALERTS, line 1819) ---- */
  const al = o => ({ level: 'emergency', type: 'Weather', icon: 'warning', message: '', details: '', where: '', phone: '', audience: 'seg-all', start: '2026-10-14T07:15', end: '2026-10-15T07:00', timeZone: TZ, duration: 'window', dismissible: false, enabled: true, ...o });
  records.push(rec('alert-weather', 'alert', 'Severe weather: Clinics close at 3 p.m. today', al({ title: 'Severe weather: Clinics close at 3 p.m. today', icon: 'thunderstorm', message: 'All outpatient clinics close at 3 p.m. Wednesday, Oct. 14, because of forecast storms and hail. Emergency departments stay open.', details: 'If your visit is after 3 p.m. today, your care team will contact you to reschedule. Video visits will go ahead as planned. If you have a medical emergency, call 911 or go to the nearest emergency department.', where: 'All outpatient clinics (sample alert)', phone: '214-555-0100' }), { at: '2026-10-14T12:15:00Z', by: 'u1' }));
  records.push(rec('alert-garage', 'alert', 'Garage C entrance closed Oct. 14–16', al({ level: 'advisory', type: 'Parking', icon: 'local_parking', title: 'Garage C entrance closed Oct. 14–16', message: 'Use the north entrance on Sample Parkway while crews repair the ramp. Valet parking is free during the closure.', details: 'The north entrance stays open 24 hours a day. Allow 10 extra minutes to park and walk to your appointment.', where: 'Lakeview campus, Garage C (sample alert)', phone: '214-555-0120', start: '2026-10-12T08:00', end: '2026-10-16T18:00', dismissible: true }), { at: '2026-10-12T13:00:00Z' }));
  records.push(rec('alert-network', 'alert', 'MyChart maintenance Sunday night', al({ level: 'advisory', title: 'MyChart maintenance Sunday night', type: 'Service disruption', icon: 'power_off', message: 'MyChart is unavailable Sunday, Nov. 22, from midnight to 4 a.m. for maintenance.', start: '2026-11-21T18:00', end: '2026-11-22T04:00', dismissible: true, duration: '24h' }), { state: 'draft', by: 'u2', at: '2026-11-10T17:00:00Z', comment: 'Planned maintenance notice' }));

  /* ---- Quick links: four MyChart tasks (Guest Flow 2) ---- */
  const ql = (k, title, icon, dest, locked, order) => rec(`quick-link-${k}`, 'quickLink', title, { title, icon, iconAlt: '', destination: dest, requiresSignIn: locked, order, enabled: true }, { at: '2026-09-08T14:00:00Z', by: 'u1' });
  records.push(
    ql('msg', 'Message your doctor', 'chat', { type: 'mychart', value: 'Messages' }, true, 1), ql('res', 'Get your test results', 'labs', { type: 'mychart', value: 'Test results' }, true, 2),
    ql('visits', 'Manage Your Visits', 'calendar_month', { type: 'mychart', value: 'Visits' }, true, 3), ql('bill', 'Manage Billing', 'credit_card', { type: 'mychart', value: 'Billing' }, true, 4));

  /* ---- Services and resources cards (type featuredCard): category label, title, one line of help (Guest Flow 2) ---- */
  const fc = (k, category, title, subtitle, icon, dest, order, opts) => rec(`featured-card-${k}`, 'featuredCard', title, { category, title, subtitle, icon, iconAlt: '', destination: dest, order, enabled: true }, { at: '2026-09-08T14:00:00Z', by: 'u1', ...opts });
  records.push(
    fc('wayres', 'Wayfinding', 'Directions on campus', 'Turn-by-turn directions inside and outside our main campuses', 'route', { type: 'screen', value: 'Wayfinding' }, 1),
    fc('video', 'Video visits', 'Prepare for a video visit', 'Check your device and connection before your visit', 'videocam', { type: 'screen', value: 'Video visit device test' }, 2),
    fc('guide', 'Resources', 'New patient guide', 'Insurance, forms, and what to bring', 'article', { type: 'screen', value: 'New patient guide' }, 3),
    fc('billing', 'Resources', 'Billing and insurance', 'Estimates, payment plans, and help', 'receipt_long', { type: 'screen', value: 'Billing and insurance' }, 4, { state: 'live+draft', next: { category: 'Resources', title: 'Billing and insurance', subtitle: 'Estimates, payment plans, and financial assistance', icon: 'receipt_long', iconAlt: '', destination: { type: 'screen', value: 'Billing and insurance' }, order: 4, enabled: true } }),
    fc('aid', 'Resources', 'Financial assistance', 'See if you qualify for help with costs', 'volunteer_activism', { type: 'screen', value: 'Financial assistance' }, 5, { state: 'draft', by: 'u3', at: '2026-10-29T18:30:00Z', comment: 'Proposed fifth card' }));

  /* ---- Content and navigation ---- */
  const di = (id, label, icon, dest, visible = true, sub = '') => ({ id, label, sub, icon, destination: dest, visible });
  records.push(rec('drawer', 'drawer', 'Menu', { sections: [
    { id: 'updates', label: 'Updates', items: [di('inbox', 'Inbox', 'inbox', { type: 'screen', value: 'Inbox' }, true, 'Updates from UTSW MyCare'), di('saved', 'Saved providers', 'favorite', { type: 'screen', value: 'Favorites' }, true, 'Doctors you save appear here'), di('locs', 'Locations', 'location_on', { type: 'screen', value: 'Locations' }, true, 'Hospitals, clinics, and urgent care'), di('signin', 'Sign in to MyChart', 'login', { type: 'screen', value: 'MyChart sign-in' }, true, 'Messages, test results, visits, and billing'), di('medblog', 'MedBlog', 'newspaper', { type: 'screen', value: 'MedBlog' }, true, 'Health news and tips from our experts')] },
    { id: 'patients', label: 'Patients and visitors', items: [di('presources', 'Patient resources', 'folder_open', { type: 'screen', value: 'Patient resources' }, true, 'Billing, records, forms, and support'), di('guide', 'Patient resource guide', 'menu_book', { type: 'url', value: 'https://utswmed.example/guide' }, true, 'Your guide to care at UT Southwestern'), di('shuttle', 'Shuttle', 'airport_shuttle', { type: 'screen', value: 'Shuttle' }, true, 'Routes and times between campuses'), di('covid', 'COVID-19 resources', 'coronavirus', { type: 'url', value: 'https://utswmed.example/covid-19' }, true, 'Testing, vaccines, and visitor guidelines')] },
    { id: 'about', label: 'About UT Southwestern', items: [di('why', 'Why UT Southwestern', 'workspace_premium', { type: 'screen', value: 'Why UT Southwestern' }, true, 'Our care, research, and rankings'), di('physician', 'Resources for physicians', 'medical_information', { type: 'url', value: 'https://utswmed.example/physicians' }, true, 'Referrals and clinical tools'), di('website', 'Visit the full website', 'language', { type: 'url', value: 'https://utswmed.example' }, true, 'utsouthwestern.edu')] },
    { id: 'social', label: 'Follow us', style: 'chips', items: ['Facebook', 'Instagram', 'LinkedIn', 'X'].map(x => di(`so-${x.toLowerCase()}`, x, 'public', { type: 'url', value: `https://${x === 'X' ? 'x' : x.toLowerCase()}.example/utsouthwestern` })) },
    { id: 'legal', label: '', items: [di('privacy', 'Privacy policy', 'privacy_tip', { type: 'url', value: 'https://utswmed.example/privacy' }), di('terms', 'Terms of use', 'description', { type: 'url', value: 'https://utswmed.example/terms' }), di('a11y', 'Accessibility', 'accessibility_new', { type: 'url', value: 'https://utswmed.example/accessibility' })] }
  ] }, { at: '2026-09-08T14:00:00Z', by: 'u1' }));
  records.push(rec('global-colors', 'globalColors', 'Global colors', { primary: '#004278', secondary: '#336893', tertiary: '#7BAFD4', background: '#F7F8FA' }, { by: 'u1', at: '2026-09-08T14:00:00Z' }));
  records.push(rec('app-entry', 'appEntry', 'App entry', { onboardingVisible: true, eulaVisible: false, eulaVersion: '1.0 (sample)', eulaText: 'By using MyCare, you agree to the terms of use and privacy notice. MyCare doesn’t replace emergency care. In an emergency, call 911. (Sample text – the approved EULA is pending.)', reacceptOnChange: true, loginPromptVisible: true, loginPromptType: 'choice' }, { by: 'u1', at: '2026-09-08T14:00:00Z' }));

  /* ---- Search (SYN line 1894, TOP 1983, POPULAR 1984, SORTS 2489) ---- */
  records.push(rec('search-mappings', 'searchMappings', 'Query mappings', { rows: [
    { id: 'm1', phrase: 'knee pain doctor', targetType: 'Condition', target: 'Knee pain' }, { id: 'm2', phrase: 'flu shot', targetType: 'Content', target: 'Flu shots are here' },
    { id: 'm3', phrase: 'parking', targetType: 'Scope', target: 'Locations' }, { id: 'm4', phrase: 'pay my bill', targetType: 'Resource', target: 'Pay a bill as a guest' },
    { id: 'm5', phrase: 'er wait', targetType: 'Resource', target: 'Urgent care wait times' }] }, { at: '2026-09-20T15:00:00Z' }));
  records.push(rec('search-synonyms', 'searchSynonyms', 'Synonyms', { rows: [
    ['skin doc', 'Dermatology'], ['derm', 'Dermatology'], ['heart doctor', 'Cardiology'], ['cardio', 'Cardiology'], ['bone doctor', 'Orthopaedics'], ['ortho', 'Orthopaedics'],
    ['pcp', 'Primary care'], ['family doctor', 'Primary care'], ['obgyn', 'Obstetrics and Gynecology'], ['gi', 'Gastroenterology'], ['afib', 'Atrial fibrillation'], ['pt', 'Allied Health – Physical Therapy']
  ].map(([term, to], i) => ({ id: `s${i + 1}`, term, to })) }, { at: '2026-09-20T15:00:00Z' }));
  records.push(rec('search-specialties', 'searchSpecialties', 'Specialty mapping', { rows: [
    ['Dermatology', 'skin, rash, acne, eczema, moles'], ['Cardiology', 'heart, chest pain, blood pressure'], ['Orthopaedics', 'bones, joints, knee, hip, shoulder'],
    ['Primary care', 'checkup, physical, annual exam'], ['Gastroenterology', 'stomach, reflux, colonoscopy'], ['Neurology', 'headache, migraine, seizures'],
    ['Obstetrics and Gynecology', 'pregnancy, prenatal, women’s health'], ['Allied Health – Physical Therapy', 'rehab, physical therapy, sports injury']
  ].map(([specialty, terms], i) => ({ id: `sp${i + 1}`, specialty, terms })) }, { at: '2026-09-20T15:00:00Z' }));
  records.push(rec('search-top', 'searchTop', 'Top and popular searches', { rows: [
    ['Primary care', 'home'], ['Knee pain', 'home'], ['Urgent care', 'home'], ['Heart doctor', 'home'],
    ['Primary care', 'popular'], ['Knee pain', 'popular'], ['Heart doctor', 'popular'], ['Spanish-speaking pediatrician', 'popular'], ['Dermatology', 'popular'], ['Accepting new patients', 'popular']
  ].map(([term, where], i) => ({ id: `t${i + 1}`, term, where })) }, { at: '2026-10-02T15:00:00Z' }));
  records.push(rec('search-ranking', 'searchRanking', 'Ranking', { relevance: 60, distance: 25, availability: 10, language: 5, featuredLabelled: true, defaultSort: 'Best match', sorts: ['Best match', 'Distance', 'Name A–Z', 'Featured'] }, { at: '2026-09-20T15:00:00Z', by: 'u1' }));

  /* ---- Location-aware configuration (LOCS, line 1829) ---- */
  const loc = (id, name, type, message, parking, indoor) => ({ id, name, type, message, parking, indoor, enabled: true });
  records.push(rec('locations', 'locations', 'Location-aware configuration', { rows: [
    loc('cuh', 'William P. Clements Jr. University Hospital', 'Hospital', 'Check in at the main lobby on level 1.', 'Garage A (sample), patient rate $5 a day', true),
    loc('zale', 'Zale Lipshy Pavilion', 'Hospital', 'Use the east entrance during the water main repair.', 'Valet at the east drive', true),
    loc('obb', 'Sample Outpatient Building', 'Building', 'Elevators to clinics are past the coffee shop.', 'Garage A (sample)', true),
    loc('fr', 'UTSW Frisco (sample)', 'Clinic', 'Free surface parking in front of the building.', 'Surface lot, free', false),
    loc('rp', 'UTSW Richardson/Plano (sample)', 'Clinic', '', 'Surface lot, free', false),
    loc('rb', 'UTSW RedBird (sample)', 'Clinic', 'Enter through the south doors.', 'Surface lot, free', true)] }, { at: '2026-10-02T15:00:00Z' }));

  /* ---- Audience segments ---- */
  const seg = (id, name, description, rules, match = 'all', reach = 0) => rec(id, 'segment', name, { name, description, match, rules, reach }, { at: '2026-09-10T15:00:00Z', by: 'u2' });
  records.push(
    seg('seg-all', 'All app users', 'Everyone who uses MyCare, signed in or not.', [], 'all', 182400),
    seg('seg-guests', 'Guests', 'People using MyCare without signing in to MyChart.', [{ attr: 'signedIn', op: 'is', value: 'Guest' }], 'all', 71300),
    seg('seg-signedin', 'Signed-in patients', 'People signed in to MyChart in the app.', [{ attr: 'signedIn', op: 'is', value: 'Signed in to MyChart' }], 'all', 111100));

  /* ---- Wayfinding (manual Gozio JSON export; schema is a placeholder) ---- */
  const wf = (version, fileName, by, at, status, stats, comment) => ({ version, fileName, sizeKb: stats.kb, by, at: t(at), status, buildings: stats.b, floors: stats.f, destinations: stats.d, comment, warnings: stats.w || 0 });
  const wayfinding = {
    production: 3, demo: 3,
    versions: [
      wf(1, 'gozio-export-2026-08-28.json', 'u2', '2026-08-28T15:00:00Z', 'retired', { kb: 412, b: 4, f: 21, d: 1188 }, 'First import'),
      wf(2, 'gozio-export-2026-09-19.json', 'u2', '2026-09-19T15:00:00Z', 'retired', { kb: 418, b: 4, f: 21, d: 1203 }, 'New imaging suite on level 2'),
      wf(3, 'gozio-export-2026-10-17.json', 'u1', '2026-10-17T15:00:00Z', 'production', { kb: 425, b: 5, f: 24, d: 1236, w: 2 }, 'Adds the Outpatient Building')
    ],
    history: [
      { at: t('2026-08-28T15:10:00Z'), by: 'u2', action: 'Uploaded and validated', version: 1, environment: 'draft', comment: 'First import' },
      { at: t('2026-08-28T16:00:00Z'), by: 'u2', action: 'Published to demo', version: 1, environment: 'demo', comment: '' },
      { at: t('2026-08-29T15:00:00Z'), by: 'u1', action: 'Published to production', version: 1, environment: 'production', comment: 'Walked the routes on demo' },
      { at: t('2026-09-19T15:10:00Z'), by: 'u2', action: 'Uploaded and validated', version: 2, environment: 'draft', comment: 'New imaging suite on level 2' },
      { at: t('2026-09-19T16:00:00Z'), by: 'u2', action: 'Published to demo', version: 2, environment: 'demo', comment: '' },
      { at: t('2026-09-22T14:00:00Z'), by: 'u1', action: 'Published to production', version: 2, environment: 'production', comment: '' },
      { at: t('2026-10-17T15:10:00Z'), by: 'u1', action: 'Uploaded and validated', version: 3, environment: 'draft', comment: 'Adds the Outpatient Building' },
      { at: t('2026-10-17T16:00:00Z'), by: 'u1', action: 'Published to demo', version: 3, environment: 'demo', comment: '' },
      { at: t('2026-10-20T14:00:00Z'), by: 'u1', action: 'Published to production', version: 3, environment: 'production', comment: 'Two warnings checked: unnamed storage rooms' }
    ]
  };

  /* ---- Notifications ---- */
  const nt = (id, o) => ({ id, title: '', description: '', sendTo: 'seg-all', timing: 'scheduled', scheduledAt: '', image: 'none', imageAlt: '', videoUrl: '', destination: { type: 'none', value: '' }, status: 'draft', createdBy: 'u3', createdAt: t('2026-10-20T15:00:00Z'), updatedAt: t('2026-10-20T15:00:00Z'), sentAt: null, stats: null, ...o });
  const notifications = [
    nt('n1', { title: 'Flu shots are here', description: 'Walk in on Saturdays, 8 a.m. to noon, at any primary care clinic.', destination: { type: 'screen', value: 'Flu shot locations' }, status: 'sent', scheduledAt: '2026-09-29T08:00', sentAt: t('2026-09-29T13:00:00Z'), createdAt: t('2026-09-26T19:00:00Z'), stats: { delivered: 168250, opened: 31400, actions: 9620 } }),
    nt('n2', { title: 'New visitor hours start Nov. 1', description: 'Two visitors at a time, 8 a.m. to 8 p.m.', destination: { type: 'screen', value: 'Visitor guidelines' }, status: 'sent', scheduledAt: '2026-10-06T09:00', sentAt: t('2026-10-06T14:00:00Z'), createdBy: 'u2', createdAt: t('2026-10-03T15:00:00Z'), stats: { delivered: 179900, opened: 22100, actions: 4380 } }),
    nt('n3', { title: 'Estimate your costs before your visit', description: 'Price estimates are now online. It takes about 5 minutes.', sendTo: 'seg-signedin', destination: { type: 'screen', value: 'Price estimates' }, status: 'scheduled', scheduledAt: '2026-11-03T09:00', createdAt: t('2026-10-27T15:00:00Z'), image: 'b', imageAlt: 'Abstract circles on a sky-blue background' }),
    nt('n4', { title: 'MyCare ahora en español', description: 'Cambie el idioma en MyChart, luego Idioma.', sendTo: 'seg-signedin', destination: { type: 'screen', value: 'Language' }, status: 'draft', scheduledAt: '2026-11-05T10:00', createdAt: t('2026-10-29T16:00:00Z') }),
    nt('n5', { title: 'Our new Frisco clinic opens Dec. 1', description: 'Primary care, imaging, and physical therapy in one place.', destination: { type: 'screen', value: 'Locations' }, status: 'draft', scheduledAt: '2026-12-01T08:00', createdAt: t('2026-10-29T20:10:00Z') }),
    nt('n6', { title: 'Holiday hours', description: 'Most clinics close Thursday, Nov. 26. Emergency departments stay open.', status: 'cancelled', scheduledAt: '2026-11-20T09:00', createdBy: 'u2', createdAt: t('2026-10-15T15:00:00Z') })
  ];

  /* ---- Admin users ---- */
  const u = (id, first, last, role, status, created, lastSignIn) => ({ id, first, last, email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@utsw.example', role, status, created: t(created), lastSignIn: lastSignIn ? t(lastSignIn) : null });
  const users = [...clone(ROLE_USERS),
    u('u4', 'Marcus', 'Bell', 'admin', 'active', '2026-07-01T15:00:00Z', '2026-10-27T18:00:00Z'),
    u('u5', 'Elena', 'Ortiz', 'marketing', 'active', '2026-07-20T15:00:00Z', '2026-10-28T15:30:00Z'),
    u('u6', 'Sam', 'Nakamura', 'marketing', 'invited', '2026-10-27T15:00:00Z', null),
    u('u7', 'Grace', 'Liu', 'admin', 'deactivated', '2026-06-15T15:00:00Z', '2026-08-30T15:00:00Z'),
    u('u8', 'Theo', 'Adams', 'marketing', 'active', '2026-08-04T15:00:00Z', '2026-10-21T13:00:00Z')];

  /* ---- Integrations (all simulated – none is connected) ---- */
  const integrations = [
    { id: 'idp', name: 'UTSW identity provider (SSO and MFA)', purpose: 'Admin sign-in', status: 'simulated', detail: 'Protocol (SAML or OIDC) and MFA mechanism pending' },
    { id: 'mychart', name: 'Epic MyChart', purpose: 'Sign-in hand-off and deep links from the app', status: 'simulated', detail: 'The Admin configures destinations only; Epic stays the source of truth' },
    { id: 'gozio', name: 'Gozio wayfinding', purpose: 'Indoor maps in the app', status: 'manual', detail: 'Manual JSON export and upload; no direct connection' },
    { id: 'push', name: 'Push notification provider', purpose: 'Notifications', status: 'simulated', detail: 'Provider pending' },
    { id: 'analytics', name: 'App analytics', purpose: 'Analytics and reporting', status: 'simulated', detail: 'Data source and metric definitions pending' },
    { id: 'config', name: 'MyCare configuration API', purpose: 'Draft, demo and production publishing', status: 'simulated', detail: 'No backend or API contract exists yet' }
  ];

  /* Zero-result searches, last 30 days (sample) */
  const zeroResults = [['derm near me open saturday', 214], ['mamogram', 188], ['covid booster walk in', 151], ['where do i park clements', 97], ['sleep study', 86], ['pediatric dentist', 64], ['allergist spanish', 52], ['passport photo', 31], ['lactation consultant', 28], ['er wait time', 24]]
    .map(([query, count], i) => ({ id: `z${i + 1}`, query, count, lastSeen: t(`2026-10-${String(30 - (i % 6)).padStart(2, '0')}T15:00:00Z`), status: 'open' }));

  const settings = { sessionTimeout: 30, timeZone: TZ, requirePublishComment: false, previewDefault: 'light' };

  /* Audit log: lifecycle events from every record, plus account events */
  const audit = [];
  records.forEach(r => r.events.forEach(e => audit.push({ id: uid('au'), at: e.at, by: e.by, action: e.action, target: r.name, targetId: r.id, targetType: r.type, environment: e.environment, version: e.version, comment: e.comment, before: null, after: null })));
  audit.push(
    { id: uid('au'), at: t('2026-10-27T15:00:00Z'), by: 'u1', action: 'User invited', target: 'Sam Nakamura', targetId: 'u6', targetType: 'user', environment: null, version: null, comment: '', before: null, after: { role: 'Marketing', status: 'Invited' } },
    { id: uid('au'), at: t('2026-09-01T15:00:00Z'), by: 'u1', action: 'User deactivated', target: 'Grace Liu', targetId: 'u7', targetType: 'user', environment: null, version: null, comment: 'Moved to another department', before: { status: 'Active' }, after: { status: 'Deactivated' } },
    { id: uid('au'), at: t('2026-08-10T15:00:00Z'), by: 'u1', action: 'Role changed', target: 'Theo Adams', targetId: 'u8', targetType: 'user', environment: null, version: null, comment: '', before: { role: 'Admin' }, after: { role: 'Marketing' } });

  return { schema: 7, records: Object.fromEntries(records.map(r => [r.id, r])), users, notifications, wayfinding, integrations, settings, audit, zeroResults };
}
