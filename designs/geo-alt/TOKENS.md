# UTSW MyCare Today line – spec

Prototype: `mycare-geo-alt.html`, built from `src.html` by `build.py`. 390 × 844 pt, checked at 360, large text (130%), reduced motion, light and dark. A second direction for the location-aware home; the first lives in `designs/geo/`.

Location is **simulated**. Real building names (William P. Clements Jr. University Hospital, Harold C. Simmons Comprehensive Cancer Center); every floor, suite, entrance, garage, rate, count, person, and visit is sample data. Maps are labelled “Sample map”.

## Concept

The home is the patient's **day drawn as a transit line**: Leave home → Park → Enter → Elevator → Visit → next visit. A **visit pass** (boarding-pass ticket: time, department, building; a Blue stub with the floor and suite) sits above it. A cyan ring marks you. As you move, the ring travels down the line, passed stops shrink to checks, and the next stop opens into one card with only what that place needs and one primary action. Search, Quick links, the five tabs, and the menu sit in the same place in every state.

How it differs from `designs/geo/`: no Blue hero or big search on Blue (slim Blue bar only, search on the light page); a vertical line instead of a context card and a three-step tracker; a ticket instead of a header card; an elevator display and floor dots instead of a floor stack; a location chip instead of a place pill; a full-width tab bar with a pill indicator instead of a floating bar; a sharper shape language (12.0 radii, notched ticket); a journey scrubber across the top of the board instead of a side timeline.

## States

| Step | Line | Open stop shows | Primary action |
|---|---|---|---|
| Away | Plan only, ring at Leave home | Campus map with the planned route | Get directions |
| Arriving | Ring on Park | Map (car drives in), spaces open, rate, valet | Start wayfinding |
| Entrance | Ring on Enter | Map, you pulse at the door | Start wayfinding (Check in ↗ secondary) |
| Floor 1 or 2 | Ring on Elevator | Elevator display and floor dots, floor plan to Elevator B, amenity tiles | Resume wayfinding |
| Floor 7 | Ring on Heart clinic | You've arrived, floor plan, nearby tiles | Check in ↗ (MyChart) |
| Simmons | Earlier stops collapse; pass flips to the 2 p.m. visit | Map at the Simmons door, Support for you tiles; Learn below | Start wayfinding |
| No location | Plan only | Notice: Choose a place, Settings | Choose a place |
| Approximate | Plan only | Notice: Clements, Simmons, Use precise location | Pick a building |
| No signal | Plan only | Notice: Choose a place, Try again | Choose a place |
| Ask (first run) | Plan only | Notice: Help when you arrive – Turn on, Not now | Turn on |
| Guest | Line starts at the garage | A blank pass asks “Where are you going?”; choosing fills the pass and the line | Choose a destination |

Inside Clements, “In this building” (departments by floor) and “Hospital resources” appear below the line. While on the move the pass folds to a compact ticket so the open stop stays on the first screen.

Precedence: your choice → paused → permission → signal → accuracy → place and floor. A journey step on the board turns location on if it was never asked.

## Trust and control

- Never asks on launch. “Help when you arrive” explains first (sample map, Parking, Best entrance, Your floor, one privacy line), then the simulated system prompt.
- Location chip (top of the home) always says what the home is using; live dot when location is in use. Tap for **Location**: why you see this (each signal tagged Simulated, MyChart, or Sample data), Not here?, Show the common homepage (paused for today, Resume), Clear my choice, Location settings.
- “Not here?” beside the chip whenever location content is active.
- **Where are you?** works without location: Clements or Simmons, then On my way, entrance, Floor 1, 2, or 7; Not at a UTSW campus; Another UTSW location; ZIP or city.
- Lock screen (simulated) names the place only.
- Epic stays Epic: Check in, visit details, messages, results, visits, and billing open in MyChart (↗, “opens in MyChart”). Guests are sent to sign in.

## Maps (one system)

One renderer and one unit space (320 × 200) for the campus and every floor plan.
- **Campus:** Sample Blvd east–west, Campus Dr north–south; Garage A and Clements north; Simmons garage and Simmons south; a covered walkway joins each garage to its entrance (Blue door mark).
- **Floors:** one corridor; rooms north and south, drawn from the same room data as the tiles, directory, search, and directions. Departments show name and suite; amenities show their glyph (the same glyph as their tile).
- **Marks:** route 5.0 --blue (dashed when planned, 30% when passed); you = cyan dot with a white ring and halo; destination = room outlined 3.0 --blue with a tint, plus a flag in the corridor. You, flags, and routes sit only on roads, walkways, and the corridor centerline, so they never touch a wall or a label. Labels 12.0 units (≥ 12.0 pt on screen at 360). “Sample map” and the floor tag live in a footer band below the drawing.

