# UTSW MyCare home screen – token spec

Prototype: `home-screen.html` (built from `home-screen.src.html` by `python3 build.py`, which inlines the logo SVGs from `../mycare-logo/` unchanged).

## Type scale (Inter; Inter Display optical size at 20.0+)
| Token | Size / line | Weight | Use |
|---|---|---|---|
| type-32 | 32.0 / 40.0 | 800 | Tab screen titles |
| type-28 | 28.0 / 36.0 | 700 | Home greeting |
| type-24 | 24.0 / 32.0 | 700–800 | Campaign headline, date tile day |
| type-20 | 20.0 / 28.0 | 700 | Sheet titles, sign-in card |
| type-18 | 18.0 / 24.0 | 700 | Section headings, card titles |
| type-16 | 16.0 / 24.0 | 400–600 | Body, buttons, list and alert titles (minimum body) |
| type-14 | 14.0 / 20.0 | 400–600 | Secondary lines, tile labels, chips |
| type-12 | 12.0 / 16.0 | 600–700 | Eyebrows, tab labels, badges (uppercase +0.06em) |

Large text remaps up the same scale: 12→14, 14→18, 16→20, 18→24, 20→24, 24→28, 28→32.

## Spacing (4-pt base)
4.0 icon–label · 8.0 between controls (minimum target spacing) · 12.0 grid gaps, inside cards · 16.0 screen gutter, card padding · 24.0 between modules, sheet sides · 32.0 status bar inset · 40.0 sheet bottom · 48.0 end of scroll, carousel peek

## Color
| Token | Hex | Role · contrast |
|---|---|---|
| blue | #004278 | App bar, headings, primary buttons, focus ring · 10.2:1 on white |
| text | #333333 | Body · 12.6:1 on white |
| text-2 | #5B6770 | Secondary · 5.5:1 on #F7F8FA, 5.1:1 on #EBF0F5 |
| on-blue-2 | #D6E4F0 | Secondary text on blue · 7.9:1 |
| cyan | #00A9E0 | Shapes and search focus glow only (never text) |
| red / red-bg | #B0003A / #FBEFF2 | Emergency label · 6.4:1 |
| magenta | #E0004D | Emergency icon disc, stripe, badges (white glyph 4.9:1) |
| orange / orange-bg | #E87722 / #FDF1E9 | Advisory icon disc and stripe (gray glyph 4.3:1) |
| green, purple | #43B02A, #8246AF | Illustration only |
| bg / surface / tint | #F7F8FA / #FFFFFF / #EBF0F5 | Screen, cards, icon wells |
| wash | #66CBEC | PMS 2995 at 60%: duotone fill inside icon wells only |
| border / border-strong | #D5DDE5 / #7A8690 | Card outlines; control outlines (3.7:1) |

## Radii
8.0 40-pt icon wells, focus ring, skeletons · 12.0 48-pt icon wells, buttons, action wells, date tile · 16.0 cards, alerts, tiles · 24.0 sheets, hero base · full: search, chips, pills

## Iconography
One family for every icon: **Material Symbols Rounded** (Apache 2.0). SVGs and the variant table are in `icons/`.

| Size | Drawing | Weight | Used for |
|---|---|---|---|
| 24.0 | opsz 24 | 400 | Tabs, app bar, tiles, list rows, icon-only buttons |
| 20.0 | opsz 20 | 400 | Inside buttons, sheet details, notices, row chevrons |
| 16.0 | opsz 20 | 500 | Beside 12.0 text only (source label, chips, location line) |

- Large text: icons beside text step up (16.0 → 20.0, 20.0 → 24.0); navigation icons stay 24.0.
- Wells: rounded squares cut to the MyCare tile's corner (about 22%): 48 × 48 radius 12.0 (tiles, empty states), 40 × 40 radius 8.0 (list rows). Circles are for people (initials).
- Duotone, wells only: outline in Blue #004278 over the filled shape in PMS 2995 at 60% (#66CBEC). The icon must read without the cyan.
- Filled means state: selected tab, finished action (Added), alert severity. Play and pause are always filled. Everything else is outline.
- White icons on Blue use grade −25. Inactive tabs and chevrons are #5B6770.
- Severity by shape: emergency is a filled triangle in magenta #E0004D (4.4:1 on #FBEFF2); advisory is a filled circle in #333333.
- Badges: magenta, white numerals (4.9:1), on the icon's top-right corner; the count is in the spoken name.
- One meaning, one symbol: a shortcut and its destination share a symbol (Find a doctor and Find care are both `stethoscope`).
- A trailing `open_in_new` means the action leaves UTSW MyCare. A trailing chevron opens a screen in the app; a down chevron expands in place.
- Every icon has a visible label except back, close, search, notifications, refresh, and carousel controls, which have spoken names. Icons are hidden from screen readers.

## Motion
| Token | Value | Use |
|---|---|---|
| duration-fast | 150 ms | Press scale 0.97–0.98, hover |
| duration-base | 200 ms | Alert expand, tab switch and icon fill, toast, dots |
| duration-slow | 300 ms | Sheets, search overlay, module entrance (50 ms stagger) |
| ease-out | cubic-bezier(0.2, 0, 0, 1) | Entering |
| ease-standard | cubic-bezier(0.4, 0, 0.2, 1) | In-place state changes |
| carousel-dwell | 6 s | Auto-advance; pauses on touch/hover/focus; pause control; off with reduced motion |

Reduced motion (OS or prototype toggle): entrance, slide, shimmer, and auto-advance off; state changes instant.
