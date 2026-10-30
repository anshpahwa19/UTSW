/* ---------- Information architecture (HANDOVER §7) ----------
   Routes are plain hash names (#home-layout) because Artifact links keep only #name hashes.
   built: true marks a working page; every other page says "Planned – Phase N" and lists what it will hold.
   needs: open questions from HANDOVER §10 (also in admin/README.md). */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', items: [
    { route: 'dashboard', label: 'Dashboard', area: 'dashboard', phase: 2,
      will: ['Overview and app engagement metrics, clearly labeled as mock data until analytics is connected', 'Active emergency alerts, campaign and content publication status', 'Scheduled notifications and pending demo items', 'Wayfinding upload and publication status', 'Recent administrative activity'],
      needs: [15, 17] }
  ] },
  { id: 'home', label: 'Home screen management', icon: 'smartphone', items: [
    { route: 'home-layout', label: 'Layout', area: 'homeLayout', built: true },
    { route: 'home-campaigns', label: 'Campaigns', area: 'campaigns', phase: 3,
      will: ['Campaign list with draft, demo and production status', 'Title, type, banner image and alt text, description, call to action, destination type and destination', 'Target audience, start and end date and time, time zone (Central by default)', 'Mobile preview and the Save draft → Demo → Production workflow'],
      needs: [8, 7], children: [['home-campaigns-new', 'New campaign'], ['home-campaigns-:id', 'Campaign details']] },
    { route: 'home-alerts', label: 'Emergency alerts', area: 'alerts', phase: 3,
      will: ['Alert list kept apart from campaigns and styled as alerts, never as promotions', 'Title, type, message, icon, call to action and destination', 'Audience, start and end, time zone and display duration', 'Priority when two alerts are active, and a mobile preview'],
      needs: [6, 8], children: [['home-alerts-new', 'New emergency alert'], ['home-alerts-:id', 'Emergency alert details']] },
    { route: 'home-quick-links', label: 'Quick links', area: 'quickLinks', phase: 3,
      will: ['The six tiles: Find my Care, Locations, and the four MyChart links', 'Title, icon from the approved icon list, icon alt text, destination and status', 'MyChart links stay hand-offs into MyChart and never edit MyChart content'],
      needs: [8], children: [['home-quick-links-new', 'New quick link'], ['home-quick-links-:id', 'Quick link details']] },
    { route: 'home-featured-cards', label: 'Featured cards', area: 'featuredCards', phase: 3,
      will: ['The UTSW resources rows: title, icon, icon alt text, destination and status', 'Mobile preview of the resource list'],
      needs: [4, 8], children: [['home-featured-cards-new', 'New featured card'], ['home-featured-cards-:id', 'Featured card details']] }
  ] },
  { id: 'content', label: 'Content and navigation', icon: 'palette', items: [
    { route: 'content-colors', label: 'Global colors', area: 'colors', phase: 3,
      will: ['Only the approved global colors: primary, secondary, tertiary and background', 'Contrast validation (4.5:1 for text) and a light and dark preview'], needs: [9, 19] },
    { route: 'content-drawer', label: 'Drawer / More options', area: 'drawer', phase: 3,
      will: ['Menu items by section, with visibility, destination and order where supported', 'Preview of the More drawer'], needs: [11, 8] },
    { route: 'content-app-entry', label: 'App entry', area: 'appEntry', phase: 3,
      will: ['End User License Agreement visibility', 'Login prompt visibility and type', 'Preview of the first-launch screens'], needs: [10] }
  ] },
  { id: 'search', label: 'Search configuration', icon: 'manage_search', items: [
    { route: 'search-query-mappings', label: 'Query mappings', area: 'search', phase: 5, will: ['Map a patient phrase to a specialty, condition or scope'], needs: [12] },
    { route: 'search-synonyms', label: 'Synonyms', area: 'search', phase: 5, will: ['Lay terms and abbreviations, seeded from the prototype (for example, “skin doc” → Dermatology)'], needs: [12] },
    { route: 'search-specialties', label: 'Specialty mapping', area: 'search', phase: 5, will: ['Specialty names to the terms patients use'], needs: [12] },
    { route: 'search-zero-results', label: 'Zero-result queries', area: 'search', phase: 5, will: ['Searches that returned nothing, with a way to add a mapping'], needs: [12, 15] },
    { route: 'search-ranking', label: 'Ranking', area: 'search', phase: 5, will: ['Only approved parameters: relevance, distance, availability, and language or accessibility match where supported'], needs: [12] }
  ] },
  { id: 'wayfinding', label: 'Wayfinding', icon: 'directions_walk', items: [
    { route: 'wayfinding', label: 'Wayfinding files', area: 'wayfinding', phase: 4,
      will: ['Current published version and upload history', 'Manual Gozio JSON upload with progress, then validation results and error details', 'Publish to demo, check it, then publish to production – uploading and publishing are separate actions', 'Publication history with user and comment, and rollback where supported', 'No direct Gozio connection'],
      needs: [17] }
  ] },
  { id: 'audiences', label: 'Audience management', icon: 'groups', items: [
    { route: 'audiences', label: 'Audience segments', area: 'audiences', phase: 5, will: ['Segment list, create and edit, name and description'], needs: [13], children: [['audiences-new', 'New audience segment'], ['audiences-:id', 'Audience segment details']] },
    { route: 'audiences-rules', label: 'Segment rules', area: 'audiences', phase: 5, will: ['Rules built only from approved attributes, with validation'], needs: [13] },
    { route: 'audiences-targeting', label: 'Targeting', area: 'audiences', phase: 5, will: ['Assign segments to eligible campaigns, content and module visibility'], needs: [13] }
  ] },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', items: [
    { route: 'notifications', label: 'All notifications', area: 'notifications', phase: 4,
      will: ['List with title, type, audience, scheduled date and time, creation date and status, with search and filters', 'Create and edit: title, description, send to, delivery type, immediate or scheduled delivery, image and alt text, video URL', 'Destination and required-field validation'],
      needs: [14], children: [['notifications-new', 'Create notification'], ['notifications-:id', 'Notification details']] }
  ] },
  { id: 'analytics', label: 'Analytics and reporting', icon: 'monitoring', items: [
    { route: 'analytics', label: 'Overview', area: 'analytics', phase: 5, will: ['Category summary with date range, all mock until a data source is approved'], needs: [15] },
    { route: 'analytics-adoption', label: 'Adoption and engagement', area: 'analytics', phase: 5, will: ['Daily and monthly active users, new-user activation, 30-day return, meaningful engagement, patient task success'], needs: [15] },
    { route: 'analytics-search', label: 'Search', area: 'analytics', phase: 5, will: ['Home module click-through, unified search success, zero-result rate, provider profile discovery'], needs: [15] },
    { route: 'analytics-content', label: 'Content', area: 'analytics', phase: 5, will: ['Article engagement, patient resource actions, crash-free sessions, home load time'], needs: [15] },
    { route: 'analytics-care', label: 'Care and wayfinding', area: 'analytics', phase: 5, will: ['Find Care action conversion and wayfinding adoption'], needs: [15] },
    { route: 'analytics-notifications', label: 'Notifications', area: 'analytics', phase: 5, will: ['Notification-to-action conversion'], needs: [15] }
  ] },
  { id: 'users', label: 'User management', icon: 'manage_accounts', items: [
    { route: 'users', label: 'All users', area: 'users', phase: 2,
      will: ['User list with name, email, role, status and last update, with search and role and status filters', 'Create user with validation and duplicate-account checks', 'User details: role, status, edits and deletion where authorized'],
      needs: [16], children: [['users-new', 'Create user'], ['users-:id', 'User details']] }
  ] },
  { id: 'audit', label: 'Audit and versioning', icon: 'history', items: [
    { route: 'audit', label: 'Audit logs', area: 'audit', phase: 4, will: ['Every administrative action with actor, time, action, and before and after values where supported'], needs: [16] },
    { route: 'audit-history', label: 'Configuration history', area: 'audit', phase: 4, will: ['Version history per configuration, with rollback only for types that support it'], needs: [17] }
  ] },
  { id: 'platform', label: 'Platform operations', icon: 'hub', items: [
    { route: 'platform-integrations', label: 'Integration status', area: 'platform', phase: 6, discovery: true, will: ['Approved integration status indicators only'], needs: [] },
    { route: 'platform-monitoring', label: 'Operational monitoring', area: 'platform', phase: 6, discovery: true, will: ['Operational errors and performance where data is approved'], needs: [] }
  ] },
  { id: 'admin-settings', label: 'Administrative settings', icon: 'tune', items: [
    { route: 'admin-settings', label: 'Approved settings', area: 'adminSettings', phase: 6, discovery: true, will: ['Administrative settings once approved'], needs: [] },
    { route: 'admin-settings-locations', label: 'Location-aware configuration', area: 'adminSettings', phase: 6, discovery: true, will: ['Facility and building configuration and approved location-specific information, where confirmed'], needs: [] }
  ] }
];
/* Open questions shown on planned pages (HANDOVER §10, numbered as there) */
const OPEN_QUESTIONS = {
  4: 'Featured cards: confirm they are the UTSW resources rows, not the MedBlog carousel.',
  6: 'Alerts: priority when several are active, what “display duration” means, and whether alerts can be dismissed.',
  7: 'Time zone default: Central (America/Chicago), with a selector.',
  8: 'Destination types: in-app screen, web URL, MyChart deep link, phone?',
  9: 'Global colors: which tokens are editable, the contrast rule, and the effect on dark mode.',
  10: 'App entry: EULA source, versioning and re-acceptance; login prompt types.',
  11: 'Drawer: which items are fixed or CMS-managed, and whether sections reorder.',
  12: 'Search: the engine behind it, mapping rules, zero-result source, and which ranking parameters can change.',
  13: 'Audiences: attributes, precedence, conflicts and PHI limits.',
  14: 'Notifications: push provider, delivery types, approval, cancel and edit rules, allowed video hosts.',
  15: 'Analytics: data source and exact metric definitions.',
  16: 'Users: invitation through the identity provider or the Admin; deletion vs. deactivation; audit retention.',
  17: 'Environments: what “Demo” is, and who can promote to production.',
  19: 'Spelling: US English in the UI (“Global colors”) to match UT Southwestern style.'
};
const PHASE_NAMES = { 2: 'Core administration', 3: 'Mobile content configuration', 4: 'Operational workflows', 5: 'Configuration and reporting', 6: 'Confirmed advanced features' };

/* Flat route table: [pattern, { section, item, title, parent }] */
const ROUTES = [];
NAV.forEach(sec => sec.items.forEach(item => {
  ROUTES.push({ pattern: item.route, section: sec, item, title: item.label });
  (item.children || []).forEach(([pattern, title]) => ROUTES.push({ pattern, section: sec, item, title, parent: item }));
}));
