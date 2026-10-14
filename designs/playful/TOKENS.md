# UTSW MyCare home – interactive direction: token spec

Prototype: `mycare-playful-home.html`, built from `src.html` by `build.py` (phone frame 390 × 844 pt, also checked at 360 pt). All sample data is fictional.

Direction: calm and Blue-led. Neutral surfaces, one card style, one cyan accent, one icon color. The energy comes from motion and gestures rather than color: a swipeable appointment stack, articles that grow out of their cards, detail pages that slide in (drag from the left edge to go back), a sliding tab indicator, and springy press feedback.

## Type scale (Inter; Inter Display optical size from 20.0 up)

| Size | Weight | Line height | Used for |
|---|---|---|---|
| 32.0 | 700 | 1.15 | Greeting headline |
| 28.0 | 700 | 1.2 | Tab page, article, and detail page titles |
| 24.0 | 700 | 1.2 | Appointment date, campaign headline, sheet titles |
| 20.0 | 700 | 1.3 | Section headings |
| 18.0 | 600–700 | 1.3 | Featured titles, appointment time, date numbers |
| 16.0 | 400–600 | 1.5 | Body (minimum), buttons, list titles, search |
| 14.0 | 400–600 | 1.5 | Meta, chips, tile labels, captions |
| 12.0 | 600–700 | 1.4 | Eyebrows, tab labels, source line, badges only |

All sizes scale with the system text setting except tab labels and tab icons (use the platform's large-content viewer). Times, abbreviated dates, and "UT Southwestern" never break across lines.

## Spacing (4-pt scale)

| Token | Value | Used for |
|---|---|---|
| s1 | 4.0 | Icon-to-text nudges, tab bar inset |
| s2 | 8.0 | Tile and chip gaps, action gaps |
| s3 | 12.0 | Icon-to-label gaps, list row padding, card gaps |
| s4 | 16.0 | Screen gutter, card padding |
| s6 | 24.0 | Banner and page padding |
| s8 | 32.0 | Gap between modules |
| s10 | 40.0 | Reserved for large section breaks |
| s12 | 48.0 | Status bar inset, page bottom padding |

Touch targets: 44.0 minimum, 48.0 for primary buttons and actions; at least 8.0 between targets.

## Color – one brand color, one accent

| Role | Value | Pairing (contrast) |
|---|---|---|
| UT Southwestern Blue | #004278 | Headings, icons, buttons, selected states; white on Blue 10.24:1, Blue on white 10.24:1 |
| Gray (body) | #333333 | Body and list titles; 11.89:1 on #F7F8FA |
| Secondary text | #5B6770 | Meta and chevrons; 5.46:1 on #F7F8FA, 5.06:1 on #EBF0F5 |
| Tint | #EBF0F5 (pressed #D1DDE6) | Icon circles, chips, tonal buttons, tab indicator; Blue on tint 8.93:1 |
| Surfaces and lines | #F7F8FA, #FFFFFF, #D5DDE5, #808B96 | Background, cards, hairlines; the search field outline #808B96 is 3.27:1 |
| PMS 2995 cyan | #00A9E0 | The one accent, shapes only: brand dot, success check (3.78:1 on Blue) |
| On Blue | #D6E4F0, #A9C7E0 | Secondary text on Blue, 7.91:1 and 5.82:1 |
| Alert | #B0003A | Emergency alerts only; white 7.22:1; always with an icon and the word "Alert" |
| Other brights | PMS 158, 361, 2587, 1925 | Kept out of the app UI; reserved for future charts and campaign art |

## Radii

| Token | Value | Used for |
|---|---|---|
| r-sm | 8.0 | Small controls |
| r-md | 12.0 | Action buttons, date boxes |
| r-lg | 16.0 | Every card: appointments, tiles, featured, lists, alert banner, toast |
| r-xl | 24.0 | Campaign banner, tab bar, sheets |
| r-pill | 999 | Buttons, chips, search field |

## Iconography

One family: **Material Symbols Rounded** (variable font, Apache 2.0), every glyph in UT Southwestern Blue. The app uses 47 glyphs, shipped as one 70 KB woff2 subset. The full system (keylines, states, treatments, color pairs, do-not-use list, and the glyph map) is in the prototype's Iconography section.

| Token | Value | Used for |
|---|---|---|
| icon-16 | 16.0, opsz 20 | With 12.0 text (source line) |
| icon-20 | 20.0, opsz 20 | With 14.0–16.0 text: buttons, actions, rows |
| icon-24 | 24.0, opsz 24 | Standalone controls, tab bar, app bar, tiles |
| icon-32 | 32.0, opsz 32 | Inside 56.0 circles only (sign-in prompts) |
| circle | 40.0, 48.0, 56.0, tint #EBF0F5 | Destinations; Blue with a white glyph when pressed |
| wght | 500 | Every size |
| GRAD | 0; −25 on Blue | White glyphs on Blue and alert red |
| FILL | 0 at rest; 1 when selected, pressed, or confirmed | Animates in 240 ms ease-out; instant with reduced motion |

Rules:

- **Three treatments.** Plain glyphs for controls and clinical details; a tinted circle (echoing the symbol's dot) for destinations only; Alert (filled warning in a white disc) for emergency alerts only, always with the word "Alert."
- **One color.** No per-icon colors – they read as decoration, compete with the alert red, and make a medical app feel like a toy.
- **One concept, one glyph.** Screens and the CMS reference concept keys (`findCare`, `addCal`), never glyph names; CMS tiles pick from the approved concept list.
- **Accessibility.** Glyphs beside text are `aria-hidden`; icon-only buttons have names; targets stay 44.0+; icons scale with text; until the font loads, glyphs stay invisible instead of showing ligature names.
- **Avoid.** Crosses as medical shorthand (a red cross on white is a protected emblem), asterisk or Star of Life shapes, needles outside vaccine content, decorative heartbeat lines, emoji, a second icon family, outline and filled mixed at rest, and sizes off the ramp.
- **Native handoff.** Load the same variable font on iOS and Android, or export vectors at FILL 0 and 1 named `ic_<concept>_outline` and `ic_<concept>_filled`.

## Motion

| Token | Value | Used for |
|---|---|---|
| d-fast | 150 ms, ease-out | Color changes, fades, pressed fills |
| d-base | 240 ms, ease-out `cubic-bezier(.2,.8,.2,1)` | Alert reveal, tab screen change, icon fill, article text |
| d-slow | 400 ms, ease-in-out `cubic-bezier(.65,0,.35,1)` | Width change, search expand |
| spring-snappy | stiffness 700, damping 36, mass 1; 360 ms; 5% overshoot | Press release, card stack, tab indicator, module entrance, toast |
| spring-gentle | stiffness 400, damping 40, mass 1; 400 ms; no overshoot | Article expand, page push, sheets, search expand, pull-to-refresh settle |
| Press | scale 0.96 in 80 ms, release on spring-snappy | Tiles, buttons, chips, cards |
| Stagger | 40 ms per module, 30 ms per chip or row | Entrances |

Springs ship as CSS `linear()` curves sampled from the spring equation (24 steps). Reduced motion replaces every transform with a 240 ms cross-fade (no bounce, scale, parallax, or looping motion), and icon fills change instantly. The emergency alert only fades or reveals in height.
