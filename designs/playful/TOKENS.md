# UTSW MyCare home – interactive direction: token spec

Prototype: `mycare-playful-home.html`, built from `src.html` by `build.py` (phone frame 390 × 844 pt, also checked at 360 pt). All sample data is fictional.

Direction: a Blue hero (reversed logo, notification bell with an inset count, initials avatar, greeting with an “Updated” refresh chip, and search) sits at the top, and content rides up on a light sheet. Search is part of the fixed header, so it always sits above appointments. Appointments get a date strip and a rich card: a Blue header with time and countdown, a map preview with directions, a prep note or checklist, and round actions. Depth comes from the Blue family and one warm sand campaign card; energy comes from motion and gestures.

## Type scale (Inter; Inter Display optical size from 20.0 up)

| Size | Weight | Line height | Used for |
|---|---|---|---|
| 32.0 | 700 | 1.15 | Greeting headline |
| 28.0 | 700 | 1.15–1.2 | Appointment time; tab page, article, and detail page titles |
| 24.0 | 700 | 1.2 | Campaign headline, sheet titles |
| 20.0 | 700 | 1.1–1.3 | Section headings, date strip day numbers |
| 18.0 | 600–700 | 1.3 | Featured titles, announcement dates |
| 16.0 | 400–600 | 1.5 | Body (minimum), buttons, list titles, search, appointment date |
| 14.0 | 400–600 | 1.5 | Meta, chips, tile labels, captions |
| 12.0 | 600–700 | 1.3–1.4 | Eyebrows, tab and action labels, date strip months, source line, badges |

