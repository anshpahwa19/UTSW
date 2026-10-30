/* ==========================================================================================
   MOCK DATA – fictional sample records for the prototype. Nothing here comes from or goes to
   MyCare, Epic/MyChart, Gozio or any UTSW system. Content is seeded from designs/guest/src.html
   (line numbers noted) so the preview matches the patient prototype.
   ========================================================================================== */

/* Sample content shown in the mobile preview (designs/guest/src.html) */
const MOCK_CONTENT = {
  /* ALERTS, line 1819 */
  alerts: [
    { id: 'a1', pri: 1, title: 'Severe weather: Some clinics close at 3 p.m. today', summary: 'Outpatient clinics close early because of an ice storm warning. Emergency departments stay open.' },
    { id: 'a2', pri: 2, title: 'Water main repair: Use the east entrance', summary: 'The west lobby doors at the sample Pavilion are closed until 6 p.m. Follow posted signs.' }
  ],
  /* TILES and LOCKED, lines 1974–1982 */
  tiles: [{ k: 'find', lbl: 'Find my Care', ic: 'findCare' }, { k: 'loc', lbl: 'Locations', ic: 'place' }],
  locked: [
    { k: 'msg', lbl: 'Message your doctor', ic: 'messages' }, { k: 'res', lbl: 'Get your test results', ic: 'results' },
    { k: 'visits', lbl: 'Manage Your Visits', ic: 'visits' }, { k: 'bill', lbl: 'Manage Billing', ic: 'bill' }
  ],
  /* TOP, line 1983 */
  top: [['Primary care', 'Providers'], ['Knee pain doctor near Frisco', 'Providers'], ['Urgent care wait times', 'All'], ['Spanish-speaking dermatologist', 'Providers'], ['Parking', 'Locations'], ['Flu shots', 'All']],
  /* FEATURED (first four) with their ART, lines 1986–2000 */
  featured: [
    { kick: 'Medications', title: 'Taking a GLP-1? Learn how it may affect your other medications', meta: 'MedBlog · Oct. 7 · 5 min read',
      art: '<rect width="304" height="144" fill="#004278"/><circle cx="268" cy="8" r="120" fill="#336893"/><path d="M160 -12v72a56 56 0 0 0 112 0v-72" fill="none" stroke="#7BAFD4" stroke-width="20" stroke-linecap="round"/><circle cx="216" cy="64" r="12" fill="#00A9E0"/><circle cx="56" cy="112" r="40" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>' },
    { kick: 'Bones and joints', title: 'Are you ruining your knees? The truth about sports injuries and arthritis', meta: 'MedBlog · Oct. 5 · 6 min read',
      art: '<rect width="304" height="144" fill="#004278"/><path d="M-20 150L120 40L200 110L330 0V150Z" fill="#336893"/><circle cx="120" cy="40" r="22" fill="#7BAFD4"/><circle cx="200" cy="110" r="22" fill="#7BAFD4"/><circle cx="252" cy="36" r="10" fill="#00A9E0"/>' },
    { kick: 'Heart', title: 'Inflammation and the heart: A new approach to cardiovascular disease prevention', meta: 'MedBlog · Oct. 1 · 7 min read',
      art: '<rect width="304" height="144" fill="#7BAFD4"/><circle cx="232" cy="64" r="64" fill="#D6E4F0"/><circle cx="232" cy="64" r="36" fill="none" stroke="#004278" stroke-width="10"/><circle cx="72" cy="120" r="48" fill="#336893" opacity=".5"/><circle cx="232" cy="64" r="8" fill="#00A9E0"/>' },
    { kick: 'Heart', title: 'Enlicitide: What to know about the new cholesterol-lowering pill', meta: 'MedBlog · Sept. 28 · 5 min read',
      art: '<rect width="304" height="144" fill="#D6E4F0"/><circle cx="212" cy="72" r="52" fill="#004278"/><circle cx="236" cy="56" r="44" fill="#D6E4F0"/><g fill="#336893"><circle cx="72" cy="40" r="3"/><circle cx="104" cy="88" r="2"/><circle cx="56" cy="104" r="2"/><circle cx="132" cy="36" r="2"/></g><circle cx="168" cy="100" r="8" fill="#00A9E0"/>' }
  ],
  /* RESOURCES, line 2016 */
  resources: [
    { k: 'rank', t: 'Nationally recognized care', s: 'See how our specialties are ranked', ic: 'rank' },
    { k: 'wayres', t: 'Internal and external wayfinding', s: 'Find your way to and around campus', ic: 'wayfinding' },
    { k: 'video', t: 'Prepare for a video visit', s: 'Test your device and find a quiet spot', ic: 'video' },
    { k: 'vuc', t: 'Virtual urgent care', s: 'Video visits, 7 a.m. to 11 p.m. daily', ic: 'urgent' },
    { k: 'aid', t: 'Financial assistance', s: 'See if you qualify for help with costs', ic: 'aid' }
  ],
  /* ANN, line 2023 */
  announcements: [
    { k: 'ann1', m: 'Oct.', d: '10', t: 'Price estimates are now online', s: 'See costs before your visit' },
    { k: 'ann2', m: 'Oct.', d: '6', t: 'New visitor hours start Nov. 1', s: 'Two visitors at a time, 8 a.m. to 8 p.m.' },
    { k: 'ann3', m: 'Sept.', d: '29', t: 'MyCare now speaks Spanish', s: 'Change it under MyChart, then Language' }
  ],
  /* Campaign banner, R.campaign and PAGES.flu (lines 2038, 2205) */
  campaign: { tag: 'Flu season', title: 'Flu shots are here', ic: 'vaccine', text: 'Protect yourself and the people around you. It takes about 10 minutes, and most plans cover it.',
    facts: [['countdown', 'Walk in', 'Saturdays, 8 a.m. to noon'], ['place', 'Where', 'Any primary care clinic']], cta: 'Find a flu shot' }
};

