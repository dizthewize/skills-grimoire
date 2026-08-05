# Architect Brief: [Feature / Initiative]

**Date:** YYYY-MM-DD &nbsp;·&nbsp; **Author:** Architect &nbsp;·&nbsp; **Read time:** ~[N] min
**Written for:** [Who reads this — their expertise *and* what they don't know about this product. This line fixes the vocabulary for the whole spec.]
**Stakeholders:** [Who must sign off / who is impacted — e.g. Eng lead, Design, leadership]
**Decision status:** [`Draft` — no decision taken yet · `Accepted YYYY-MM-DD` — <what was decided> · `Superseded by <brief>` — <what changed>. Dated briefs are never rewritten, so this line is how a reader learns the spec's fate without opening every later file. *(PRD mode: omit — a living document has no single decision status.)*]

**In one line:** [The whole spec in one sentence, no jargon and no acronyms. Write this **last** — if it won't compress, the scope isn't settled.]

*(PRD mode: keep `Written for` and `In one line`; drop `Date` and `Read time` — the PRD is a living document, not a dated one.)*

---

## 0. Bottom Line Up Front

[3-4 sentences a busy reader can stop at: the problem, what's being built, the recommended approach, and the target outcome. If this section reads well, the rest is detail. One idea per sentence; bold at most one phrase.]

**Assumptions:** [The 2-3 beliefs this spec rests on. If one is wrong, the spec changes — flag them so reviewers can challenge them.]

*Fill the sections the request needs. A full PRD uses all of them; a backlog-prioritization or scoping request leans on a few. Don't pad sections that don't apply.*

---

## 1. Problem Statement

### 1.1 Summary

[What the problem is and who it affects.]

[Why it matters *now* — business cost, user pain, or strategic gap.]

[What success looks like and the key constraint shaping the approach.]

### 1.2 User Impact

**Who is affected.** [User segments or personas experiencing this problem.]

**Current workaround.** [What users do today and why it's insufficient.]

**Business cost.** [What the problem costs in revenue, retention, or velocity. Quantify where possible, and give each figure a "which means" clause.]

---

## 2. Goals / Non-Goals

### 2.1 Goals
1. **[Goal label]:** [What we're trying to achieve — tie to a success metric in §12.]
2. **[Goal label]:** [Description.]

### 2.2 Non-Goals
- **[Non-goal label]:** [What's explicitly out of scope and why.]
- **[Non-goal label]:** [What we're deferring and the reasoning.]

---

## 3. User Stories

| ID | Priority | Story | Acceptance criteria |
|----|----------|-------|---------------------|
| US-1 | Must | As a [user type], I want to [action] so that [outcome] | AC-1, AC-2 |
| US-2 | Should | As a [user type], I want to [action] so that [outcome] | AC-3 |

**Criteria live in §5 and only in §5.** This column carries their ids, never a restatement — two copies of the same criterion drift apart, and the copy a reviewer reads is not always the copy a builder builds to. A story with no id here has no acceptance criteria yet, which is itself the finding.

---

## 4. Functional Requirements

### FR-1: [Feature Name]
- [Specific behavior the system must exhibit]
- [Constraint or rule the implementation must respect]
- [Edge case the feature must handle]

### FR-2: [Feature Name]
- [Requirement]
- [Requirement]

---

## 5. Acceptance Criteria

The single home for acceptance. Every criterion must be pass/fail by someone who didn't write it. Given/When/Then, no "should be fast / intuitive."

### AC-1: [Feature or Story Area]
- **Given** [the precondition or starting state]
- **When** [the user action or system event]
- **Then** [the expected outcome, specific and testable]

### AC-2: [Feature or Story Area]
- **Given** [precondition]
- **When** [action]
- **Then** [outcome]

---

## 6. Feature Scope

**In scope (v1)**
- [Capability being built]
- [Capability being built]

**Out of scope / deferred**
- [Capability deliberately excluded] — [why]
- [Capability deferred to a later phase] — [trigger that would pull it forward]

---

## 7. Trade-off Analysis

### 7.1 Decision Criteria
[The requirements this decision must satisfy — timeline, team capacity, technical constraints, strategic fit. Weight them.]

### 7.2 Option A: [Name]
**What it is.** [Description of the approach.]

**Strengths** — [1], [2]
**Weaknesses** — [1], [2]
**Fit.** [How well it satisfies the decision criteria.]

### 7.3 Option B: [Name]
[Repeat the block above.]

### 7.4 Comparison Matrix

Score each (✅ strong · ⚠️ adequate · ❌ weak).

| Criteria | [Option A] | [Option B] |
|----------|:----------:|:----------:|
| Implementation effort | | |
| Time to ship | | |
| Scalability | | |
| Maintenance burden | | |
| User experience | | |

### 7.5 Recommendation
**Choose [Option].** [Rationale tied to the decision criteria in 7.1, and what you knowingly trade away.]

---

## 8. Release Plan

Sequence the work. Each phase ships something testable; later phases depend on earlier ones.

| Phase / Sprint | Scope | Exit criteria | Rough size |
|----------------|-------|---------------|------------|
| Phase 1 (MVP) | [What ships] | [How we know it's done] | [S/M/L or pts] |
| Phase 2 | [What ships] | [Exit criteria] | |
| Later | [Deferred capability] | | |

**Cut line:** [What's the minimum that delivers value if the timeline tightens.]

---

## 9. Backlog Prioritization

Score with an explicit framework (RICE shown; swap for MoSCoW or value/effort — see playbooks). Sort by score descending.

| Item | Reach | Impact | Confidence | Effort | RICE | Priority |
|------|:-----:|:------:|:----------:|:------:|:----:|:--------:|
| [Item] | | | | | | P0 |
| [Item] | | | | | | P1 |

*RICE = (Reach × Impact × Confidence) / Effort — a score for ranking work, where the inputs are shown so anyone can audit the ranking rather than trust it.*

---

## 10. Dependencies and Open Questions

### 10.1 Dependencies
- **[System / Team]:** [What's needed, by when, who owns it]

### 10.2 Blocking Pre-Checks *(resolve before this spec ships)*

Questions an **acceptance criterion depends on** — anything naming a vendor, model, API or prerequisite an AC's exit criterion is built on. These are not open questions; a spec that ships with one unresolved authorises building on a dependency nobody confirmed.

| # | Question | Depends-on AC | Answer | Resolved |
|---|----------|---------------|--------|:--------:|
| 1 | [e.g. can vendor X actually produce this, on our account?] | AC-N | [the verified answer] | ☐ |

> Run the mechanical check: list every vendor/model/API named in your ACs and release plan, then grep your own open questions for those names. Any hit belongs in this table, not §10.3. If answering needs real research, that is an **Analyst** request (feasibility + reachability probe against the real credentials) — not a deferral.

### 10.3 Open Questions *(logged — nothing is built on these)*
1. **[Question]** — Owner: [name or TBD] — [why it blocks / what it changes]

---

## 11. Risks

- **[Risk]:** [Likelihood × impact, and the mitigation or de-risking step.]
- **[Risk]:** [Detail.]

---

## 12. Success Metrics

| Metric | Target | Timeframe | How to Measure |
|--------|--------|-----------|----------------|
| [Metric name] | [Specific value] | [e.g. 30 days post-launch] | [Data source or method] |
| [Metric name] | [Specific value] | | |

---

## 13. Capabilities *(PRD mode — required; omit in a dated brief)*

What the product **does today**, as shipped. Distinct from §6 Feature Scope, which is what *this initiative* adds — this is the standing inventory a reader consults to answer "does it already do X?".

`feature-discovery` reads this to place a new feature in the product, and `/prd-sync` appends here as features ship. **Emit the section even when empty** — a new product has none yet, and an absent heading makes the write-back invent a structure instead of extending yours.

| Capability | What it does | Serves (job / user) | Spec |
|------------|--------------|---------------------|------|
| [e.g. Unified inbox] | [one line] | [the job it serves] | [`feature-specs/<slug>`] |

---

## 14. Decision Record *(PRD mode — required; omit in a dated brief)*

Why the product is the way it is. Each entry: what was decided, the reasoning, and what it ruled out. Rationale that lives only in a per-feature `context.md` is invisible to anyone scoping the next feature — this is where it survives.

`/prd-sync` adds an entry per shipped feature; add your own for decisions that were never a feature (a repositioning, a dropped channel, a pricing model).

| Date | Decision | Why | Ruled out | Source |
|------|----------|-----|-----------|--------|
| YYYY-MM-DD | [what was decided] | [the reasoning] | [the alternative and why not] | [`feature-specs/<slug>` or a brief] |

---

## 15. Next Steps
1. [Actionable next step] — Owner: [name]
2. [Actionable next step] — Owner: [name]
3. [Actionable next step] — Owner: [name]

---

## 16. Glossary

Every term of art used above, in one plain sentence each. **If a reader outside this project would have to look it up, it belongs here** — including the terms that feel too obvious to define, because those are the ones writers skip and readers stumble on. Prioritization frameworks, internal feature codenames, and role abbreviations all count.

| Term | Plain meaning |
|------|---------------|
| **[e.g. RICE]** | [a way of ranking work by reach × impact × confidence ÷ effort, so the order is arguable rather than arbitrary] |
| **[e.g. AC]** | [acceptance criterion — a pass/fail test that says whether the thing was actually built] |
| **[e.g. ICP]** | [ideal customer profile — the specific kind of buyer the product is built for] |
