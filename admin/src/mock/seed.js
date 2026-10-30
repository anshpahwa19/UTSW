/* ==========================================================================================
   MOCK DATA – fictional sample records for the prototype. Nothing here comes from or goes to
   MyCare, Epic/MyChart, Gozio or any UTSW system. Content is seeded from designs/guest/src.html
   (line numbers noted) so the preview matches the patient prototype. People are fictional;
   emails use the reserved .example domain; phone numbers use the prototype's sample numbers.
   ========================================================================================== */

/* Approved icon list: the designs/guest ICON_MAP concepts (line 1712) that CMS tiles may use. One concept, one glyph. */
const APPROVED_ICONS = [
  { key: 'findCare', glyph: 'stethoscope', label: 'Find my Care – providers' },
  { key: 'place', glyph: 'location_on', label: 'Locations' },
  { key: 'wayfinding', glyph: 'directions_walk', label: 'Wayfinding' },
  { key: 'messages', glyph: 'chat', label: 'Message your doctor' },
  { key: 'results', glyph: 'lab_profile', label: 'Test results' },
  { key: 'visits', glyph: 'calendar_month', label: 'Visits' },
  { key: 'bill', glyph: 'receipt_long', label: 'Billing' },
  { key: 'urgent', glyph: 'acute', label: 'Urgent care' },
  { key: 'video', glyph: 'videocam', label: 'Video visits' },
  { key: 'vaccine', glyph: 'vaccines', label: 'Vaccines' },
  { key: 'rank', glyph: 'workspace_premium', label: 'Recognition' },
  { key: 'aid', glyph: 'volunteer_activism', label: 'Financial assistance' },
  { key: 'article', glyph: 'article', label: 'Articles' },
  { key: 'records', glyph: 'folder_open', label: 'Records and forms' },
  { key: 'help', glyph: 'help', label: 'Help and contact' },
  { key: 'privacy', glyph: 'privacy_tip', label: 'Privacy and terms' },
  { key: 'inbox', glyph: 'inbox', label: 'Inbox' },
  { key: 'favorite', glyph: 'favorite', label: 'Saved providers' },
  { key: 'shuttle', glyph: 'directions_bus', label: 'Campus shuttle' },
  { key: 'why', glyph: 'verified', label: 'Why UT Southwestern' },
  { key: 'guide', glyph: 'menu_book', label: 'Patient resource guide' },
  { key: 'patientRes', glyph: 'library_books', label: 'Patient resources' },
  { key: 'physicianRes', glyph: 'badge', label: 'Physician resources' },
  { key: 'covid', glyph: 'coronavirus', label: 'COVID-19 resources' },
  { key: 'website', glyph: 'public', label: 'Full website' },
  { key: 'language', glyph: 'translate', label: 'Language' },
  { key: 'parking', glyph: 'local_parking', label: 'Parking' },
  { key: 'countdown', glyph: 'schedule', label: 'Hours and times' }
];
/* Alert icons: the alert concept plus situation glyphs (no crosses, per the brand rules) */
const ALERT_ICONS = [
  { glyph: 'warning', label: 'Warning (default)' }, { glyph: 'thunderstorm', label: 'Severe weather' }, { glyph: 'ac_unit', label: 'Ice and snow' },
  { glyph: 'construction', label: 'Construction or repair' }, { glyph: 'water_drop', label: 'Water' }, { glyph: 'power_off', label: 'Power outage' },
  { glyph: 'coronavirus', label: 'Public health' }, { glyph: 'no_transfer', label: 'Transport disruption' }
];
const iconLabel = g => (APPROVED_ICONS.find(i => i.glyph === g) || ALERT_ICONS.find(i => i.glyph === g) || { label: g }).label;

/* Destinations. Types and targets are pending UTSW confirmation (HANDOVER §10.8). */
const DEST_TYPES = [['screen', 'App screen'], ['mychart', 'MyChart (sign-in hand-off)'], ['url', 'Web page'], ['phone', 'Phone number'], ['none', 'No destination']];
const APP_SCREENS = ['Find my Care', 'Locations', 'Wayfinding', 'MyChart sign-in', 'MedBlog', 'Inbox', 'Saved providers', 'Campus shuttle', 'Urgent care wait times', 'Price estimates', 'Visitor guidelines', 'Flu shot locations', 'Financial assistance', 'Video visit device test', 'Virtual urgent care', 'Help and contact us', 'Privacy policy', 'Language'];
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

