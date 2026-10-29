# UTSW MyCare Today line – spec

Prototype: `mycare-geo-alt.html`, built from `src.html` by `build.py`. On screens 1000 px and wider the board pins the phone on the left and scales it to the window height, so the whole mockup stays in view while the journey, controls, and docs scroll beside it. 390 × 844 pt, checked at 360, large text (130%), reduced motion, light and dark. A second direction for the location-aware home; the first lives in `designs/geo/`.

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

## MyChart tab

The guest prototype's sign-in, on this prototype's tokens:
- **Header:** "MyChart" with "Sign in for visits, messages, results, and bills."
- **Blue panel** (with the cyan glow): "Sign in to MyChart", then fields on the panel. They are white in light mode and deep navy in dark, with the show-password eye inside the field.
- **Buttons:** a white Sign in button with three loading dots, "Forgot username or password?", a "New to MyChart?" divider, and an outlined Create an account.
- **Below the panel:** a "Simulated sign-in" note, then "Without signing in": Pay as a guest, and More (opens the menu).
- **Empty fields:** Sign in says "Enter your MyChart username and password" and focuses the empty field.
- **Signed in:** a Blue card with Jordan Rivera (sample), the MyChart hand-offs (each opens in MyChart ↗), and Sign out.

## Device mockups

Drawn in CSS to the real devices' shapes, with no logos or photos. The Device control switches between them; the app adapts its status bar height, screen height, and system bars.

| | iPhone 15 (390 × 844) | Samsung Galaxy S24 (360 × 780) |
|---|---|---|
| Frame | Titanium rim, 11 px black bezel, 51 px screen corners | Flat aluminum rim, 7 px bezel, 36 px screen corners |
| Camera | Dynamic Island, 124 × 36 | Centred punch-hole, 12 px |
| Buttons | Action button and two volume buttons on the left, side button on the right | Volume and power on the right |
| Status bar | 54 px: time left of the island; signal, Wi-Fi, battery | 36 px: time left; Wi-Fi, signal, battery, 85% |
| Bottom | Home indicator, 134 × 5 | Gesture bar, 108 × 4 |

## Common homepage modules (from `designs/guest`)

The location layer sits on top; the guest home's modules follow in their usual CMS order in every state, so the common homepage is always there:

1. **Emergency alert banner** (board control) – above everything, with an icon and the word "Alert" (never color alone), "Show all alerts (2)", and the full alert on a page.
2. **Global search** – one field for doctors, places, MedBlog articles, resources, and announcements, with scope chips: All, Doctors, Places, Articles, Resources. **Top searches** sit under the field and lead to real results here: Heart clinic, Parking, Pharmacy, Lab, Urgent care, Flu shots.
3. **MyChart sign-in prompt** (guests only) – Sign in or Create account.
4. **Quick links** – the same six links.
5. **MedBlog** – a swipeable carousel with previous and next buttons and a progress bar. It never auto-advances. "See all" opens a list with topic chips, and each article opens on its own page.
6. **UTSW resources** – rankings, wayfinding (opens the tab), video visit prep, virtual urgent care, financial assistance.
7. **Campaign banners** – the Blue flu campaign (walk-in facts, Find a flu shot, add to calendar), plus a tint promo for virtual urgent care.
8. **Announcements** – date badges, and "See all".

The menu adds "Why UT Southwestern" and "Patient resource guide". Article, resource, announcement, and campaign copy is copied unchanged from the guest prototype; all of it is sample CMS content.

## Place mode: the app becomes the place (Gozio-style navigation, UT Southwestern design)

When location (live or chosen) puts you at a campus, the Home tab stops being a page and becomes the place. Away, the common homepage returns.