## Directions

One builder for every route: Drive to the garage (campus) → Walk to the entrance (campus) → Take the elevator (Floor 1) → Get off at Floor 7 (elevator display) → Heart clinic, Suite 7200. Opens on the step the simulated location says you're at (“You're here”). Step bar, map per step, 20.0/700 instruction, 48.0 Back and Next, Done on the last step, Open in your map app on the drive.

## Motion

| Moment | Motion |
|---|---|
| You move | Ring travels to the new stop (700 ms spring), rail fill grows (700 ms ease-in-out), passed nodes pop to checks (420 ms) |
| Stop opens | Panel unfolds from 0 rows (520 ms ease-out), card rises 8.0, tiles rise on a 40 ms stagger |
| Arriving | Route draws (1000 ms); the car follows it into the garage |
| Entrance | Halo pulses three times at the door |
| Floor change | Elevator display counts through each floor (140 ms per floor) |
| Next visit | Pass flips over (560 ms) |
| Directions step | Step slides in 16.0 (360 ms) |
| Same context | Nothing moves |
| Reduced motion | Cross-fades only; ring, fill, floor, and car jump to their end |

## Tokens (from `designs/guest`)

- Color: Blue #004278 (bar, stub, primary buttons), cyan #00A9E0 (you, never text), ink #333333, ink-2 #5B6770, bg #F7F8FA, tint #EBF0F5, line #D5DDE5. Dark: bg #0D1620, surface #16222E, ink #E6EDF3, ink-2 #A6B4C0, text Blue #8CC0EA, controls #2D6CA6.
- Type: Inter, 12.0–32.0 even sizes only, scaled by the text-size setting.
- Spacing: 4.0, 8.0, 12.0, 16.0, 24.0, 32.0, 40.0, 48.0.
- Radii: 8.0 (tiles, maps), 12.0 (cards, buttons, pass), pill (chips).
- Targets: 44.0 minimum, buttons 48.0. Disabled buttons: tint fill, ink-2 text.

| Component | Tokens |
|---|---|
| Line | 40.0 nodes (24.0 when passed) · 4.0 rail --tint-2, fill --ctl · you ring 3.0 --cyan, ping when live |
| Visit pass | surface + 1.0 line · 8.0 notches · stub 96.0 --ctl, 32.0/800 floor · 24.0/800 time (20.0 when compact) |
| Stop card | r-md surface, 1.0 line, s3 padding, one primary 48.0 button |
| Lift panel | 64.0 --inverse display (28.0/800) · 7 floor dots, you ring cyan, your floor --ctl |
| Tiles | 3 across, r-sm, 88.0 high, glyph + 12.0/600 name + 12.0 distance |
| Location chip | 44.0 pill, surface, 1.0 line, live dot or glyph |
| Notice | 2.0 dashed line-strong, stacked 48.0 actions |
| Tab bar | full width, surface, 56.0 tabs, 56 × 32 pill indicator · like the platform bars, keeps its 12.0 labels when text is enlarged |

## Real integrations needed

| Shown here | Real system |
|---|---|
| Arriving, entrance, campus | Geofences around campuses, garages, and doors, with dwell time |
| Floor and indoor route | Indoor positioning (BLE or Wi-Fi RTT) and a wayfinding SDK with floor plans |
| Today's visits, check-in | Epic MyChart integration; MyCare hands off |
| Floor, suite, entrance | Department directory mapped to buildings |
| Spaces open, rate | Garage occupancy and pricing feed |
| Amenities, support, education | CMS content per building, approved by each center |
| Lock screen notice | Geofence-triggered local notification |

Design intent to confirm with UTSW privacy and Epic teams: location is read only while the app is open, decides the home on the phone, and is never saved or shared.

## Build

`python3 build.py` inlines `../../mycare-logo/reversed.svg` and `icon.svg` unchanged, derives the Material Symbols subset from `ICON_MAP` (64 glyphs, about 100 KB woff2, measured from Google Fonts), and fails if a static glyph is unmapped or a glyph is mapped twice.

## Verification

- `build.py` succeeds: 64 glyphs, logo and icon inlined unaltered.
- Headless Chromium, five configurations (light 390, dark 390, light 360 with large text, dark 360 with large text and reduced motion, light 360 reduced motion): every journey step, floor 2, guest with and without a destination, MyChart sign-in and sign-out, Ask → explainer → system prompt → allowed, approximate, manual choice, Where are you? with ZIP, clear choice, pause and resume, no signal, every directions step, all tabs, search with and without results, menu, lock screen, and every Quick link. No console or page errors.
- Every visible text node meets 4.5:1 (3:1 large) in both themes; no element spills past the phone or its container; every control is at least 44 × 44.
