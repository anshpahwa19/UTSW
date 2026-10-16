# UTSW MyCare – guest flow v2 (Home and Find care)

Interactive prototype of the **guest** experience only: guest Home, the global search, and the Find care provider flow (search → results → filters and sort → provider profile → save and share → saved providers), including loading, empty, service-error, offline, and location-denied states.

- `guest-flow.html` – the built prototype (publish this file).
- `guest-flow.src.html` – markup and styles. `guest-flow.src.js` – behavior and fictional sample data.
- `build.py` – `python3 build.py` inlines the script, the logo SVGs from `../../mycare-logo/` (unchanged), and the Material Symbols Rounded icons listed in `../icons/manifest.json`.

Tokens, iconography, and logo rules are shared with the home screen prototype; see `../TOKENS.md` and `../icons/README.md`. The right-hand panels of the prototype list the new rules for this flow (filters, plain-language search, location fallback, favorites, share, missing profile data) and map each Find care and Home requirement to a state you can jump to.

All providers, locations, phone numbers (555 numbers), and links (`mycare.example`) are fictional. Saved providers and recent searches are stored in the browser's local storage, standing in for on-device storage.