/* Home modules: labels from MOD_LABELS, fixed header from HEAD, guest order from cfg (lines 2112–2114) */
const HOME_FIXED = [
  { id: 'alerts', label: 'Emergency alert banner', desc: 'Shows only while an emergency alert is active. Managed in Emergency alerts.', icon: 'warning' },
  { id: 'greeting', label: 'Welcome', desc: 'Greeting and short intro on the Blue hero.', icon: 'waving_hand' },
  { id: 'search', label: 'Search and top searches', desc: 'Global search field and the top searches row.', icon: 'search' }
];
const HOME_MODULES = {
  tiles: { label: 'Quick links', desc: 'Find my Care, Locations, and four MyChart links. Managed in Quick links.', icon: 'apps' },
  signin: { label: 'MyChart sign-in prompt', desc: 'Invites patients to sign in or create a MyChart account.', icon: 'login' },
  featured: { label: 'MedBlog (featured)', desc: 'Carousel of the four newest MedBlog articles.', icon: 'article' },
  services: { label: 'UTSW resources', desc: 'Resource rows with an icon and destination. Managed in Featured cards.', icon: 'library_books' },
  campaign: { label: 'Campaign banner', desc: 'The active campaign. Managed in Campaigns.', icon: 'campaign' },
  news: { label: 'Announcements', desc: 'The three newest announcements, with See all.', icon: 'feed' }
};
/* Which modules each audience may use. Authenticated is empty until the signed-in home is designed (HANDOVER §10.5). */
const AUDIENCE_MODULES = { guest: ['tiles', 'signin', 'featured', 'services', 'campaign', 'news'], authenticated: [] };

/* Sample Admin accounts (fictional people, example domain) */
const MOCK_USERS = [
  { id: 'u1', first: 'Dana', last: 'Whitfield', email: 'dana.whitfield@utsw.example', role: 'superAdmin', status: 'active' },
  { id: 'u2', first: 'Chris', last: 'Okoro', email: 'chris.okoro@utsw.example', role: 'admin', status: 'active' },
  { id: 'u3', first: 'Priya', last: 'Raman', email: 'priya.raman@utsw.example', role: 'marketing', status: 'active' }
];

/* Config records (HANDOVER §6.3). Every version carries version, data, updatedBy, updatedAt and comment;
   production and demo point at versions; a draft is unversioned until it is deployed to demo. */
