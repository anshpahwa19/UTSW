# 2. Feature and Scope Inventory – MyCare 2.0

| | |
|---|---|
| **Deliverable** | 2 of 7 – Feature and Scope Inventory |
| **Status** | Draft v0.1 – for client validation |
| **Date** | Oct. 13, 2026 |
| **Sources** | S1 (cited by slide), S2c, S3–S7. The public websites (S2a, S2b) were not accessed. |
| **Evidence mix** | 39 capabilities in total. 17 have a current state that is Confirmed or Observed in the app (S1). 12 are Proposed in S1 with no current equivalent. 7 appear only in inspiration references or concept mockups (R). 3 are inferred enablers or web-only observations (F-17, F-23, F-34). |
| **Key assumptions** | A-01, A-03, A-04, A-05, A-07, A-08 – see the [Register](05-assumptions-risks-register.md). |
| **Decisions required** | First-release scope (Q-12); status of the "Future" lists (Q-13); the priorities proposed here (all **provisional**). |

## How to read this inventory

- **Evidence status:** **C** = Confirmed · **O** = Observed · **P** = Proposed in S1 · **R** = observed in an inspiration reference or concept only, with no UTSW annotation · **A** = Assumption · **U** = Unknown.
- **"User problem" statements are Assumptions** unless a slide is cited. The deck states very few problems directly.
- **Provisional priority** is a recommendation, **not** a client-approved decision:
  - **P1** – Candidate for the first release. It is a core journey, or an existing capability that must not regress.
  - **P2** – Candidate for the first release only if its dependencies are confirmed; otherwise an early follow-on.
  - **P3** – Later, or explore and validate first.
  - **Hold** – Too little is known to prioritize.

---

## Summary by group

### A. Core patient journeys

| ID | Capability | Current state | Future-state opportunity | Evidence | Provisional priority |
|---|---|---|---|---|---|
| F-01 | Find Care entry and unified search | Name/specialty/condition field plus a separate zip field (S1-1) | A large, prominent search covering doctor, specialty, condition, location and zip (S1-2) | C, O, P | P1 |
| F-02 | Search filters | City only (S1-1) | Gender, languages, online scheduling, hospital affiliation, distance ranges, accepting new patients, provider type (S1-2) | C, P, K-01 | P1 (data-dependent filters can move to P2) |
| F-03 | Specialty discovery | Academic division list (S1-1) | Icons or segmented specialties (S1-2) | C, P | P1 |
| F-04 | Popular searches | None observed | "Popular searches?" (S1-2) | P (as a question) | P3 |
| F-05 | Search history | Exists (S1-1) | Not mentioned in the Future lists | C | P2 – keep unless evidence says otherwise |
| F-06 | Location context (near me, zip, distance) | "Distance from me" button and zip field (S1-1); distance on cards (S1-6) | Distance ranges (S1-2) | C, P | P1 |
| F-07 | Providers–locations toggle | Separate tabs (S1-1) | "Potentially a toggle for site/clinics vs. providers" (S1-2) | P | P2 – depends on the navigation decision |
| F-08 | Results sorting | None observed | Reference only (S1-5) | R | P3 |
| F-09 | Provider results list (directory view) | Card with name, photo, division, address, distance and action (S1-6) | Simpler cards with a clear action; specialty instead of division (S1-7) | C, O, P, K-03 | P1 |
| F-10 | Provider detail (profile) | Long single scroll with raw research text (S1-8, S1-9) | Sections, action buttons, swipeable locations, better formatting (S1-10) | C, O, P | P1 |
| F-11 | Appointment actions | "Schedule Now" or "Request an Appointment" (S1-6, S1-8) | "Request or schedule appointment" kept (S1-7, S1-10) | C, O, K-04 | P1 |
| F-12 | Share provider | Exists (S1-8) | Kept (S1-10) | C | P2 – keep |
| F-13 | Find a Location (search and browse) | Buildings / Clinics / Hospitals; search and zip (S1-13); variant with Clinics/Maps (S1-14) | Gozio as the main find-and-navigate; entry from Home and Find Care (S1-13) | O, P, K-02 | P1 |
| F-14 | Location detail (building, clinic, hospital) | Building → clinics; clinic → providers, phone, address (S1-15) | Not annotated; references show hours, photos and "Take Me There" | O, R | P1 |
| F-15 | Directions and wayfinding | Wayfinding tab (S1-1); provider of the service **Unknown** | Gozio navigation (S1-13); day-of "Take me to my appointment" concept (S1-18) | O, P, A-07 | P1 if Gozio's role is confirmed, otherwise P2 |
| F-16 | Provider–location cross-linking | Provider → locations (S1-8); clinic → providers (S1-15) | Locations as their own swipeable section on the profile (S1-10) | O, P | P1 |

