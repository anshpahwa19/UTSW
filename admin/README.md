# MyCare Admin – prototype

The UTSW MyCare 2.0 Admin Portal. All 12 modules from `handoff/admin-portal/BRIEF.md` work end to end on mock data. The Admin is light only; the mobile previews show the app in light or dark. Planning inputs are `handoff/admin-portal/BRIEF.md` and `handoff/admin-portal/HANDOVER.md`.

**Everything runs on mock data.** Nothing connects to MyCare, Epic/MyChart, Gozio, an identity provider, a push provider or an analytics source. Every screen says so, and the code has no endpoints, backend URLs or credentials.

## Build

`python3 build.py` writes two files from the same source: `admin-portal.html` (the full portal) and `dashboard.html` (Dashboard only: opens signed in as the sample Super Admin; every other page, link and user-menu action is locked and says so).

```
cd admin
python3 build.py
```

The build writes `admin-portal.html`, a single self-contained file published as a claude.ai Artifact and committed beside its source. It needs Python 3 only. At run time the page loads Inter and a Material Symbols Rounded subset from Google Fonts; everything else is inline.

`build.py` concatenates `src/styles/` and the JS files (in `FILES` order) into one strict-mode script. It inlines the `mycare-logo/` SVGs unaltered and the mobile preview (`src/preview/`) for a sandboxed `srcdoc` iframe. It also derives the icon subset from every glyph the code names.

## What each module does