/* Content that stays outside the Admin (MedBlog feed, announcements, top searches) – designs/guest lines 1983–2027 */
const STATIC_CONTENT = {
  top: [['Primary care', 'Providers'], ['Knee pain doctor near Frisco', 'Providers'], ['Urgent care wait times', 'All'], ['Spanish-speaking dermatologist', 'Providers'], ['Parking', 'Locations'], ['Flu shots', 'All']],
  featured: [
    { kick: 'Medications', title: 'Taking a GLP-1? Learn how it may affect your other medications', meta: 'MedBlog · Oct. 7 · 5 min read', art: ART.a },
    { kick: 'Bones and joints', title: 'Are you ruining your knees? The truth about sports injuries and arthritis', meta: 'MedBlog · Oct. 5 · 6 min read', art: ART.e },
    { kick: 'Heart', title: 'Inflammation and the heart: A new approach to cardiovascular disease prevention', meta: 'MedBlog · Oct. 1 · 7 min read', art: ART.d },
    { kick: 'Heart', title: 'Enlicitide: What to know about the new cholesterol-lowering pill', meta: 'MedBlog · Sept. 28 · 5 min read', art: ART.b }
  ],
  announcements: [
    { k: 'ann1', m: 'Oct.', d: '10', t: 'Price estimates are now online', s: 'See costs before your visit' },
    { k: 'ann2', m: 'Oct.', d: '6', t: 'New visitor hours start Nov. 1', s: 'Two visitors at a time, 8 a.m. to 8 p.m.' },
    { k: 'ann3', m: 'Sept.', d: '29', t: 'MyCare now speaks Spanish', s: 'Change it under MyChart, then Language' }
  ],
  /* Personalised homepage sample patient (designs/guest lines 2072–2090), used by the authenticated preview */
  visits: [
    { m: 'Oct.', d: '21', t: '9:30 a.m.', who: 'Riley Okafor, M.D.', type: 'Follow-up visit – knee', where: 'UTSW Frisco (sample)' },
    { m: 'Oct.', d: '28', t: '4:15 p.m.', who: 'Jordan Ellis, PT, DPT', type: 'Physical therapy', where: 'UTSW Frisco (sample)' }
  ],
  near: [
    { t: 'UTSW Frisco (sample)', s: '1.2 mi · Weekdays, 8 a.m. to 5 p.m.' },
    { t: 'UTSW Richardson/Plano (sample)', s: '9.8 mi · Weekdays, 7 a.m. to 6 p.m.' },
    { t: 'Zale Lipshy Pavilion', s: '24 mi · Open 24 hours' }
  ]
};

/* Home modules: labels from MOD_LABELS, fixed header from HEAD, guest order from cfg (lines 2112–2114).
   Authenticated modules come from the personalised homepage prototype until the signed-in home is designed. */
