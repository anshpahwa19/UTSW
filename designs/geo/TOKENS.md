# UTSW MyCare location-aware home – spec

Prototype: `mycare-geo.html`, built from `src.html` by `build.py`. 390 × 844 pt (checked at 360, large text, reduced motion, light and dark). Location is **simulated**. Real building names (Clements University Hospital, Simmons Cancer Center); every floor, suite, entrance, garage, count, person, and visit is sample data.

Design system: copied from `designs/guest/` (unchanged). No new sizes, colors, radii, or curves.

## Principle

One homepage. A **context card** sits at the top of the light sheet; what matters here moves up. Search, Quick links, tabs, menu, and every common module stay in every state. One line of copy wherever possible – the visuals carry the state.

## Journey (the board's main control)

| Step | Context card | Moves up |
|---|---|---|
| Away | Nothing new. Quiet row only when location isn't on yet (Turn on), denied, or off (Choose) | – |
| Arriving | Map strip (car drives to the garage) · place, “Arriving · Visit at 10:30 a.m.” · tracker Park (120 open) → Enter → Floor 7 (Elevator B) · Directions, Visit ↗ | Parking |
| At the entrance | Map strip (you pulse at the door) · tracker on Enter · Directions, Check in ↗ | Nearby, Good to know |
| Inside | Floor stack (you slide between floors; destination in Blue with a pin) · “Floor 2 / Heart clinic is on Floor 7” or “You've arrived” · Resume directions or Check in ↗ | Nearby, In this building |
| Cancer center | Map strip at the Simmons door · “Visit at 2 p.m.” · tracker · Directions, Visit ↗ | Support for you, Learn, Nearby |
| Approximate | “Near the Dallas campus” · two building tiles · Use precise location | – |
| No signal | “We can't find you” · two building tiles · Try again, Other location, ZIP or city | – |

Guests see no visit details; the card asks “Where are you going?” with four department chips.

Precedence: manual choice → setting → permission → signal → accuracy → place and floor. A journey step allows location if it was never asked.

## Motion

| Moment | Motion |
|---|---|
| Context starts | Leaving modules fade up 160 ms · card rises 24.0 and scales from 97% on spring-gentle · kept modules slide · hero rings ping from 55%, 140 ms apart · place pill pops |
| Island | Arrival notice drops from the top (--inverse pill, cyan icon) on spring-snappy, lifts after 2.8 s – never covers the card. Screen readers hear the full sentence |
| Arriving | Route draws in 1000 ms; car follows it into the garage (1.8 s) |
| Entrance | Door pulse ×3 |
| Step change | Tracker fill grows from the last step (800 ms, spring-snappy); current circle pops with a cyan halo |
| Floor change | Floor dot slides between floors (900 ms); island “Floor 7” or “You've arrived” |
| Nearby, support tiles | Rise on a 40 ms stagger |
| Same-context refresh | Everything stays still |
| Reduced motion | Cross-fades only; car rests at the garage, rings and pulse still, floor dot jumps, island fades |

## Control and trust

- **Options** (⋯ on the card, or the place pill): Not here?, Show the common homepage (today, Undo), Clear my choice, Why am I seeing this?, Location settings.
- **Where are you?** works without location: two building tiles, Another UTSW location, Not at a UTSW campus, ZIP or city. Clements then asks: On my way, At the main entrance, Floor 1, 2, or 7.
- **Before the system prompt:** “Help when you arrive” with the animated map, three icons (Parking, Best entrance, Directions), one privacy line, Continue / Not now / Choose a campus instead. Never on launch.
- **Why you see this:** each signal with its source tag (Simulated, MyChart, Sample data).
- **Lock screen:** names the place only.
- **Epic stays Epic:** visit details and check-in open in MyChart (↗).
- Design intent: location is read only while open, decides the home on the phone, never saved or shared – UTSW privacy and Epic teams confirm.

## Real integrations

| Capability | Real system |
|---|---|
| Arrival and campus | Geofences around campuses, garages, entrances, with dwell time |
| Floor and indoor route | Indoor positioning (BLE or Wi-Fi RTT) and a wayfinding SDK with floor plans |
| Today's visit, check-in | Epic MyChart integration; MyCare hands off |
| Floor, suite, entrance | Department directory mapped to buildings |
| Parking spaces | Garage occupancy feed |
| Amenities, support | CMS content per building, approved by each center |
| Arrival notice | Geofence-triggered local notification |

## Components (existing tokens only)

| Component | Tokens |
|---|---|
| Context card | r-xl surface, shadow-2 + 1.0 --line · map strip 120.0 · header s4: 40.0 solid dot, 18.0/700 place, 14.0 --ink-2 status with live dot · ⋯ 44.0 · body s4 |
| Map strip | Map tokens · route 6.0 --blue · P and H signs: 28.0 --ctl squares, white 16.0/700 · car 8.0 --ctl with white ring · you: cyan dot, 25% halo · “Simulated” tag 12.0/600 on surface |
| Step tracker | 40.0 circles, 2.0 --tint-2 ring at rest; --ctl when done or now; now adds a 6.0 cyan halo · 4.0 track --tint-2, --ctl fill · 12.0/600 label + 12.0 sub |
| Floor stack | 7 bars 12.0 high, 4.0 gap, r 4.0, --tint-2 · destination --ctl + 16.0 pin · you: 12.0 cyan dot with a 3.0 surface ring · 28.0/700 --blue floor, 14.0 sub · --bg panel, r-lg |
| Building tiles | 2 across, 112.0, --bg r-lg, hairline · 40.0 solid dot, 14.0/600 name, 12.0/700 --blue visit time |
| Icon tiles | 80.0 wide · 48.0 dot · 12.0/600 label, 12.0 distance (--blue on this floor) |
| Island | --inverse pill 40.0 high, 32.0 cyan icon circle, 14.0/600 |
| Quiet row | r-lg surface, shadow-1 · 40.0 dot (solid --ctl for Turn on) · 16.0/600 + 14.0 · one 44.0 pill · 44.0 close |
| Place pill | On Blue: white 12% fill, 20% ring, 14.0/600, live dot |
| Lock screen | System-drawn, simulated · 64.0 clock (platform size) · notice on surface with the unaltered app icon |

## Verification

- `build.py`: 80 glyphs, all render; logo and icon inlined unaltered.
- Headless Chromium: no console or page errors across every journey step, floor, permission, accuracy, guest, manual pick, pause, directions, search, tabs, menu, lock screen, Play, and reduced motion.
- Contrast sweep of every visible text node, 16 states and overlays, light and dark: 0 below 4.5:1 (3:1 large).
