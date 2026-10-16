# MyCare logo iterations – brief

## The task

Create **four different logo iterations for MyCare**, UT Southwestern Medical Center's patient app, and present them in a **Claude Slides deck** that follows the structure and look of `reference-slides.pdf`.

The reference deck shows one earlier proposal in five slides:
1. **Why the current logo needs a refresh** – the current logo plus the problems with it.
2. **A modern [name]** – the hero lockup in a white card, then "The idea" and "What changed".
3. **How we made the logo** – four steps (Audit, Type, Symbol, System), each with a picture.
4. **One system for every surface** – stacked, reversed (on UT Southwestern Blue), one-color, app icon and favicon at 160/64/32 px.
5. **Specifications and next steps** – clear-space diagram, specs table (colors, type, icon), and a "Next step: CMPA review" box.

Reuse that slide design: light background `#F7F8FA`, a short cyan `#00A9E0` bar above an uppercase gray `#5B6770` eyebrow, a heavy UT Southwestern Blue `#004278` heading (Inter, 72 px, weight 800), white cards with a `#D5DDE5` border, body text `#333333`, and a footer row. The full brand deck those slides came from is https://claude.ai/artifact/F6kTZbgBk3sHEGxLFfftZL (read it with the Artifact tool for the exact slide markup and brand rules).

Suggested deck outline (about 22 slides):
- Cover
- Why the current logo needs a refresh (current logo + problems)
- MyCare in the app family today (the App Store screenshot, what it teaches)
- Research: what modern patient-app and healthcare logos do (keep it short and factual)
- For each of the four iterations: **A modern MyCare – [iteration name]**, **How we made it**, **One system for every surface**, **Specifications** (4 slides each = 16)
- Side-by-side comparison of all four (hero lockup + app icon at 64 px and 32 px on a phone home screen row)
- Recommendation and next steps (CMPA review)

## What the user asked for – hard rules

1. **The product is MyCare – do not base the logo on "UTSW".** No U-shaped symbols, no UTSW monogram, no "UTSW" as the hero word. (The earlier proposal in `reference-slides.pdf` used a "U" tile – that direction is rejected.) The word "MyCare" leads. An optional, small endorsement such as "UT Southwestern" may appear in secondary lockups, in plain Inter, never styled like the master logo.
2. **It must look like a healthcare logo** – trustworthy, caring, clinical-grade, instantly read as a health app on a phone.
3. **It goes with the brand guidelines but must not look like the main UT Southwestern logo.** Use the brand palette and type spirit; do not copy the master logo's Helvetica Neue Heavy/Roman pairing, its blue-plus-gray two-word structure, or its right-aligned stacked descriptor.
4. **Four genuinely different iterations** – different ideas, not color swaps. Each one is a full system: horizontal lockup, stacked lockup, reversed, one-color (blue and black), app icon (1024 × 1024, full bleed) and favicon.
5. Deliver in slides. Research is welcome.

## What "they have today" (see `app-store-today.webp` and `current-logo.png`)

UT Southwestern's App Store listing shows a mixed app family: PA Scutpuppy and UTSW Scutpuppy (cartoon dog), UTSWRefer (white tile, blue "UTSW / Refer" text), UTSW Evexia (white ξ on blue), **UTSWMyCare (blue tile with white "UTSW / MyCare" text)**, Between High School & … (white lion on slate blue), UTSW CDRC mHealth (colorful brain on white), Diuretic Tuner (yellow-red pill on blue). Takeaways: the current MyCare icon is all text and hard to read at icon size; several family icons are blue tiles, so MyCare needs a distinct symbol to stand out while still feeling like UT Southwestern.

## Direction ideas (pick four distinct ones, or better ones from research)

Avoid clichés: stethoscopes, EKG heartbeat lines, caduceus or rod of Asclepius, generic red crosses, literal hearts with pulses, cartoon mascots, stock icons.
- **Care cross** – a soft, modern medical plus/cross built from rounded or interlocking forms (care, connection, access), possibly with a "my" person element.
- **The person at the center** – an abstract person or two shapes embracing a central dot (patient + care team), geometric and friendly.
- **Path / access** – a mark built from a route or doorway (finding care, appointments, wayfinding), forming an "M" or a plus.
- **Conversation + care** – a speech-bubble or portal form merged with a plus or heart (messaging your care team), clearly medical.
- **Wordmark-led** – a distinctive custom "MyCare" wordmark with one ownable detail (e.g. a plus inside the "a" or as the dot of a custom letter), paired with a simple monogram icon.
Each iteration needs a one-sentence idea, like the reference slide's "The idea".

## Brand guidelines (UT Southwestern)

**Colors**
- UT Southwestern Blue `#004278` (PMS 2945) – primary; the anchor for every iteration.
- Gray `#333333` (80% black, PMS 431).
- PMS 2995 cyan `#00A9E0` – accent for shapes only (2.5:1 on white – never for small text).
- Brights (approx. screen values): PMS 158 `#E87722`, PMS 1925 `#E0004D`, PMS 361 `#43B02A`, PMS 2587 `#8246AF`. Muted: PMS 542 `#7BAFD4`, 7407 `#CBA052`, 7524 `#A45A52`, 5763 `#777C4F`, 437 `#7B6469`. Neutrals: 642 `#D1DDE6`, 4545 `#D5CB9F`, 482 `#DBC8B6`, 5807 `#D0D1B0`, 400 `#C4BFB6`. Tints at 90/80/70/60%.
- One accent at most per iteration beyond blue; every mark must also work in one color (all blue, all black, all white).
- Reversed versions sit on UT Southwestern Blue or 75% black and darker.

**Type** – Inter and Inter Display (installed at `/usr/share/fonts/opentype/inter/`, Thin–Black with italics), all outlined to paths in the final SVGs. Avoid serif faces. Do not use Helvetica/FreeSans for these (too close to the master logo).

**Craft and accessibility**
- Text in the lockup ≥ 4.5:1 contrast on its background.
- Horizontal lockup legible at 187 px wide; app icon recognizable at 32 px.
- Clear-space rule and minimum size defined for each iteration.
- Final SVGs: outlined type, no `<text>`, no external references, under 40 KB.

**Editorial style for slide copy** – sentence-case headings, no periods in headings, en dash with spaces ( – ), serial comma, no "&" for "and", "UT Southwestern" never split across lines, "email", "website", "healthcare".

**Governance** – every slide set is a proposal; final adoption needs CMPA approval (logo@utsouthwestern.edu).

## Tools (in `tools/`)

- `tools/textpath.py` – HarfBuzz-shaped text → outlined SVG path data. Needs `pip install fonttools uharfbuzz`. In Python: `sys.path.insert(0, "handoff/logo-iterations/tools"); from textpath import text_path, font_metrics, FONTS`; `text_path(text, font, size, tracking=0, x=0, y=0, features=None) -> (path_d, width)` with y as the baseline; font names like `"Inter Display ExtraBold"`, `"Inter Medium"`; Inter features such as `cv11` (single-storey a).
- `tools/render.js` – `node handoff/logo-iterations/tools/render.js in.svg out.png --width 1200 --bg "#FFFFFF" --pad 40` renders SVG to PNG with Playwright Chromium (Playwright lives at `/opt/node-tools/node_modules/playwright`; Chromium at `/opt/pw-browsers`). Look at every render with the Read tool before using it.
- Upload final SVGs to the deck as assets and show them with `<img>` – never rebuild a logo with live text on a slide.

Save the final logo files in `logo-iterations/<iteration-name>/` in the repo and commit them.