const HOME_FIXED = [
  { id: 'alerts', label: 'Emergency alert banner', desc: 'Shows only while an emergency alert is active. Managed in Emergency alerts.', icon: 'warning' },
  { id: 'greeting', label: 'Welcome', desc: 'Greeting and short intro on the Blue hero.', icon: 'waving_hand' },
  { id: 'search', label: 'Search and top searches', desc: 'Global search field and the top searches row.', icon: 'search' }
];
const HOME_MODULES = {
  tiles: { label: 'Quick links', desc: 'Tiles managed in Quick links.', icon: 'apps', link: 'home-quick-links' },
  signin: { label: 'MyChart sign-in prompt', desc: 'Invites guests to sign in or create a MyChart account.', icon: 'login' },
  featured: { label: 'MedBlog (featured)', desc: 'Carousel of the four newest MedBlog articles.', icon: 'article' },
  services: { label: 'UTSW resources', desc: 'Rows managed in Featured cards.', icon: 'library_books', link: 'home-featured-cards' },
  campaign: { label: 'Campaign banner', desc: 'The active campaign, managed in Campaigns.', icon: 'campaign', link: 'home-campaigns' },
  news: { label: 'Announcements', desc: 'The three newest announcements, with See all.', icon: 'feed' },
  visits: { label: 'Your next visits', desc: 'Upcoming visits from MyChart. Read only – Epic stays the source.', icon: 'calendar_month' },
  near: { label: 'Near you', desc: 'Closest UT Southwestern locations to the patient.', icon: 'near_me' }
};
const AUDIENCE_MODULES = {
  guest: ['tiles', 'signin', 'featured', 'services', 'campaign', 'news'],
  authenticated: ['visits', 'tiles', 'near', 'featured', 'services', 'campaign', 'news']
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
  const head = ['alerts', 'greeting', 'search'];
  const g = rec('home-layout-guest', 'homeLayout', 'Guest home layout', { head, modules: mods(['tiles', 'signin', 'featured', 'services', 'news', 'campaign'], ['campaign']) }, { by: 'u1', at: '2026-09-08T14:05:00Z', comment: 'Initial guest home from the approved design' });
  g.versions[2] = ver(2, { head, modules: mods(['tiles', 'signin', 'campaign', 'featured', 'services', 'news']) }, 'u2', '2026-09-29T15:30:00Z', 'Turn on the flu campaign and move it up for launch week');
  g.versions[3] = ver(3, { head, modules: mods(['tiles', 'signin', 'featured', 'services', 'campaign', 'news']) }, 'u2', '2026-10-14T13:45:00Z', 'Move the campaign below UTSW resources after launch week');
  g.production = 3; g.demo = 3; g.nextVersion = 4;
  g.events.push(
    evt('Draft saved', 'draft', null, 'u3', '2026-09-26T19:12:00Z', 'Flu campaign launch'), evt('Review requested', 'draft', null, 'u3', '2026-09-26T19:14:00Z', 'Please review for the Sept. 29 launch'),
    evt('Deployed to demo', 'demo', 2, 'u2', '2026-09-29T15:30:00Z', 'Turn on the flu campaign and move it up for launch week'), evt('Published to production', 'production', 2, 'u2', '2026-09-29T17:00:00Z', 'Flu campaign launch'),
    evt('Deployed to demo', 'demo', 3, 'u2', '2026-10-14T13:45:00Z', 'Move the campaign below UTSW resources after launch week'), evt('Published to production', 'production', 3, 'u1', '2026-10-14T15:20:00Z', 'Checked on demo devices'));
  records.push(g);
  records.push(rec('home-layout-authenticated', 'homeLayout', 'Authenticated home layout', { head, modules: mods(['visits', 'tiles', 'near', 'featured', 'services', 'campaign', 'news']) }, { by: 'u1', at: '2026-10-20T15:00:00Z', comment: 'From the personalised homepage prototype – pending the signed-in design' }));

  /* ---- Campaigns (SOW: three to five for the MVP) ---- */
  const camp = (o) => ({ type: 'Seasonal', tag: 'Flu season', icon: 'vaccines', image: 'none', imageAlt: '', description: '', fact1Label: '', fact1Value: '', fact2Label: '', fact2Value: '', ctaLabel: 'Learn more', destination: { type: 'screen', value: 'Find my Care' }, audience: 'seg-all', start: '2026-10-01T08:00', end: '2026-12-31T23:59', timeZone: TZ, enabled: true, ...o });
  records.push(rec('campaign-flu', 'campaign', 'Flu shots are here', camp({ title: 'Flu shots are here', description: 'Protect yourself and the people around you. It takes about 10 minutes, and most plans cover it.', fact1Label: 'Walk in', fact1Value: 'Saturdays, 8 a.m. to noon', fact2Label: 'Where', fact2Value: 'Any primary care clinic', ctaLabel: 'Find a flu shot', destination: { type: 'screen', value: 'Flu shot locations' }, start: '2026-09-29T06:00', end: '2026-12-15T23:59' }), { at: '2026-09-28T15:00:00Z' }));
  records.push(rec('campaign-estimates', 'campaign', 'Know your costs before your visit', camp({ type: 'Service', tag: 'New online', icon: 'receipt_long', title: 'Know your costs before your visit', description: 'Get a price estimate based on your insurance in about 5 minutes.', fact1Label: 'Takes', fact1Value: 'About 5 minutes', fact2Label: 'You need', fact2Value: 'Your insurance card', ctaLabel: 'Get an estimate', destination: { type: 'screen', value: 'Price estimates' }, start: '2026-11-03T08:00', end: '2027-01-31T23:59' }),
    { state: 'ahead', at: '2026-10-20T15:00:00Z', next: camp({ type: 'Service', tag: 'New online', icon: 'receipt_long', title: 'Know your costs before your visit', description: 'Get a price estimate based on your insurance in about 5 minutes. Estimates are available in English and Spanish.', fact1Label: 'Takes', fact1Value: 'About 5 minutes', fact2Label: 'You need', fact2Value: 'Your insurance card', ctaLabel: 'Get an estimate', destination: { type: 'screen', value: 'Price estimates' }, start: '2026-11-03T08:00', end: '2027-01-31T23:59' }) }));
  records.push(rec('campaign-mammogram', 'campaign', 'Schedule your mammogram', camp({ type: 'Awareness', tag: 'Breast cancer awareness', icon: 'calendar_month', title: 'Schedule your mammogram', description: 'Screening finds cancer early, when it’s easiest to treat. Most plans cover a yearly mammogram.', fact1Label: 'Book', fact1Value: 'Online or by phone', fact2Label: 'Where', fact2Value: '6 imaging centers', ctaLabel: 'Schedule now', destination: { type: 'mychart', value: 'Visits' }, audience: 'seg-signedin', start: '2026-10-01T08:00', end: '2026-10-31T23:59' }), { at: '2026-09-25T15:00:00Z' }));
  records.push(rec('campaign-frisco', 'campaign', 'Now open in Frisco', camp({ type: 'Announcement', tag: 'New location', icon: 'location_on', title: 'Now open in Frisco', description: 'Primary care, imaging, and physical therapy under one roof at our new Frisco clinic.', fact1Label: 'Opens', fact1Value: 'Dec. 1', fact2Label: 'Hours', fact2Value: 'Weekdays, 8 a.m. to 5 p.m.', ctaLabel: 'Get directions', destination: { type: 'screen', value: 'Locations' }, audience: 'seg-collin', image: 'e', imageAlt: 'Abstract Blue peaks', start: '2026-12-01T08:00', end: '2027-02-28T23:59' }), { state: 'draft', by: 'u3', at: '2026-10-29T20:00:00Z', comment: 'First draft for review' }));

  /* ---- Emergency alerts (ALERTS, line 1819) ---- */
  const al = o => ({ type: 'Weather', icon: 'warning', priority: 1, ctaLabel: 'Read full alert', destination: { type: 'none', value: '' }, audience: 'seg-all', start: '2026-10-14T07:45', end: '2026-10-14T23:59', timeZone: TZ, duration: 'window', dismissible: false, enabled: true, details: '', ...o });
  records.push(rec('alert-weather', 'alert', 'Severe weather: Some clinics close at 3 p.m. today', al({ title: 'Severe weather: Some clinics close at 3 p.m. today', icon: 'ac_unit', message: 'Outpatient clinics close early because of an ice storm warning. Emergency departments stay open.', details: 'Because of an ice storm warning for North Texas, outpatient clinics close at 3 p.m. today. If your appointment is affected, a care team member will call you to reschedule. Emergency departments and inpatient units stay open. For questions, call 214-648-3266.', start: '2026-10-30T07:45', end: '2026-10-30T23:59', ctaLabel: 'Call us', destination: { type: 'phone', value: '214-648-3266' } }), { at: '2026-10-30T12:40:00Z', by: 'u1' }));
  records.push(rec('alert-water', 'alert', 'Water main repair: Use the east entrance', al({ title: 'Water main repair: Use the east entrance', type: 'Facility', icon: 'construction', priority: 2, message: 'The west lobby doors at the sample Pavilion are closed until 6 p.m. Follow posted signs.', details: 'Crews are repairing a water main near the west lobby of the sample Pavilion. Use the east entrance until 6 p.m. today. Valet parking has moved to the east drive.', start: '2026-10-30T06:00', end: '2026-10-30T18:00', ctaLabel: 'Get directions', destination: { type: 'screen', value: 'Wayfinding' } }), { at: '2026-10-30T11:00:00Z' }));
  records.push(rec('alert-network', 'alert', 'MyChart maintenance Sunday night', al({ title: 'MyChart maintenance Sunday night', type: 'Service disruption', icon: 'power_off', priority: 3, message: 'MyChart is unavailable Sunday, Nov. 2, from midnight to 4 a.m. for maintenance.', start: '2026-11-01T18:00', end: '2026-11-02T04:00', dismissible: true, duration: '24h' }), { state: 'draft', by: 'u2', at: '2026-10-29T17:00:00Z', comment: 'Planned maintenance notice' }));

  /* ---- Quick links (TILES + LOCKED, lines 1974–1982) ---- */
  const ql = (k, title, icon, dest, locked, order) => rec(`quick-link-${k}`, 'quickLink', title, { title, icon, iconAlt: '', destination: dest, requiresSignIn: locked, order, enabled: true }, { at: '2026-09-08T14:00:00Z', by: 'u1' });
  records.push(
    ql('msg', 'Message your doctor', 'chat', { type: 'mychart', value: 'Messages' }, true, 1), ql('res', 'Get your test results', 'lab_profile', { type: 'mychart', value: 'Test results' }, true, 2),
    ql('visits', 'Manage Your Visits', 'calendar_month', { type: 'mychart', value: 'Visits' }, true, 3), ql('bill', 'Manage Billing', 'receipt_long', { type: 'mychart', value: 'Billing' }, true, 4),
    ql('find', 'Find my Care', 'stethoscope', { type: 'screen', value: 'Find my Care' }, false, 5), ql('loc', 'Locations', 'location_on', { type: 'screen', value: 'Locations' }, false, 6));

  /* ---- Featured cards = UTSW resources rows (RESOURCES, line 2016) ---- */
  const fc = (k, title, subtitle, icon, dest, order, opts) => rec(`featured-card-${k}`, 'featuredCard', title, { title, subtitle, icon, iconAlt: '', destination: dest, order, enabled: true }, { at: '2026-09-08T14:00:00Z', by: 'u1', ...opts });
  records.push(
    fc('rank', 'Nationally recognized care', 'See how our specialties are ranked', 'workspace_premium', { type: 'url', value: 'https://utswmed.example/rankings' }, 1),
    fc('wayres', 'Internal and external wayfinding', 'Find your way to and around campus', 'directions_walk', { type: 'screen', value: 'Wayfinding' }, 2),
    fc('video', 'Prepare for a video visit', 'Test your device and find a quiet spot', 'videocam', { type: 'screen', value: 'Video visit device test' }, 3),
    fc('vuc', 'Virtual urgent care', 'Video visits, 7 a.m. to 11 p.m. daily', 'acute', { type: 'screen', value: 'Virtual urgent care' }, 4),
    fc('aid', 'Financial assistance', 'See if you qualify for help with costs', 'volunteer_activism', { type: 'screen', value: 'Financial assistance' }, 5, { state: 'live+draft', next: { title: 'Financial assistance', subtitle: 'Apply online in about 15 minutes', icon: 'volunteer_activism', iconAlt: '', destination: { type: 'screen', value: 'Financial assistance' }, order: 5, enabled: true } }));

  /* ---- Content and navigation ---- */
  const di = (id, label, icon, dest, visible = true, sub = '') => ({ id, label, sub, icon, destination: dest, visible });
  records.push(rec('drawer', 'drawer', 'Drawer / More options', { sections: [
    { id: 'main', label: '', items: [di('inbox', 'Inbox', 'inbox', { type: 'screen', value: 'Inbox' }, true, 'Alerts and news'), di('saved', 'Saved providers', 'favorite', { type: 'screen', value: 'Saved providers' }), di('shuttle', 'Campus shuttle', 'directions_bus', { type: 'screen', value: 'Campus shuttle' }, true, 'Routes and next departures')] },
    { id: 'about', label: 'About UT Southwestern', items: [di('why', 'Why UT Southwestern', 'verified', { type: 'url', value: 'https://utswmed.example/why' }), di('guide', 'Patient resource guide', 'menu_book', { type: 'url', value: 'https://utswmed.example/guide' }), di('presources', 'Patient resources', 'library_books', { type: 'url', value: 'https://utswmed.example/patients' }), di('physician', 'Physician resources', 'badge', { type: 'url', value: 'https://utswmed.example/physicians' }, true, 'For referring clinicians'), di('covid', 'COVID-19 resources', 'coronavirus', { type: 'url', value: 'https://utswmed.example/covid-19' }), di('website', 'Visit the full website', 'public', { type: 'url', value: 'https://utswmed.example' }, true, 'utswmed.org')] },
    { id: 'help', label: 'Settings and help', items: [di('lang', 'Language', 'translate', { type: 'screen', value: 'Language' }, true, 'English'), di('helpc', 'Help and contact us', 'help', { type: 'screen', value: 'Help and contact us' }), di('privacy', 'Privacy policy', 'privacy_tip', { type: 'screen', value: 'Privacy policy' })] }
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
  records.push(rec('search-ranking', 'searchRanking', 'Ranking', { relevance: 60, distance: 25, availability: 10, language: 5, featuredLabelled: true, defaultSort: 'Best match' }, { at: '2026-09-20T15:00:00Z', by: 'u1' }));

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
    seg('seg-signedin', 'Signed-in patients', 'People signed in to MyChart in the app.', [{ attr: 'signedIn', op: 'is', value: 'Signed in to MyChart' }], 'all', 111100),
    seg('seg-spanish', 'Spanish-language users', 'App language set to Spanish.', [{ attr: 'language', op: 'is', value: 'Spanish' }], 'all', 23800),
    seg('seg-collin', 'Collin and Denton counties', 'People near the Frisco and Richardson/Plano clinics.', [{ attr: 'region', op: 'is', value: 'Collin County' }, { attr: 'region', op: 'is', value: 'Denton County' }], 'any', 38900));

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
  const nt = (id, o) => ({ id, title: '', description: '', sendTo: 'seg-all', delivery: 'push+inbox', timing: 'scheduled', scheduledAt: '', image: 'none', imageAlt: '', videoUrl: '', destination: { type: 'none', value: '' }, status: 'draft', createdBy: 'u3', createdAt: t('2026-10-20T15:00:00Z'), updatedAt: t('2026-10-20T15:00:00Z'), sentAt: null, stats: null, ...o });
  const notifications = [
    nt('n1', { title: 'Flu shots are here', description: 'Walk in on Saturdays, 8 a.m. to noon, at any primary care clinic.', destination: { type: 'screen', value: 'Flu shot locations' }, status: 'sent', scheduledAt: '2026-09-29T08:00', sentAt: t('2026-09-29T13:00:00Z'), createdAt: t('2026-09-26T19:00:00Z'), stats: { delivered: 168250, opened: 31400, actions: 9620 } }),
    nt('n2', { title: 'New visitor hours start Nov. 1', description: 'Two visitors at a time, 8 a.m. to 8 p.m.', delivery: 'inbox', destination: { type: 'screen', value: 'Visitor guidelines' }, status: 'sent', scheduledAt: '2026-10-06T09:00', sentAt: t('2026-10-06T14:00:00Z'), createdBy: 'u2', createdAt: t('2026-10-03T15:00:00Z'), stats: { delivered: 179900, opened: 22100, actions: 4380 } }),
    nt('n3', { title: 'Estimate your costs before your visit', description: 'Price estimates are now online. It takes about 5 minutes.', sendTo: 'seg-signedin', destination: { type: 'screen', value: 'Price estimates' }, status: 'scheduled', scheduledAt: '2026-11-03T09:00', createdAt: t('2026-10-27T15:00:00Z'), image: 'b', imageAlt: 'Abstract circles on a sky-blue background' }),
    nt('n4', { title: 'MyCare ahora en español', description: 'Cambie el idioma en MyChart, luego Idioma.', sendTo: 'seg-spanish', destination: { type: 'screen', value: 'Language' }, status: 'pending', scheduledAt: '2026-11-05T10:00', createdAt: t('2026-10-29T16:00:00Z') }),
    nt('n5', { title: 'Our new Frisco clinic opens Dec. 1', description: 'Primary care, imaging, and physical therapy in one place.', sendTo: 'seg-collin', destination: { type: 'screen', value: 'Locations' }, status: 'draft', scheduledAt: '2026-12-01T08:00', createdAt: t('2026-10-29T20:10:00Z') }),
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

  return { schema: 3, records: Object.fromEntries(records.map(r => [r.id, r])), users, notifications, wayfinding, integrations, settings, audit, zeroResults };
}
