# UTSW MyCare mobile app – home screen design brief

Handoff from the brand guidelines session. Everything needed to design the home screen is here.

## The task

Design the **home screen of the UTSW MyCare mobile app** (the UT Southwestern Medical Center patient app).

- **Mobile app only.** No web, tablet, or desktop layouts. Design for a phone viewport (base frame 390 × 844 pt, iPhone 14/15 class; it must also hold up at 360 pt wide for Android).
- **Stick to the UT Southwestern brand guidelines** (summarized below; full deck linked).
- **Modern, user-friendly layout** that meets **WCAG 2.2 AA**.
- **Font sizes: even numbers only, always written with .0** – e.g. 12.0, 14.0, 16.0, 18.0, 20.0, 24.0, 28.0, 32.0. No odd or fractional sizes anywhere.
- **Spacing consistent throughout** – one spacing scale on a 4-pt base (4.0, 8.0, 12.0, 16.0, 24.0, 32.0, 40.0, 48.0) used for every margin, gap, and padding.
- **Animations and interactions** – meaningful motion (entrance, press states, alert expand, carousel, pull-to-refresh, tab switching), all honoring `prefers-reduced-motion`.
- Design **both audiences**: Guest home and Authenticated home (the requirements call for separate compositions).
- Deliverable: a high-fidelity, clickable mobile prototype as a claude.ai Artifact (phone-sized frame, interactive), plus a short spec of the tokens used (type scale, spacing scale, colors, radii, motion durations/easings).

## Requirements (transcribed from `home-screen-requirements.webp`)

Module: **Home Screen**

| Feature | Elements | Requirements |
|---|---|---|
| **Home Screen Layout** | Configurable Modules · Guest Home · Authenticated Home | 1. Display a home experience composed of modules configured by UTSW administrators. 2. Support separate compositions for guest and authenticated audiences. 3. Display modules in the configured order and honor visibility rules. 4. Module changes should not require a mobile app release when supported by the CMS. |
| **Emergency Alert Banner** | Alert Banner · Alert Details | 1. Display a prominent banner when an active emergency alert is published. 2. Allow the user to open the full alert details. 3. Respect alert activation and expiry configuration. 4. Confirm priority behavior when multiple alerts are active. |
| **Appointment Context** | Upcoming Appointments · Appointment Actions | 1. For authenticated users, surface available upcoming appointment context from Epic/MyChart. 2. Provide configured actions such as directions, wayfinding, rideshare, add to calendar, or opening MyChart appointment details. 3. Do not treat MyCare as the source of truth for clinical appointment data. 4. Validate which appointment fields/actions the approved Epic integration exposes. |
| **Search & Quick Access** | Search Entry Point · Top Searches · Quick Tiles | 1. Provide a search entry point for providers, locations, content, and resources. 2. Display configured top searches or suggestions where available. 3. Allow quick-access tiles to route users to their target modules. 4. Confirm tile types and search suggestion sources during discovery. |
| **Featured Content & Services** | Featured Content · Highlighted Services · Campaign Banners · Announcements | 1. Display featured content, services, promotions, and announcements configured by UTSW administrators. 2. Selecting an item opens its configured destination. 3. Respect publication dates and audience visibility rules. |

The next module in the source (cut off) is **Find Care → Provider Search** (keyword search, plain-language queries) – a likely quick-tile/search destination.

Design implications: build the home as a stack of reusable module components (so admins can reorder/hide them), show the guest and authenticated compositions, show the alert banner in collapsed and expanded/detail states (and how two simultaneous alerts stack), mark appointment data as coming from MyChart (e.g. "From MyChart" source label), and treat Find Care/Provider Search as a tile destination.

## Brand guidelines (UT Southwestern)

Full deck: https://claude.ai/artifact/F6kTZbgBk3sHEGxLFfftZL (read it with the Artifact tool if more detail is needed).

