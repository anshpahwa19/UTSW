# UTSW MyCare – logo modernization concepts

**Status:** Draft concepts for CMPA review (Oct. 13, 2026). Not approved. See risk R-18 and question Q-41 in `docs/foundation/`.
**Review sheet:** `review.png`

## What's wrong with the current lockup (Observed, S8; colors are approximate because the source is a compressed screenshot)
- Blue measures about `#275896`. The official UT Southwestern Blue is `#004278` (S3).
- Gray measures about 63% black. The brand gray is 80% black (S3).
- "MyCare" is a very light weight. It loses contrast and detail at small sizes, and it reads as a different design language from the heavy "UTSW".
- There is no symbol or app icon, and the only file is a raster.

## Concept A – Refined lockup (lowest risk)
- Same structure: "UTSW" art + "MyCare".
- "MyCare" is set in Instrument Sans SemiBold, tracking −12/1000 em. Its cap height is 0.9 of the "UTSW" U-height, so it balances the heavy art without overpowering it.
- Gap between the two words: 0.42 U-height.
- Official colors: UTSW in `#004278`, "MyCare" in `#333333`.
- App icon: "MC" monogram (Instrument Sans Bold) in white on blue. It is legible, but it is the least distinctive part of this concept.
- Files:
  - `A-horizontal.svg`
  - `A-stacked.svg`
  - `A-reversed-dark.svg`
  - `A-mono-black.svg`
  - `A-app-icon.svg`
  - `A-horizontal-tight.svg` (no clear space, for in-app headers)

## Concept B – MyCare-led with care ring symbol
- **Symbol:** a thick ring, open at the upper right, with a solid dot at the center. The ring is the "C" of Care and a path that leads onward. The dot is the patient (the "My").
  - Geometry: stroke 0.30r, a 60° gap centered at 45°, dot radius 0.26r.
  - It avoids medical clichés and is not borrowed from MyChart or Gozio.
- **Wordmark:** "MyCare" in Instrument Sans Bold, `#004278`, tracking −18/1000 em.
- **Endorsement:** "UTSW" art above "MyCare" at 0.5 U-height.
- **App icon:** the symbol alone. It is clearly recognizable at 29 px.
- **Minimum size:** about 240 px wide is suggested, because the "UTSW" endorsement gets small at 187 px.
- Files:
  - `B-horizontal.svg`
  - `B-reversed-dark.svg`
  - `B-mono-black.svg`
  - `B-app-icon.svg`
  - `B-app-icon-light.svg`
  - `B-horizontal-tight.svg`
  - `B-reversed-tight.svg`

## Contrast (WCAG, computed)
| Pair | Ratio |
|---|---|
| `#004278` on white | 10.2:1 |
| `#333333` on white | 12.6:1 |
| White on `#333333` | 12.6:1 |
| White on `#004278` | 10.2:1 |

## Rules respected
- "UTSW" letterforms are never redrawn or retyped (S4, S5). The art in these files is a **placeholder raster taken from the current lockup**, recolored only to official colors. It must be replaced with CMPA master vector art.
- Reversed versions are on `#333333` (80% black), which S5 allows. Reversed on UT Southwestern Blue would need CMPA confirmation.
- All other type is outlined, so the SVGs need no fonts. Instrument Sans is an open-source (SIL OFL) typeface, but the license should be confirmed for logo use.
- The product name is unchanged ("MyCare").

## Open questions for CMPA (Q-32, Q-41)
- Is a modernization sanctioned, and does master vector art exist for "UTSW"?
- Should the app keep "UTSW" or use the full UT Southwestern Medical Center logo?
- What is the screen value of "80% black"?
- Is an app-specific symbol (Concept B) acceptable within the brand architecture?

Rebuild: `build.py` (it needs the scratchpad toolkit: fonts, `outline.py`, `fpo.py`), so treat it as a reference.