- **Full-bleed live 3D map** (520.0 high, sticky; the sheet scrolls over it). Floating on top: search ("Search this hospital"), the menu, and the step-by-step guide pill (Step 4 of 6 · Elevator B to Floor 7; it opens to the whole list). Down the right edge: 2D or 3D, Recenter, and inside a building one stacked floor control – All floors, 7, 2, 1 – with a cyan dot on your floor. Along the bottom edge: your doctor (sample) and the "Sample 3D map" tag share one row, so neither covers the other.
- **Bottom sheet:** one row – "● Floor 1 · You're here · Simulated" (opens Location) and Not here? – then the place's full name and eight category circles (56.0, solid Blue): Care, Dining, Restrooms, Pharmacy, Information, Parking, Elevators, Quiet rooms.
- **Every category asks to navigate.** Tapping a circle flies the map to the nearest match (rings pulse on every match) and raises a card over the map: the place, floor, walking time, and hours, with **Start navigation** (primary) and Menu, Prices, or Details. The sheet lists the rest by walking time under a "Nearest" card with the same Start navigation; any row or map label raises the card for that place.
- **All floors.** When your destination is on another floor, the map opens pulled apart: your floor solid at the bottom, the floors above drawn as light (cyan edges, faint fill), the route running from you to the elevator, up a glowing shaft with arrows flowing up, and on to the pin. Floor names ride beside each floor; the destination callout hangs above or below its place, wherever there is room. All floors is also a button on the floor control.
- **Below the categories:** the step-by-step guide (the day line), the visit pass, Care near you, open times, hospital resources, then the common homepage modules.
- **Motion:** arriving at a place, the camera swoops down from above the campus (2.4 s) while the sheet slides up on a spring. Floor changes drop the old floor away and settle the new one (650 ms), like an elevator. The car drives the route into the garage. Reduced motion jumps the camera and keeps cross-fades only.

**Live 3D map** (WebGL, three.js r128 from cdnjs, one renderer moved between the home and directions):
- **Campus:** glass towers with lit window bands and a helipad, open garage decks on columns with parked cars, the covered walkway and its lit entrance, roads with lane marks, trees, soft shadows.
- **Floors:** a slab, the corridor, rooms with walls and door gaps, open doors, and furniture by kind (café tables and counter, pharmacy counter, waiting seats, exam bays, chapel pews, elevator cars).
- **Marks:** the route is a Blue ribbon with a cyan glow and white chevrons flowing toward the destination; outdoors and in All floors it also shows through buildings at 40%. You are a Blue dot with a white ring, a pulsing halo, and a heading cone, always drawn on top. The destination is a bobbing red pin with a light beam.
- **Labels** are HTML over the canvas, projected every frame: department callouts (white, red dot, name and suite), round Blue amenity badges, P for garages. They never collide with each other or with the map controls; one that does not fit is hidden, and a callout with no room above its place hangs below it. Labels are buttons that raise the place card.
- **Camera:** framed by the screen's width, so a narrow phone sees the whole floor. Drag to turn; Ctrl or Cmd with the wheel zooms. Card maps (place pages, docs) are still images of the same renderer. Without WebGL, the earlier SVG drawing renders the same scenes.
- Light and dark come from the --m3-* tokens and the engine palette. Every map carries "Sample 3D map" (or "Sample map").

**Turn-by-turn** (Start navigation from the map card, a category, a tile, search, or a stop):
- **Top:** a Blue instruction banner with a 48.0 arrow (straight, turn left or right, walkway, entrance, elevator, flag), the instruction in 20.0/700, and the distance, which counts down while you walk. It turns green on arrival.
- **Map:** the 3D map fills the screen and follows you heading-up, a little ahead of the dot. **Next** walks the dot along the step (0.9–3.2 s) before the next instruction appears. The elevator step shows the building pulled apart and the dot rides the shaft from Floor 1 to Floor 7 while the elevator display counts up.
- **Map buttons (right edge):** Route overview (the whole way, every floor), Live view (simulated: eye level, the route ahead on the floor), Voice (reads each step aloud; off by default), Recenter.
- **Bottom card:** minutes left, distance, arrival time, the destination, step dots, the elevator display on the ride step, Open in your map app on the drive, Simulate the walk (plays every step, Pause to stop), Back and Next, and End.
- **Example steps:** Head east on Sample Blvd → Turn left into Garage A → Park, then take the covered walkway → Enter at the North entrance → Go straight down the main hall → Turn left to Elevator B → Take Elevator B to Floor 7 → Turn right out of the elevator → Heart clinic is on your left.
- **Left and right** come from the plan: which way you face and which side of the corridor the room is on.

## Places near you: menus, prices, and times (for everyone at a campus)

Care near you and Facilities show for every user at a campus, guests and patients alike. A facility with something to show opens a **place page** instead of going straight to directions. The page has the floor plan, floor, walking time, hours, and Directions (primary), then what is there:

| Place | Shows |
|---|---|
| Café (Clements, Simmons) | Menu by meal with prices and Vegetarian or Gluten-free tags – "nothing to order in the app" |
| Snacks (Floor 2) | Grab-and-go items and prices |
| Lab | Walk-in wait, common tests with self-pay prices (Fasting tag), Get a price estimate |
| Imaging | Walk-in wait, exams with self-pay prices, Get a price estimate |
| Pharmacy | Services (flu shot, pickup, questions) and common items with prices |
| Chapel, quiet rooms | Gathering times and what is in the room |
| Parking (from the Park stop and search) | Spaces open, valet, and the rate table |