### B. Supporting capabilities

| ID | Capability | Current state | Future-state opportunity | Evidence | Provisional priority |
|---|---|---|---|---|---|
| F-17 | Patient resources | Exists on the web (S1-22); in-app status **Unknown** | Slide with no annotation | O (web), U | P2 |
| F-18 | Learn about services, conditions and specialties | **Unknown** | "Ability to learn more about services, conditions, specialties" (S1-23) | P | P3 – unless search needs it for condition-to-specialty mapping |
| F-19 | Favorites and saved content | None observed | "Ability to notate/keep favorites" (S1-23); "Favorites or saved content" (S1-24) | P | P2 |
| F-20 | Personal information | **Unknown** | "Personal information?" (S1-24) | P (as a question) | Hold |
| F-21 | Language preferences | **Unknown** | "Language preferences?" (S1-24) | P (as a question) | Hold – depends on Q-34 |
| F-22 | Accessibility settings | **Unknown** | "Accessibility settings" (S1-24) | P | P2 for honoring device accessibility settings (a recommendation); P3 for any in-app settings screen |
| F-23 | Permission settings | Location prompt implied by "Distance from me" (S1-1) | "Permission settings" (S1-24) | C, P | P1 for handling permission states (an enabler); P3 for a settings screen |

### C. Personalization and engagement

| ID | Capability | Current state | Future-state opportunity | Evidence | Provisional priority |
|---|---|---|---|---|---|
| F-24 | Home screen (signed-out and general) | MedBlog carousel, Quick Links, UTSW Resources (S1-17) | Concept: search, facility directory, Find Care and Wayfinding cards, MyChart connect, Featured (S1-17) | O, R | P1 – home must reflect the new architecture |
| F-25 | Signed-in personalized home | None observed | Concept: greeting, follow-up prompt, appointment card, recommendations (S1-18) | R (labeled "AUTHENTICATED") | P2 – depends on MyChart / Epic (U-08) |
| F-26 | Appointment cards (week before, day of) | None observed | "Appts in a week", "Day of appt" concepts with parking and navigation (S1-18) | R | P2 – high patient value, heavy dependencies |
| F-27 | Recommendations | None observed | "Recommended for you", "Why?" (S1-18) | R | P3 |
| F-28 | MedBlog and newsroom | MedBlog list and home carousel (S1-17, S1-20) | Category browsing and cards (references, S1-20) | O, R | P2 – keep and improve |
| F-29 | Health campaigns | None observed | Monthly observances mapped to service lines (S1-24) | P, K-06 | P3 |
| F-30 | Notifications | None observed | Bell icon in the concept (S1-18) | R | Hold |

### D. External integrations

| ID | Capability | Current state | Future-state opportunity | Evidence | Provisional priority |
|---|---|---|---|---|---|
| F-31 | MyChart access | MyChart tab (S1-1); four Quick Links (S1-17) | "MyChart Portal – Connect now" concept (S1-17) | O, R | P1 – keep; the boundary needs defining |
| F-32 | Appointment scheduling system | Behind "Schedule Now" and "Request an Appointment" (S1-6); mechanism **Unknown** | Online scheduling filter (S1-2) | O, P, U | P1 (dependency of F-11) |
| F-33 | Gozio platform | Named in S1-13; current use **Unknown** | "Gozio as the main find and navigate to location" (S1-13) | P, A-07 | P1 (dependency of F-13 to F-15) |
| F-34 | Provider and location data services | **Unknown**; utswmed.org pages referenced on S1-1 and S1-13 | Needed for filters, cards and profiles | A-08, U | P1 (dependency) |
| F-35 | Online food ordering | None observed | External ordering site link (S1-21) | P | P3 |

### E. Potential future enhancements

| ID | Capability | Current state | Future-state opportunity | Evidence | Provisional priority |
|---|---|---|---|---|---|
| F-36 | Campus Mode | None observed | Agenda, Guest Services call, food, wayfinding, entertainment (S1-21) | P | P3 |
| F-37 | Digital insurance ID card | None observed | "Save your insurance ID card digitally" (S1-24) | P | P3 |
| F-38 | Arrival confirmation | Dialog seen on S1-22; source **Unknown** | Not annotated | R, U | Hold |
| F-39 | System-level search and app shortcuts | None observed | iOS Spotlight reference (S1-23), not annotated | R | Hold |

