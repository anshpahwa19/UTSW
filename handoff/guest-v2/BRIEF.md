# Guest flow v2 – Home and Find Care (provider flow)

New scope from the user. Design for the **guest user only** (no signed-in states, no MyChart appointment card).

## Inputs in this folder
- `old-app-screens.pdf` – screenshots of the current/old UTSW app. Use as the reference for features to carry over.
- `req-home-screen.png` – Home Screen requirements table (layout, emergency alert, search and quick access, featured content and services; appointment context is authenticated-only, so skip it).
- `req-find-care.webp` – Find Care requirements: provider search (keyword, plain-language, auto-suggestions, recent/popular), location-based search (near me, manual, ZIP/city, denied-permission fallback), provider filters (specialty, condition, distance, language, gender, hospital affiliation, accepting new patients, online scheduling; multi-select, clear/reset), sorting (relevance, distance, A–Z, featured), results and empty/loading/error/offline states, provider profile (credentials, bio, specialties, languages, locations, contact, research/media, request appointment, favorite, share, related providers), favorites (guest favorites stored locally; add/remove/view saved), share via native share sheet with a public link only.

## Scope
1. **Guest Home** – rework features based on the old app screenshots and requirements.
2. **Provider flow** – Find Care search → filters/sort → results (incl. empty, loading, error, offline) → provider profile → favorite/share → saved providers.
3. **Keep the global search** from the current prototype (`glass-prototype/src.html`: search orb in the dock + search sheet with scopes, top searches, browse, grouped results).

## Keep from the existing work
- Visual direction: liquid glass on UT Southwestern Blue, tokens in `glass-prototype/src.html` (type scale 12.0–32.0 even only, 4-pt spacing scale, glass tokens, radii, motion).
- Brand rules, editorial style, and WCAG 2.2 AA checklist in `handoff/BRIEF.md`; logo files in `mycare-logo/`.
- Search field focus: no ring on the white search field (user requested).
- Fictional sample data only.
