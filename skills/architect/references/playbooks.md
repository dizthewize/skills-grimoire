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
| **Roadmap** | §0 TL;DR, §8 Release Plan, §6 Scope, §9 Prioritization | §4, §5 |
| **Backlog prioritization** | §9 Prioritization (scored), §6 Scope | §1 detail, §4, §5 |
| **Sprint planning** | §8 Release Plan, §3 Stories, §10 Dependencies | §7 |
| **User stories / acceptance criteria** | §3 Stories, §5 Acceptance Criteria, §4 FR | §7, §8, §9 |
| **Feature scoping / trade-off** | §6 Scope, §7 Trade-off (matrix + recommendation), §2 Non-Goals | §3, §9 |

Always fill §0 TL;DR (with assumptions), §1 Problem Statement, and §6 Scope.

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

## Quality checklist

Before marking a spec ready:

- [ ] Problem stated in ≤2 sentences, **before** any solution.
- [ ] Goals tie to measurable success metrics (§12).
- [ ] Non-goals listed — scope is explicitly bounded.
- [ ] Every acceptance criterion is pass/fail by someone who didn't write it.
- [ ] Prioritization uses a named framework with visible inputs.
- [ ] Trade-offs end in a **recommendation**, not an open question.
- [ ] Dependencies and open questions each have an owner.
- [ ] Assumptions are stated so reviewers can challenge them.