---

## Detail cards

### A. Core patient journeys

#### F-01 Find Care entry and unified search
- **User problem (Assumption):**
  - People think in symptoms, conditions, names or places, not in UTSW's organizational structure.
  - Today they must choose a field and know the right terms.
- **Primary user:** prospective and existing patients (A-02).
- **Current state (C, S1-1):**
  - A "Name, Specialty, Condition" field and a separate "Zip Code" field.
  - The search sits above a long academic division list.
- **Opportunity (P, S1-2):**
  - One prominent search covering doctor, specialty, condition, location and zip.
  - Renaming to "Find Care" (A-03).
- **Value (Assumption):** faster route to the right provider; fewer dead ends and calls.
- **Dependencies:** search service (U-05); taxonomy and synonyms (U-06); provider and location data (U-03, U-04).
- **Open questions:** Q-08, Q-14, Q-25.
- **Provisional priority:** P1. It is the core of the most important journey (Journey A).

#### F-02 Search filters
- **User problem (Assumption):** patients have practical constraints (language, provider gender, distance, availability for new patients, online booking) that the current city-only filter does not address.
- **Primary user:** prospective patients.
- **Current state (C, O, S1-1):** a city filter only, with 10 cities.
- **Opportunity (P, S1-2):**
  - Filters for gender, languages, online scheduling, hospital affiliation (default UTSW only), distance ranges, accepting new patients and provider type. Provider type is missing on S1-4 (K-01).
  - A scrolling filter bar.
- **Value (Assumption):** more relevant results, and fewer requests to providers who cannot take the patient.
- **Dependencies:** every filter needs a reliable structured attribute (U-03). Hospital affiliation needs affiliation data and display rules (U-17). Online scheduling needs scheduling eligibility (U-07).
- **Open questions:** Q-13, Q-16, Q-24.
- **Risks:** R-02 (a filter with poor data erodes trust).
- **Provisional priority:** P1 for filters backed by verified data. P2 for the rest, pending a data audit.

#### F-03 Specialty discovery
- **User problem (P, S1-7):** academic divisions are not patient-friendly terms ("Instead of academic division use more patient friendly terms like specialty").
- **Primary user:** prospective patients who don't know a provider's name.
- **Current state (C, O, S1-1):** an academic division list such as "Internal Medicine - Clinical Genetics".
- **Opportunity (P, S1-2):** icon-based or segmented specialty selection.
- **Value (Assumption):** a lower vocabulary barrier.
- **Dependencies:** a patient-facing specialty taxonomy mapped to academic divisions, with an owner (U-06). Clinical departments must agree.
- **Open questions:** Q-14.
- **Risks:** R-09.
- **Provisional priority:** P1.

#### F-04 Popular searches
- **User problem (Assumption):** a starting point for undecided users.
- **Primary user:** prospective patients.
- **Current state:** none observed.
- **Opportunity (P, S1-2):** "Popular searches?" – shown with a question mark in the deck.
- **Dependencies:** search analytics (U-11) or curation (U-16).
- **Open questions:** Q-08.
- **Provisional priority:** P3.

#### F-05 Search history
- **Current state (C, S1-1):** exists.
- **Opportunity:** not mentioned in the Future lists. Whether it stays is an open decision.
- **Dependencies:** whether it is stored on the device or in an account (U-10); privacy treatment of searches for sensitive conditions (U-13).
- **Open questions:** Q-12, Q-31.
- **Provisional priority:** P2 – keep unless evidence supports removing it.

#### F-06 Location context (near me, zip, distance)
- **User problem (Assumption):** patients want care near them.
- **Current state (C, O):** a "Distance from me" button and a zip field (S1-1); "18.0 mi" on cards (S1-6).
- **Opportunity (P, S1-2):** distance ranges as a filter.
- **Dependencies:** location permission handling (F-23); coordinates for each practice location (U-04).
- **Open questions:** for providers with several locations, which location is the distance measured from (Q-24)?
- **Provisional priority:** P1.

#### F-07 Providers–locations toggle in Find Care
- **Opportunity (P, S1-2):** "Potentially a toggle for site/clinics vs. providers". S1-13 also proposes integrating locations into Find Care.
- **Dependencies:** the navigation decision (see [Experience Architecture](03-experience-architecture.md)); Gozio's role (U-09).
- **Open questions:** Q-12, Q-28.
- **Provisional priority:** P2.

