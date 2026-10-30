/* ---------- Information architecture (HANDOVER §7) ----------
   Routes are plain hash names (#home-layout) because Artifact links keep only #name hashes.
   children: routes that aren't sidebar items (create and details pages). */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', items: [{ route: 'dashboard', label: 'Dashboard', area: 'dashboard' }] },
  { id: 'home', label: 'Home screen management', icon: 'smartphone', items: [
    { route: 'home-layout', label: 'Layout', area: 'homeLayout' },
    { route: 'home-campaigns', label: 'Campaigns', area: 'campaigns', children: [['home-campaigns-new', 'New campaign'], ['home-campaigns-:id', 'Campaign']] },
    { route: 'home-alerts', label: 'Emergency alerts', area: 'alerts', children: [['home-alerts-new', 'New emergency alert'], ['home-alerts-:id', 'Emergency alert']] },
    { route: 'home-quick-links', label: 'Quick links', area: 'quickLinks', children: [['home-quick-links-new', 'New quick link'], ['home-quick-links-:id', 'Quick link']] },
    { route: 'home-featured-cards', label: 'Featured cards', area: 'featuredCards', children: [['home-featured-cards-new', 'New featured card'], ['home-featured-cards-:id', 'Featured card']] }
  ] },
  { id: 'content', label: 'Content and navigation', icon: 'palette', items: [
    { route: 'content-colors', label: 'Global colors', area: 'colors' },
    { route: 'content-drawer', label: 'Drawer / More options', area: 'drawer' },
    { route: 'content-app-entry', label: 'App entry', area: 'appEntry' }
  ] },
  { id: 'search', label: 'Search configuration', icon: 'manage_search', items: [
    { route: 'search-query-mappings', label: 'Query mappings', area: 'search' },
    { route: 'search-synonyms', label: 'Synonyms', area: 'search' },
    { route: 'search-specialties', label: 'Specialty mapping', area: 'search' },
    { route: 'search-zero-results', label: 'Zero-result queries', area: 'search' },
    { route: 'search-ranking', label: 'Ranking', area: 'search' }
  ] },
  { id: 'wayfinding', label: 'Wayfinding', icon: 'directions_walk', items: [{ route: 'wayfinding', label: 'Wayfinding files', area: 'wayfinding' }] },
  { id: 'audiences', label: 'Audience management', icon: 'groups', items: [
    { route: 'audiences', label: 'Audience segments', area: 'audiences', children: [['audiences-new', 'New segment'], ['audiences-:id', 'Segment']] },
    { route: 'audiences-rules', label: 'Segment rules', area: 'audiences' },
    { route: 'audiences-targeting', label: 'Targeting', area: 'audiences' }
  ] },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', items: [
    { route: 'notifications', label: 'All notifications', area: 'notifications', children: [['notifications-new', 'Create notification'], ['notifications-:id', 'Notification']] }
  ] },
  { id: 'analytics', label: 'Analytics and reporting', icon: 'monitoring', items: [
    { route: 'analytics', label: 'Overview', area: 'analytics' },
    { route: 'analytics-adoption', label: 'Adoption and engagement', area: 'analytics' },
    { route: 'analytics-search', label: 'Search', area: 'analytics' },
    { route: 'analytics-content', label: 'Content', area: 'analytics' },
    { route: 'analytics-care', label: 'Care and wayfinding', area: 'analytics' },
    { route: 'analytics-notifications', label: 'Notifications', area: 'analytics' }
  ] },
  { id: 'users', label: 'User management', icon: 'manage_accounts', items: [
    { route: 'users', label: 'All users', area: 'users', children: [['users-new', 'Create user'], ['users-:id', 'User details']] }
  ] },
  { id: 'audit', label: 'Audit and versioning', icon: 'history', items: [
    { route: 'audit', label: 'Audit logs', area: 'audit' },
    { route: 'audit-history', label: 'Configuration history', area: 'audit' }
  ] },
  { id: 'platform', label: 'Platform operations', icon: 'hub', items: [
    { route: 'platform-integrations', label: 'Integration status', area: 'platform' },
    { route: 'platform-monitoring', label: 'Operational monitoring', area: 'platform' }
  ] },
  { id: 'admin-settings', label: 'Administrative settings', icon: 'tune', items: [
    { route: 'admin-settings', label: 'Approved settings', area: 'adminSettings' },
    { route: 'admin-settings-locations', label: 'Location-aware configuration', area: 'locations' }
  ] }
];
/* Flat route table */
const ROUTES = [];
NAV.forEach(sec => sec.items.forEach(item => {
  ROUTES.push({ pattern: item.route, section: sec, item, title: item.label });
  (item.children || []).forEach(([pattern, title]) => ROUTES.push({ pattern, section: sec, item, title, parent: item }));
}));
