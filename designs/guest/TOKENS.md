# UTSW MyCare guest flow – token spec and flow map

Prototype: `mycare-guest.html`, built from `src.html` by `build.py` (phone frame 390 × 844 pt, also checked at 360 pt and with large text). All people, places, and alerts are fictional sample data.

Scope: the guest experience only – the guest home and the Find my Care / provider flow. The signed-in experience is the next round.

Direction: inherited from `designs/playful/` without changes to its scales. The Blue hero keeps the global search as the hero feature (field, top searches, full-screen overlay). Provider search is the **Providers scope** of that same overlay, which adds a location chip, Filters, and Sort. Every base token (color, type, spacing, radii, motion, icons) is defined in `designs/playful/TOKENS.md`; this file lists only what the guest flow adds.

## Navigation

Guest tabs: **Home · Find my Care · Locations · Wayfinding · MyChart**.

- The old app's five tabs (Home, MyChart, Providers, Locations, Wayfinding), kept so returning users find things where they expect them. Visits and Messages (signed-in tabs in the playful direction) mean nothing to a guest.
- **Find my Care** replaces "Providers": people arrive with a problem, not a name, and the tab can grow to services without a rename.
- **Locations** and **Wayfinding** stay separate: "which place" versus "how do I get there and around inside."
- **MyChart** is sign-in only, plus Pay as a guest and a link to More. After sign-in it becomes the account tab, so the tab count never changes.
- **Menu (hamburger)** stays on the home app bar, as in the old app, and opens the **More** drawer: Inbox, Saved providers, Campus shuttle; About UT Southwestern (Why UT Southwestern, Patient resource guide, Patient resources, Physician resources, COVID-19 resources, Visit the full website); Settings and help (Language, Help and contact us, Privacy policy); Follow us. Menu items come from the CMS, so admins can retire one (COVID-19) without a release. A cyan dot on the menu button means unread Inbox items.
- Tab bar inset drops from 12.0 to 8.0 per side so "Wayfinding" fits at 360.

## Flow map

1. **Enter** – home search (All scope) and top searches; Find my Care tile and Find my Care tab (Providers scope); near-me arrow; specialty list and search history.
2. **Search** – suggestions as you type (specialties, conditions, names); plain language and synonyms ("skin doc" → Dermatology); typo fixes ("dermatolgy"); "near Frisco" sets location; "Spanish-speaking" adds a language filter; recent (device) and popular searches.
3. **Refine** – location (near me, ZIP or city; ask, denied, and no-fix fallbacks); Filters (eight attributes); Sort (best match, distance, last name A–Z, featured first).
4. **Results** – cards to profile; loading skeleton, error, offline, no results with alternatives, each with retry.
5. **Profile** – identity and credentials, bio, specialties and conditions, languages, locations with directions and phone, education, research and media, related providers.
6. **Act** – schedule online or call; save (device) with Undo; share the public link through the native share sheet.

Also in the guest flow: **MedBlog → See all** opens the MedBlog list (topic chips, 96.0 thumbnails, titles, dates, Show more; each row opens the article), and **Menu → Inbox** lists app notifications (active alert, announcements) with unread dots and Mark all as read. Care team messages stay in MyChart.

Signed-in destinations (message your doctor, test results, manage visits, manage billing) open a sign-in prompt for that task, never a dead end, with "Find a provider" for people who aren't patients yet.

## Rules

- **Filters**: multi-select; any match within a group (OR), all groups must match (AND). Live count on "Show N providers"; changes apply on that button, closing discards the draft. Clear all in the sheet; each active filter is a removable chip under the toolbar.
- **Distance** filter and sort need a location; without one they are disabled with "Set a location" and a link.
- **Featured** promotion is always labeled on the card and profile, and only reorders results under "Featured first."
- **Location** is requested only when someone taps near me, never on launch. Denied: explain and offer ZIP or city plus Open Settings. No fix: explain and offer ZIP or city. Unknown ZIP: inline error naming the ZIP.
- **Favorites and recent searches** live on the device only (guest). Removing a favorite offers Undo for 5 seconds.
- **Share** hands the platform share sheet the public profile link only – never searches, location, or the saved list.
- **Profile data**: name, credentials, specialty, one location, and phone are required; bio, research, and video hide when missing (Harper Singh shows this).

## Components added (all on existing tokens)

