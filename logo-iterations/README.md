# MyCare logo iterations

Four logo directions for MyCare, UT Southwestern Medical Center's patient app. These are proposals: CMPA (logo@utsouthwestern.edu) has to approve one before anyone uses it.

| Folder | Idea |
|---|---|
| `open-arms/` | A medical plus whose top arm is a person's head: care that opens its arms to you |
| `care-chat/` | Two speech bubbles, your question and your care team's answer, with a plus at the center |
| `heart-path/` | Two lines, you and your care team, meet in the middle to draw an M that is also a heart |
| `care-c/` | A custom C in the wordmark that holds a medical plus. The C becomes the monogram icon |

Each folder has the same set of files. All SVGs use outlined Inter Display type, contain no `<text>` and no external references, and are under 10 KB each.

- `horizontal.svg`: the primary lockup. In `care-c/` this is the wordmark alone, and `horizontal-symbol.svg` adds the monogram.
- `stacked.svg`: the stacked lockup, with a small "UT Southwestern" endorsement in plain Inter Medium.
- `reversed.svg` and `reversed-stacked.svg`: for UT Southwestern Blue, or 75% black and darker.
- `one-color-blue.svg` and `one-color-black.svg`
- `symbol.svg`
- `app-icon.svg` and `app-icon-1024.png`: 1024 × 1024, full bleed. iOS and Android apply their own corner masks.
- `favicon.svg` and `favicon-32.png`
- `clearspace.svg`: clear space equals the cap height of "MyCare". The minimum size is 187 px wide.
- `process-type.svg` and `process-symbol.svg`: the weight tests and the symbol draft next to the final, used in the deck.
- `preview.png`: a contact sheet of the iteration, shown at real sizes.

To rebuild every SVG, run `python3 logo-iterations/build.py`. It needs `pip install fonttools uharfbuzz` and the Inter fonts in `/usr/share/fonts/opentype/inter/`. To render PNGs, use `handoff/logo-iterations/tools/render.js`.