All sizes scale with the system text setting except tab labels and tab icons (use the platform's large-content viewer). Times, abbreviated dates, and "UT Southwestern" never break across lines.

## Spacing (4-pt scale)

| Token | Value | Used for |
|---|---|---|
| s1 | 4.0 | Icon-to-text nudges, pill padding |
| s2 | 8.0 | Tile, chip, and date-strip gaps; map overlay inset |
| s3 | 12.0 | Icon-to-label gaps, list row padding, card footers |
| s4 | 16.0 | Screen gutter, card padding, card sections |
| s6 | 24.0 | Hero rhythm, content sheet overlap and top padding, banners |
| s8 | 32.0 | Gap between content modules |
| s10 | 40.0 | Reserved for large section breaks |
| s12 | 48.0 | Status bar inset, hero bottom padding |

Touch targets: 44.0 minimum, 48.0 for primary buttons and actions; at least 8.0 between targets.

## Color – a Blue family, one accent, one warm moment

| Role | Value | Pairing (contrast) |
|---|---|---|
| UT Southwestern Blue | #004278 | Hero, app bar, appointment header, icons, buttons; white on Blue 10.24:1 |
| Blue 80%, PMS 542 | #336893, #7BAFD4 | Featured artwork only – shapes, never text |
| On Blue | #D6E4F0, #A9C7E0 | Secondary text on Blue, 7.91:1 and 5.82:1 |
| Gray (body) | #333333 | Body and list titles; 11.89:1 on #F7F8FA |
| Secondary text | #5B6770 | Meta and chevrons; 5.46:1 on #F7F8FA, 5.06:1 on #EBF0F5 |
| Tint | #EBF0F5 (pressed #D1DDE6) | List circles, chips, action circles, tab indicator; Blue on tint 8.93:1 |
| Surfaces and lines | #F7F8FA, #FFFFFF, #D5DDE5, #808B96 | Content sheet, cards, hairlines; the search field outline #808B96 is 3.27:1 |
| PMS 2995 cyan | #00A9E0 | The one accent, shapes only: brand dot, hero glow, countdown icon, unread dots (3.78:1 on Blue) |
| PMS 4545 at 60% | #E6E0C5, #D5CB9F | Campaign card only – Blue badge, Blue headline, facts on a 60% white panel; Blue 7.72:1, Gray 9.53:1 |
| Alert | #B0003A | Emergency alerts only; white 7.22:1; always with an icon and the word "Alert" |

## Radii

| Token | Value | Used for |
|---|---|---|
| r-sm | 8.0 | Small controls |
| r-md | 12.0 | Map preview, prep panels, date boxes |
| r-lg | 16.0 | Every card: appointment, date strip, tiles, featured, lists, alert, toast |
| r-xl | 24.0 | Content sheet top, campaign card, tab bar, sheets |
| r-pill | 999 | Buttons, chips, pills, search field |

## Iconography

One family: **Material Symbols Rounded** (variable font, Apache 2.0), every glyph in UT Southwestern Blue or white on Blue. The app uses 52 glyphs, shipped as one 74 KB woff2 subset. The full system (keylines, states, treatments, color pairs, do-not-use list, and the glyph map) is in the prototype's Iconography section.

| Token | Value | Used for |
|---|---|---|
| icon-16 | 16.0, opsz 20 | With 12.0 text (pills, source line, map labels) |
| icon-20 | 20.0, opsz 20 | With 14.0–16.0 text: buttons, rows, appointment details |
| icon-24 | 24.0, opsz 24 | Standalone controls, tab bar, app bar, tiles, actions |
| icon-32 | 32.0, opsz 32 | Inside 56.0 circles only (sign-in prompts, campaign badge) |
| circle | 40.0, 48.0, 56.0 | Blue in quick access; tint in lists and actions, Blue when pressed or done |
| wght | 500 | Every size |
| GRAD | 0; −25 on Blue | White glyphs on Blue and alert red |
| FILL | 0 at rest; 1 when selected, pressed, or confirmed | Animates in 240 ms ease-out; instant with reduced motion |

Rules:

- **Three treatments.** Plain glyphs for controls and clinical details; circles for destinations and actions; Alert (filled warning in a white disc) for emergency alerts only, always with the word "Alert."
- **One color.** No per-icon colors – they read as decoration, compete with the alert red, and make a medical app feel like a toy.
- **One concept, one glyph.** Screens and the CMS reference concept keys (`findCare`, `addCal`), never glyph names; CMS tiles pick from the approved concept list.
- **Accessibility.** Glyphs beside text are `aria-hidden`; icon-only buttons have names; targets stay 44.0+; icons scale with text; until the font loads, glyphs stay invisible instead of showing ligature names.
- **Avoid.** Crosses as medical shorthand (a red cross on white is a protected emblem), asterisk or Star of Life shapes, needles outside vaccine content, decorative heartbeat lines, emoji, a second icon family, outline and filled mixed at rest, and sizes off the ramp.
- **Native handoff.** Load the same variable font on iOS and Android, or export vectors at FILL 0 and 1 named `ic_<concept>_outline` and `ic_<concept>_filled`.

## Motion

| Token | Value | Used for |
|---|---|---|
| d-fast | 150 ms, ease-out | Color changes, fades, pressed fills |
| d-base | 240 ms, ease-out `cubic-bezier(.2,.8,.2,1)` | Alert reveal, date pill selection, icon fill, article text |
| d-slow | 400 ms, ease-in-out `cubic-bezier(.65,0,.35,1)` | Width change, search expand |
| spring-snappy | stiffness 700, damping 36, mass 1; 360 ms; 5% overshoot | Appointment card swap and height, press release, tab indicator, entrances, toast |
| spring-gentle | stiffness 400, damping 40, mass 1; 400 ms; no overshoot | Article expand, page push, sheets, search expand, pull-to-refresh settle |
| Press | scale 0.96 in 80 ms, release on spring-snappy | Tiles, buttons, chips, cards |
| Stagger | 40 ms per module, 30 ms per chip or row | Entrances |

Springs ship as CSS `linear()` curves sampled from the spring equation (24 steps). Reduced motion replaces every transform with a 240 ms cross-fade (no bounce, scale, parallax, or looping motion), and icon fills change instantly. The emergency alert only fades or reveals in height.
