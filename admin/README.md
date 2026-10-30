# MyCare Admin – prototype

The UTSW MyCare 2.0 Admin Portal, Phase 1: the app shell, core components, the mock service layer and config schema, and one working vertical slice, **Home screen management → Layout**. Planning inputs are `handoff/admin-portal/BRIEF.md` and `handoff/admin-portal/HANDOVER.md`.

**Everything here is a prototype on mock data.** Nothing connects to MyCare, Epic/MyChart, Gozio, an identity provider or any UTSW system. Every screen says so, and the code has no endpoints, URLs to backends or credentials.

## Build

```
cd admin
python3 build.py
```

The build writes `admin-portal.html`, a single self-contained file that can be published as a claude.ai Artifact. It is committed beside its source, as elsewhere in this repo. It needs Python 3 only (standard library). At run time the page loads Inter and a Material Symbols Rounded subset from Google Fonts; everything else is inline.

`build.py`:
- concatenates `src/styles/` and the JS files (in its `FILES` order) into one strict-mode script
- inlines `mycare-logo/reversed.svg` and `horizontal.svg` as data URIs, unaltered
- inlines the mobile preview (`src/preview/`) as strings for a sandboxed `srcdoc` iframe
- derives the icon subset from the glyphs the code names (`ic('…')`, `icon: '…'`, `BADGES`, `EXTRA_GLYPHS` comments)

## Stack decision

Zero-dependency static app, the option recommended in HANDOVER §6.2: vanilla JS, CSS custom properties, hash routing and a Python build. There is no `package.json` and nothing to install. If UTSW wants this to become production code, the alternative (Vite + React + TypeScript) is still open. See open question 1.

## Structure

```
admin/
  build.py, admin-portal.html (built), README.md
  src/
    index.html            page template
    styles/tokens.css     designs/guest tokens (lines 11–61, unchanged) + admin layout tokens + dark values
    styles/admin.css      components and layouts
    app/                  util (dates, storage), permissions, session, nav (IA), shell, router, boot
    ui/components.js      button, badge, field, switch, checkbox, segmented, card, states, stepper, table, modal, confirm, toast
    ui/preview.js         isolated preview frame (iframe srcdoc, sandbox="allow-scripts")
    services/services.js  MOCK ConfigService and UserService, config schema, simulated latency and errors
    mock/seed.js          MOCK fixtures seeded from designs/guest/src.html (line numbers in comments)
    preview/              mobile.css, mobile.html and mobile.js: the designs/guest home modules, copied
    pages/                auth (sign-in, MFA, signed out, expired, denied, not found), planned, home-layout
```

Nothing outside `admin/` is modified. The guest CSS, data and module markup are copied in, never linked across folders.

## Routes

Routes are plain hash names, for example `#home-layout`, because Artifact links keep only `#name` hashes, not `#/path`. The section "Settings" is named `#admin-settings` because claude.ai reserves `#settings`.

| Status | Routes |
|---|---|
| Built | `home-layout` (Guest and Authenticated tabs) |
| System | `login`, `mfa`, `signed-out`, `expired`, `denied`, plus a not-found view for unknown names |
| Planned – Phase 2 | `dashboard`, `users`, `users-new`, `users-:id` |
| Planned – Phase 3 | `home-campaigns`, `home-alerts`, `home-quick-links`, `home-featured-cards` (each with `-new` and `-:id`), `content-colors`, `content-drawer`, `content-app-entry` |
| Planned – Phase 4 | `wayfinding`, `notifications`, `notifications-new`, `notifications-:id`, `audit`, `audit-history` |
| Planned – Phase 5 | `search-query-mappings`, `search-synonyms`, `search-specialties`, `search-zero-results`, `search-ranking`, `audiences`, `audiences-new`, `audiences-:id`, `audiences-rules`, `audiences-targeting`, `analytics`, `analytics-adoption`, `analytics-search`, `analytics-content`, `analytics-care`, `analytics-notifications` |
| Requires discovery – Phase 6 | `platform-integrations`, `platform-monitoring`, `admin-settings`, `admin-settings-locations` |

Planned pages say "Planned – Phase N". They list what the page will do, the open questions it depends on and the viewer's access level. They have no form controls, so there are no dead buttons.

## What is mock or simulated

| Area | In the prototype | Real integration needed |
|---|---|---|
| Sign-in | "Sign in with UTSW SSO" → choose a sample account → simulated MFA approval. Never a username or password | Identity provider (SAML or OIDC), MFA mechanism |
| Session | 30-minute idle timeout (placeholder), "Simulate session expiry" and Sign out in the user menu | Approved timeout and session handling |
| Roles | Three sample accounts; a role switcher labeled "Prototype only" | Roles from the identity provider; confirmed permission matrix |
| Config and publishing | `ConfigService` with draft, demo and production snapshots, saved to `localStorage` on this device (`utsw-admin-mock-v1`, always in try/catch). "Reset mock data" restores the seed | Backend and API contract (none exists) |
| Latency and errors | 180–420 ms simulated latency; "Simulate service errors" in the user menu makes calls fail, to show error states | – |
| Preview | designs/guest home modules and sample content in an isolated iframe | The app's real rendering of published config |

## Lifecycle (Home screen layout)

- **Draft:** Save draft stores the working copy. Nothing reaches demo or production. Marketing can save drafts and request a review.
- **Demo:** Deploy to demo turns the saved draft into a numbered version on demo. Production is unchanged.
- **Request changes:** sends the demo version back to a draft with a required comment.
- **Production:** Publish to production publishes the version on demo, never a draft. A confirmation lists the changes.
- **Rollback:** creates a new version with an old version's contents on demo and production, and needs a reason. Offered only where the config type's `supportsRollback` flag is true. Every flag is an assumption pending confirmation.

