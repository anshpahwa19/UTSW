# UTSW MyCare 2.0 – Admin Portal handover

Prepared Oct. 30, 2026, from branch `claude/serene-hamilton-9mf14n` (repo state at commit `dbf9222`). This is analysis only. Nothing in the Admin Portal has been built, and no mobile prototype was changed. The full request is saved word for word in `BRIEF.md` next to this file.

**For the new chat:** read `BRIEF.md` and this file, settle the one decision in §6, then start with the task in §11.

---

## 0. Five facts that shape everything

1. **There is no compiled mobile app in this repo.** The "patient app" is a set of interactive HTML prototypes: static single files with vanilla JS, built by small Python scripts and published as claude.ai Artifacts. There is no React Native, Flutter or native code, no `package.json`, no backend, no API, no authentication and no test suite.
2. **No real integration exists to reuse.** Every Admin data service (auth, config, publishing, notifications, analytics, Gozio) has to be a mock, labelled as one, behind a service layer.
3. **The prototypes already hold the content model the Admin needs.** Module ids, order and visibility, alerts, quick links, MedBlog, resources, campaign, announcements, menu, synonyms and sorts are all defined in `designs/guest/src.html`. Use them as the starting config schema (§6.3) rather than inventing a new one.
4. **The brand and tokens are documented and consistent** across prototypes. Reuse them as they are.
5. **No Admin Portal or admin component exists.** The nearest thing is each prototype's "board": a side panel of prototype controls, including a CMS-style module order and visibility list. It has its own `--bd-*` chrome tokens.

## 1. Existing technology stack

| Layer | What the repo uses |
|---|---|
| Language | HTML, CSS custom properties, vanilla ES2020 JavaScript. No framework, TypeScript or bundler |
| Build | One Python 3 standard-library `build.py` per prototype. It inlines JS, the logo SVGs and icon glyphs into one self-contained `.html`. Run `python3 build.py` inside the folder; the built file is committed beside its source |
| Routing | No URL routing. Each prototype keeps an in-page screen stack in JS (`push`/`pop`, tabs, sheets, drawer) |
| Fonts | Inter from Google Fonts |
| Icons | Material Symbols Rounded, delivered two ways: `designs/*` load a variable-font subset from Google Fonts by concept key (`ICON_MAP`); `design/*` inline SVG paths listed in `design/icons/manifest.json` and fetched by `design/fetch_icons.py` (Apache 2.0, `design/icons/LICENSE.txt`) |
| Data | Hard-coded fictional arrays in each prototype. Device state lives in `localStorage`, always wrapped in try/catch (designs/guest key `mycare-guest-v1`; guest-v2 prefix `mycare-guest-`) |
| Hosting | claude.ai Artifacts. Scripts may load only from cdnjs, jsdelivr, unpkg, cdn.tailwindcss.com and code.jquery.com; stylesheets only from Google Fonts. No requests to other hosts. Pages run in a sandboxed iframe where storage can throw |
| Verification | Headless Chromium and Playwright are pre-installed in the cloud container (`require('playwright')`). Specs record console-error sweeps and contrast sweeps run that way. No CI |
| Conventions | `.gitignore` holds only `__pycache__/`. Each prototype has a `TOKENS.md` or `README.md` spec. Sample data is visibly fictional (555 phone numbers, `mycare.example` links), except real building names in the geo prototypes |

## 2. Existing project structure

