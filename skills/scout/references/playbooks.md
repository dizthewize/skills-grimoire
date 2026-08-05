# Scout Playbooks

Per-duty research guidance. The **output format is always `scout-brief-template.md`** — one brief structure for every duty. The duty type only changes which sections you go deep on; fill the rest briefly or mark `❓` / "not researched" rather than deleting them.

## Contents

- [Per-duty emphasis](#per-duty-emphasis) — which sections matter for each request type
- [Research checklists](#research-checklists) — what to gather per duty
- [Analytical frameworks](#analytical-frameworks) — named methods to structure the analysis
- [Source quality guide](#source-quality-guide) — what to trust, in order
- [Evidence grading](#evidence-grading) — Confirmed / Reported / Inferred
- [Quality checklist](#quality-checklist) — before the brief ships

---

## Per-duty emphasis

| Duty | Go deep on | Keep light |
|---|---|---|
| **Competitor scan / feature tracking** | §2 Competitive Landscape, §3 Feature Matrix, §7 Watch List | §1, §4 |
| **Demand-signal / trend analysis** | §1 Market Overview, §4 Demand Signals (incl. 4.4 counter-signals) | §3 |
| **Landscape mapping** | §2.1 Overview Matrix, §5 Whitespace, §1.1 Summary | §3, §6 |
| **Positioning research** | §2 per-player Positioning blocks, §5 Whitespace (positioning gaps) | §3, §4 |

Always fill §0 Bottom Line Up Front, §6 Risks, §8 Glossary, and §9 Sources regardless of duty.

---

## Research checklists

**Competitor scan / feature tracking**
- Product / pricing / changelog pages (primary)
- Recent launches, release notes, blog posts
- Pricing tiers, packaging, what's gated
- Public roadmap, beta/waitlist signals
- Notable hires, funding, acquisitions that signal direction

**Demand-signal / trend analysis**
- Search-interest trends (directional, not exact)
- Communities discussing the problem (forums, subreddits, Discord, reviews)
- Competitor traction (funding, customer counts, job postings)
- Analyst/industry reports for size and growth (cite, don't over-trust)
- Counter-signals: who says demand is overstated or declining → §4.4

**Landscape mapping**
- Enumerate players by segment (incumbents, challengers, new entrants)
- Segment axes: target customer, price point, business model, geography
- Funding / maturity stage of each player
- Gaps — segments or use cases nobody serves well → §5
- Recent entrants and exits (momentum) → §7

**Positioning research**
- Homepage hero, taglines, primary value props (quote verbatim)
- Stated target customer and use cases
- Category claim ("the X for Y")
- Proof points they lead with (logos, metrics, testimonials)
- Pricing posture as positioning (premium / value / freemium)

---

## Analytical frameworks

Don't free-form the analysis — run it through the right lens and name which you used. State inputs so the conclusion is auditable; with thin data, label estimates.

### Competitor tiering
Classify every competitor before analyzing, so the brief weights them correctly:
- **Direct** — same problem, same buyer (head-to-head).
- **Adjacent** — solves a neighboring problem or serves a neighboring buyer (could pivot in).
- **Aspirational / substitute** — what users do *instead* (incl. "spreadsheet + duct tape" and "do nothing").

### Market sizing — TAM / SAM / SOM
- **TAM** total demand if everyone who could buy, did. **SAM** the slice you can actually serve (segment/geo/channel). **SOM** the realistic near-term capture.
- Compute **two ways and reconcile**: *top-down* (analyst report × filters) and *bottom-up* (# target accounts × price × adoption). If they diverge wildly, say so and trust bottom-up. Always show the arithmetic.

### Porter's Five Forces (industry attractiveness)
Rate each High/Med/Low with a one-line why: rivalry intensity, threat of new entrants, supplier power, buyer power, threat of substitutes. Use for landscape/feasibility reads — it surfaces *structural* margin pressure, not just who's loud.

### Positioning map (2×2)
Pick the two axes buyers actually decide on (e.g. price × breadth, self-serve × enterprise). Plot competitors. **White space = an empty, demand-backed quadrant** — empty alone isn't opportunity; pair it with a §4 demand signal.

### Demand-signal scoring
Rate each signal **strong / moderate / weak** on three tests, then weight strong signals heaviest:
1. **Source quality** — primary/observed > secondary > anecdote.
2. **Independence** — do unrelated sources corroborate, or is it one echo?
3. **Recency & direction** — current and trending up, or stale/declining?
A pile of weak, correlated signals is not strong demand. Always seek the counter-signal (§4.4).

---

## Source quality guide

Trust, roughly in descending order:

1. **Primary, first-party** — the company's own site, pricing pages, docs, changelogs, official posts, regulatory filings. Best for what a company *does*.
2. **Primary, observed** — your own hands-on check, screenshots, archived snapshots (Wayback). Good for verifying claims.
3. **Reputable secondary** — established trade press, analyst firms (Gartner/Forrester/CB Insights), well-known industry blogs. Good for context and market size; verify specific numbers.
4. **Community** — forums, reviews (G2/Capterra/Reddit), social. Excellent for *demand signals and sentiment*; weak for hard facts.
5. **Treat with caution** — vendor-sponsored "studies," press releases (claims, not facts), undated content, AI-generated summaries.

Record the date accessed for every source. When a key claim rests on a single low-tier source, say so in the brief.

---

## Evidence grading

Tag non-obvious claims inline so the reader can weight them:

- **`[Confirmed]`** — first-party or directly observed. Safe to act on.
- **`[Reported]`** — from a credible secondary source. Trust but verify before betting big.
- **`[Inferred]`** — Scout's own analysis connecting dots. Never present as fact; state the reasoning.

Non-public numbers (exact revenue, headcount, roadmaps) are estimates — give a range with reasoning and tag `[Inferred]`.

---

## Quality checklist

Before the brief ships:

- [ ] §0 Bottom Line Up Front states the single most decision-relevant finding.
- [ ] Competitors are **tiered** (direct / adjacent / substitute), not lumped together.
- [ ] Any market-size claim is computed **two ways** and reconciled, with arithmetic shown.
- [ ] Demand signals are **scored** (strong/moderate/weak) — and at least one **counter-signal** is in §4.4.
- [ ] White space is backed by a demand signal, not just an empty quadrant.
- [ ] Every non-obvious claim has a source URL **and** an evidence tag.
- [ ] Dates are on every fact; anything stale is flagged.
- [ ] Competitor **strengths** are reported, not just weaknesses (neutrality check).
- [ ] The header names a **reader** (`Written for`) and the brief is written in that reader's vocabulary.
- [ ] Every acronym and term of art is **spelled out at first use** and listed in §8 Glossary.
- [ ] §0 is **≤120 words**, and every headline stat has a **"which means" clause**.
- [ ] Evidence tags sit at the **end** of claims, one per bullet — not mid-sentence.
- [ ] No cross-reference is a **bare filename** — each names the conclusion the other brief reached.
- [ ] The `In one line` header survives the outsider test: a reader who knows nothing about this product understands it.
- [ ] **Decision status** is set — `Draft`, `Accepted <date>`, or `Superseded by <brief>`. Since dated briefs are never rewritten, this is the only place a reader learns whether the recommendation was taken.