**Logo – new UTSW MyCare logo** (proposal, pending CMPA approval): vector files in `mycare-logo/` – `horizontal.svg` (blue tile with white "U" cradling a cyan dot + "UTSW" Inter Display ExtraBold blue + "MyCare" Inter Display Medium #333333), `wordmark.svg`, `stacked.svg`, `reversed.svg` (white on #004278), `one-color-blue.svg`, `one-color-black.svg`, `icon.svg` (1024 app icon, white U + cyan dot on #004278). Clear space = cap height of "UTSW" on every side; minimum 187 px wide on screen. Never redraw, distort, recolor, or rebuild the logo with live text – use the SVGs. Do not use or imitate the master "UT Southwestern Medical Center" logo.

**Colors**
- UT Southwestern Blue `#004278` (PMS 2945) – primary brand color; headings, primary buttons, app bar. 
- UT Southwestern Gray `#333333` (80% black, PMS 431) – body text.
- PMS 2995 cyan `#00A9E0` – accent for non-text shapes only (fails text contrast on white: 2.5:1).
- Brights (approx. screen values): PMS 158 `#E87722` orange, PMS 1925 `#E0004D` magenta-red, PMS 361 `#43B02A` green, PMS 2587 `#8246AF` purple.
- Muted: PMS 542 `#7BAFD4`, 7407 `#CBA052`, 7524 `#A45A52`, 5763 `#777C4F`, 437 `#7B6469`.
- Neutrals (pastels): PMS 642 `#D1DDE6`, 4545 `#D5CB9F`, 482 `#DBC8B6`, 5807 `#D0D1B0`, 400 `#C4BFB6`.
- Tints at 90/80/70/60% of each are part of the palette.
- Supporting UI tones used in the deck: background `#F7F8FA`, surface tint `#EBF0F5`, borders `#D5DDE5`, secondary text `#5B6770` (5.46:1 on #F7F8FA), light text on blue `#D6E4F0` / `#A9C7E0`, alert red text `#B0003A` (6.4:1 on #FBEFF2).
- Only Blue's RGB (0/66/120) is official; other hex values are approximations.

**Typography** – the brand's logo uses Helvetica Neue Heavy/Roman; for UI use a modern neo-grotesk: **Inter** (body/UI) and **Inter Display** (large headings), or the platform system font (SF Pro / Roboto) if preferred. Weights: 400/500/600/700/800. Avoid serif faces for body copy.

**Editorial style for UI copy** (UT Southwestern Style Guide)
- Headlines and screen titles in sentence case; no periods in headlines.
- First reference "UT Southwestern" or "UT Southwestern Medical Center"; later "UTSW". Never split "UT" and "Southwestern" across lines (use a non-breaking space).
- No ampersand in place of "and" in text (allowed only in official names and shortened navigation).
- En dash with spaces ( – ), never em dashes. Serial comma.
- Times: 8 a.m., 8:30 a.m., noon, midnight. Dates: Monday; Jan., Feb., Aug., Sept., Oct., Nov., Dec. abbreviated with a date (Oct. 21); others spelled out (June 8).
- Phone: 214-648-3266. Numbers one–nine spelled out in prose; numerals for 10+, measurements, percentages, ages.
- Words: email, website, online, healthcare, checkup (noun), wait-list (verb)/waitlist (noun).
- Hospital name: William P. Clements Jr. University Hospital → Clements University Hospital on later reference.
- Titles: "Jane Doe, M.D." then "Dr. Doe". Use clearly fictional sample people and data; never invent real physicians or statistics.

## Accessibility checklist (WCAG 2.2 AA)
- Text contrast ≥ 4.5:1 (≥ 3:1 for 24.0+ or 18.0+ bold); non-text UI and focus indicators ≥ 3:1.
- Touch targets ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android), with ≥ 8.0 spacing between.
- Never rely on color alone (alert severity has an icon and a word).
- Visible focus states; logical reading/focus order; every icon button has an accessible name.
- Supports Dynamic Type / font scaling without clipping; minimum body 16.0.
- Motion: subtle, purposeful, 150–300 ms; respect reduced motion; no flashing; auto-advancing carousels must pause and have controls.
- Emergency alert announced to screen readers (live region) and dismissible/collapsible per config.
