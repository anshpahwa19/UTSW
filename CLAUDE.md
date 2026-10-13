# CLAUDE.md – MyCare 2.0 project guidance

This repository holds product, UX and (later) design and engineering work for UT Southwestern Medical Center's **MyCare 2.0** patient app.

## Source of truth
- `docs/foundation/` is the shared product foundation. Read its `README.md` before any MyCare task.
- Update the foundation documents when new information arrives. Do not create parallel notes. Add a change-log line to `docs/foundation/README.md`.

## Working rules
- Label every statement with one evidence category: **Confirmed**, **Observed**, **Proposed**, **Assumption** or **Unknown**. A deck "Future" or "Explore" idea is Proposed, never an approved requirement.
- Cite sources by ID: `S1-<slide>` for the deck; S3–S7 for brand and style. See the source register in `docs/foundation/README.md`.
- Do not invent business goals, research findings, integrations, APIs or technical constraints. Record gaps as Unknowns with a Q-ID instead.
- Keep IDs stable (F-, A-, R-, U-, K-, Q-, UX-, H-, G-). Add new IDs; don't renumber.
- Use UT Southwestern terminology and the UT Southwestern Style Guide (S6): American spelling, serial comma, spaced en dashes (no em dashes), phone format 214-648-8400, "a.m./p.m.", and official hospital and center names.
- Brand: UT Southwestern Blue is RGB 0, 66, 120 (`#004278`). Never recreate the logo in type. Hex values for the other palette colors are unconfirmed.
- Don't move to screen design until the decision gates in `docs/foundation/07-recommended-next-steps.md` allow it.