| Module | Routes | Working flows |
|---|---|---|
| Sign-in | `login`, `mfa`, `signed-out`, `expired`, `denied` | Simulated UTSW SSO, then sample account, then simulated MFA approval. Never a password. Idle timeout from settings, sign out, access denied, and return to the requested page |
| Dashboard | `dashboard` | Quick create (alert, campaign, notification), four sample KPIs, live emergency alerts, "Right now in the app" (live guest home phone, campaign showing, alerts, layout and indoor-map versions), what's coming up in the next 30 days, and recent activity |
| Feature publishing bar | Layout, Campaigns, Emergency alerts, Quick links, Featured cards, Audience segments | Home Screen is a sidebar group again, one page per feature. Each feature's page has a slim Publishing bar with three batch actions (each button says how many items it moves) – Deploy drafts to demo, Publish demo to production, and Publish drafts directly (skips demo). Each batch lists the items it can move, all ticked; untick any to leave them out. One comment goes into each item's history. Only what the role may do is offered (Marketing: deploy only). Single items keep their full Draft/Demo/Production row, which adds Publish directly |
| Collapsible sidebar | Every page | On screens 1024px and wider, the button left of the logo collapses the sidebar to a 72px icon rail and expands it again; the choice is remembered in this browser. In the rail, each icon has a tooltip, the current section is highlighted, and a section opens as a flyout of its pages (Escape or a click outside closes it). Pages reflow to the wider space through their container queries. Below 1024px the menu button opens the sidebar as a drawer, as before |
| Several at once | every `-new` page (campaigns, alerts, quick links, featured cards, audience segments) | One New button. The new-item form is an accordion: one panel per item ("Campaign 1 – title", with a problem count when it has errors), the open panel drives the preview, and **Add more** at the bottom adds another, opened and focused. Remove sits on each panel header. Save N as drafts checks every item first (the first one with problems opens), then saves them all and returns to the list; one item opens its editor as before. Up to 10 at a time |
| Home layout | `home-layout` | Guest and Authenticated tabs: reorder by drag and drop (mouse, touch or pen), with the arrow keys on the handle, or from the handle's move menu (WCAG 2.5.7 alternative to dragging), show or hide, live preview, full lifecycle, change history with rollback. Save draft and Discard sit on the modules card; deploy and publish (or publish directly) from the page's Publishing bar. No per-layout publishing row |
| Campaigns | `home-campaigns`, `-new`, `-:id` | List with search, filters and status. Create and edit: content, image and alt text, facts, CTA and destination, audience, schedule (Starts: Instant or Scheduled; separate date and time inputs for start and end), time zone. Validation, live preview, lifecycle, delete never-published drafts |
| Emergency alerts | `home-alerts`, `-new`, `-:id` | Styled apart from campaigns (red banner, red-ruled form). Type, icon, message, full text, CTA, priority, display duration, window, dismissible, on or off. Preview stacks alerts by priority |
| Quick links, Featured cards | `home-quick-links…`, `home-featured-cards…` | Title, approved icon, icon alt text, destination, position, sign-in lock (MyChart destinations must need sign-in), preview of the tiles or rows |
| Global colors | `content-colors` | Four approved colors with live WCAG checks; saving is blocked until every check passes. Preview in light and dark |
| Drawer / More options | `content-drawer` | Per section: show or hide, reorder, edit, add and remove items (Inbox and Language are fixed). Drawer preview, with hidden items optionally shown dimmed |
| App entry | `content-app-entry` | Onboarding, EULA (version, text, re-accept), sign-in prompt and its type. Preview of the first-launch screen and EULA sheet |
| Search | `search-query-mappings`, `search-synonyms`, `search-specialties`, `search-zero-results`, `search-ranking` | Editable tables with duplicate checks and a "Try a search" tester that uses unsaved edits. Zero-result queries become a synonym or mapping draft in one step. Ranking weights must total 100 |
| Wayfinding | `wayfinding` | Choose or drop a real JSON file, or use a valid or broken sample. Progress, validation errors and warnings, save as validated, then publish to demo, publish to production, roll back, and history |
| Audiences | `audiences…`, `audiences-rules`, `audiences-targeting` | Segments with a rule builder (all or any) and conflict checks, "used by", every rule with a person tester, and targeting campaigns or alerts (saves a draft on each item) |
| Notifications | `notifications`, `-new`, `-:id` | Create and edit with validation, then schedule or send now (Admin and Super Admin), cancel a scheduled one with a reason, duplicate, delete. Choose the audience segment; every notification goes out as push and Inbox. Lock-screen preview, plus results for sent messages Status is one row (status, when, actions); a Versions card lists every save with View and Restore |
| Analytics | `analytics`, `analytics-*` | Overview plus five categories with exactly the brief's metrics. 7, 30 or 90 days with loading and error states, metric tiles, line chart (hover and arrow-key crosshair, data table), and breakdowns |
| Admin management (users) | `users`, `users-new`, `users-:id` | Search and filter by role and status. Create with required, email-format and duplicate checks (simulated invitation). Edit, change role, resend invite, deactivate or reactivate, delete. You can't remove or demote yourself |
| My profile | `profile` | From the user menu (which shows the current role tag). Change your own first and last name (audited). Email, role, status and dates are read only. Password change is SIMULATED: the form checks the rules (12+ characters, a letter and a number, different from the current one, confirmation matches), sends and stores nothing, and clears the fields |
| Audit and versioning | `audit`, `audit-history` | Every action with actor, time, environment, comment and a before-and-after table. Every configuration's versions with comparison and rollback where the type supports it |
| Platform operations | `platform-integrations`, `platform-monitoring` | Simulated integration status with "Run check", fetch error and latency charts, and incidents |
| Administrative settings | `admin-settings`, `admin-settings-locations` | Session timeout, default time zone, required publish comment, and the permission matrix. Location-aware facility messages with a location-card preview |

Every configuration editor shares the same lifecycle:
1. **Save draft** (Marketing can then **Request review**).
2. **Deploy to demo**, which creates a numbered version.
3. **Request changes** (a comment is required) or **Publish to production**, which only publishes what is on demo.
4. **Versions and rollback:** every editor's History card opens on **Versions** (each version, when and by whom, its comment, and whether it is on demo or in production). **View** shows what a version changes against production; **Roll back** makes a new version that copies it onto demo and production. Every configuration type supports rollback now, campaigns and alerts included (still pending confirmation). **Change history** lists the events. Notifications keep a version on every save: a draft can restore an older version (as a new version, nothing lost); a sent, scheduled or cancelled one can use an older version as a new draft.