```
design/                  Original home-screen prototype and the shared SVG icon pipeline
  TOKENS.md              Home-screen spec: type, spacing, color, radii, icons, motion
  home-screen.src.html → home-screen.html (build.py)
  fetch_icons.py, icons/ manifest.json, svg/, README.md, LICENSE.txt
  guest-v2/              Parallel guest prototype: guest-flow.src.html + guest-flow.src.js → guest-flow.html, README.md
designs/                 Canonical design line. Each folder: src.html → build.py → mycare-*.html, plus TOKENS.md
  playful/               Base direction: defines the type, color, radii, motion and icon scales
  guest/                 Canonical guest flow: splash, onboarding, sign-in choice, guest home, Find my Care,
                         personalised homepage, dark mode, CMS module order board control
  geo/                   Location-aware home: context card, journey, step-by-step directions
  geo-alt/               Alternative: Today line, place mode, Gozio-style navigation, 3D map, device mockups,
                         "Real integrations needed" table
  geo-duo/               Foldable concept
glass-prototype/         Earlier dark "glass" direction (superseded)
handoff/                 Briefs and source material
  BRIEF.md               Home-screen brief: requirements table, brand guidelines, editorial style, WCAG 2.2 AA checklist
  home-screen-requirements.webp
  guest-provider-refs/, guest-v2/   Old-app screens (PDF), Home and Find care requirement images, guest brief
  logo-iterations/       Logo brief, current logo, reference slides
  admin-portal/          BRIEF.md (Admin request) and this HANDOVER.md
mycare-logo/             Proposed MyCare logo SVGs: horizontal, stacked, reversed, wordmark, icon, one-color variants, clearspace
logo-iterations/         Four further logo directions (ask, care-inside, seamless, way-in) – proposals, not used in any prototype
```

**Source of truth for the Admin:** `designs/guest/` for tokens, content model, guest flow and dark mode; `designs/geo-alt/` for location-aware and wayfinding concepts. `design/guest-v2/` is a parallel guest exploration on the same brand. It differs in some labels: "Find my care" vs "Find my Care", and "Sign in as a patient" vs "I'm a patient". See §10.

## 3. Existing mobile design system

Defined in `designs/guest/src.html` (`:root`, lines 11–61) and specified in `designs/guest/TOKENS.md` and `designs/playful/TOKENS.md`. The brand rules come from `handoff/BRIEF.md`, and the full brand deck is at https://claude.ai/artifact/F6kTZbgBk3sHEGxLFfftZL.

**Color**

| Token | Light | Dark | Role |
|---|---|---|---|
| `--brand` | #004278 | #004278 | UT Southwestern Blue (PMS 2945, the only official value). Large brand surfaces: app bar, hero, splash, drawer header, campaign |
| `--ctl` | #004278 | #2D6CA6 | Primary buttons, selected chips, switches |
| `--blue` | #004278 | #8CC0EA | Accent for headings, links and icons |
| `--blue-80`, `--pms542` | #336893, #7BAFD4 | | Supporting blues |
| `--cyan` | #00A9E0 | | Non-text shapes only (2.5:1 on white) |
| `--bg` / `--surface` | #F7F8FA / #FFFFFF | #0D1620 / #16222E | Page / cards |
| `--tint` / `--tint-2` / `--sky` | #EBF0F5 / #D1DDE6 / #D6E4F0 | #1F3042 / #2A4157 | Fills and tonal buttons |
| `--line` / `--line-strong` | #D5DDE5 / #808B96 | #2B3C4D / #7D8E9E | Hairlines / field outlines |
| `--ink` / `--ink-2` | #333333 / #5B6770 | #E6EDF3 / #A6B4C0 | Body / secondary text |
| `--alert` / `--alert-ink` | #B0003A | #B0003A / #FF8AA8 | Emergency alert banner (white text, 7.2:1) and error text only |
| `--on-blue-2` / `--on-blue-3` | #D6E4F0 / #A9C7E0 | | Text on Blue |

