# UTSW MyCare home – playful direction: token spec

Prototype: `mycare-playful-home.html` (phone frame 390 × 844 pt, also checked at 360 pt). All sample data is fictional.

## Type scale (Inter; Inter Display optical size from 20.0 up)

| Size | Weight | Line height | Used for |
|---|---|---|---|
| 32.0 | 800 | 1.15 | Greeting headline |
| 28.0 | 800 | 1.15–1.2 | Campaign headline, tab page titles |
| 24.0 | 800 | 1.2 | Appointment date, featured titles, sign-in prompt, sheet titles, big tile |
| 20.0 | 700 | 1.3 | Module headings |
| 18.0 | 600–700 | 1.25 | Tile labels, appointment time, date badges |
| 16.0 | 400–700 | 1.5 | Body (minimum), buttons, list titles, search |
| 14.0 | 500–800 | 1.5 | Meta, chips, alert kicker, captions |
| 12.0 | 600–700 | 1.4 | Tab labels, source tag, badges only |

All sizes scale with the system text setting except tab labels and tab icons (use the platform's large-content viewer).

## Spacing (4-pt scale)

| Token | Value | Used for |
|---|---|---|
| s1 | 4.0 | Icon-to-text nudges, chip padding |
| s2 | 8.0 | Gaps between chips, actions, list rows |
| s3 | 12.0 | Tile gaps, icon-to-label gaps |
| s4 | 16.0 | Screen gutter, card padding |
| s6 | 24.0 | Gap between modules, hero padding |
| s8 | 32.0 | Sheet bottom padding |
| s10 | 40.0 | Reserved for large section breaks |
| s12 | 48.0 | Status bar inset |

Touch targets: 44.0 minimum, 48.0 for primary buttons and action buttons; at least 8.0 between targets.

## Color

| Role | Value | Pairing (contrast) |
|---|---|---|
| UT Southwestern Blue | #004278 | White text 10.2:1; anchor, headings, primary buttons, active tab |
| Gray (body) | #333333 | On #F7F8FA 11.8:1 |
| Secondary text | #5B6770 | On #F7F8FA 5.46:1, on #EBF0F5 5.06:1 |
| Alert | #B0003A | White text 7.22:1; always with icon and the word "Alert" |
| PMS 2587 purple | #8246AF | White text 6.1:1; campaign, featured |
| PMS 1925 magenta | #E0004D | White icon 4.91:1; badges, tile dots |
| PMS 2995 cyan | #00A9E0 | Shapes only; blue icon on cyan 3.78:1 |
| PMS 158 orange | #E87722 | Shapes only; blue icon 3.46:1 |
| PMS 361 green | #43B02A | Shapes only; blue icon 3.65:1 |
| Tints at 20% | #CCEEF9, #FAE4D3, #D9EFD4, #E6DAEF, #F9CCDB | Blue text 7.2–8.4:1; tiles, chips, icons |
| Surfaces | #F7F8FA, #FFFFFF, #EBF0F5, #D1DDE6 | Background, cards, hero, source tag |

## Radii

| Token | Value | Used for |
|---|---|---|
| r-sm | 8.0 | Small controls |
| r-md | 16.0 | Alert banner, action buttons, list rows |
| r-lg | 24.0 | Tiles, appointment card, services |
| r-xl | 32.0 | Hero, featured, campaign, tab bar, sheets |
| r-pill | 999 | Buttons, chips, search field |

## Iconography

One family: **Material Symbols Rounded** (variable font, Apache 2.0). Rounded ends echo the round-capped U in the MyCare symbol; four variable axes let states animate without swapping files. The app uses 44 glyphs, shipped as one 66 KB woff2 subset. The full system (keylines, states, treatments, color pairs, do-not-use list, and the glyph map) is in the prototype's Iconography section.

| Token | Value | Used for |
|---|---|---|
| icon-16 | 16.0, opsz 20 | With 12.0 text (source tag) |
| icon-20 | 20.0, opsz 20 | With 14.0–16.0 text: buttons, actions, rows |
| icon-24 | 24.0, opsz 24 | Standalone controls, tab bar, app bar, tiles |
| icon-32 | 32.0, opsz 32 | Inside 56.0 dots only |
| dot | 40.0, 48.0, 56.0 circles | Destinations: tiles, services, results, menu rows |
| wght | 500 | Every size |
| GRAD | 0; −25 on dark fills | White glyphs on Blue, purple, magenta, alert |
| FILL | 0 at rest; 1 when selected, pressed, or confirmed | Animates in 240 ms ease-out; instant with reduced motion |

Rules:

- **Three treatments.** Plain glyphs for controls and clinical details; Dot (a circle, echoing the symbol's dot) for destinations only; Alert (filled warning in a white disc) for emergency alerts only, always with the word "Alert."
- **One concept, one glyph.** Screens and the CMS reference concept keys (`findCare`, `addCal`), never glyph names; CMS tiles pick from the approved concept list.
- **Contrast.** Glyphs that carry meaning keep 3:1 against their dot: 20% tint + Blue 7.2–8.4:1, cyan + Blue 3.78:1, green + Blue 3.65:1, orange + Blue 3.46:1, purple + white 6.1:1, magenta + white 4.91:1, white + alert red 7.22:1. No cyan, orange, or green glyphs on white.
- **Accessibility.** Glyphs beside text are `aria-hidden`; icon-only buttons have names; targets stay 44.0+; icons scale with text (tab bar icons and labels stay fixed); until the font loads, glyphs stay invisible instead of showing ligature names.
- **Avoid.** Crosses as medical shorthand (a red cross on white is a protected emblem), asterisk or Star of Life shapes, needles outside vaccine content, decorative heartbeat lines, emoji, a second icon family, outline and filled mixed at rest, and sizes off the ramp.
- **Native handoff.** Load the same variable font on iOS and Android, or export vectors at FILL 0 and 1 named `ic_<concept>_outline` and `ic_<concept>_filled`.

## Motion

| Token | Value | Used for |
|---|---|---|
| d-fast | 150 ms, ease-out | Color changes, fades |
| d-base | 240 ms, ease-out `cubic-bezier(.2,.8,.2,1)` | Alert reveal, tab screen change, backdrop, icon fill |
| d-slow | 400 ms, ease-in-out `cubic-bezier(.65,0,.35,1)` | Width change, search expand |
| spring-snappy | stiffness 700, damping 36, mass 1; 360 ms; 5% overshoot | Press release, card stack, module entrance, toast |
| spring-bouncy | stiffness 560, damping 22, mass 1; 480 ms; 19% overshoot | Chip pop, tile icon hop, tab pill, carousel dots |
| spring-gentle | stiffness 400, damping 40, mass 1; 400 ms; no overshoot | Search expand, sheets, pull-to-refresh settle |
| Press | scale 0.95 in 80 ms, release on spring-snappy | Tiles, buttons, chips, rows |
| Stagger | 50 ms per module, 40 ms per chip | Entrances |

Springs ship as CSS `linear()` curves sampled from the spring equation (24 steps). Reduced motion replaces every transform with a 240 ms cross-fade (no bounce, scale, parallax, or looping motion). The emergency alert only fades or reveals in height.