Each environment is labeled everywhere it appears: the stepper, the preview ("Unsaved edits – not live", "Demo v4 – demo environment only", "Production v3 – what patients see (simulated)") and the change history. Every status badge pairs an icon with a word. Leaving the page, switching audience or signing out with unsaved changes asks first.

## Permissions (proposed, pending confirmation)

The matrix from HANDOVER §7 lives in one object, `PERMISSIONS` in `src/app/permissions.js`, with the levels none, view, draft, demo, publish and manage. Navigation hides areas a role can't view. Visiting one directly shows the access-denied view, and the services check the same matrix.

Switching roles in the prototype keeps the signed-in sample person, so history entries show that person's name under the new role.

## Verification (Oct. 30, 2026)

All run in headless Chromium with the pre-installed Playwright, against the built file:
- `python3 build.py` succeeds: 14 JS files, 76 glyphs in the icon subset, about 200 KB.
- All 41 routes for each of the three roles: no console or page errors, one `h1` per page, every control has a name, no horizontal overflow, and every rendered glyph is in the subset. Each role sees the expected denied views: Super Admin only on `#denied`, Admin on 5 routes (Platform operations and Administrative settings), Marketing on 9 (adding User management and Audit).
- Workflow: edit, Save draft, Deploy to demo (the change list is correct), Publish, Rollback (an empty reason is rejected), Marketing's Request review, the leave-page guard, simulated error with Retry, session expiry, and sign out.
- Keyboard only:
  - Tab reaches the skip link first.
  - Sidebar sections open with Enter, and links move focus to the new page heading.
  - Reorder buttons keep focus on the moved row and announce its new position.
  - Dialogs move focus to the title, Escape closes them and focus returns to the opener.
  - Sort headers keep focus and set `aria-sort`, and the table shows a no-match state with Clear.
  - The preview scroller is reachable by Tab.
- Contrast sweep of every visible text element in light and dark (sign-in, layout, dialog, toast, user menu, planned and not-found pages, preview light and dark with an alert): the Admin has no failures. In the preview, see the known issue below.
- Widths 1024, 1280 and 1440 with a persistent sidebar, and 400 with the sidebar behind a menu button and the mock-data flag on its own row. No horizontal scroll at any width.

### Known issue in the copied mobile design

The campaign tag ("Flu season": white on 14% white over the campaign gradient) measures 4.37:1 at the gradient's lightest stop (`--blue-80`), just under 4.5:1. The rule is copied unchanged from `designs/guest/src.html` (`.camp-tag`), which this work must not modify, so the preview mirrors it. The fix belongs in `designs/guest`.

## Open questions (HANDOVER §10) – not guessed

1. **Stack:** static, zero-dependency (in use) vs a framework app if this becomes production code.
2. **Which prototype the preview mirrors:** `designs/guest` (in use) vs `design/guest-v2`, whose labels differ ("Find my Care" vs "Find my care"; "I'm a patient" vs "Sign in as a patient").
3. **Configurable modules:** the brief names four, but the prototype has nine module ids. Alerts, Welcome and Search are shown as fixed; the six reorderable ones are configurable here. Which does the Admin manage, and do MedBlog and announcements come from the CMS or a website feed?
4. **Featured cards:** assumed to be the UTSW resources rows, not the MedBlog carousel. Confirm.
5. **Authenticated home:** no design exists. The Authenticated tab shows an empty state and publishes nothing.
6. **Alerts:** priority rules for several active alerts, the meaning of "display duration", and whether alerts can be dismissed.
7. **Time zone default:** times show in Central Time (America/Chicago). Confirm, and a selector comes with scheduled content.
8. **Destination types** for campaigns, alerts, quick links, cards and drawer items.
9. **Global colors:** which tokens are editable, the contrast thresholds, and the effect on dark mode.
10. **App entry:** EULA source, versioning and re-acceptance; login prompt types.
11. **Drawer:** which items are fixed or CMS-managed, and whether sections can be reordered.
12. **Search:** the engine, mapping semantics, the source of zero-result queries, and which ranking parameters can change.
13. **Audiences:** attributes, precedence, conflict handling and PHI limits.
14. **Notifications:** push provider, delivery types, approval, cancel and edit rules, allowed video hosts.
15. **Analytics:** data source and exact metric definitions.
16. **Users:** invitation through the identity provider or the Admin; deletion vs deactivation; audit retention and before-and-after detail.
17. **Environments:** what "Demo" is (a separate environment or a build), and who can promote to production. Which config types support versioning and rollback (all flags here are assumptions).
18. **Admin device support:** built for desktop (1280 and 1440, usable at 1024). It also works at phone width, but that is not a supported target until confirmed.
19. **Spelling:** the UI uses US English ("Global colors") per UT Southwestern style, while the brief uses UK spelling. The one exception is the app's own label "Personalise My Homepage".
20. **Logo:** `mycare-logo/` is a proposal pending CMPA approval and is used unaltered.

Also pending: the session timeout (30 minutes is a placeholder) and the final permission matrix.

## Next: Phase 2

- **Auth UI:** wire the screens to the approved identity provider once the protocol, MFA and timeout are confirmed. The screens and router guards exist.
- **Role-aware navigation:** replace the proposed matrix with the confirmed one, and add permission-aware actions to each new page.
- **Dashboard:** metric cards and status tables from mock services, labeled as mock data, with inline SVG charts (no chart library).
- **User management:** list (the `dataTable` component already does search, filters and sort), create with validation and duplicate checks, and details with status changes and confirmations, on a mock `UserService`.
