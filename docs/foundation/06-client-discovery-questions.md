# 6. Client Discovery Question List – MyCare 2.0

| | |
|---|---|
| **Deliverable** | 6 of 7 – Client Discovery Questions |
| **Status** | Draft v0.1 – ready to use in the first client alignment session |
| **Date** | Oct. 13, 2026 |
| **Sources** | Derived from gaps and conflicts in S1, the access limits on S2, and the Register (U-, A-, K-items) |
| **Decisions required** | Every **Essential** question must be answered (or explicitly deferred by the client) before Phase 3 – Structure is finalized |

**Priority key:**
- **Essential** – blocks the foundation. Answer it before structuring scope, architecture or journeys.
- **Later** – needed before a specific later phase (named in the table).

---

## The 10 questions to ask first

1. **Q-01** What is MyCare 2.0 for, and which patient problem must it solve first?
2. **Q-02** Which objectives and measures define success?
3. **Q-12** Which areas are in the first release, and which are explicitly out?
4. **Q-04** Who is the primary audience for the first release?
5. **Q-27** What can MyCare show and do with MyChart, and who owns the experience after handoff?
6. **Q-28** What is Gozio's role, and what can it do in our app?
7. **Q-26 / Q-15** How does scheduling work, and what decides "Schedule Now" vs. "Request an Appointment"?
8. **Q-24** Where do provider and location data come from, and which filter attributes exist?
9. **Q-07** What evidence do we have about patient pain points (analytics, reviews, calls, research)?
10. **Q-35** Who owns the product and makes scope decisions?

---

## Theme 1 – Product vision and business objectives

| ID | Question | Why it matters | Links | Priority |
|---|---|---|---|---|
| Q-01 | What is the vision for MyCare 2.0, and which patient problem must it solve first? | The deck lists features, not goals. Priorities can't be judged without a goal. | U-24 | Essential |
| Q-02 | Which business and patient objectives define success? How will they be measured – for example, appointment actions completed, calls avoided, wayfinding use, MyChart activation (examples only)? | Sets the success metrics and the priority logic | U-24, R-11 | Essential |
| Q-03 | Is MyCare 2.0 an evolution of the current app (same listing and codebase) or a new product? Is a web counterpart in scope? | Changes the technical approach, migration and scope | A-01, U-01 | Essential |
| Q-04 | Who is the primary audience for the first release: prospective patients, existing patients, on-campus visitors, caregivers, referring clinicians? | Drives the home screen, navigation and sign-in model | A-02 | Essential |
| Q-05 | How should MyCare relate to MyChart in name and role? What does "UTSWMyCare" in the website's Patient Resources navigation refer to? | Prevents confusion between brands and products | A-05, K-08 | Essential |
| Q-06 | Who produced the concept screens on S1-17 and S1-18, and what is their status? Why were the reference apps chosen, and which qualities matter most? | Prevents designing toward an unapproved direction or copying references | A-12, A-13, K-05 | Later (before Phase 6) |

## Theme 2 – Patient pain points and supporting evidence

| ID | Question | Why it matters | Links | Priority |
|---|---|---|---|---|
| Q-07 | What evidence exists today – app analytics, app-store reviews, call-center contact reasons, patient surveys, usability studies? Can we have access? | No research was provided. Decisions otherwise rest on opinion. | U-11, R-11 | Essential |
| Q-08 | What are the top searches and the zero-result searches in the app and on utswmed.org/doctors? | Grounds search, the taxonomy and popular searches | F-01, F-04, A-15 | Essential |
| Q-09 | How is usage split across Home, MyChart, Providers, Locations and Wayfinding today? | Decides between navigation hypotheses H1, H2 and H3 | Architecture §3 | Essential |
| Q-10 | What do patients report about finding locations, parking and arriving on time? | Sizes the wayfinding and day-of opportunity | F-15, F-26 | Later (Phase 4) |
| Q-11 | Has the current app had an accessibility audit or received accessibility complaints? | Baseline for accessibility work | R-07 | Later (Phase 4) |

## Theme 3 – First-release scope and feature priorities

| ID | Question | Why it matters | Links | Priority |
|---|---|---|---|---|
| Q-12 | Which of the 13 areas are in scope for the first release, and which are explicitly out? Should search history and the current Quick Links be kept? | Prevents scope creep | R-01, all F-items | Essential |
| Q-13 | Are the "Future" lists (S1-2, S1-4, S1-7, S1-10) approved requirements or proposals? Is "Provider Type" in or out? What does "Gender" refer to? | Separates requirements from ideas | K-01, A-10 | Essential |
| Q-14 | Should patients see academic division, patient-friendly specialty, or both? Who owns the specialty and condition taxonomy? | Core of Find Care; needs governance | K-03, U-06, R-09 | Essential |
| Q-15 | What do "Schedule Now" and "Request an Appointment" each do, and what decides which one appears? | The trust-critical final step of Journey A | K-04, A-04, R-05 | Essential |
| Q-16 | What does "Hospital affiliation (default to UTSW only)" mean? Which institutions are included, and are there partner or legal display rules? | Defines filter behavior and wording | A-11, U-17 | Essential |
| Q-17 | Is a signed-in, personalized home (S1-18) expected in the first release? | Large dependency on MyChart / Epic and privacy | F-25, F-26, R-03 | Essential |
| Q-18 | Should MyCare offer urgent or emergency guidance – for example, 911 messaging, urgent care or virtual visits? The deck doesn't mention it. | Patient safety and architecture | R-17 | Essential |
| Q-19 | Is Campus Mode in scope? Who is it for, what triggers it, where does the agenda come from, and what is "entertainment"? Which vendor links (food ordering) are approved? | F-36 cannot be specified without this | U-18, U-19 | Later (Phase 3 for scope, Phase 6 for detail) |
| Q-20 | Are favorites, the digital insurance card and account settings expected in the first release? Should personal information be edited in MyCare or MyChart? | Account-area scope; privacy | F-19, F-20, F-37, U-20 | Later (Phase 3) |
| Q-21 | Is the campaign calendar complete? The mapping uses months not in the list. Who curates campaigns, and does "personalized" mean by patient or by season? | Content and privacy design | K-06, A-14 | Later (Phase 5) |