function seedDb() {
  const t = s => new Date(s).toISOString();
  const mods = (order, off = []) => order.map(id => ({ id, on: !off.includes(id) }));
  const head = ['alerts', 'greeting', 'search'];
  const v1 = { head, modules: mods(['tiles', 'signin', 'featured', 'services', 'news', 'campaign'], ['campaign']) };
  const v2 = { head, modules: mods(['tiles', 'signin', 'campaign', 'featured', 'services', 'news']) };
  const v3 = { head, modules: mods(['tiles', 'signin', 'featured', 'services', 'campaign', 'news']) }; /* = designs/guest cfg */
  const ver = (version, data, by, at, comment) => ({ version, data, updatedBy: by, updatedAt: t(at), comment });
  const ev = (action, env, version, by, at, comment) => ({ id: uid('ev'), action, environment: env, version, by, at: t(at), comment });

  const guest = {
    id: 'home-layout-guest', type: 'homeLayout', name: 'Guest home layout', audience: 'guest',
    versions: {
      1: ver(1, v1, 'u1', '2026-09-08T14:05:00Z', 'Initial guest home from the approved design'),
      2: ver(2, v2, 'u2', '2026-09-29T15:30:00Z', 'Turn on the flu campaign and move it up for launch week'),
      3: ver(3, v3, 'u2', '2026-10-14T13:45:00Z', 'Move the campaign below UTSW resources after launch week')
    },
    production: 3, demo: 3, draft: null, review: null, nextVersion: 4,
    events: [
      ev('Deployed to demo', 'demo', 1, 'u1', '2026-09-08T14:05:00Z', 'Initial guest home from the approved design'),
      ev('Published to production', 'production', 1, 'u1', '2026-09-09T16:00:00Z', 'Approved in design review'),
      ev('Draft saved', 'draft', null, 'u3', '2026-09-26T19:12:00Z', 'Flu campaign launch'),
      ev('Review requested', 'draft', null, 'u3', '2026-09-26T19:14:00Z', 'Please review for the Sept. 29 launch'),
      ev('Deployed to demo', 'demo', 2, 'u2', '2026-09-29T15:30:00Z', 'Turn on the flu campaign and move it up for launch week'),
      ev('Published to production', 'production', 2, 'u2', '2026-09-29T17:00:00Z', 'Flu campaign launch'),
      ev('Deployed to demo', 'demo', 3, 'u2', '2026-10-14T13:45:00Z', 'Move the campaign below UTSW resources after launch week'),
      ev('Published to production', 'production', 3, 'u1', '2026-10-14T15:20:00Z', 'Checked on demo devices')
    ]
  };
  const authenticated = {
    id: 'home-layout-authenticated', type: 'homeLayout', name: 'Authenticated home layout', audience: 'authenticated',
    pending: 'The signed-in home has no approved design yet (HANDOVER §10.5).',
    versions: {}, production: null, demo: null, draft: null, review: null, nextVersion: 1, events: []
  };
  /* The other config types exist in the schema with their production seed, ready for later phases */
  const simple = (id, type, name, data, by = 'u1', at = '2026-10-01T15:00:00Z') => ({
    id, type, name, versions: { 1: ver(1, data, by, at, 'Seeded from the guest prototype') }, production: 1, demo: 1, draft: null, review: null, nextVersion: 2,
    events: [ev('Published to production', 'production', 1, by, at, 'Seeded from the guest prototype')]
  });
  const records = [
    guest, authenticated,
    ...MOCK_CONTENT.alerts.map(a => simple(`alert-${a.id}`, 'alert', a.title, { ...a, type: 'Weather', audience: 'All', timeZone: TZ, status: 'Scheduled' })),
    simple('campaign-flu', 'campaign', 'Flu shots are here', { ...MOCK_CONTENT.campaign, type: 'Seasonal', audience: 'All', timeZone: TZ }),
    ...[...MOCK_CONTENT.locked, ...MOCK_CONTENT.tiles].map(q => simple(`quick-link-${q.k}`, 'quickLink', q.lbl, { title: q.lbl, icon: q.ic, iconAlt: '', destination: q.k })),
    ...MOCK_CONTENT.resources.map(r => simple(`featured-card-${r.k}`, 'featuredCard', r.t, { title: r.t, subtitle: r.s, icon: r.ic, iconAlt: '', destination: r.k })),
    simple('drawer', 'drawer', 'Drawer / More options', { sections: [
      { label: 'Inbox and saved', items: ['Inbox', 'Saved providers', 'Campus shuttle'] },
      { label: 'About UT Southwestern', items: ['Why UT Southwestern', 'Patient resource guide', 'Patient resources', 'Physician resources', 'COVID-19 resources', 'Visit the full website'] },
      { label: 'Settings and help', items: ['Language', 'Help and contact us', 'Privacy policy'] }] }),
    simple('global-colors', 'globalColors', 'Global colors', { primary: '#004278', secondary: '#336893', tertiary: '#7BAFD4', background: '#F7F8FA' }),
    simple('app-entry', 'appEntry', 'App entry', { eulaVisible: false, loginPromptVisible: true, loginPromptType: 'Sign-in choice' }),
    simple('search', 'search', 'Search configuration', {
      synonyms: { 'skin doc': 'Dermatology', 'heart doctor': 'Cardiology', 'bone doctor': 'Orthopaedics', pcp: 'Primary care', obgyn: 'Obstetrics and Gynecology' },
      top: MOCK_CONTENT.top, popular: ['Primary care', 'Dermatology', 'Knee pain', 'Cardiology', 'Migraine', 'Physical therapy'],
      sorts: ['Best match', 'Distance', 'Last name A–Z', 'Featured first'] })
  ];
  return { schema: 1, records: Object.fromEntries(records.map(r => [r.id, r])), users: clone(MOCK_USERS) };
}
