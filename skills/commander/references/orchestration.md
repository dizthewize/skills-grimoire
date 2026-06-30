# Commander Orchestration

How to run the specialist chain cohesively.

## Contents

- [Dependency map](#dependency-map)
- [Lens selection](#lens-selection) — which specialists a request needs
- [Hand-off format](#hand-off-format) — what carries between phases
- [Conflict reconciliation](#conflict-reconciliation) — when lenses disagree
- [Optional: parallelizing with subagents](#optional-parallelizing-with-subagents)

---

## Dependency map

```
        ┌─────────┐     ┌──────────┐
        │  Scout  │     │ Analyst  │     (Phase 1 — independent)
        │ market  │     │  tech    │
        └────┬────┘     └────┬─────┘
             │   ╲         ╱  │
             │    ╲       ╱   │
             │     ▼     ▼    │
             │   ┌───────────┐│
             │   │ Architect ││            (Phase 2 — needs market + feasibility)
             │   │  product  ││
             │   └─────┬─────┘│
             │         │      │
             ▼         ▼      │
           ┌─────────────┐    │
           │ Strategist  │◀───┘            (Phase 3 — needs product + positioning)
           │   growth    │
           └──────┬──────┘
                  ▼
           ┌─────────────┐
           │  SYNTHESIS  │                 (Phase 4 — reconcile into one decision)
           └─────────────┘
```

- **Scout** and **Analyst** are independent — run them first, in either order (or parallel if asked).
- **Architect** consumes Scout's opportunity + Analyst's feasibility → spec only what's worth building *and* buildable.
- **Strategist** consumes Architect's product + Scout's positioning/demand → go-to-market.
- **Synthesis** reconciles all four.

---

## Lens selection

Run only what the decision needs. Common shapes:

| Request shape | Lenses |
|---|---|
| "Should we build / pursue X?" (open venture/idea) | All four |
| "Is there a market for X and how would we sell it?" | Scout → Strategist |
| "Can we build X and what would it take?" | Analyst → Architect |
| "Spec X" where market is already known | Architect (+ Analyst if feasibility is open) |
| "How do we launch / grow X?" (product exists) | Strategist (+ Scout for positioning) |
| "Is X technically worth it vs. buying?" | Analyst only → invoke `analyst` directly, skip the chain |

If only one lens applies, don't run Commander — invoke that specialist skill directly. Commander earns its cost only when ≥2 lenses must be reconciled.

---

## Hand-off format

After each phase, capture a compact hand-off (not the whole brief) to feed forward. Keep it to the facts the next phase needs:

```
### Hand-off: <specialist> → <next>
- Bottom line: <one line>
- Carries forward: <2–4 facts the next lens must respect>
- Open flags: <unknowns / risks the next lens should weigh>
- Brief: <path to the saved sub-brief>
```

Example — Scout → Architect: "Bottom line: real demand, crowded mid-market, white space in self-serve SMB. Carries forward: target the SMB self-serve segment; must beat <competitor> on setup time. Open flags: demand softest in EU."

---

## Conflict reconciliation

The synthesis exists to resolve tension between lenses. Name the conflict, then weight it — don't average.

| Tension | How to read it |
|---|---|
| Strong demand (Scout) × low feasibility (Analyst) | REFINE — narrow scope to the buildable slice, or fix the tech gap first |
| Buildable (Analyst) × thin demand (Scout) | KILL or PARK — capability without a market |
| Clear product (Architect) × no viable channel (Strategist) | REFINE — distribution is the bottleneck, not the product |
| Everything green except one fatal risk | Let the fatal risk drive the verdict; don't let three greens drown one red |

State the weighting explicitly in the synthesis ("weighted feasibility over demand because the demand is soft and the build is a one-way door").

---

## Optional: parallelizing with subagents

Default is **inline and sequential** — do not spawn subagents unless the user explicitly asks. If they do, only the independent Phase-1 lenses (Scout, Analyst) parallelize safely; Architect and Strategist must stay sequential because they depend on upstream output. Spawn one subagent per independent lens, collect both briefs, then continue the chain inline. The dependency map is the contract — never run a downstream lens before its inputs exist.
