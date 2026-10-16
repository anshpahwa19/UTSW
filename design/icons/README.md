# UTSW MyCare icons

Every icon in the MyCare app comes from **Material Symbols Rounded** (Google), licensed under the Apache License 2.0. A copy is in `LICENSE.txt`.

- `manifest.json` lists each symbol and the variants the app uses.
- `svg/` holds one file per symbol and variant, named `{symbol}--{variant}.svg`, downloaded from fonts.google.com by `../fetch_icons.py`.
- `../build.py` inlines these files into the prototype.

| Variant | Optical size | Weight | Fill | Grade | Use |
|---|---|---|---|---|---|
| `24` | 24 | 400 | 0 | 0 | Default icon at 24.0 |
| `24f` | 24 | 400 | 1 | 0 | Selected tab, finished action, severity, duotone fill layer, playback |
| `24g` | 24 | 400 | 0 | −25 | White icon on UT Southwestern Blue |
| `20` / `20f` | 20 | 400 | 0 / 1 | 0 | Inside buttons, sheet details, notices, chevrons |
| `16` / `16f` | 20 | 500 | 0 / 1 | 0 | Beside 12.0 text, drawn at 16.0 |
| `40f` | 40 | 400 | 1 | 0 | Map pin |

To add a symbol, add it to `manifest.json`, then run `python3 fetch_icons.py` and `python3 build.py`.

iOS: add the SVGs to the asset catalog with Preserve Vector Data turned on. Android: import them as vector drawables. A duotone icon is two layers: the `24f` shape in `#66CBEC` under the `24` outline in `#004278`.
