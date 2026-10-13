# MyCare 2.0 – Product Foundation

The shared product foundation for UT Southwestern Medical Center's **MyCare 2.0** experience. These documents set out what is known, proposed, assumed and unknown **before** any screen design or development begins.

**Status:** Draft v0.1 (Oct. 13, 2026) – for client validation. Nothing here is approved scope.

## Documents

| # | Deliverable | Purpose |
|---|---|---|
| 1 | [Product Understanding Brief](01-product-understanding-brief.md) | What MyCare 2.0 is, what the sources establish, and what remains unknown, across all 13 areas |
| 2 | [Feature and Scope Inventory](02-feature-scope-inventory.md) | 39 capabilities (F-01 to F-39) in five groups, each with evidence status and a provisional priority |
| 3 | [Experience Architecture](03-experience-architecture.md) | Entity model, navigation hypotheses (H1–H3), signed-in vs. signed-out, handoffs, and UX foundation principles (UX-1 to UX-10) |
| 4 | [User Journey Maps](04-user-journey-maps.md) | Journeys A–E with decision points, states and missing steps |
| 5 | [Assumptions and Risks Register](05-assumptions-risks-register.md) | Assumptions (A-), risks (R-), dependencies and unknowns (U-), and source conflicts (K-) |
| 6 | [Client Discovery Questions](06-client-discovery-questions.md) | 41 questions (Q-01 to Q-41), split into Essential and Later |
| 7 | [Recommended Next Steps](07-recommended-next-steps.md) | Immediate actions, the six-phase approach and decision gates |
| – | [Deck evidence log](sources/deck-evidence-log.md) | Slide-by-slide record of source S1 |
| – | [Brand and editorial standards](sources/brand-and-editorial-standards.md) | Notes on sources S3–S7 as they apply to MyCare |

## Evidence key (used in every document)

| Category | Meaning |
|---|---|
| **Confirmed** | Explicitly stated as fact in a provided source (for example, a "Current" bullet in the deck, or a brand standard) |
| **Observed** | Directly visible in a screenshot in the deck, or on a public page |
| **Proposed** | An idea suggested in the deck ("Future", "What We Want to Explore"). **Not an approved requirement.** |
| **Assumption** | A reasonable interpretation that needs validation |
| **Unknown** | Must come from the client or technical team |

The Inventory also uses **R** for elements seen only in inspiration references or concept mockups, with no UTSW annotation.

## ID conventions

`S` sources · `S1-n` deck slide n · `F` features · `A` assumptions · `R` risks · `U` unknowns and dependencies · `K` source conflicts · `Q` discovery questions · `H` navigation hypotheses · `UX` experience principles · `G` decision gates.

## Source register

| ID | Source | Status |
|---|---|---|
| S1 | *UTSW MyCare 2.0 – Key Features, Experience, Design Elements* (24 slides) | Reviewed in full |
| S2a | https://utswmed.org/doctors/ | **Not accessed** – the workspace network policy denied the host, and the hosted fetch tool could not resolve it |
| S2b | https://utswmed.org/locations/ | **Not accessed** – same reason |
| S2c | Search-engine listings of utswmed.org URLs | URL patterns only; no page content reviewed |
| S3 | Logo Color Palette – Brand Standards | Reviewed |
| S4 | Typography – Brand Standards | Reviewed |
| S5 | UT Southwestern Logos – Brand Standards | Reviewed |
| S6 | UT Southwestern Style Guide (updated June 8, 2026) | Reviewed |
| S7 | UTSW Brand Color Palette | Reviewed (swatches did not render; labels legible) |
| S8 | Current "UTSW MyCare" logo – image provided by the client team (1386×384 PNG, Oct. 13, 2026) | Reviewed; colors measured (approximate – compressed screenshot) |

Source files are not stored in this repository. They were provided in the working session.

## Executive summary

**What we know**
- UT Southwestern runs a patient app, "UTSW MyCare". Its tabs are Home, MyChart, Providers, Locations and Wayfinding.
- The app today offers:
  - Provider search by name, specialty, condition and zip.
  - An academic-division list as the main filter, plus a city filter.
  - Long provider profiles with raw research text.
  - Building, clinic and hospital lists.
  - A Home screen with MedBlog and four MyChart-style Quick Links.
- The deck proposes:
  - "Find Care", with one prominent search and richer filters.
  - Patient-friendly specialties instead of academic divisions.
  - Action-first provider cards and profiles.
  - Gozio as the main way to find and navigate to locations.
  - A personalized home with appointment cards.
  - Campus Mode, favorites, account settings and health campaigns.
- UTSW's brand and editorial standards are defined and apply.

**What we do not know**
- The product's objectives and success measures, and the first-release scope.
- The technology, and the data sources behind providers and locations.
- How scheduling, MyChart and Gozio integrate.
- The authentication model, accessibility standard and privacy rules.
- What user research or analytics exist.
- The public websites could not be reviewed from this workspace.

**The most important patient journeys**
- **A – Find Care:** need → search → filter → choose → appointment action.
- **C – Provider to Location:** which location, then book or navigate.
- **B – Find a Location:** the right building or clinic → directions.
- **D – Returning patient:** open the app → MyChart task or today's appointment.

**The highest-impact opportunities (provisional)**
1. One patient-language Find Care search and specialty browse (F-01, F-03).
2. Trustworthy, clear appointment actions (F-11).
3. Simpler result cards and sectioned profiles (F-09, F-10).
4. Seamless provider ↔ location ↔ navigation links (F-13 to F-16).
5. A day-of appointment card, if MyChart and Gozio allow it (F-26).

**Decisions required from the client**
- Vision and objectives (Q-01, Q-02).
- First-release scope and audiences (Q-12, Q-04).
- The MyCare–MyChart boundary (Q-05, Q-27).
- Gozio's role (Q-28).
- The appointment action model (Q-15, Q-26).
- Taxonomy ownership (Q-14).
- Accessibility and privacy requirements (Q-30, Q-31).
- Product owner (Q-35).

**Recommended next action**
1. Allow `utswmed.org` in the workspace network policy so the website review can be completed.
2. Send the evidence request.
3. Hold a client alignment session built on the 10 essential questions in deliverable 6.

## Change log

| Version | Date | Change |
|---|---|---|
| 0.1 | Oct. 13, 2026 | Initial foundation from S1 and S3–S7. S2a and S2b not accessible. |
| 0.2 | Oct. 13, 2026 | Added S8 (current UTSW MyCare logo) and its measured color deviations; added R-18 and Q-41; logo modernization concepts started at the client team's request, ahead of gate G5 (see brand notes section 6). |