#### F-08 Results sorting
- **Evidence:** a reference only (S1-5, "Sort results by – Recommended / Time / Distance"). UTSW did not annotate it.
- **Note:** listed so it is not forgotten. It is **not** a proposed requirement.
- **Provisional priority:** P3.

#### F-09 Provider results list (directory view)
- **User problem (P, S1-7):** current cards are dense with information (full clinic name and address) and weak on actions.
- **Primary user:** prospective patients.
- **Current state (C, O, S1-6):** photo, name and credentials, academic division, full location and address, distance, and either "Schedule Now" or "Request an Appointment".
- **Opportunity (P, S1-7):** clearer separation between cards; action-first; specialty instead of division; "less is more".
- **Conflict:** the Future list keeps academic division (K-03).
- **Dependencies:** F-03 taxonomy; F-11 action rules.
- **Open questions:** Q-14, Q-15.
- **Provisional priority:** P1.

#### F-10 Provider detail (profile)
- **User problem (P, S1-10):** a long, undifferentiated scroll with "pasted text" formatting; research citations dominate (S1-9).
- **Primary user:** prospective patients evaluating a provider; existing patients looking up their provider.
- **Current state (C, S1-8):** name, credentials, photo, department and division, biography, education, clinical focus, research, video, locations with phone numbers, appointment action, share, and an "Accepting Virtual Care" label.
- **Opportunity (P, S1-10):** segmented or expandable sections; action buttons for directions, address and phone; swipeable locations; designed formatting.
- **Dependencies:** structured profile content (U-03); content governance and editing (U-16); video hosting.
- **Open questions:** Q-24, Q-33.
- **Provisional priority:** P1.

#### F-11 Appointment actions
- **User problem (Assumption):** two different labels with no explanation may confuse patients about what will happen next.
- **Primary user:** prospective and existing patients.
- **Current state (C, O):** "Schedule Now" and "Request an Appointment" (S1-6, S1-8).
- **Opportunity:** both the Future directory and detail lists keep "Request or schedule appointment" (S1-7, S1-10).
- **Dependencies:** the scheduling system and eligibility rules (U-07); new- vs. existing-patient rules; referral requirements; sign-in requirements (U-10).
- **Open questions:** Q-15, Q-26.
- **Risks:** R-05.
- **Provisional priority:** P1. This is where the main journey succeeds or fails.

#### F-12 Share provider
- **Current state (C, S1-8):** exists. It is kept in S1-10.
- **Dependencies:** a public profile URL for each provider. S2c shows `/doctors/{name}/` pages are indexed; whether the app shares those URLs is **Unknown**.
- **Provisional priority:** P2 – keep.

#### F-13 Find a Location (search and browse)
- **User problem (Assumption):** patients need to find the right building, clinic or hospital, and the difference between them is not obvious.
- **Primary user:** patients with upcoming visits; visitors.
- **Current state (O, S1-13):** "Building, Clinic or Hospital" search, a zip field, and Buildings / Clinics / Hospitals categories. A variant has a Clinics/Maps toggle (S1-14, K-02).
- **Opportunity (P, S1-13):** Gozio as the main find-and-navigate; a Home button; integration with Find Care.
- **Dependencies:** location data (U-04); Gozio (U-09).
- **Open questions:** Q-23, Q-28.
- **Provisional priority:** P1.

#### F-14 Location detail (building, clinic, hospital)
- **Current state (O, S1-15):** a building sheet (photo, address, "Clinics in Building"); a clinic detail (photo, address, phone, "Search Providers", provider list).
- **Opportunity:** none annotated. References show hours, open status, photos and "Take Me There" (S1-15, S1-16).
- **Dependencies:** hours, parking and status data (U-04).
- **Open questions:** Q-24.
- **Provisional priority:** P1.

#### F-15 Directions and wayfinding
- **User problem (Assumption):** getting to the right entrance, floor and suite on large campuses is hard.
- **Primary user:** patients on the day of a visit; visitors.
- **Current state (O):** a Wayfinding tab (S1-1). Who provides it is **Unknown** (A-07).
- **Opportunity (P):** Gozio navigation (S1-13); the day-of concept with "Take me to my appointment", parking and suite details (S1-18).
- **Dependencies:** Gozio contract, SDK and coverage (U-09); appointment location data (U-08).
- **Open questions:** Q-28.
- **Provisional priority:** P1 if Gozio's role is confirmed, otherwise P2.