Every publishing panel is one slim row: the stage tags (draft, demo version, production version) and the actions: Save draft, Deploy to demo, Publish to production, and Publish directly (a saved draft straight to production, skipping demo; Admin and Super Admin). Confirmations list the exact changes, and leaving with unsaved edits asks first.

Tables: every table shows 8 rows a page, with numbered pages once it has more than 8. Filters sit behind one Filters button (the count shows how many are applied); the panel holds all of a table's filters and applies them together with Apply, Escape or a click outside discards, and applied filters show as removable chips above the table.

Forms: helper text sits below its field; every date-and-time value is entered as a separate Date and Time input (campaigns, alerts, notifications), and paired controls share one column gap.

Dropdowns: every select uses one dropdown design (ui/select.js). The native select stays in the page, hidden, as the source of truth for forms and validation; a button shows the choice and opens a listbox in the top layer, so tables, cards and dialogs never clip it. Table filters are multi-select (checkboxes, an All row that clears, values within one filter combine with OR, filters combine with AND). Form fields stay single-select, since each holds one value. Keyboard: Down, Enter or Space opens; arrows, Home, End and typing move; Enter or Space picks; Escape closes.

Theme: the Admin is light only. Each mobile preview has its own Light/Dark toggle that shows the app in the guest app's own dark palette. Every color comes from the `designs/guest` tokens.

## Stack decision

Zero-dependency static app, the option recommended in HANDOVER §6.2: vanilla JS, CSS custom properties, hash routing and a Python build. There is no `package.json`. If UTSW wants production code, the alternative (Vite + React + TypeScript) is still open; see open question 1.

## Structure

```
admin/
  build.py, admin-portal.html (built), README.md
  src/
    index.html            page template
    styles/tokens.css     designs/guest tokens (lines 11–61, unchanged) + admin layout tokens + guest dark values
    styles/admin.css      components and layouts
    app/                  util, permissions (one matrix object), session, nav (IA), shell (header, sidebar, theme, user menu), router, boot
    ui/                   components (button, badge, table, modal, toast…), forms, select (dropdown), charts, lifecycle, preview
    services/services.js  MOCK services: config + lifecycle, users, notifications, wayfinding, zero results, analytics, audit, platform, settings
    mock/seed.js          MOCK fixtures, seeded from designs/guest/src.html (line numbers in comments)
    preview/              mobile.css, mobile.html, mobile.js – designs/guest home, drawer, sign-in choice and sheet markup, copied
    pages/                auth, home-layout, collection (campaigns, alerts, quick links, cards, segments), config-pages,
                          notifications, users, wayfinding, analytics (+ dashboard), admin-pages (audit, platform, settings, rules, targeting, zero results)
```

Nothing outside `admin/` is modified.

## Routes

Routes are plain hash names (`#home-layout`, `#home-campaigns-campaign-flu`) because Artifact links keep only `#name` hashes. Settings live at `#admin-settings` because claude.ai reserves `#settings`.

## What is mock or simulated

- **Sign-in, MFA and session:** simulated, with sample accounts only.
- **Publishing, sending, uploading and integration checks:** simulated in the browser.
- **Analytics, monitoring and zero-result counts:** deterministic sample data.
- **Saving:** changes are saved in this browser's `localStorage` (`utsw-admin-mock-v1`, always wrapped in try/catch). Clearing site data restores the seed.
- **Errors:** every page has an error state with retry; the user-menu switch that simulated failures was removed on request, so the mock services don't fail on their own.
- **Roles:** the role comes from the sample account chosen at sign-in (Super Admin, Admin or Marketing). There is no role switcher in the user menu.
- **Wayfinding files:** read in the browser with FileReader and never uploaded anywhere. The JSON schema checked is a placeholder until UTSW shares a real Gozio export.

## Permissions (proposed, pending confirmation)

The matrix lives in one object, `PERMISSIONS` in `src/app/permissions.js`, and is shown read-only on the settings page. Navigation hides areas a role can't view, and visiting one directly shows access denied. The services check the same matrix. The role switcher (prototype only) keeps the signed-in sample person.

## Verification (Oct. 30, 2026)

