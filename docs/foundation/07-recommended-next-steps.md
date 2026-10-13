# 7. Recommended Next Steps – MyCare 2.0

| | |
|---|---|
| **Deliverable** | 7 of 7 – Recommended Next Steps and Phased Delivery Approach |
| **Status** | Draft v0.1 – a recommendation. **No dates, durations or team capacity are assumed** (Q-38). |
| **Date** | Oct. 13, 2026 |
| **Sources** | Deliverables 1–6 |
| **Key assumptions** | The client wants a discovery-led approach before design (consistent with the brief for this work). Phases may overlap where answers arrive early. |
| **Decisions required** | Approval to proceed from Phase 1 to Phase 2; the attendees and format of the alignment session; access to evidence (Q-07, Q-40) |

---

## Where we are

**Phase 1 – Understand is partly complete.**
- **Done:** the deck has been fully reviewed and the brand and editorial standards have been summarized.
- **Not done:** the public websites have not been reviewed (access blocked). No stakeholders, users or internal documents have been consulted yet.

## Immediate next actions (in order)

1. **Unblock the public-web review.**
   - Allow `utswmed.org` in the workspace network policy.
   - Then review /doctors/ and /locations/ and update the [Brief](01-product-understanding-brief.md), section 2, and the A-08 and A-17 entries (Q-40).
2. **Send the evidence request** to the client before the alignment session:
   - Analytics, search logs and tab usage (Q-07, Q-08, Q-09).
   - App-store reviews.
   - Call-center contact reasons.
   - Prior research.
   - Technical overview of the current app (Q-22).
   - Data dictionaries for providers and locations (Q-24).
   - Gozio contract scope and capabilities (Q-28).
   - MyChart integration notes (Q-27).
   - Accessibility and privacy requirements (Q-30, Q-31).
3. **Name the decision-makers** (Q-35, Q-36) and confirm who attends alignment.
4. **Run the alignment session** using the "10 questions to ask first" in the [Discovery Questions](06-client-discovery-questions.md), and resolve the source conflicts K-01 to K-08.
5. **Update this foundation** with the answers: change Assumptions to Validated or Invalidated, close Unknowns, and turn provisional priorities into agreed scope.

## Phased approach

| Phase | Objective | Key activities | Outputs | Exit criteria (decision gate) |
|---|---|---|---|---|
| **1 – Understand** | A reliable picture of the product, ecosystem and constraints | Review the deck (done) and the websites (blocked); review the evidence the client provides; walk through the current app; interview stakeholders (product, Patient Access, Epic / MyChart, Gozio, CMPA, IT, Privacy, Compliance); review the technical overview | Foundation v0.2: an updated Brief, Inventory and Register; a current-state baseline | Current state confirmed (K-02, U-23); stakeholders identified; evidence received or confirmed unavailable |
| **2 – Align** | Shared agreement on vision, scope and success | Alignment workshop; agree objectives and metrics; first-release scope and exclusions; priority journeys; resolve the K-conflicts; agree the decision process | Vision statement; success metrics; agreed scope (replacing the provisional priorities); decision log | **Essential questions answered or explicitly deferred.** Scope signed off by the product owner. |
| **3 – Structure** | A coherent architecture grounded in agreed scope and real constraints | Finalize the navigation model (H1, H2 or H3, or a variant); entity and content model; integration boundaries (MyChart, scheduling, Gozio); journey maps updated with confirmed workflows; taxonomy approach; content model and formatting rules (S6) | Approved information architecture; integration boundary document; updated journey maps; content model | The navigation model and integration boundaries are approved by product, engineering and integration owners |
| **4 – Validate** | Reduce the riskiest assumptions with evidence | Prioritize assumptions by impact × uncertainty; tree testing of the architecture; testing specialty names and labels with patients; interviews with patients, visitors and front-desk / call-center staff (subject to Q-39); data audit of filter attributes (R-02) | Research findings; validated or invalidated assumptions; an agreed experience direction | The riskiest assumptions are tested (taxonomy, navigation, appointment actions, filters); direction agreed |
| **5 – Design Foundation** | A reusable, brand-compliant, accessible base | Design-system requirements; core interaction patterns (search, filters, cards, detail sections, handoffs, states); responsive behavior; accessibility acceptance criteria (per Q-30); brand inputs from CMPA (app lockup, digital palette, typeface – Q-32) | Design-system requirements; pattern library specification; state inventory; accessibility criteria | CMPA brand review passed; accessibility criteria agreed; engineering confirms feasibility |
| **6 – Detailed Design** | Buildable designs for the agreed scope | Wireframes → prototypes → visual design → specifications → engineering handoff, with usability testing at prototype stage | Wireframes; prototypes; UI specifications; handoff package | Proceed **only** when the Phase 2–5 decisions they depend on are made |

## Decision gates that must not be skipped

| Gate | Before | Decisions required |
|---|---|---|
| G1 | Phase 2 | Product owner named (Q-35); evidence access confirmed (Q-07, Q-40) |
| G2 | Phase 3 | Vision and objectives (Q-01, Q-02); first-release scope (Q-12, Q-13); audiences (Q-04) |
| G3 | Phase 4 | Navigation model candidate; MyChart and Gozio boundaries (Q-27, Q-28); appointment action model (Q-15, Q-26) |
| G4 | Phase 5 | Validated taxonomy and labels (Q-14); accessibility standard (Q-30); privacy rules (Q-31) |
| G5 | Phase 6 | Brand assets and design-system decision (Q-32); engineering ownership (Q-37) |

## Maintaining the foundation

- These documents are the **single source of truth** for later MyCare 2.0 work. Update them rather than creating parallel notes.
- When a question is answered, record the answer, update the linked A-, U-, K- and F-items, and add a line to the change log in the [README](README.md).
- Keep the five evidence categories (Confirmed, Observed, Proposed, Assumption, Unknown) on every new statement.
