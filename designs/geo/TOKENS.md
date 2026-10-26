# UTSW MyCare location-aware home – context model, flows, and token spec

Prototype: `mycare-geo.html`, built from `src.html` by `build.py` (phone frame 390 × 844 pt, also checked at 360 pt, with large text, reduced motion, and light and dark mode). Location is **simulated** with board controls. Real building names are used (William P. Clements Jr. University Hospital, then Clements University Hospital; Harold C. Simmons Comprehensive Cancer Center, then Simmons Cancer Center). Every floor, suite, entrance, garage, rate, count, amenity, person, and visit is fictional sample data.

Reference: `designs/guest/` (unchanged). This prototype copies its design system (tokens, components, dark mode, motion) and adds a context layer. Nothing here adds a size, color, radius, or curve.

## Principle

One homepage that adapts – not a different app per building. MyCare works out a **context**, puts it first in a **context layer** at the top of the light sheet, and moves the most relevant modules up. Search, Quick links, the five tabs, the menu, and every common module stay on the page in every state.

## Context model

| Context | Signals | What the home shows first | Hero and search |
|---|---|---|---|
| Away | No location, or away from campus; or the feature is off | The common homepage, plus one quiet row (Turn on / I'm at a campus / Choose a campus) | Welcome line; common top searches |
| Arriving | Precise location near Clements, not yet on foot; today's visit (signed in) | Context card: visit strip, Park → Enter → Go to (garage availability, best entrance, floor and suite), Start directions, Parking options. Then **Parking** | Place pill, “You're almost here”; top searches Parking, Main entrance, Valet, Accessible parking |
| At the entrance | Entrance geofence | Card: steps with Enter current, Start indoor directions, Check in (opens in MyChart), Save where you parked. Then **Nearby**, **Good to know here** | “You've arrived”; Restrooms, Café, Pharmacy, Elevators |
| Inside, by floor | Indoor positioning: building and floor | Card: floor chip, the rest of the route (Resume directions) or “You've arrived on Floor 7” with check-in. Then **Nearby** (sorted by distance from this floor), **Departments**, **Good to know here** | “Find your way inside”; search lists this building first |
| Cancer center | Simmons Cancer Center geofence; today's visit there | Card: visit strip, steps, Start directions. Then **Support services**, **Patient education**, **Nearby** – approved cancer center content | “You've arrived”; Support groups, Nutrition, Café, Parking |
| Near campus (approximate) | Approximate location | Card: which building? (your visit's building marked), Use precise location | Pill “Near the Dallas campus” |
| Location unavailable | Allowed, no fix | Fallback card: I'm at Clements / Simmons, Another UTSW location, Enter a ZIP code or city, Try again | Welcome line |
| You chose | Manual pick | Same as the chosen context, labelled “You chose this location,” with Change and Clear | Same as chosen |
| Paused | Show the common homepage, or Not here?, for this place | Common homepage with “Common homepage at … · Show again” | Welcome line |

**Precedence:** manual choice → feature setting (off = common) → permission (ask or denied = common with a way in) → fix (none = fallback card) → accuracy (approximate = which building?) → place and floor. A pause applies to one place for the rest of the day; leaving the place clears it. A fresh location reading replaces a manual pick.

**Guests** (not signed in) never see visit details; the card asks “Where are you going?” (Admitting, Lab and blood draw, Imaging, Heart and vascular clinic) and builds the steps from that.

## Flow map – location transitions

Away → Arriving → Entrance → Inside · Floor 1 → Inside · Floor 7 → Away (left). Also Away → Cancer center, any → Unavailable, any → You chose.

- **Re-compose:** modules that leave fade up (160 ms), the context card rises in (spring-gentle, 8.0 rise, 98% scale), kept modules slide to their new place (spring-snappy), new modules enter on the 40 ms stagger. Reduced motion cross-fades.
- **Announce once:** a toast with Hide (pauses this place) and a polite live-region message, e.g. “Arriving at Clements University Hospital. Parking and directions are at the top.” If a sheet, page, or search is open, the home re-composes underneath and the toast waits until it closes.
- **Floors are quiet:** a floor change updates the card body in place (240 ms cross-fade) and says “Floor 7. You've arrived.” without a toast.
- **Leaving:** back to the common homepage with “You've left Clements University Hospital – back to the common homepage,” plus Your car when a parking spot was saved.
- **Real build:** wait for a steady reading (about 30 seconds of dwell) before re-composing, so driving past campus never flips the home.

## Manual access and control

- **I'm at…** (quiet row, Not here?, options, settings, and “I'm here now” on a location page): Clements (then On my way, At the main entrance, Inside – Floor 1, 2, or 7) or Simmons; Another UTSW location; I'm not at a UTSW campus; Enter a ZIP code or city. Works with location denied or off.
- **Location options** (three dots on the card or the place pill): Not here?, Show the common homepage (today, with Undo), Clear my choice, Why am I seeing this?, Location and your home.
- **Location and your home** (menu): Adapt my home to where I am, Arrival notice, Location access, Choose where you are, Paused today · Show again.

## Permission and fallbacks

| State | Shows | Way forward |
|---|---|---|
| Not asked | Quiet row “Get help when you arrive” (names today's visit when signed in) | Turn on → MyCare explanation sheet (what you get, what's used, what isn't) → system dialog with the Precise switch. Choose a campus instead. Not now hides the row for the session |
| Allowed, precise | Full context | Options as above |
| Allowed, approximate | “You're near the UT Southwestern Dallas campus” – which building? | Pick a building, or Use precise location (one-time precise prompt) |
| Denied | Quiet row “Location is off for MyCare” | Choose where you are; Open Settings from Location access |
| No fix | Fallback card | Manual places, ZIP or city, Try again |
| Feature off | Quiet row “Location-aware home is off” | Choose; turn back on in settings |

Location is never requested on launch.

## Privacy and trust (design intent – to confirm with UTSW privacy, compliance, and Epic)

- Explain before the system prompt; ask only when the patient turns it on.
- Visible when active: live dot and place pill on the hero; “Location on · Precise / Indoor / Approximate” with a Simulated tag, or “You chose this location,” on the card.
- Why am I seeing this? on every card lists each signal and its source (location – simulated; your visit today – from MyChart, sample patient; building information – from UTSW, sample data).
- Location is read only while the app is open, decides the home on the device, and isn't stored, shared with the care team, or added to the record.
- Lock screen: the arrival notice names the place only (“You're near Clements University Hospital. Open MyCare for parking and directions.”). Visit type, provider, and time stay in the app, behind sign-in.
- No Epic clinical workflows are duplicated: visit details, eCheck-in, messages, results, scheduling, and billing hand off with “Open … in MyChart” / “Opens in MyChart” and an open-in-new glyph.

## Real integrations required

| Capability | Prototype | Real system |
|---|---|---|
| Arrival and campus detection | Board “Simulated location” | Core Location / Fused Location region monitoring around campuses, garages, entrances; dwell and debouncing; campus polygons in the CMS |
| Indoor position and floor | Board “Inside: floor” | Indoor positioning (BLE beacons or Wi-Fi RTT) and a wayfinding SDK with maintained floor plans; building-level fallback |
| Today's visit, check-in | Sample patient; hand-off toasts | Epic MyChart SDK or approved APIs for upcoming visits and department; eCheck-in and details stay in Epic modules |
| Destination: building, floor, suite, best entrance | Sample mapping | Department directory mapping Epic departments to buildings, floors, suites, entrances (facilities-owned) |
| Parking availability and rates | Static sample counts | Garage occupancy feed or operator API; rates in the CMS; hide the meter when stale |
| Amenities, hours, resources | Sample data | CMS content per building and floor; cancer center content approved by its editors |
| Arrival notice | Simulated lock screen | Geofence-triggered local notification with privacy-approved copy and an in-app setting |
| Precise vs approximate | Board “Accuracy” | iOS reduced accuracy and temporary full-accuracy request; Android coarse vs fine |

## Components added (all on existing tokens)

| Component | Tokens |
|---|---|
| Context card | First module on the light sheet · surface, r-lg, shadow-2 + 1.0 --line · header s4: 40.0 solid dot, 12.0/700 uppercase kicker in --blue with the live dot and a Simulated tag (12.0/600 --ink-2 on --bg, hairline), 20.0/700 --ink title (the building's full name), 14.0 --ink-2 status · 44.0 options button · body s4 gaps · footer hairline with 44.0 links |
| Live dot | 8.0 --cyan with a 3.0 ring at 25% · shape only, always beside words · pulses twice on arrival, still with reduced motion |
| Visit strip | --bg, r-md, inset --line · 56.0 time box in --ctl, white 18.0/700 time, 12.0/700 a.m. · 16.0/700 date, 14.0 meta, “From MyChart” tag · 44.0 “Open visit in MyChart” link |
| Arrival steps | 32.0 circles (tint; --ctl for current; check glyph when done) on a 2.0 --line rail · 12.0/700 kicker, 16.0/600 title, 14.0 meta · s3 between · numbered because order is real |
| Parking meter | 8.0 pill, --tint-2 track, --ctl fill; the count is always written out |
| Floor chip | 32.0 pill on tint, 14.0/700 --blue, layers glyph |
| Destination box / arrived note | --bg r-md with 40.0 dot / tint r-md with a filled check and 16.0 --blue headline |
| Quiet row | surface, r-lg, shadow-1 · 40.0 dot, 16.0/600 line, 14.0 --ink-2 subline · actions under the text: 44.0 pills (tonal; solid --ctl for the one primary; plain --ink-2 for Not now) |
| Place pill | On Blue, replaces the welcome line · 32.0 pill, white 12% fill and 20% ring, 14.0/600 white, live dot · opens Location options |
| Amenity tiles | 3 across, 104.0 high, r-lg, shadow-1 · 40.0 dot, 14.0/600 label, 12.0/600 distance (--blue when on this floor) |
| Source note | 12.0/600 --ink-2 with a 16.0 info glyph: “Sample places and distances…” |
| Route map | 240.0, r-lg, map tokens (`--map-bg/--map-block/--map-road`, `.m-*`) · 6.0 --blue route drawn in 900 ms · cyan you-are-here dot with white ring and 25% halo · 12.0/600 labels in --ink / --ink-2 · floor chips |
| Lock screen | System-drawn, simulated · Blue with hero glow · 64.0/600 clock (platform size, the one exception to the 12.0–32.0 scale) · notification on surface with the unaltered 40.0 app icon |
| Precise switch | Inside the system dialog · standard 52.0 × 32.0 switch |

Type 12.0–32.0 even sizes; spacing 4.0–48.0; radii 8.0/12.0/16.0/24.0/pill; targets 44.0 minimum, 48.0 primary buttons. Colors are roles only (`--brand`, `--ctl`, `--blue`, `--bg`, `--surface`, `--tint`, `--tint-2`, `--ink`, `--ink-2`, `--line`, `--line-strong`, `--cyan` for shapes), so dark mode follows via `.phone.dark`.

## Verification

- `python3 designs/geo/build.py` – 83 glyphs, all mapped; every static glyph in the subset; logo and icon inlined unaltered.
- Headless Chromium: no console or page errors through every simulated state, floor, permission, accuracy, auth state, manual pick, pause, Not here?, directions page, search, settings, lock screen, walk-through, leaving, every tab, MedBlog, menu, and MyChart sign-out and sign-in; all 83 glyphs render as ligatures.
- Automated contrast sweep of every visible text node (14 states and overlays, light and dark): 0 below 4.5:1 (3:1 for large text).
- Screenshots reviewed at 390 and 360, default and large text, reduced motion, light and dark.

## Prototype controls

Simulated location (Away, Arriving, Entrance, Inside, Cancer center, Unavailable) · Inside: floor (1, 2, 7) · Location permission (Ask, Allowed, Denied, No fix) · Accuracy · MyChart (Signed in sample patient, Guest) · Location-aware home (On, Off) · Demos: Walk through a visit, Arrive with the phone locked, Reset · Emergency alert · Phone width · Text size · App appearance · Motion. Flow map buttons jump to each step with precise location allowed.

## Still to design

- Cancer center depth: infusion and radiation flows, the resource center floor, caregiver-specific views, and multiple Simmons locations.
- Other hospitals and clinics (Zale Lipshy Pavilion, regional clinics), parking-only and multi-building campuses.
- Signed-in home composition beyond the context layer; multiple visits in different buildings on one day; late or running-behind states (needs Epic data).
- Real dwell timing, background behavior, and battery tests once a positioning vendor is chosen.
