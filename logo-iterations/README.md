# MyCare logo iterations – round 2

Four logo directions for MyCare, UT Southwestern Medical Center's patient app. These are proposals: CMPA (logo@utsouthwestern.edu) has to approve one before anyone uses it. The client rejected round 1 (open-arms, care-chat, heart-path, care-c). Its files are still in git history.

| Folder | Structure | Idea |
|---|---|---|
| `seamless/` | Symbol-led, two tones | A plus in two halves (you and your care team) joined by one soft seam |
| `way-in/` | Monoline, wayfinding | A cross-shaped hospital plan, drawn as one line, with the door open and a cyan dot (you) arriving |
| `care-inside/` | Wordmark-led | The counter of the "a" in MyCare is a medical plus |
| `ask/` | One shape, one color | A plus that speaks: a speech tail grows from the bottom arm |

Each folder contains the following files.

- **Lockups:** `horizontal.svg`, `horizontal-endorsed.svg`, `stacked.svg`, `reversed.svg`, `reversed-stacked.svg`, `one-color-blue.svg`, `one-color-black.svg`, `one-color-white.svg`, `one-color-stacked-blue.svg`, and `symbol.svg`.
- **App icon:** `app-icon.svg` and `app-icon-1024.png` (1024 × 1024, full bleed), `icon-layer-main.svg` and `icon-layer-accent.svg` (transparent layers for Apple Icon Composer and the Android foreground), `icon-monochrome.svg` (Android 13+ themed icon layer, inside the 66 dp safe zone), `play-store-512.png`, and `apple-touch-icon-180.png`.
- **Favicon:** `favicon.svg` and `favicon-32.png`.
- **Guides:** `clearspace.svg` (clear space equals the cap height of "MyCare"; the minimum size is 187 px wide), `process-symbol.svg` (first sketch beside the final symbol), and `process-type.svg` (the four weights tested).
- **Previews:** `in-use.png` (home screen, launch screen, app header, and browser tab) and `preview.png` (contact sheet at real sizes).

All logo SVGs use outlined Inter Display type, contain no `<text>` and no external references, and are under 40 KB.

To rebuild every file, run `python3 logo-iterations/build.py`. It needs `pip install fonttools uharfbuzz shapely svgpathtools`, and the geometry helpers are in `geo.py`. To render a mockup, run `python3 logo-iterations/mockup.py logo-iterations/<folder> out.png`. To render PNGs, use `handoff/logo-iterations/tools/render.js`.

Note for CMPA: the brand deck gives PMS 2945 as #004278, but the public brand site lists #004c97. Confirm the screen value before final art.