| Component | Tokens |
|---|---|
| Provider card | r-lg, s4 padding; 56.0 initials circle on tint; name 16.0/700 Blue; specialty 14.0 #333333; location and distance 14.0 #5B6770; tags 12.0/600 Blue on tint, Featured white on Blue; 44.0 heart top right, FILL 1 when saved |
| Search toolbar | Outline chips 44.0 high: white, #808B96 inset ring (3.27:1), Blue label and 20.0 icons; filter count badge 20.0 Blue pill, 12.0/700 white |
| Active filter chips | Blue chip, white label, 20.0 close glyph; named "Remove filter: …" |
| Filters sheet | 92% height, r-xl top; groups s4 × s6 split by hairlines #D5DDE5; fixed footer: tonal Clear all + primary "Show N providers" |
| Switch | 52.0 × 32.0 track, #808B96 off, Blue on; 24.0 white knob; row 56.0; `role="switch"` |
| Radio | 24.0 ring (#808B96, Blue when checked), 12.0 Blue dot; row 56.0; `role="radio"` in a radiogroup |
| Skeleton | Three card shapes; tint #EBF0F5 → #D1DDE6 shimmer, 1200 ms linear loop; static with reduced motion; announced as "Loading providers" |
| State panel | White, r-lg, s6 × s4; 56.0 tint circle with 32.0 glyph; 20.0/700 Blue title; 16.0 #5B6770 body; one primary action, then secondary alternatives; help line with the phone number |
| Offline bar | #333333 pill, white 14.0/600 (12.63:1), 44.0 Retry; 88.0 above the bottom edge; toasts move up to 152.0 while it shows |
| Location sheet | "Use my current location" row; notice callout on tint for denied or no fix; ZIP or city field; city rows; "Search anywhere" |
| System location dialog | 272.0 wide, r-lg, centered; 16.0/700 title, 14.0 body, 44.0 rows; labeled as platform-drawn |
| Share sheet | Preview (initials circle, title, URL) on #F7F8FA; four 48.0 target circles; callout "Only the public link is shared" |
| Profile header | 80.0 Blue initials circle with 28.0 white initials; 28.0/700 name; 16.0 specialty; 48.0 primary CTA; four 48.0 action circles (Call, Save, Share, Directions) |
| Location card | r-lg, s4; 16.0/700 name; 14.0 address, distance, hours; selectable phone number; two 44.0 tonal buttons |
| Menu drawer | From the right, min(88%, 344.0) wide, r-xl on the open edge; Blue header with 24.0/700 title and 44.0 close; grouped rows; external links end in an open-in-new glyph instead of a chevron; Follow us as labeled outline chips (no third-party logos, so the icon set stays one family) |
| Menu button | 44.0 ghost button with `menu`; 10.0 cyan dot ringed in Blue for unread Inbox items; label "Menu, 3 new in Inbox" |
| Sign-in pill, compact | When the app bar runs out of room (360 with large text), the pill keeps its 44.0 target and drops its label; the accessible name stays "Sign in to MyChart" |
| MedBlog list | 96.0 thumbnails, r-md; kicker 12.0/700; 16.0/700 Blue titles; 14.0 dates (Oct. 7, 2026); topic chips that scroll the selected chip into view; hairlines between rows; Show more, then an end note |
| Inbox row | Standard row; 8.0 Blue unread dot; name starts with "Unread." for screen readers; tonal Mark all as read |
| Toast with action | Blue toast; Undo is a 44.0 pill, white 14.0/700 on 16% white |
| MyChart panel | r-xl Blue with cyan glow; 24.0/700 title; fields 52.0 high, r-md white; white primary, outlined secondary |
| App bar sign-in pill | 44.0, 14% white on Blue, 20.0 login glyph + 14.0/600 "Sign in"; the logo flexes between 200 and 232 so the pill never clips (brand minimum 187) |

## Type, spacing, color, motion

No new values. In use: 32.0 welcome, 28.0 page titles and provider name, 24.0 sheet titles, 20.0 sections and state titles, 18.0 featured titles and card initials, 16.0 body and names, 14.0 meta and chips, 12.0 tags, tab labels, and suggestion types. Spacing stays on 4.0 · 8.0 · 12.0 · 16.0 · 24.0 · 32.0 · 40.0 · 48.0. The alert red #B0003A is also used for inline field errors (ZIP not found), always as text with the reason.

| Motion | Used for |
|---|---|
| spring-gentle, 400 ms | Search overlay expands from the field, tile, or chip; profile push; sheets |
| spring-snappy, 360 ms | Result cards (30 ms stagger), heart fill pop, switch knob, radio dot, system dialog scale-in |
| d-base, 240 ms | Offline bar, state panel swaps, icon fill |
| Reduced | Cross-fades only; shimmer and spinners stop; hearts, switches, and radios change instantly |

## Icons

74 concepts, one glyph each, Material Symbols Rounded in a 108 KB subset. New in the guest flow: `favorite`, `tune`, `swap_vert`, `near_me`, `my_location`, `location_off`, `translate`, `person_add`, `edit_calendar`, `call`, `school`, `science`, `play_circle`, `wifi_off`, `error`, `trending_up`, `domain`, `apartment`, `door_front`, `map`, `workspace_premium`, `sms`, `mail`, `more_horiz`, `visibility`, `visibility_off`, `menu`, `inbox`, `done_all`, `directions_bus`, `verified`, `menu_book`, `library_books`, `badge`, `coronavirus`, `public`, `open_in_new`. The full map renders on the board.

## Prototype controls

Emergency alerts (none, one, two) · Location permission (ask, allowed, denied, no fix) · Provider results (live, loading, error, none) · Network (online, offline) · Phone width (390, 360) · Text size (default, large) · Motion (full, reduced) · Guest home module order and visibility (CMS). Flow map buttons jump to each step.