#### F-16 Provider–location cross-linking
- **User problem (Assumption):** patients need to know where a provider practices and who practices at a location.
- **Current state (O):** provider → locations (S1-8); clinic → providers (S1-15).
- **Opportunity (P, S1-10):** locations as their own swipeable section on the profile.
- **Dependencies:** a consistent model of providers, clinics and buildings (U-03, U-04). See the entity model in the [Experience Architecture](03-experience-architecture.md).
- **Provisional priority:** P1.

### B. Supporting capabilities

#### F-17 Patient resources
- **Evidence:** the public web Patient Resources sections are observed (S1-22). The slide has no annotation.
- **Dependencies:** whether these open as web content or native screens (U-02); content ownership (U-16).
- **Open questions:** Q-12.
- **Provisional priority:** P2.

#### F-18 Learn about services, conditions and specialties
- **Evidence (P, S1-23):** the reference shows a services icon grid.
- **Note:** this could support F-01 and F-03 by mapping conditions to specialties (Assumption).
- **Dependencies:** a condition and service content source (U-16). S2c shows location URLs keyed by condition slugs, which suggests a taxonomy exists on the web (Assumption).
- **Provisional priority:** P3.

#### F-19 Favorites and saved content
- **Evidence (P, S1-23, S1-24):** the reference shows saved providers and locations with an empty state.
- **Dependencies:** account model and sync (U-10); privacy (U-13).
- **Open questions:** Q-20, Q-29.
- **Provisional priority:** P2.

#### F-20 Personal information
- **Evidence:** proposed with a question mark ("Personal information?", S1-24).
- **Note:** this may overlap with MyChart demographics (Assumption).
- **Dependencies:** U-08, U-10.
- **Open questions:** Q-20, Q-27.
- **Provisional priority:** Hold.

#### F-21 Language preferences
- **Evidence:** proposed with a question mark ("Language preferences?", S1-24).
- **Distinct from:** the provider "Languages" filter (F-02).
- **Dependencies:** app UI localization scope (U-21).
- **Open questions:** Q-34.
- **Provisional priority:** Hold.

#### F-22 Accessibility settings
- **Evidence (P, S1-24).**
- **Recommendation (not from the source):** first honor operating-system accessibility features such as text size, screen readers, reduced motion and contrast. Then decide whether in-app settings add value.
- **Dependencies:** the accessibility standard (U-12).
- **Open questions:** Q-30.
- **Provisional priority:** P2 for honoring OS settings; P3 for a settings screen.

#### F-23 Permission settings
- **Evidence:** a location permission is implied by "Distance from me" (C, S1-1). "Permission settings" is proposed (P, S1-24).
- **Recommendation:** design the location, notification and other permission states (granted, denied, limited) as part of the core journeys.
- **Dependencies:** U-13, U-22.
- **Provisional priority:** P1 for permission-state handling; P3 for a settings screen.

### C. Personalization and engagement

#### F-24 Home screen (signed-out and general)
- **Current state (O, S1-17):**
  - A MedBlog carousel.
  - Quick Links: Message your doctor, Get your test results, Manage Your Visits, Manage Billing.
  - UTSW Resources.
  - A menu whose contents are **Unknown**.
- **Opportunity (R, S1-17):** a concept with search, a facility directory, Find Care and Wayfinding entry cards, MyChart "Connect now" and Featured content.
- **Dependencies:** the navigation decision; content operations (U-16).
- **Provisional priority:** P1 – the home screen must reflect the new architecture even if personalization comes later.

#### F-25 Signed-in personalized home
- **Opportunity (R, S1-18):** a concept labeled "AUTHENTICATED".
- **Dependencies:** authentication (U-10); MyChart / Epic data access (U-08); privacy rules for what appears on screen (U-13).
- **Open questions:** Q-17, Q-27, Q-29, Q-31.
- **Risks:** R-03, R-06.
- **Provisional priority:** P2.

#### F-26 Appointment cards (week before, day of)
- **User problem (Assumption):** patients need the time, place, parking and route for an upcoming visit in one place.
- **Opportunity (R, S1-18):** the week-out card shows the time and visit type. The day-of card adds a building, floor, suite and reception, parking guidance, an indoor map and "Take me to my appointment".
- **Dependencies:**
  - Appointment data (U-08).
  - Mapping each appointment department to a Gozio destination (U-09).
  - Parking data (U-04).
  - Privacy, since the visit type shows on screen (U-13).
- **Provisional priority:** P2. High value, but every element depends on an integration that is not yet confirmed.