Prices sit in a right-aligned tabular column and wrap rather than clip. Every list is tagged Sample. Restrooms, the ATM, and the information desk still go straight to directions.

## Scenarios (board switch above the journey)

Each scenario has its own Back / Next steps. People, hours, waits, conditions, and times are sample data.

**1. Guest nearby.** Not signed in, at a campus. Below a "Here for: Looking around" bar, the home shows:
- **Care near you:** departments in this building, sorted by walking time from where you stand. They re-sort when you change floors.
- **Open times today:** each doctor with today's open times as plain chips (information only). The row opens the section page.
- **Facilities:** the tiles for this floor. Café, snacks, pharmacy, chapel, and quiet rooms open their place page.

Any department opens a **section page** with:
- Its floor plan.
- Floor and suite, walking time, and hours.
- Directions (primary).
- The walk-in wait, plus test or exam prices, for lab and imaging.
- Open times for today or tomorrow.
- Conditions we treat or Services here (sample).
- What's near it.

Steps: Away → Arriving → Floor 1 → Café menu → Floor 2 → Lab prices → Simmons → No location.

**2. Appointments – nothing is booked in the app.**
- **With a visit in MyChart:** it leads the home. Care near you marks its section ("Your visit · 10:30 a.m."). On the section page, the visit comes first with Check in ↗, and the visit's doctor shows "Your visit" instead of times.
- **Without a visit:** doctors show their open times today or tomorrow, as plain chips, never buttons. Below them: "Open times are for information. To schedule, call 214-648-3266."
- **Guests:** see the same open times, plus "Sign in to see your visits".

Steps: Your visit → Heart clinic → No visit → Open times → Tomorrow → Guest.

**3. Why you're here.** With no visit today, the home asks once on arrival, as a ticket like the visit pass. A Blue welcome band reads "Where to today?" over the building name, with notches where it meets the list. Five common answers sit in a single list, each with a one-line hint of where it leads: Information desk · 4 min, Walk-in · Floors 1 and 2, Floor 1 · 6 min. Three rarer answers are quiet chips below. A footer has "Stays on this phone" and Not now. A "Here for …" bar with Change replaces the question afterwards.

| Answer | Home shows |
|---|---|
| An appointment | Sign in to MyChart, or choose where it is → pass and line |
| Visiting someone | Visiting hours, Go to the information desk, café, restrooms, chapel |
| Lab or imaging | Pick Lab or Imaging with walk-in waits → pass and line lead there |
| Pharmacy | Straight to the pharmacy (pass and line), hours, prescription status (MyChart) |
| I need care | 911 note, open times near you (for information) |
| Pick up or drop off | Pickup at the North entrance, door parking, Go to the lobby |
| Looking around | Everything near you (scenario 1) |
| Something else | Search, classes, billing help, lost and found, talk to someone |

A focused answer keeps the home short: it shows only Facilities below. Looking around and Not now show Care near you and the doctors too. The Location sheet lists the answer as a reason ("Your answer"), next to the simulated location.

**4. 3D wayfinding.** Signed in with a visit on Floor 7, standing on Floor 1. Steps: All floors (the route through the pulled-apart building) → Tap Dining (the map flies to the café, with Start navigation) → Turn by turn (follow camera, Next walks the dot) → Elevator (the dot rides the shaft) → Live view (simulated, out of the elevator) → Overview (every floor of the way) → Arrived.

