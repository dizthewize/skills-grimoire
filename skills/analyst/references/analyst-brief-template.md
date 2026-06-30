# Analyst Brief: [Technology / Decision]

**Date:** YYYY-MM-DD &nbsp;·&nbsp; **Prepared by:** Analyst
**Context:** [1-2 sentences describing what this brief is evaluating and why.]
**Confidence:** [High / Medium / Low] — [one phrase on why, e.g. "rate limits undocumented for the enterprise tier"]

> **Confidence tags** — mark non-obvious claims inline: `[Verified]` tested/observed first-hand · `[Docs]` stated in official docs · `[Inferred]` Analyst's analysis. Never present `[Inferred]` as fact.

---

## 0. Bottom Line Up Front

[2-3 sentences: the recommendation, the single reason it wins, and the biggest risk or trade-off accepted.]

**Recommendation:** [Choose X / BUILD / BUY / HYBRID] — [one-line rationale tied to the top decision criterion.]

**Decision criteria** (what this call is measured against — weight them):
1. **[Criterion]** — [why it matters / weight]
2. **[Criterion]** — [why it matters / weight]
3. **[Criterion]** — [why it matters / weight]

*Fill the sections below that the decision needs — feasibility review, stack comparison, build-vs-buy, or a mix. Skip what doesn't apply; don't pad.*

---

## 1. Feasibility Review

### 1.1 Summary Matrix

| Tool / Platform | Version | Auth Model | Rate Limit | Key Capability | Real-Time | Maintained? |
|-----------------|---------|------------|------------|----------------|-----------|-------------|
| | | | | | | |
| | | | | | | |

### 1.2 [Tool / Platform A] · *checked YYYY-MM-DD*

**What it is.** [What the tool is, its primary use case, and current version.]

**Maintenance & health.** [Last release date, release cadence, open-issue/PR backlog, # maintainers, license, governance (company-backed / community / single-maintainer). A dying dependency is a future migration.]

**Auth model.** [How auth works, scopes, token types, and any approval gates.] `[Docs]`

**Rate limits / tiers.** [Access tiers, limits per tier, and what each unlocks.]

**Key endpoints.**
- `[endpoint]` — [what it does]
- `[endpoint]` — [what it does]

**Webhooks / real-time.** [What real-time events are available, latency, and gaps.]

**Pricing.** [One sentence on cost structure; note where cost spikes at scale.]

**Lock-in / exit cost.** [How hard to migrate off later — proprietary formats, data export, standard vs. bespoke APIs.]

**Key gotchas.**
- [Gotcha 1 — the thing the happy-path docs don't lead with]
- [Gotcha 2]
- [Gotcha 3]

**Sources**
- [URL] (accessed YYYY-MM-DD)

### 1.3 [Tool / Platform B] · *checked YYYY-MM-DD*

[Repeat the block above.]

---

## 2. Stack Comparison: [Option A] vs [Option B]

### 2.1 Decision Criteria

[Restate the requirements this decision must satisfy — performance, cost, team skills, timeline, strategic fit. Reference §0 weighting.]

### 2.2 Option A: [Name]

**What it is.** [Description of the approach or technology.]

**Strengths**
- [Strength 1]
- [Strength 2]

**Weaknesses**
- [Weakness 1]
- [Weakness 2]

**Fit for this use case.** [Assessment against the decision criteria.]

### 2.3 Option B: [Name]

[Repeat the block above.]

### 2.4 Side-by-Side Matrix

Score each criterion (✅ strong · ⚠️ adequate · ❌ weak) so the trade-off is visible at a glance.

| Criteria | [Option A] | [Option B] |
|----------|:----------:|:----------:|
| MVP speed | | |
| Cost at low scale | | |
| Cost at high scale | | |
| Real-time support | | |
| Job queue / batch work | | |
| Team familiarity | | |
| Ecosystem / community | | |
| Vendor lock-in | | |

### 2.5 Recommendation

**Choose [Option].** [Rationale paragraph: why this wins given the constraints, and what you knowingly trade away.]

**Suggested stack:**
- **[Layer]:** [Choice and one-line reasoning]
- **[Layer]:** [Choice and one-line reasoning]
- **[Layer]:** [Choice and one-line reasoning]

**Sources**
- [URL] (accessed YYYY-MM-DD)

---

## 3. Build-vs-Buy Analysis

### 3.1 [Component]

**Problem.** [What needs to be built or bought and why it matters.]

**Build option:** [Name]
- **Scope:** [What gets built.]
- **Effort:** [Weeks or months — and the confidence on that estimate.]
- **Ongoing cost:** [Maintenance burden in time or dollars.]
- **Risks:** [Key build risks.]

**Buy option:** [Vendor(s)]
- **Pricing:** [Specific numbers or tiers, including cost at projected scale.]
- **Pros:** [Why buying makes sense here.]
- **Cons:** [What you give up or risk — including lock-in.]

**Hybrid option.** [How combining build and buy captures the benefits of both.]

**Recommendation: BUILD / BUY / HYBRID.** [Rationale tied to the constraints above, including the break-even point where the answer would flip.]

**Sources**
- [URL] (accessed YYYY-MM-DD)

---

## 4. Overall Fit Assessment

### Integration Complexity: Easiest to Hardest
1. **[Item]** — [One-line rationale]
2. **[Item]** — [One-line rationale]
3. **[Item]** — [One-line rationale]

### Architecture Recap
- **[Layer]:** [Chosen approach and why]
- **[Layer]:** [Chosen approach and why]
- **[Layer]:** [Chosen approach and why]

---

## 5. Risks & Open Questions

- **[Risk]:** [Impact and how to de-risk — e.g. spike, prototype, contract term.]
- **[Open question]:** [What's unverified, why it matters, and — if outside this skill's scope (implementation, product decisions, market research) — note that.]

---

## 6. Sources

List every source once, with the date accessed.

- [Topic]: [URL] (accessed YYYY-MM-DD)
- [Topic]: [URL] (accessed YYYY-MM-DD)
- [Topic]: [URL] (accessed YYYY-MM-DD)
