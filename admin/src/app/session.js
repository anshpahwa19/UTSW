/* ---------- Simulated SSO session ----------
   SIMULATED: no identity provider is connected. The real flow (SAML or OIDC, MFA, timeout) is pending UTSW (HANDOVER §8).
   There is never a username and password form. */
const SESSION_IDLE_MS = 30 * 60 * 1000; /* 30 minutes idle – placeholder until UTSW confirms the timeout */
const Session = {
  current: () => DB.session,
  /* Step 1: the person picks a sample account on the simulated identity-provider screen */
  pending: null,
  begin(userId) { this.pending = userId; },
  /* Step 2: simulated MFA approval starts the session */
  complete() {
    const u = UserService.byId(this.pending); if (!u) return false;
    DB.session = { userId: u.id, role: u.role, startedAt: Date.now(), lastActive: Date.now() };
    this.pending = null; saveDb(); return true;
  },
  touch() { if (DB.session) { DB.session.lastActive = Date.now(); } },
  expired() { return !!DB.session && Date.now() - DB.session.lastActive > SESSION_IDLE_MS; },
  /* Prototype only: lets reviewers see each role without three sign-ins */
  switchRole(role) { if (DB.session && ROLES[role]) { DB.session.role = role; saveDb(); } },
  end() { DB.session = null; saveDb(); },
  role: () => DB.session && DB.session.role,
  user: () => DB.session && UserService.byId(DB.session.userId)
};