**5. Section guides** (like a theme park's land guides). Walk into a section and its guide unlocks: a toast, the map frames that section with a tinted floor and rising walls of light plus its name, and the home leads with a themed card – what's happening now (sample), four quick actions (show on the map, Check in in MyChart, or call the desk), Only here, and a tip. Sections: Main lobby, Imaging and pharmacy (Floor 1), Lab, Rehab (Floor 2), Heart and Vascular Center (Floor 7), Simmons main floor. In directions, stepping into a section shows "Entering · Section guide unlocked". All guides lists every section – unlocked as you go, preview the rest. Steps: Main lobby → Imaging wing → Lab → Rehab → Stepping in → Heart center → All guides → Simmons.

## Trust and control

- Never asks on launch. “Help when you arrive” explains first (sample map, Parking, Best entrance, Your floor, one privacy line), then the simulated system prompt.
- Location chip (top of the home) always says what the home is using; live dot when location is in use. Tap for **Location**: why you see this (each signal tagged Simulated, MyChart, or Sample data), Not here?, Show the common homepage (paused for today, Resume), Clear my choice, Location settings.
- “Not here?” beside the chip whenever location content is active.
- **Where are you?** works without location: Clements or Simmons, then On my way, entrance, Floor 1, 2, or 7; Not at a UTSW campus; Another UTSW location; ZIP or city.
- Lock screen (simulated) shows live directions, like a Live Activity (iOS) or live notification (Android): step number, the step itself, a progress line, and the place and floor. The final step reads “Go to Suite 7200” – never the department or the visit. It stays open while the board steps through the journey; Open directions goes to the same step in the app.
- Epic stays Epic: Check in, visit details, messages, results, visits, and billing open in MyChart (↗, “opens in MyChart”). Guests are sent to sign in.

## Maps (one system)

One unit space (320 × 200) for the campus and every floor plan, shared by the live 3D map and its SVG fallback.
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
| Directions step | Step slides in 16.0 (360 ms); the dot walks the step and the camera follows heading-up |
| Arriving at a place | Camera swoops down from above the campus (2.4 s), the sheet rises |
| All floors | Floors pull apart; the floors above turn to light; arrows flow up the elevator shaft |
| Elevator ride | The dot climbs the shaft (2.2 s) while the display counts floors |
| Same context | Nothing moves |
| Reduced motion | Cross-fades only; ring, fill, floor, car, camera, and dot jump to their end; nothing idles |

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
| Tab bar | full width, surface, 56.0 tabs sized to their labels (one line at 360), 56 × 32 pill indicator · like the platform bars, keeps its 12.0 labels when text is enlarged |

## Real integrations needed

| Shown here | Real system |
|---|---|
| Arriving, entrance, campus | Geofences around campuses, garages, and doors, with dwell time |
| Floor and indoor route | Indoor positioning (BLE or Wi-Fi RTT) and a wayfinding SDK with floor plans |
| 3D map, All floors, route | Venue map data per floor (IMDF or the wayfinding vendor's SDK, such as Gozio), rendered natively; routes from the vendor's routing service |
| Live view | Camera-based AR (ARKit or ARCore) anchored to the indoor position; here it is simulated inside the 3D model |
| Voice | Platform text-to-speech, read from the step list |
| Today's visits, check-in | Epic MyChart integration; MyCare hands off |
| Your visits, open times | MyChart visits; Epic scheduling read-only (open slots by department and provider) – no booking in MyCare |
| Menus, prices | Food service menus, pharmacy items, lab and imaging self-pay price lists (CMS or feeds) |
| Walk-in waits | Lab and imaging queue feed |
| Conditions treated, hours | Department content in the CMS, approved by each department |
| Floor, suite, entrance | Department directory mapped to buildings |
| Spaces open, rate | Garage occupancy and pricing feed |
| Amenities, support, education | CMS content per building, approved by each center |
| Lock screen notice and live directions | Geofence-triggered local notification; ActivityKit Live Activity (iOS) or an ongoing notification (Android) updated by indoor positioning |

Design intent to confirm with UTSW privacy and Epic teams: location is read only while the app is open, decides the home on the phone, and is never saved or shared.

## Build

`python3 build.py` inlines `../../mycare-logo/reversed.svg` and `icon.svg` unchanged, derives the Material Symbols subset from `ICON_MAP` (95 glyphs, about 150 KB woff2, measured from Google Fonts), and fails if a static glyph is unmapped or a glyph is mapped twice.

## Verification

- `build.py` succeeds: 95 glyphs, logo and icon inlined unaltered.
- Headless Chromium, five configurations (light 390, dark 390, light 360 with large text, dark 360 with large text and reduced motion, light 360 reduced motion): every journey step, floor 2, guest with and without a destination, MyChart sign-in and sign-out, Ask → explainer → system prompt → allowed, approximate, manual choice, Where are you? with ZIP, clear choice, pause and resume, no signal, every directions step, every category on the live map, each floor and All floors, a map label, 2D, the guide, Route overview, Live view, Voice, Simulate the walk, scenario 4 step by step, all tabs, search with and without results, menu, lock screen, and every Quick link. No console or page errors. WebGL runs in headless Chromium through SwiftShader, with three.js served from a local copy; a sixth run blocks three.js to check the SVG fallback.
- Every visible text node meets 4.5:1 (3:1 large) in both themes; no element spills past the phone or its container; every control is at least 44 × 44.
