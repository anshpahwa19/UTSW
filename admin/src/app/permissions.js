/* ---------- Roles and permissions ----------
   PROPOSED MATRIX – pending UTSW confirmation (HANDOVER §7, open question in admin/README.md).
   Kept in this one object so the confirmed matrix replaces it without touching screens. */
const ROLES = {
  superAdmin: { label: 'Super Admin' },
  admin: { label: 'Admin' },
  marketing: { label: 'Marketing' }
};
/* Levels, lowest to highest. draft = edit drafts and request review; demo = also deploy to demo;
   publish = also publish to production, request changes and roll back; manage = full control (users). */
const LEVELS = ['none', 'view', 'draft', 'demo', 'publish', 'manage'];
const LEVEL_LABEL = { none: 'No access', view: 'View', draft: 'Edit drafts, request review', demo: 'Edit and deploy to demo', publish: 'Edit and publish', manage: 'Manage' };
const PERMISSIONS = {
  status: 'Proposed – pending confirmation',
  areas: {
    dashboard: { superAdmin: 'view', admin: 'view', marketing: 'view' },
    analytics: { superAdmin: 'view', admin: 'view', marketing: 'view' },
    homeLayout: { superAdmin: 'publish', admin: 'publish', marketing: 'draft' },
    quickLinks: { superAdmin: 'publish', admin: 'publish', marketing: 'draft' },
    featuredCards: { superAdmin: 'publish', admin: 'publish', marketing: 'draft' },
    drawer: { superAdmin: 'publish', admin: 'publish', marketing: 'draft' },
    appEntry: { superAdmin: 'publish', admin: 'publish', marketing: 'draft' },
    campaigns: { superAdmin: 'publish', admin: 'publish', marketing: 'demo' },
    alerts: { superAdmin: 'publish', admin: 'publish', marketing: 'view' },
    colors: { superAdmin: 'publish', admin: 'view', marketing: 'view' },
    search: { superAdmin: 'publish', admin: 'publish', marketing: 'view' },
    audiences: { superAdmin: 'publish', admin: 'publish', marketing: 'view' },
    wayfinding: { superAdmin: 'publish', admin: 'publish', marketing: 'view' },
    notifications: { superAdmin: 'publish', admin: 'publish', marketing: 'draft' },
    users: { superAdmin: 'manage', admin: 'view', marketing: 'none' },
    audit: { superAdmin: 'publish', admin: 'view', marketing: 'none' },
    platform: { superAdmin: 'view', admin: 'none', marketing: 'none' },
    adminSettings: { superAdmin: 'view', admin: 'none', marketing: 'none' }
  }
};
const levelOf = (role, area) => (PERMISSIONS.areas[area] || {})[role] || 'none';
const can = (role, area, need = 'view') => LEVELS.indexOf(levelOf(role, area)) >= LEVELS.indexOf(need);
/* Lifecycle actions → the level each needs */
const ACTION_NEEDS = { saveDraft: 'draft', requestReview: 'draft', deployDemo: 'demo', requestChanges: 'publish', publish: 'publish', rollback: 'publish' };
const canAct = (role, area, action) => can(role, area, ACTION_NEEDS[action]);