Brand brights and muted tones (orange #E87722, magenta-red #E0004D, green #43B02A, purple #8246AF and others) are listed in `handoff/BRIEF.md`. They are approximate screen values and are not used in the app UI.

**Type:** Inter (Inter Display at 20.0 and above). Sizes 12, 14, 16, 18, 20, 24, 28, 32, written "16.0" in specs, as tokens `--t12`…`--t32` scaled by `--ts` for large text. Weights 400, 600 and 700. Minimum body size 16.0 on mobile.
**Spacing:** 4-pt scale `--s1 4`, `--s2 8`, `--s3 12`, `--s4 16`, `--s6 24`, `--s8 32`, `--s10 40`, `--s12 48`. Targets: `--hit 44`, `--hit-lg 48`.
**Radii:** `--r-sm 8`, `--r-md 12`, `--r-lg 16`, `--r-xl 24`, `--r-pill`.
**Elevation and focus:** `--shadow-1`, `--shadow-2`; `--focus: 0 0 0 2px #FFF, 0 0 0 5px #004278`; `--focus-on-blue`.
**Motion:** `--d-fast 150ms`, `--d-base 240ms`, `--d-slow 400ms`, `--ease-out`, `--ease-in-out`, and spring curves (`--spring-snappy`, `--spring-gentle`) as CSS `linear()`. Reduced motion swaps every transform for a 240 ms cross-fade.
**Icons:** Material Symbols Rounded only, one color, FILL 0 at rest and 1 when selected, weight 500. Each glyph is chosen by concept key from `ICON_MAP` (designs/guest lines 1712+; "CMS tiles pick from the approved concept list"). Avoid crosses as medical shorthand (a red cross is a protected emblem), the Star of Life, emoji and a second icon family.
**Editorial style:** sentence-case titles; en dash with spaces, never em dashes; serial comma; AP dates and times (Oct. 14, 7:45 a.m., noon); "UT Southwestern" never broken across lines; no "&" in running text; US English. The one exception is the requested label "Personalise My Homepage".
**Accessibility:** WCAG 2.2 AA. Text contrast 4.5:1 (3:1 for large text); UI and focus 3:1. Never rely on color alone: severity carries an icon and a word. Every icon button has a name. Emergency alerts use a live region. Reduced motion and large text are supported.

**Adapting for desktop admin:** keep every color, type, radius, focus and motion token unchanged. Add admin-only layout tokens (sidebar width, content max-width, table row height, a 14.0 dense body for tables) in the Admin's own stylesheet, never in the mobile files. The board's `--bd-*` tokens show how a neutral admin chrome can sit next to the brand.

## 4. Reusable components and assets

**Assets (reuse unaltered)**
- `mycare-logo/*.svg`. Inline them at build time the way `designs/guest/build.py` does. Horizontal on light backgrounds, reversed on Blue, brand minimum width 187. Never redraw or recolor. The logo itself is still a proposal pending CMPA approval.
- Icons: either the Google Fonts Material Symbols subset (designs/guest approach) or inlined SVG via `design/icons/manifest.json` + `fetch_icons.py` (design/guest-v2 approach). Pick one for the Admin. The SVG route works offline and keeps the built file self-contained.
- Inter from Google Fonts.

**Patterns to copy, not import.** They exist as CSS and JS inside prototypes, not as packaged components. Copy what's needed into the Admin and never link across folders.
- Buttons: primary (`--ctl` fill), tonal (`--tint`), secondary outline and text, at 44 or 48 high.
- Chips: filters with a remove action. Switch (`role="switch"`). Segmented controls (board).
- Sheets and dialogs with focus handling. Toast with Undo (5 s). Skeleton loading. Empty, error, offline and no-results states, each with a retry.
- Emergency alert banner in collapsed and detail states, two alerts stacking by priority.
- Source and status tags: "From MyChart", "Sample data", "Simulated", "Featured". The Admin needs the same honesty labels ("Mock data", "Draft", "Demo", "Production").
- Board module-order list (reorder plus visibility toggle). It is the interaction to grow into Home Screen Management.
- Phone frame at 390 × 844, also checked at 360.

**Mobile preview source.** The home modules in `designs/guest/src.html` render from data arrays. The Admin preview should reuse that markup and CSS in an isolated frame (an `iframe` with `srcdoc`, so styles can't leak), fed by the Admin's draft config. The brief's rule: no unrelated mobile design.

**Not for reuse in the Admin:** splash, onboarding scenes, scroll animations, capture mode, and the Find my Care search engine logic (only its synonym and sort data matter).

## 5. Current mobile application functionality (prototype level)

| Area | What exists (fictional data, simulated systems) | Admin module it informs |
|---|---|---|
| First launch | Animated splash; four onboarding slides (Find my Care, MyChart, Locations, Wayfinding); sign-in choice ("I'm a patient" opens a simulated MyChart sign-in; "Continue as guest"); Create an account and Pay a bill as a guest one tap away. **No EULA anywhere** | App Entry |
| Navigation | Guest tabs Home · Find my Care · Locations · Wayfinding · MyChart. Hamburger opens the More drawer: Inbox, Saved providers, Campus shuttle; About UT Southwestern (Why UT Southwestern, Patient resource guide, Patient resources, Physician resources, COVID-19 resources, Visit the full website); Settings and help (Language, Help and contact us, Privacy policy, Appearance); Follow us. The spec says "Menu items come from the CMS" | Drawer / More Options |
| Home composition | Fixed header `HEAD = ['alerts','greeting','search']`, then CMS-ordered modules `cfg = ['tiles','signin','featured','services','campaign','news']`, each with an on/off switch. Labels in `MOD_LABELS` (§6.3) | Home Screen Management |
| Emergency alerts | `ALERTS` `{id, pri, title, summary, window, full}`; none, one or two active; priority stacking; detail view; activation window shown as text | Emergency Alerts |
| Quick links | Six tiles with exact names: Find my Care, Locations (`TILES`), plus Message your doctor, Get your test results, Manage Your Visits, Manage Billing (`LOCKED`, each with `why`/`what`). The last four open a MyChart sign-in prompt for guests and never edit Epic data | Quick Links |
| Featured content | MedBlog carousel (`FEATURED`: kick, title, date, read time, art, body); MedBlog list (See all); UTSW resources (`RESOURCES`: title, subtitle, icon); campaign "Flu shots are here" (`PAGES.flu`: facts, CTA, add to calendar); announcements (`ANN`: date, title, subtitle) | Campaigns, Featured Cards |
| Personalised homepage (designs/guest) | "Personalise My Homepage" switch; reorders modules from location, appointment history, preferred services and care needs. Sample patient Jordan Rivera stands in for MyChart; the choice stays on the device | Audience (advanced personalisation is not MVP) |
| Authenticated home | **Not designed.** The signed-in home is "the next round"; only the personalised mode shows "Your next visits" from sample MyChart data | Authenticated Experience (no mobile reference yet) |
| Search and Find my Care | Scopes (All, Providers, Locations, Content, Resources); top searches with a scope (`TOP`); popular (`POPULAR`); suggestions; synonyms (`SYN`, e.g. "skin doc" → Dermatology); typo fixes; plain-language parsing ("near Frisco", "Spanish-speaking"); eight filter attributes; sorts (`SORTS`: Best match, Distance, Last name A–Z, Featured first, always labelled); loading, error, offline and no-results states | Search Configuration |
| Providers and locations | Profile, save (device), share (public link only); locations list and map; location permission flows (ask, denied, no fix, ZIP or city) | – (content comes from source systems) |
| Wayfinding | geo and geo-alt simulate a journey, Gozio-style indoor navigation and sample maps. **No file upload or JSON anywhere** | Wayfinding (no mobile counterpart) |
| Notifications | Menu → Inbox lists app notifications (active alert, announcements) with unread dots and Mark all as read. geo simulates an arrival notice. No push | Notifications |
| Analytics | None. Only an on-device tap count used to order personalised quick links | Analytics (all mock) |
| Theme | Light, dark and system appearance on the device. No colors come from a CMS | Global Colours |

`designs/geo-alt/TOKENS.md` (Real integrations needed) names what production would need: geofences, indoor positioning (BLE or Wi-Fi RTT), venue map data (IMDF or the wayfinding vendor's SDK, such as Gozio), Epic MyChart for visits and check-in hand-off, CMS content per building, garage feeds, and local notifications. "Epic stays Epic." None of these exist in the repo.

## 6. Recommended Admin Portal architecture

### 6.1 Placement
A **separate application** in a new top-level `admin/` folder, logically and physically isolated from `designs/`, `design/` and the logo folders. The repo has no shared app to add a route or module to, and isolation guarantees the patient prototypes can't break.

### 6.2 Stack – the one decision to confirm first
- **Recommended: follow the repo's convention.** A zero-dependency static app: vanilla JS (ES modules in source), CSS custom properties, and a Python `build.py` that inlines everything into one `admin/admin-portal.html` publishable as a claude.ai Artifact. Hash routing (`#/home/campaigns/123`). No new toolchain or dependencies, consistent with every other deliverable here, and shareable as a link.
- **Alternative**, only if UTSW wants this to become production code now: Vite + React + TypeScript. This would add the repo's first `package.json` and Node toolchain, and production hosting, auth and API choices that don't exist yet.

Proposed layout (recommended option):

```
admin/
  README.md            Build, routes, what is mock, open questions
  build.py             Inlines CSS, JS, logo and icons → admin-portal.html
  admin-portal.html    Built file (committed, as elsewhere in the repo)
  src/
    index.html         Shell markup
    styles/tokens.css  Copied from designs/guest :root (unchanged) + admin layout tokens
    styles/admin.css   Components and layouts
    app/router.js      Hash routes, breadcrumbs, guards (role, session)
    app/session.js     Mock SSO session, expiry, logout, prototype-only role switcher
    app/permissions.js Role → permission matrix, one object, marked "pending confirmation"
    ui/                shell, sidebar, header, page heading, button, field, select, table, filters,
                       badge, card, modal, confirm, toast, empty/loading/error, stepper, preview
    services/          Async interfaces: config, publishing, users, notifications, wayfinding,
                       search, audiences, analytics, audit. Simulated latency and error injection
    mock/              Fixtures, every one labelled MOCK, seeded from designs/guest data
    preview/           Isolated mobile preview (iframe srcdoc) reusing designs/guest module CSS and markup
```

### 6.3 Config schema to start from (taken from the prototypes)

| Config | Seed from | Fields to add from the brief |
|---|---|---|
| Home layout per audience | `MOD_LABELS`, `HEAD` (fixed), `cfg` (order and on/off) in designs/guest lines 2112–2114 | `audience: guest \| authenticated`, audience rules, status |
| Emergency alert | `ALERTS` (line 1819) | type, icon, CTA label, destination type and destination, audience, start and end date and time, time zone, display duration, status |
| Campaign | `PAGES.flu` (line 2038) | title, type, image and alt text, description, CTA, destination type and destination, audience, start, end, time zone, status |
| Quick link | `TILES` + `LOCKED` (lines 1974–1982) | icon (concept key from `ICON_MAP`), icon alt text, destination, status |
| Featured card | `RESOURCES` (line 2016); see §10 | title, icon, icon alt text, destination, status |
| Drawer item | Menu list in designs/guest TOKENS.md, Navigation | section, label, destination, visible, order |
| Search | `SYN` (line 1894), `TOP` (1983), `POPULAR` (1984), `SORTS` (2489), `SCOPES` (2965) | query mappings, specialty mapping, zero-result queries, approved ranking parameters |
| Global colours | `--brand`, `--ctl`, `--blue`, `--bg` | Only the approved set, with contrast validation (4.5:1) and light and dark preview |
| App entry | Onboarding and sign-in choice in designs/guest TOKENS.md | EULA visible, login prompt visible, login prompt type |

Every versioned record carries `id`, `status`, `environment`, `version`, `updatedBy`, `updatedAt` and `comment`, plus a per-type `supportsRollback` flag. Never assume rollback for every type.

### 6.4 Behavior rules for the build
- **Lifecycle:** Draft → Deploy to demo → Request changes (back to Draft) or Publish to production → Rollback where the type supports it. Keep draft, demo and production snapshots separate. The preview and every list say which environment they show. A draft never shows as live.
- **Honesty:** a persistent "Prototype – mock data, not connected to MyCare" indicator; integration states shown as "Simulated"; no URLs, endpoints or credentials anywhere in the code.
- **Auth:** "Sign in with UTSW SSO" leads to a simulated identity-provider and MFA step labelled "Simulated". Also needed: access-denied, session-expired and logged-out states. Never a username and password form.
- **Persistence:** mock edits are saved to `localStorage` (try/catch) so reviewers keep their changes across reloads, with a "Reset mock data" action.
- **Charts:** no chart library is in the repo. Draw inline SVG to avoid a dependency, and only for metrics backed by mock data that is labelled.
- **Accessibility:** semantic tables (header cells with scope, sortable headers announced); labelled fields with errors tied by `aria-describedby`; toasts in an `aria-live` region; status badges always pair an icon with a word; full keyboard paths through the sidebar, tables, dialogs and reorder (move up and down buttons, not drag only); the same `--focus` ring.

## 7. Admin Portal information architecture

The brief's IA (§4 of BRIEF.md), with nesting reduced where a sub-item is really a route or a tab:

| Section | Pages (routes) | Notes |
|---|---|---|
| Dashboard | `#/dashboard` | Mock metrics clearly labelled; active alerts; scheduled notifications; pending demo items; wayfinding status; recent activity |
| Home Screen Management | Layout (`#/home/layout`, Guest and Authenticated tabs, module library as a side panel, live preview) · Campaigns · Emergency Alerts · Quick Links · Featured Cards (each a list, a new route and a `:id` route) | Folds Overview, Module Library, Guest and Authenticated into one Layout page. Emergency Alerts styled in `--alert` and kept apart from campaigns |
| Content and Navigation | Global Colours · Drawer / More Options · App Entry | Each a split editor with a preview |
| Search Configuration | Query Mappings · Synonyms · Specialty Mapping · Zero-Result Queries · Ranking | Ranking shows only approved parameters (relevance, distance, availability, language/accessibility where supported) |
| Wayfinding | One page with a stepper: Upload → Validate → Demo → Production, plus Published version and History tabs | Upload and publish are separate actions; manual Gozio JSON only |
| Audience Management | Segments (list, new, `:id`) · Rules · Targeting | Only approved attributes; no AI screens |
| Notifications | All notifications (`#/notifications`), Create (`/new`), Details (`/:id`) | Create and Details are routes, not sidebar items |
| Analytics and Reporting | Overview · Adoption and Engagement · Search · Content · Care and Wayfinding · Notifications | Metric list exactly as in the brief; date range; loading, empty and error states; all mock |
| User Management | All users (`#/users`), Create (`/new`), Details (`/:id`) | Invitation and activation follow the approved auth workflow |
| Audit and Versioning | Audit Logs · Configuration History (rollback inside a version's detail, with confirmation) | Rollback appears only where supported |
| Platform Operations | Integration Status · Operational Monitoring | "Requires discovery and approval" pages; no invented controls |
| Settings | Approved administrative settings · Location-aware configuration (where confirmed) | Same treatment as Platform Operations |
| System routes | `#/login`, `#/mfa`, `#/denied`, `#/expired`, `#/signed-out` | |

**Role visibility (a proposal to confirm, kept in one matrix object):**

| Area | Super Admin | Admin | Marketing |
|---|---|---|---|
| Dashboard, Analytics | View | View | View |
| Home layout, Quick Links, Featured Cards, Drawer, App Entry | Edit and publish | Edit and publish | Edit draft, request review |
| Campaigns | Edit and publish | Edit and publish | Edit and publish to demo |
| Emergency Alerts | Edit and publish | Edit and publish | View |
| Global Colours | Edit and publish | View | View |
| Search, Audiences, Wayfinding | Edit and publish | Edit and publish | View |
| Notifications | Edit and send | Edit and send | Draft |
| Users | Manage | View | – |
| Audit and Versioning | View, roll back | View | – |
| Platform Operations, Settings | View (discovery pages) | – | – |

## 8. Implementation dependencies

**Inside the repo (read-only inputs, copy into `admin/`)**
- Tokens: `designs/guest/src.html` lines 11–61, including the dark values (see `designs/guest/TOKENS.md`, Dark mode).
- Content model: `designs/guest/src.html`: `ICON_MAP` 1712, `ALERTS` 1819, `LOCS` 1829, `PROVIDERS` 1848, `SYN` 1894, `TILES`/`LOCKED` 1974, `TOP`/`POPULAR` 1983, `FEATURED` 1994, `RESOURCES` 2016, `ANN` 2023, `PAGES` 2028, `SHUTTLES` 2049, `INBOX` 2053, `MOD_LABELS`/`HEAD`/`cfg` 2112, `SORTS` 2489, `SCOPES` 2965, `TABS` 3090.
- Home module markup and CSS for the preview: same file.
- Logos: `mycare-logo/`. Icons: `design/icons/` + `design/fetch_icons.py`, or the Google Fonts subset.
- Brand and editorial rules plus the accessibility checklist: `handoff/BRIEF.md`.

**External**
- Google Fonts (Inter, Material Symbols). Playwright and Chromium for verification (pre-installed). The claude.ai Artifact tool for sharing.

**Decisions that block specific phases (UTSW to supply)**

| Phase | Needed before it can be real (the UI can still be built on mocks) |
|---|---|
| 2 – Auth, users | Identity provider and protocol (SAML or OIDC), MFA mechanism, session timeout, invitation and activation flow, deactivation vs deletion, final permission matrix |
| 3 – Mobile content | Authenticated home design; which modules are configurable vs fixed; campaign types and count (SOW: three to five); "Featured Cards" definition; destination types (in-app screen, web URL, MyChart deep link, phone?); approved global colour set; EULA source and versioning; login prompt types |
| 4 – Operations | Notification channel and push provider, approval, cancel and edit rules; Gozio JSON schema and a sample file; which config types support versioning and rollback; what "Demo" is (separate environment or build) |
| 5 – Search, audiences, analytics | Search platform and the controls it actually exposes; audience attributes, precedence, conflicts and privacy (PHI) limits; analytics source and metric definitions |
| 6 – Advanced | Confirmed scope for platform operations and location-aware configuration |
| All | A backend and API contract. None exists; every service stays mock until one is provided |

## 9. Important constraints

- Do not modify `designs/`, `design/`, `glass-prototype/`, `mycare-logo/`, `logo-iterations/` or `handoff/` sources. Read them, and copy what's needed into `admin/`.
- Do not invent API endpoints, credentials or undocumented backend behavior. Never present publishing, authentication, analytics or notifications as connected to production.
- Do not replace UTSW SSO and MFA with a custom username and password system.
- Epic/MyChart is the source of truth for clinical and appointment data. The Admin configures only destinations and hand-offs into MyChart, never MyChart content, and does not recreate the patient app.
- Gozio: manual JSON export and upload only. No direct integration; upload and publish are separate actions.
- Versioning and rollback only where a config type supports it.
- Not confirmed MVP, so not to be built as features: integration credential management, advanced observability, geofencing management, Bluetooth beacon configuration, AI administration, advanced activity-based personalisation. Document them as needing discovery.
- Only show metrics backed by available data, and label mock data everywhere it appears.
- Emergency alerts must look and behave differently from campaigns.
- Unpublished changes must never look live. Draft, demo and production are always distinguishable in lists, editors and the preview.
- No dead buttons or misleading controls in the implemented scope; planned pages say so plainly.
- WCAG 2.2 AA; status never by color alone; keyboard paths for every action, including reorder.
- Logos are used unaltered. Material Symbols Rounded is the only icon family. UTSW editorial style for all copy.
- No unnecessary dependencies. If the result is published as an Artifact, it must meet the Artifact CSP (§1).
- Git: work on the session's branch, commit and push. No pull request unless asked.

## 10. Unconfirmed requirements and conflicts to resolve

1. **Stack** (§6.2): static, zero-dependency (recommended) vs a framework app.
2. **Which prototype the preview mirrors:** `designs/guest` (canonical) vs `design/guest-v2`. Labels differ ("Find my Care" vs "Find my care"; "I'm a patient" vs "Sign in as a patient").
3. **Configurable modules:** the brief lists four (Campaigns, Emergency Alerts, Quick Links, Featured Cards). The prototypes have nine module ids. Alerts, greeting and search are fixed at the top; tiles, sign-in prompt, MedBlog, resources, campaign and announcements are reorderable. Which of these does the Admin manage, and where do MedBlog and announcements come from (CMS vs website feed)?
4. **"Featured Cards"** (title, icon, alt text, destination) best matches the prototype's UTSW resources rows, not the MedBlog "featured" carousel. Confirm.
5. **Authenticated home:** no design exists, so the Authenticated tab needs a module list from UTSW or the next design round.
6. **Alerts:** priority rules for several active alerts (the prototype stacks two by `pri`); meaning of "display duration"; whether alerts are dismissible.
7. **Time zone default:** assume America/Chicago (Central) for Dallas, with an explicit selector.
8. **Destination types** for campaigns, alerts, quick links, cards and drawer items.
9. **Global colours:** which tokens are editable, contrast thresholds enforced, and the effect on dark mode (the brand surface stays #004278 in both themes today).
10. **App entry:** EULA text source, versioning and re-acceptance; login prompt types (the prototypes have a sign-in choice screen and a MyChart sign-in prompt module).
11. **Drawer:** which items are fixed and which are CMS-managed; whether sections can be reordered.
12. **Search:** engine behind it, mapping semantics, source of zero-result queries, which ranking parameters are adjustable.
13. **Audiences:** attributes (guest vs authenticated, location, language?), precedence and conflict handling, and PHI limits. The personalised homepage uses MyChart data on the device only.
14. **Notifications:** push provider, delivery types, approval, cancel and edit rules, allowed video hosts.
15. **Analytics:** data source and exact metric definitions (for example "meaningful engagement", "patient task success").
16. **Users:** invitation through the identity provider or the Admin; deletion vs deactivation; audit retention and before-and-after detail.
17. **Environments:** what "Demo" is, and who can promote to production.
18. **Admin device support:** desktop only (recommended 1280 and 1440, usable at 1024) or tablet too.
19. **Spelling:** the brief uses UK spelling ("Colours", "Personalisation"); the app copy is US English per UT Southwestern style. Recommend US English in the UI ("Global colors") once confirmed.
20. **Logo:** `mycare-logo/` is a proposal pending CMPA approval; `logo-iterations/` directions are not adopted.

## 11. Recommended first implementation task

**Phase 1 foundation plus one vertical slice**, in the new chat:

1. Confirm the stack (§6.2) in a single question. Proceed with the static option if there's no answer.
2. Create `admin/` with `build.py`, `tokens.css` (copied from designs/guest, unchanged, plus admin layout tokens), and the app shell:
   - persistent sidebar with the full IA (§7), role-filtered
   - top header with an environment indicator, the mock-data indicator, and the user menu (role switcher labelled "Prototype only", sign out)
   - page heading with breadcrumbs, and the hash router with every route
   - planned pages that state "Planned – Phase N" with no dead controls
3. Build the core components: button, field, select, checkbox and switch, table with search and filters, badge, card, modal, confirm dialog, toast, empty, loading and error states, stepper, and the preview frame.
4. Add the mock service layer and the config schema (§6.3), seeded from designs/guest data, with the draft, demo and production lifecycle and simulated latency and errors.
5. Build the vertical slice, **Home Screen Management → Layout (Guest)**: module list with reorder and visibility, live mobile preview reusing designs/guest module markup, and Save draft, Deploy to demo and Publish to production with environment badges and confirmations. This proves the shell, components, services, preview and lifecycle together before the other modules repeat the pattern.
6. Verify:
   - `python3 build.py` succeeds
   - headless Chromium shows no console or page errors across every route and role
   - keyboard-only pass through the sidebar, table, dialog and reorder
   - contrast check of all text
   - widths 1024, 1280 and 1440
   - publish the Artifact, then commit and push

Suggested opening message for the new chat:

> Read `handoff/admin-portal/BRIEF.md` and `handoff/admin-portal/HANDOVER.md`. Do not modify anything outside `admin/`. Confirm the stack choice in §6.2, then carry out the first implementation task in §11.