## Theme 4 – Technical dependencies and integration constraints

| ID | Question | Why it matters | Links | Priority |
|---|---|---|---|---|
| Q-22 | What technology is the current app built with? Which platforms (iOS, Android, tablet) and OS versions are supported? Which screens are native and which are web views? | Feasibility and reuse | U-01, U-02, A-16 | Essential |
| Q-23 | Why do UTSW screenshots show two navigation patterns (five tabs vs. three) and two location models? What is in the Home menu? What does the MedBlog filter do? Where is the "Confirm that You've Arrived" dialog from? | An accurate current-state baseline | K-02, U-23, F-38 | Essential |
| Q-24 | Where do provider and location data come from, how often are they updated, and which attributes exist (gender, languages, accepting new patients, online scheduling, affiliation, provider type, virtual care, hours, parking, photos, coordinates)? How is distance calculated for providers with several locations? | Every filter, card and detail depends on it | U-03, U-04, A-08, A-09, R-02 | Essential |
| Q-25 | What powers search today? Does it support typeahead, synonyms, condition-to-specialty matching and location queries? | Feasibility of the unified Find Care search | U-05, A-17 | Essential |
| Q-26 | How is scheduling integrated (MyChart / Epic scheduling, request forms, call center)? Is sign-in required? Are there new-patient, referral or location rules? | Journeys A and C, final step | U-07 | Essential |
| Q-27 | How does the app connect to MyChart today (deep link, web view, single sign-on)? Can MyCare display appointment data? Who owns the experience after handoff? | Architecture; personalized home; Journey D | U-08, A-05, A-06 | Essential |
| Q-28 | What is UTSW's arrangement with Gozio? SDK or separate module; current use in the Wayfinding tab; indoor coverage by building; deep links to destinations; parking; branding; offline; analytics | Journeys B and D; the Locations architecture | U-09, A-07, R-04 | Essential |
| Q-29 | What is the authentication and account model – MyChart credentials, a separate MyCare account or none? Biometrics? Caregiver or proxy access? | Signed-in vs. signed-out design; favorites storage | U-10 | Essential |
| Q-30 | Which accessibility standard and conformance level apply to the app, and who signs off? | Acceptance criteria for all design and build | U-12, R-07 | Essential |
| Q-31 | What privacy and security rules apply – personal information on screens and notifications, search history, analytics and third-party SDKs, location data, insurance card images? | Constrains personalization and analytics | U-13, U-22, R-06 | Essential |
| Q-32 | Is there an existing design system, component library or Figma file for the app? Is there an approved MyCare app lockup and icon? Are there approved digital values for the extended palette and an interface typeface? | Needed for the design foundation; brand compliance | U-14, R-08 | Later (before Phase 5) |
| Q-33 | Who manages MedBlog, newsroom, campaign, featured and provider-profile content, and through which systems? | Engagement features and profile quality | U-16, R-13 | Later (Phase 3) |
| Q-34 | Which languages must the app interface support (as distinct from provider languages)? | Language preferences and content strategy | U-21, F-21 | Later (Phase 3) |

## Theme 5 – Stakeholders, approvals, success metrics and delivery

| ID | Question | Why it matters | Links | Priority |
|---|---|---|---|---|
| Q-35 | Who is the accountable product owner and final decision-maker on scope? | Decisions need an owner | U-15 | Essential |
| Q-36 | Which groups must review or approve – for example, CMPA (brand), Patient Access, Epic / MyChart team, IT security, Privacy, Compliance, Legal, clinical departments, Gozio? | Plans approval gates; avoids late rework | R-08, R-09 | Essential |
| Q-37 | Who will build MyCare 2.0 (in-house or vendor)? What release process, app-store ownership, environments and constraints apply? | Feasible phasing and handoff | U-15 | Essential |
| Q-38 | What are the delivery expectations – milestones, fixed dates, budget or capacity limits? (None are assumed in these documents.) | Plan realism | – | Essential |
| Q-39 | Can we speak with patients, visitors, call-center and front-desk staff? What approval and privacy constraints apply to research? | Phase 4 validation | R-11 | Later (before Phase 4) |
| Q-40 | Can the project team get network access to utswmed.org, plus any test environments and documentation? (The public websites could not be reached from the current workspace.) | Completes the public-web baseline | R-12 | Essential (operational) |