Headless Chromium with the pre-installed Playwright, against the built file:
- `python3 build.py` succeeds: 23 JS files, 114 icons, about 450 KB.
- **Route sweep:** 53 routes, covering every page, create page and sample detail page, × 3 roles × light and dark. No console or page errors, no error or stuck loading states, every control has a name, every rendered icon is in the subset, and no horizontal overflow.
- **End-to-end flows:** 48 checks pass, from campaign creation (validation, preview, deploy and publish) through wayfinding bad and good files, the notification lifecycle, users, audit rollback, settings and Marketing permissions.
- **Contrast:** every visible text element, plus dialogs, the user menu, the error summary and validation results.
- **Widths:** 1024, 1280, 1440 and phone width.

### Known issue in the copied mobile design

Campaign tags such as "Flu season" (white on 14% white over the campaign gradient) measure 4.37:1 at the gradient's lightest stop, just under 4.5:1. The rule is copied unchanged from `designs/guest/src.html` (`.camp-tag`), so the preview mirrors it; the fix belongs in `designs/guest`.

## Open questions (HANDOVER §10) – not guessed

1. **Stack:** static, zero-dependency (in use) vs a framework app if this becomes production code.
2. **Which prototype the preview mirrors:** `designs/guest` (in use) vs `design/guest-v2`, whose labels differ ("Find my Care" vs "Find my care"; "I'm a patient" vs "Sign in as a patient").
3. **Configurable modules:** the brief names four, but the prototype has nine module ids. Alerts, Welcome and Search are shown as fixed; the six reorderable ones are configurable here. Which does the Admin manage, and do MedBlog and announcements come from the CMS or a website feed?
4. **Featured cards:** built as the UTSW resources rows, not the MedBlog carousel. Confirm.
5. **Authenticated home:** no design exists. The Authenticated tab uses the personalised homepage modules from the prototype (Your next visits from MyChart, Near you) until the signed-in design is approved.
6. **Alerts:** priority rules for several active alerts, the meaning of "display duration", and whether alerts can be dismissed.
7. **Time zone default:** times show in Central Time (America/Chicago). Confirm, and a selector comes with scheduled content.
8. **Destination types** for campaigns, alerts, quick links, cards and drawer items.
9. **Global colors:** which tokens are editable, the contrast thresholds, and the effect on dark mode.
10. **App entry:** EULA source, versioning and re-acceptance; login prompt types.
11. **Drawer:** which items are fixed or CMS-managed, and whether sections can be reordered.
12. **Search:** the engine, mapping semantics, the source of zero-result queries, and which ranking parameters can change.
13. **Audiences:** attributes, precedence, conflict handling and PHI limits.
14. **Notifications:** push provider, whether delivery types or an approval step are needed (removed from the prototype on request), who can send, cancel and edit rules, allowed video hosts.
15. **Analytics:** data source and exact metric definitions.
16. **Users:** invitation through the identity provider or the Admin; deletion vs deactivation; audit retention and before-and-after detail.
17. **Environments:** what "Demo" is (a separate environment or a build), and who can promote to production. Which config types support versioning and rollback (all flags here are assumptions).
18. **Admin device support:** built for desktop (1280 and 1440, usable at 1024). It also works at phone width, but that is not a supported target until confirmed.
19. **Spelling:** the UI uses US English ("Global colors") per UT Southwestern style, while the brief uses UK spelling. The one exception is the app's own label "Personalise My Homepage".
20. **Logo:** `mycare-logo/` is a proposal pending CMPA approval and is used unaltered.
21. **Password changes:** sign-in is UTSW SSO, so who changes an admin's password (the identity provider's own page, or never from the Admin) and whether the profile page should link there. The prototype's password form is simulated and stores nothing.

Also pending: the session timeout (30 minutes is a placeholder) and the final permission matrix.

## Next

- Connect the services to a real backend once an API contract exists. Screens only call the service interfaces in `src/services/services.js`.
- Replace the simulated sign-in with the approved identity provider, and the proposed permission matrix with the confirmed one.
- Swap in real data sources for analytics, push and the Gozio export schema as UTSW confirms them.