#### F-27 Recommendations
- **Evidence:** "Recommended for you" and a "Why?" tag on a follow-up prompt (R, S1-18).
- **Dependencies:** the data and rules behind recommendations; privacy (U-13).
- **Provisional priority:** P3.

#### F-28 MedBlog and newsroom
- **Current state (O, S1-17, S1-20):** a chronological list, a filter icon and a Home carousel. MedBlog topic pages exist on the web (S2c).
- **Opportunity:** category browsing and cards (R, S1-20). "Newsroom" is named but not shown.
- **Dependencies:** the content feed and CMS (U-16).
- **Open questions:** Q-33.
- **Provisional priority:** P2 – keep and improve.

#### F-29 Health campaigns
- **Evidence (P, S1-24):** 14 monthly observances and a mapping for eight service lines. The mapping uses months with no listed observance (K-06).
- **Dependencies:** curation and approvals (U-16); personalization rules (U-13).
- **Open questions:** Q-21.
- **Provisional priority:** P3.

#### F-30 Notifications
- **Evidence:** a bell icon in the concept only (R, S1-18). It is not annotated.
- **Dependencies:** U-22, U-13.
- **Provisional priority:** Hold.

### D. External integrations

#### F-31 MyChart access
- **Current state (O):** a MyChart tab (S1-1); four Quick Links on Home (S1-17).
- **Unknown:** the mechanism (deep link, web view, single sign-on), who owns the experience after handoff, and the MyCare/MyChart naming (K-08).
- **Open questions:** Q-05, Q-27.
- **Provisional priority:** P1 – keep the access. The ownership boundary is an essential decision.

#### F-32 Appointment scheduling system
- See F-11. Whether scheduling happens in MyChart, a web form or another tool is **Unknown** (U-07).
- **Open questions:** Q-26.
- **Provisional priority:** P1 (dependency).

#### F-33 Gozio platform
- **Evidence:** named in S1-13. A concept caption mentions a "Gozio SDK" (S1-18), which is a mockup and not evidence of a working integration.
- **Unknown:** whether Gozio is already in use, and its limits on embedding, branding, deep links, indoor coverage and offline use (U-09).
- **Open questions:** Q-28.
- **Provisional priority:** P1 (dependency).

#### F-34 Provider and location data services
- **Evidence:** the deck cites utswmed.org/doctors and /locations next to the current-state slides (S1-1, S1-13). That the app shares their data is an Assumption (A-08).
- **Unknown:** the systems of record and the update frequency.
- **Open questions:** Q-24, Q-25.
- **Provisional priority:** P1 (dependency).

#### F-35 Online food ordering
- **Evidence (P, S1-21):** a link to an external ordering site.
- **Dependencies:** vendor link policy, web-view handling and privacy (U-19).
- **Provisional priority:** P3.

### E. Potential future enhancements

#### F-36 Campus Mode
- **Evidence (P, S1-21):** a real-time agenda for the day, a Guest Services call button, food ordering, wayfinding and entertainment.
- **Unknown:** the audience, the trigger and the data sources (U-18).
- **Open questions:** Q-19.
- **Provisional priority:** P3.

#### F-37 Digital insurance ID card
- **Evidence (P, S1-24).**
- **Dependencies:** storage, security and handling of an image that may contain personal or health-related information (U-20, U-13). Possible overlap with insurance features in MyChart (Assumption).
- **Provisional priority:** P3.

#### F-38 Arrival confirmation
- **Evidence:** a dialog in an inset screenshot on S1-22 ("Confirm that You've Arrived … Not Yet / Yes, I'm Here"). Its source app and whether it exists at UTSW are **Unknown**.
- **Provisional priority:** Hold – ask the client (Q-23).

#### F-39 System-level search and app shortcuts
- **Evidence:** an iOS Spotlight reference (S1-23) with no annotation.
- **Provisional priority:** Hold.

---

## Capabilities mentioned nowhere in the materials (gaps, not proposals)

These are recorded so the client can decide whether they matter. They are **not** recommended features.
- **Urgent or emergency care guidance.** The only references are a Children's Health reference (S1-17) and an "Urgent Care" chip in a popular-searches reference (S1-2). See Q-18.
- **Insurance acceptance** as a search criterion.
- **Referral requirements** before scheduling.
- **Caregiver or proxy use** (for example, a parent managing a child's care).
- **Virtual care as a journey or filter.** Only the "Accepting Virtual Care" label is observed (S1-8).
- **Provider ratings or reviews.** These appear only in a non-healthcare reference (S1-12).
- **Offline behavior** (for example, in parking garages or buildings with poor signal).
