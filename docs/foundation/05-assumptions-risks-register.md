# 5. Assumptions and Risks Register – MyCare 2.0

| | |
|---|---|
| **Deliverable** | 5 of 7 – Assumptions and Risks Register. It also covers the dependency and unknowns register. |
| **Status** | Draft v0.1 – a living register. Update it as each question is answered. |
| **Date** | Oct. 13, 2026 |
| **Sources** | S1 (by slide), S2c, S3–S7. S2a and S2b were not accessed. |
| **Contents** | Part A – Assumptions (A-xx) · Part B – Risks (R-xx) · Part C – Dependencies and unknowns (U-xx) · Part D – Source conflicts (K-xx) |
| **Decisions required** | Each entry names the stakeholder expected to answer or decide. Stakeholder roles are generic because **no UTSW organization chart or contacts were provided** (U-15, Q-35, Q-36). |

**Status values:** **Open** (not yet validated) · **Validated** · **Invalidated** · **Closed**. Every entry starts as **Open**.

---

## Part A – Assumptions

| ID | Assumption | Basis | Impact if wrong | How to validate | Owner to confirm | Status |
|---|---|---|---|---|---|---|
| A-01 | MyCare 2.0 is the next version of the existing "UTSW MyCare" app (same product, evolved), not a new product | Deck title; "Current" vs. "Future" framing (S1) | Scope, migration, app-store listing and technical approach all change | Q-03 | Product owner | Open |
| A-02 | The primary audiences are prospective/new patients and existing patients; on-campus visitors are secondary | "Accepting new patients" filter (S1-2); MyChart Quick Links (S1-17); Campus Mode (S1-21) | Home screen, navigation and sign-in priorities change | Q-04; analytics (Q-07, Q-09) | Product owner; Patient Experience | Open |
| A-03 | "Find Care" replaces or renames "Find a Provider" / the "Providers" tab | Slide headers "Find a Provider Start → Find Care" (S1-1 to S1-5) | Naming and navigation labels change | Q-12 | Product owner; CMPA | Open |
| A-04 | "Schedule Now" means direct online self-scheduling and "Request an Appointment" means a request workflow; which one shows depends on the provider | Different labels on adjacent cards (S1-6) | The main journey's final step is designed wrongly (R-05) | Q-15, Q-26 | Patient Access; Epic / scheduling team | Open |
| A-05 | MyChart stays the system of record for appointments, messages, results and billing; MyCare links into it rather than replacing it | MyChart tab and Quick Links (S1-1, S1-17); "MyChart Portal – Connect now" concept (S1-17) | The architecture and the integration effort change fundamentally | Q-05, Q-27 | Epic / MyChart team; IT | Open |
| A-06 | A personalized home needs authenticated access to appointment data from MyChart / Epic | "AUTHENTICATED" concept with appointment cards (S1-18) | F-25 and F-26 may be impossible or need a different data route | Q-17, Q-27, Q-29 | Epic / MyChart team; IT security | Open |
| A-07 | Gozio is UTSW's wayfinding vendor and may already power the "Wayfinding" tab | "Gozio as the main find and navigate to location" (S1-13); "Gozio SDK" caption in a concept (S1-18) | The Locations and day-of experiences may need a different vendor or approach | Q-28 | Gozio account owner; IT | Open |
| A-08 | Provider and location data in the app come from the same source as utswmed.org | utswmed.org URLs placed on current-state slides (S1-1, S1-13) | Data, filter and search plans change | Q-24, Q-25 | Digital / web platform team | Open |
| A-09 | The attributes behind the proposed filters (gender, languages, online scheduling, affiliation, accepting new patients, provider type) exist as reliable structured data | The Future filter list (S1-2) | Filters ship empty or misleading (R-02) | Data audit; Q-24 | Provider data owner | Open |
| A-10 | The "Gender" filter means the provider's gender | Common directory practice; the list on S1-2 | Label, data and sensitivity decisions change | Q-13 | Product owner; Patient Experience | Open |
| A-11 | "Hospital affiliation (default to UTSW only)" means the directory includes providers who practice at affiliated institutions (for example, Parkland Health or Children's Health), and the default view shows UTSW facilities only | S1-2 wording; affiliated institutions listed in S6 | Filter logic, labels and legal or partner rules change | Q-16 | Medical group leadership; Legal; CMPA | Open |
| A-12 | Inspiration references show *qualities* to emulate, not features or visual styles to copy | References are unannotated or annotated only loosely (S1-3, S1-5, S1-11, S1-12, S1-16, S1-19, S1-20, S1-23) | Scope inflation; off-brand designs (R-08) | Q-06 | Product owner | Open |
| A-13 | The concept screens on S1-17 and S1-18 are exploratory and not approved designs | No approval or source is stated; their content conflicts with the facts (K-05) | Effort spent validating or reworking an approved direction | Q-06 | Product owner | Open |
| A-14 | Campaign content would be curated by CMPA or service-line marketing, not generated per patient | Service-line-to-month mapping (S1-24) | Privacy and personalization design change | Q-21 | CMPA | Open |
| A-15 | Popular searches would come from search analytics or editorial curation | "Popular searches?" (S1-2) | The feature cannot be built without a source | Q-08 | Digital analytics | Open |
| A-16 | The app runs on iOS today; Android support is not shown | All UTSW screenshots are from iOS (S1) | Platform scope and parity work change | Q-22 | Mobile engineering | Open |
| A-17 | The public website has a condition and service taxonomy linked to locations | Indexed URLs `/locations/all/{id}/{condition-or-service}/` (S2c) | The condition-to-specialty mapping for search may need to be built from scratch | Website review (Q-40); Q-25 | Digital / web platform team | Open |

## Part B – Risks

Likelihood and impact are **provisional, qualitative** ratings (High / Medium / Low) based only on the materials reviewed.

| ID | Risk | Likelihood | Impact | Trigger or evidence | Mitigation or validation | Owner |
|---|---|---|---|---|---|---|
| R-01 | **Scope creep.** 13 areas and 39 capabilities with no agreed first-release boundary | High | High | No scope statement in S1 | Agree first-release scope and exclusions in Phase 2 (Q-12) | Product owner |
| R-02 | **Filter data quality.** Proposed filters lack reliable data, causing empty or wrong results and lost trust | Medium | High | A-09 unvalidated; a city-only filter today | Data audit before committing filters; show only filters backed by verified data | Provider data owner |
| R-03 | **MyChart / Epic dependency.** The personalized home and appointment cards depend on data access that may be limited | Medium | High | A-06 | Confirm the integration options early (Q-27); design a signed-out and MyChart-handoff path that works on its own | Epic / MyChart team |
| R-04 | **Gozio limits.** Embedding, branding or deep-linking limits prevent the integrated Locations and day-of experience | Medium | High | A-07; no Gozio documentation provided | Request Gozio capability documentation (Q-28); keep the architecture vendor-neutral until confirmed | Gozio account owner |
| R-05 | **Appointment action confusion.** Unclear actions lead to failed bookings, call volume and lost trust | High | High | K-04; two labels with no explanation (S1-6) | Define one action model with clear labels and "what happens next" text (Q-15) | Patient Access |
| R-06 | **Privacy exposure.** Personal and visit details on home screens, notifications or analytics reveal sensitive information | Medium | High | The concept shows name, location and visit type (S1-18) | Privacy review before personalization (Q-31); minimum-necessary display by default | Privacy Office; InfoSec |
| R-07 | **Accessibility shortfall.** No stated standard; possible low-contrast text in current screens | Medium | High | Light-blue address text and buttons (S1-6, S1-8) – visual impression from screenshots, not measured | Confirm the standard (Q-30); accessibility audit of the current app | Accessibility / Compliance |
| R-08 | **Brand and editorial drift.** Concepts and references use off-brand colors, a typeset app badge and non-style-guide copy | High | Medium | S1-17, S1-18; [brand notes](sources/brand-and-editorial-standards.md) | Brand review gate; content style checklist based on S6 | CMPA |
| R-09 | **Taxonomy governance.** Moving from academic divisions to patient-friendly specialties needs clinical department agreement and ongoing upkeep | Medium | High | S1-7; K-03 | Name a taxonomy owner; map divisions to specialties to conditions (Q-14) | CMPA; clinical departments |
| R-10 | **Location naming complexity.** Official clinic names are long ("… (Dallas) at Professional Office Building 2"); simplified display names may conflict with official naming rules | High | Medium | S1-6, S1-14; S6 naming rules | Agree display-name rules with CMPA; keep official names on detail pages | CMPA |
| R-11 | **Decisions without evidence.** No research or analytics were provided, so priorities rest on opinion and references | High | High | U-11 | Request analytics and app-store reviews (Q-07); run targeted research in Phase 4 | Product owner; Digital analytics |
| R-12 | **Unverified web baseline.** utswmed.org could not be reviewed | Certain (current) | Medium | Section 2 of the [Brief](01-product-understanding-brief.md) | Allow `utswmed.org` in the environment network policy and complete the review (Q-40) | Workspace owner |
| R-13 | **Content operations capacity.** MedBlog, campaigns, featured content and profiles need ongoing editorial effort | Medium | Medium | S1-20, S1-24 | Confirm content owners and workflow (Q-33) | CMPA |
| R-14 | **Conflicting source material.** Unresolved conflicts carry into design | Medium | Medium | Part D (K-01 to K-08) | Resolve the K-items in the alignment session | Product owner |
| R-15 | **Leaving the app.** External links (food ordering, web resources, MyChart) fragment the experience and may create privacy issues | Medium | Medium | S1-21, S1-22 | Define handoff patterns and return paths; vendor review (U-19) | Product owner; Privacy Office |
| R-16 | **Location permission denied.** Distance and near-me features degrade | High | Medium | F-06 depends on permission | Keep a zip or city fallback (it exists today, S1-1); design the denied state | Design team |
| R-17 | **Emergency misuse.** Patients with urgent needs try to use provider search instead of emergency or urgent care | Low–Medium | High | No urgent or emergency guidance in S1 | Ask whether safety messaging or urgent-care entry is needed (Q-18) | Clinical leadership; Legal |

## Part C – Dependencies and unknowns

| ID | Unknown | Why it matters | Who should answer | Questions |
|---|---|---|---|---|
| U-01 | **Current app technology and platforms.** Native iOS/Android, cross-platform or web wrapper; supported OS versions; tablet support | Determines what is feasible, component reuse, and whether 2.0 is a rebuild or an evolution | Mobile engineering lead; IT | Q-22 |
| U-02 | **Native vs. web-based experiences.** Which screens are native and which are web views (profiles, resources, MyChart) | Affects consistency, accessibility, performance, analytics and the effort to redesign each area | Mobile engineering lead | Q-22 |
| U-03 | **Provider data source and attributes.** System of record, fields available (gender, languages, accepting new patients, online scheduling, affiliation, provider type, virtual care), update frequency and who edits biographies and research | Every Find Care filter and card depends on it (R-02) | Provider data owner; Digital / web team | Q-24 |
| U-04 | **Location data source.** Buildings, clinics, hospitals; hours, open/closed status, parking, photos, phone numbers, coordinates; how clinics relate to buildings | Location search, detail, distance and day-of guidance depend on it | Facilities; Digital / web team; Gozio admin | Q-24 |
| U-05 | **Search and filtering capabilities.** Engine, typeahead, synonyms, condition-to-specialty matching, geographic queries, ranking | Determines whether "one search for doctor, specialty, condition, location and zip" is achievable | Search / web platform owner | Q-25 |
| U-06 | **Specialty and condition taxonomy.** Mapping of academic divisions to patient-friendly specialties and conditions, and who owns it | Core of F-03 and F-09; needs governance (R-09) | CMPA; clinical departments | Q-14 |
| U-07 | **Appointment scheduling integration.** Systems behind "Schedule Now" and "Request an Appointment"; new vs. existing patient rules; referral rules; whether sign-in is required | Determines the final step of Journey A and Journey C (R-05) | Patient Access / Access Center; Epic scheduling team | Q-15, Q-26 |
| U-08 | **MyChart integration and ownership boundary.** Deep link, web view or single sign-on; which data MyCare may show (appointments, visit type, location); who owns screens after handoff | Determines the personalized home, the returning-patient journey and the architecture | Epic / MyChart team; IT | Q-05, Q-27 |
| U-09 | **Gozio integration and customization limits.** SDK vs. separate module; indoor map coverage by building; deep links to destinations; parking data; branding; offline support; current use | Determines F-13 to F-15 and F-26 (R-04) | Gozio account owner; vendor | Q-28 |
| U-10 | **Authentication and account management.** MyChart credentials vs. a separate account; biometrics; session length; proxy / caregiver access; where favorites and history are stored | Determines the signed-in vs. signed-out architecture and the favorites design | IT security / identity; Epic team | Q-29 |
| U-11 | **Analytics and user research.** Tab and feature usage, search logs (top and zero-result), app-store reviews, call-center contact reasons, prior studies | Needed to prioritize with evidence (R-11) | Digital analytics; Patient Experience | Q-07, Q-08, Q-09 |
| U-12 | **Accessibility requirements.** Standard and level, audit history, sign-off owner. As a state institution, UTSW **may** be subject to public-sector digital accessibility rules (for example, ADA Title II regulations and Texas state rules) – **not confirmed; for UTSW Compliance to determine** | Sets acceptance criteria for design and engineering (R-07) | Accessibility office; Compliance; Legal | Q-30 |
| U-13 | **Privacy and security requirements.** Whether app data counts as protected health information; what may appear on screen or in notifications; analytics and SDK policy; location data; insurance card storage | Constrains personalization, history, analytics and favorites (R-06) | Privacy Office; InfoSec; Legal | Q-31 |
| U-14 | **Design system and component availability.** Existing app design system or Figma libraries; approved app lockup and icon; digital palette values; interface typeface | Needed before Phase 5; brand compliance (R-08) | CMPA (logo@utsouthwestern.edu); current design team | Q-32 |
| U-15 | **Engineering ownership and constraints.** In-house or vendor; release process; app-store ownership; environments; capacity | Determines a feasible phasing and handoff | IT leadership; product owner | Q-37 |
| U-16 | **Content operations.** MedBlog and newsroom feeds, campaign curation, featured content, provider profile editing, approval workflows | Engagement features and profile quality depend on it (R-13) | CMPA; Digital / web team | Q-33 |
| U-17 | **Hospital affiliation data and display rules.** Which institutions, whether partners' providers appear, legal or brand rules | Defines F-02 affiliation filter behavior (A-11) | Medical group leadership; Legal; CMPA | Q-16 |
| U-18 | **Campus Mode data and triggers.** Audience; agenda source; geofence or check-in; Guest Services number; meaning of "entertainment" | F-36 cannot be specified without it | Patient Experience; Guest Services | Q-19 |
| U-19 | **External vendor link policy.** Food-ordering vendor and other third-party sites: web view vs. browser, tracking, branding | Experience consistency and privacy (R-15) | Auxiliary Services; Privacy Office | Q-19 |
| U-20 | **Insurance card capture and storage.** On device or server; encryption; relationship to MyChart insurance features | F-37 feasibility and privacy | Revenue cycle / Patient Access; InfoSec | Q-20 |
| U-21 | **App interface localization.** Languages the app interface must support (distinct from the provider-languages filter) | F-21 and content strategy | Patient Experience; Language Services | Q-34 |
| U-22 | **Notifications capability and policy.** Push infrastructure, consent, content rules | F-30 and day-of reminders; privacy | Mobile engineering; Privacy Office | Q-31 |
| U-23 | **Current-state baseline.** Why UTSW screenshots show two navigation patterns and two location models (K-02); what the home menu contains; what the MedBlog filter does | We need an accurate picture of today before defining tomorrow | Product owner; mobile engineering | Q-23 |
| U-24 | **Product vision, objectives and success measures** | Without them, no priority or design decision can be judged | Executive sponsor; product owner | Q-01, Q-02 |

## Part D – Source conflicts (do not resolve without the client)

| ID | Conflict | Where | Resolution path |
|---|---|---|---|
| K-01 | "Provider Type" filter listed on S1-2 but not on S1-4 | S1-2, S1-4 | Q-13 |
| K-02 | Two navigation patterns (five tabs vs. three tabs) and two location models in UTSW screenshots | S1-1 and others; S1-13, S1-14, S1-15 | Q-23 |
| K-03 | Future Directory View keeps "Academic division"; Explore proposes using specialty instead; detail view keeps "Academic department and division" | S1-7, S1-10 | Q-14 |
| K-04 | "Schedule Now" vs. "Request an Appointment" with no stated rule | S1-6, S1-8 | Q-15 |
| K-05 | Concept content contradicts facts and style ("12 locations across DFW" vs. a city list including Lubbock and Tyler; style-guide conflicts) | S1-17, S1-18 vs. S1-1, S6 | Q-06 (concept status) |
| K-06 | Campaign mapping uses months with no listed observance | S1-24 | Q-21 |
| K-07 | "Better UI/UX the list view" appears on a detail-view slide | S1-10 | Confirm in the alignment session |
| K-08 | "UTSWMyCare" appears as a patient resource in the website navigation; whether it means the app or the patient portal is unclear | S1-22 | Q-05 |
