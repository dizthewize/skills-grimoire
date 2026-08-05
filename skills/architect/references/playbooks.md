# Architect Playbooks

Per-request guidance. The **output format is always `architect-brief-template.md`**. The request type only changes which sections you go deep on; skip sections that don't apply rather than padding them.

## Contents

- [Per-request emphasis](#per-request-emphasis) — which sections matter for each request type
- [Prioritization frameworks](#prioritization-frameworks) — RICE, MoSCoW, value/effort
- [Story & acceptance-criteria patterns](#story--acceptance-criteria-patterns)
- [Quality checklist](#quality-checklist) — before marking a spec ready

---

## Per-request emphasis

| Request | Go deep on | Skip / keep light |
|---|---|---|
| **Full PRD / feature spec** | §1 Problem, §2 Goals, §3–5 Stories/FR/AC, §6 Scope, §12 Metrics | — (use all) |
| **Roadmap** | §0 Bottom Line Up Front, §8 Release Plan, §6 Scope, §9 Prioritization | §4, §5 |
| **Backlog prioritization** | §9 Prioritization (scored), §6 Scope | §1 detail, §4, §5 |
| **Sprint planning** | §8 Release Plan, §3 Stories, §10 Dependencies | §7 |
| **User stories / acceptance criteria** | §3 Stories, §5 Acceptance Criteria, §4 FR | §7, §8, §9 |
| **Feature scoping / trade-off** | §6 Scope, §7 Trade-off (matrix + recommendation), §2 Non-Goals | §3, §9 |

Always fill §0 Bottom Line Up Front (with assumptions), §1 Problem Statement, §6 Scope, and §16 Glossary.

---

## Prioritization frameworks

Pick one, state which you used, and show the inputs so the ranking is auditable.

**RICE** — default for ranking a backlog by expected value.
`RICE = (Reach × Impact × Confidence) / Effort`
- **Reach:** # users/events affected per period.
- **Impact:** per-user effect (3 massive / 2 high / 1 medium / 0.5 low / 0.25 minimal).
- **Confidence:** % (100 high / 80 medium / 50 low) — your certainty in the estimates.
- **Effort:** person-months (or sprint points). Sort by score descending.

**MoSCoW** — fast scoping when a release deadline is fixed.
- **Must** (release fails without it) · **Should** (important, not vital) · **Could** (nice-to-have, first to cut) · **Won't** (explicitly out — record it as a non-goal).

**Value vs. Effort (2×2)** — quick visual triage.
- High value / low effort = do now · High/high = plan · Low/low = backlog · Low value/high effort = drop.

When data is thin, say so and label estimates — a defensible framework with rough inputs beats unscored opinion.

---

## Story & acceptance-criteria patterns

**User story** — one user, one action, one outcome:
> As a **[specific user/persona]**, I want to **[action]**, so that **[outcome/value]**.

Smells to avoid: stories with "and" (split them), "As a user" (too generic — name the persona), or no "so that" (no stated value = question whether to build it).

**Acceptance criteria** — Given/When/Then, pass/fail by someone else:
> **Given** [precondition] · **When** [action/event] · **Then** [specific, observable outcome].

Each story needs criteria for the happy path **and** the important error/edge cases. Reject "should be fast/intuitive/user-friendly" — replace with a measurable bar ("loads in <500ms", "shows inline error within the field").

**INVEST check** for a good story: Independent, Negotiable, Valuable, Estimable, Small, Testable.

---

## Open-question triage (run before the spec ships)

Open questions are where an unverified dependency hides in plain sight. Sort every one into exactly one bucket:

| Bucket | Test | Disposition |
|---|---|---|
| **Blocking pre-check** | An AC's exit criterion depends on the answer — it names a vendor, model, API, or prerequisite the spec commits to building on | **Not an open question.** Resolve it *now*; the phase cannot go Ready until it is. |
| **Priority question** | The answer changes sequencing or scope, but nothing breaks either way | Log with an owner and a decide-by date |
| **Nice to know** | No decision hangs on it | Log, no owner needed |

**The mechanical check:** take the set of vendors, models, APIs and prerequisites named anywhere in your ACs and release plan. Grep your own open questions for those names. Any hit is a blocking pre-check, not a question.

Why this needs to be mechanical rather than a judgement call: the failure looks *diligent* from both sides. A question like *"can vendor X meet our quality bar?"* is a reasonable thing to log, and a task titled *"build the pipeline on vendor X"* with *"AC-N met"* as its exit criterion is a reasonable thing to schedule. Nobody reads them together, so the spec authorises building on a dependency nobody confirmed — and "can it?" is answered only after the work is built. Resolving one lookup up front is the whole cost of avoiding that.

If the answer needs research beyond a lookup, that is an **Analyst** request (feasibility + a reachability probe against the real credentials) — not a line item to defer.

---

## Quality checklist

Before marking a spec ready:

- [ ] Problem stated in ≤2 sentences, **before** any solution.
- [ ] Goals tie to measurable success metrics (§12).
- [ ] Non-goals listed — scope is explicitly bounded.
- [ ] Every acceptance criterion is pass/fail by someone who didn't write it.
- [ ] Prioritization uses a named framework with visible inputs.
- [ ] Trade-offs end in a **recommendation**, not an open question.
- [ ] Dependencies and open questions each have an owner.
- [ ] **Open questions triaged against the ACs** — none that an acceptance criterion depends on is still unresolved (see Open-question triage).
- [ ] Assumptions are stated so reviewers can challenge them.
- [ ] **Acceptance criteria appear in §5 and nowhere else** — §3's story table carries AC ids, never restated criteria.
- [ ] The header names a **reader** (`Written for`) and the spec is written in that reader's vocabulary.
- [ ] Every acronym and term of art is **spelled out at first use** and listed in §16 Glossary — internal feature codenames included.
- [ ] Every business-cost or metric figure has a **"which means" clause**.
- [ ] No cross-reference is a **bare filename** — each names the conclusion the other doc reached.
- [ ] The `In one line` header survives the outsider test: a reader who knows nothing about this product understands what is being built.
- [ ] **Decision status** is set on a dated brief — `Draft`, `Accepted <date>`, or `Superseded by <brief>`. Omit it in PRD mode; a living document has no single status.
