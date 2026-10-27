# MyCare Duo – spec

Prototype: `mycare-geo-duo.html`, built from `src.html` by `build.py`. The location-aware home (the Today line from `designs/geo-alt/`) redesigned for a concept book-style foldable, shown closed and open, with the fold animation between them. On screens 1000 px and wider the board pins the device on the left and zooms it to the window height (at 1,250 × 890 the whole device, open or closed, is in view), while the journey, controls, and docs scroll beside it.

**“iPhone Duo” is a concept device, not a shipping Apple product.** The mockup is drawn in HTML and CSS: graphite bezel, no maker marks or Apple imagery. Location is **simulated**; building names are real, and every floor, suite, garage, rate, visit, and person is sample data.

## Assumed device sizes

| Part | Assumption |
|---|---|
| Cover screen (closed) | 390 × 844 pt, portrait – a standard phone canvas |
| Inner screen (open) | 780 × 844 pt, near-square |
| Hinge | Vertical, book-style, at x 390 of the inner screen; a visible crease |
| Keep-out | 32.0 centred on the crease (16.0 each side) |
| Bezel | 12.0 around the inner screen; 6.0 cover sides, 12.0 top and bottom |

Confirm sizes, safe areas, and posture events with the platform once a real device exists.

## Two layouts

| | Closed – cover | Open – inner |
|---|---|---|
| Job | A one-hand glance | Plan and follow the day |
| Top | Blue band: logo, Sign in or account, menu | The same band across both panes; logo left, account and menu right |
| Where | Location chip and search; “Not here?” on the Today row | Chip and “Not here?”, then a search field (left pane) |
| Main | Pass (compact), one **now card**: a stop strip with the cyan ring, the stop, one map, the primary action; a “Then” row | Left: pass, the full line, In this building, Learn, Quick links. Right: the current stop – header, lift panel, large map (358 wide), stats or tiles, secondary actions |
| Primary action | In the now card | Pinned to the bottom of the right pane, level with the tab bar |
| Tabs | Full width | Left pane only, so no tab sits on the crease |
| Sheets, search, system prompt, toasts | Full screen | Left pane |
| Directions | A full page | Steps listed on the left, step map and Back · Next on the right |
| Other tabs | One column | List on the left; the map (Locations, Wayfinding) or your current stop (Find my Care, MyChart) on the right |

Pane rules: two panes of 390, each with 16.0 margins, so no text or control comes within 16.0 of the crease. Only colour crosses it – the Blue band, backgrounds, scrims. The verifier checks this in every open state.

## Fold and unfold

| Time | Device | Screen |
|---|---|---|
| 0 ms | The leaf lifts off the hinge (rotateY, 900 ms ease-in-out); the device slides to centre the open shape | Under the leaf, the shared map starts growing from its cover position |
| 450 ms | Leaf on edge; shading peaks; the cover turns away | The leaf's back face carries the inner left pane (your day) |
| 630–900 ms | Leaf flat | Map lands in the right pane; header, details, and the primary action fade in |
| Fold | The same, backwards | The map shrinks into the cover's now card as the leaf closes |
| Reduced motion | No turn | 120 ms fade out, 200 ms fade in |

One rAF loop reads the leaf's real angle each frame and drives the shading, the shared map (a FLIP between its cover and inner rectangles), and the fade, so the screen stays in step with the device, even when a fold is reversed half way. Shared pairs: the current stop's map, the directions step map, the Locations map, and the Wayfinding floor plan; without a pair the right pane cross-fades. Folding keeps the tab, directions (same step), and search; open sheets and the system prompt close. The lock screen lives on the cover; “Lock screen” folds first.

## Tokens (from `designs/guest` and `designs/geo-alt`)

- Color: Blue #004278 (band, stub, primary buttons), cyan #00A9E0 (you, never text), ink #333333, ink-2 #5B6770, bg #F7F8FA, tint #EBF0F5, line #D5DDE5, crease rgba(16,38,60,.10). Dark: bg #0D1620, surface #16222E, ink #E6EDF3, ink-2 #A6B4C0, text Blue #8CC0EA, controls #2D6CA6, crease rgba(0,0,0,.45). Device: bezel #1E2125 (#202429 on the dark board), edge #3A3F45.
- Type: Inter, 12.0–32.0 even sizes only, scaled by the text-size setting (tab labels stay 12.0, like the platform bars).
- Spacing: 4.0, 8.0, 12.0, 16.0, 24.0, 32.0, 40.0, 48.0. Hinge keep-out 16.0 per side.
- Radii: 8.0 (tiles, maps), 12.0 (cards, buttons, pass), pill (chips). Device: 48 outer, 40 cover screen, 38 inner screen.
- Targets: 44.0 minimum, buttons 48.0.
- Motion: 150, 240, 400, 700 ms; fold 900 ms `cubic-bezier(.65,0,.35,1)`; spring for the you ring.

| Component | Tokens |
|---|---|
| Now card (cover) | surface, 1.0 line, r-md, s3 padding · strip: 12.0 dots, 16.0 current, 28.0 cyan ring, 4.0 rail · 40.0 solid stop dot, 18.0/700 title |
| Detail pane (inner) | s4 top, 16.0 sides · 20.0/700 title · map 358 wide · action bar surface, 1.0 top line, 12 / 16 / 24 padding |
| Line (inner) | 40.0 nodes (24.0 when passed) · 4.0 rail · you ring 3.0 cyan |
| Crease | 24 wide gradient plus a 1.0 line, above content, never interactive |
| Hinge handle | 48.0 pill on the bezel colour, at the hinge below the device |

## Real integrations needed

| Shown here | Real system |
|---|---|
| Fold and unfold | Posture and hinge events, state restoration across screens |
| Arriving, entrance, campus | Geofences around campuses, garages, and doors |
| Floor and indoor route | Indoor positioning and a wayfinding SDK with floor plans |
| Today's visits, check-in | Epic MyChart integration; MyCare hands off |
| Floor, suite, entrance | Department directory mapped to buildings |
| Spaces open, rate | Garage occupancy and pricing feed |
| Amenities, support | CMS content per building |
| Lock screen directions | Live Activity (iOS) or an ongoing notification (Android) |

## Build

`python3 build.py` inlines `../../mycare-logo/reversed.svg` and `icon.svg` unchanged, derives the Material Symbols subset from `ICON_MAP` (66 glyphs; re-measured from Google Fonts at 104,072 bytes, about 102 KB woff2), and fails if a static glyph is unmapped or a glyph is mapped twice.

## Verification

Headless Chromium at 1,600 × 1,100 (zoom 1), four configurations – light; dark; dark with large text and reduced motion; light with large text and reduced motion – each run closed and then open: Ask → explainer → system prompt → allowed, all seven journey steps, no signal, approximate and its building choice, the location sheet, picker, ZIP, manual Floor 2, clear choice, pause and resume, every directions step, all tabs, Wayfinding at Simmons, search with and without results, the menu and theme switch, every Quick link, guest away, arriving, inside without and with a destination, and sign-in. Then the lock screen (folding first) and its next step, Open directions, unfolding with directions open, folding with search open, unfolding with a sheet open, and a fold reversed half way. No console or page errors; every visible text node meets 4.5:1 (3:1 large) in both themes; no element spills past its screen or clips its text; no tab label wraps; nothing sits within the crease keep-out; every control is at least 44 × 44. Closed, open, and mid-fold frames reviewed at 1,250 × 890.
