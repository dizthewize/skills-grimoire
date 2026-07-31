# Analyst Playbooks

Per-request research guidance. The **output format is always `analyst-brief-template.md`**. The request type only changes which sections you go deep on; skip sections that don't apply rather than padding them.

## Contents

- [Per-request emphasis](#per-request-emphasis) — which sections matter for each request type
- [Evaluation checklists](#evaluation-checklists) — what to check per duty
- [Analytical frameworks](#analytical-frameworks) — named methods to structure the decision
- [Doc-reading protocol](#doc-reading-protocol) — read before you evaluate
- [Confidence grading](#confidence-grading) — Verified / Docs / Inferred
- [Quality checklist](#quality-checklist) — before the brief ships

---

## Per-request emphasis

| Request | Go deep on | Skip / keep light |
|---|---|---|
| **Library / framework evaluation** | §1 Feasibility (esp. Maintenance & health), §5 Risks | §2, §3 |
| **Stack comparison** | §2 Stack Comparison (matrix + recommendation), §0 criteria | §3 |
| **Build-vs-buy** | §3 Build-vs-Buy (incl. break-even point), §0 criteria | §1 detail |
| **API feasibility / docs review** | §1 per-tool blocks (auth, limits, endpoints, gotchas) | §2, §3 |
| **Tool recommendation w/ trade-offs** | §2.4 matrix, §0 Recommendation, §5 Risks | §3 |

Always fill §0 Bottom Line Up Front (with explicit decision criteria), the Recommendation, and §6 Sources.

---

## Evaluation checklists

**Library / framework evaluation**
- Current version, release cadence, date of last release
- Maintenance signal: open-issue/PR backlog, # active maintainers, company vs. community backing
- License (and whether it's compatible with the intended use)
- Breaking-change history / semver discipline
- Bundle size / runtime footprint where relevant
- Ecosystem: plugins, integrations, Stack Overflow / community depth
- Migration/exit cost if it's later abandoned

**Stack comparison**
- Lock the decision criteria *first* (perf, cost, team skills, timeline, fit, lock-in)
- Cost at low scale **and** at projected high scale (where curves cross)
- Team familiarity / hiring market for each option
- Operational burden (hosting, scaling, on-call)
- Score every criterion in the §2.4 matrix — no blanks

**Build-vs-buy**
- Honest build effort estimate + confidence on it
- Ongoing maintenance cost of the build option (the part teams underweight)
- Vendor pricing at projected scale, not just entry tier
- Lock-in / data portability of the buy option
- The break-even point where the recommendation would flip

**API feasibility / docs review**
- Auth model, scopes, token lifetime, approval gates
- Rate limits per tier and what each tier unlocks
- Key endpoints needed for the use case — confirm they exist and return what's needed
- Webhooks / real-time availability and latency
- Pagination, idempotency, error semantics
- Gotchas the happy-path docs bury (sandbox limits, eventual consistency, deprecations)

---

## Analytical frameworks

Don't free-form the call — run it through the right method and name which you used. Show inputs so the recommendation is auditable.

### Weighted decision matrix
The default for any "X vs. Y" pick. Turns vibes into a defensible score:
1. List the decision criteria; assign each a **weight** (must sum to 1.0) reflecting how much it matters *for this decision*.
2. Score each option per criterion **1–5**.
3. **Weighted score = Σ(weight × score).** Highest wins — but sanity-check: if the winner loses badly on a must-have, the weights are wrong, not the answer.

| Criterion | Weight | Opt A | Opt B |
|---|:--:|:--:|:--:|
| [e.g. perf] | 0.3 | 4 | 5 |
| [e.g. team familiarity] | 0.25 | 5 | 2 |
| **Weighted total** | 1.0 | **x.x** | **x.x** |

### Dependency / library health score
Rate a library before adopting — a dying dependency is a future migration. Score each Green/Yellow/Red:
- **Release cadence** — shipped in last ~6mo? **Maintainers** — bus factor >1? **Issue/PR backlog** — triaged or abandoned? **Breaking-change discipline** — semver respected? **Adoption** — downloads/dependents trending up? **License** — compatible with intended use? **Governance** — company-backed / foundation / lone maintainer?
- Any Red on maintainers, license, or governance is a near-veto regardless of features.

### Build-vs-buy: TCO + break-even
Compare **total cost of ownership over a horizon (e.g. 3 yrs)**, not sticker price:
- **Build TCO** = initial effort + ongoing maintenance + opportunity cost of not shipping elsewhere.
- **Buy TCO** = subscription at *projected* scale + integration + lock-in/exit cost.
- State the **break-even point** — the scale/timeline where the cheaper option flips. That number is the actual deliverable.

### Reversibility (one-way vs. two-way door)
Classify the decision before agonizing over it:
- **Two-way door** (cheap to reverse) → recommend fast, bias to action, prototype.
- **One-way door** (costly to unwind — data model, core framework, vendor lock-in) → demand higher confidence, prefer a spike, document the exit cost.

### Spike / POC protocol
When docs can't answer feasibility, propose a **time-boxed spike** (e.g. 1–2 days) instead of guessing:
- Define the **one question** it must answer and the **pass/fail bar** up front.
- Scope to the riskiest unknown only (the auth flow, the rate limit at load, the migration).
- Output: a `[Verified]` finding + throwaway code, not production work. Record it in §5 Risks.

---

## Doc-reading protocol

Per the global rule: **read the official docs before forming an opinion.** Wrong technical calls come overwhelmingly from evaluating off memory or marketing pages.

1. `WebSearch` for the official docs / changelog / pricing / status pages (not blog summaries).
2. `WebFetch` the primary pages. Prefer docs and changelogs over third-party tutorials.
3. If JS-heavy docs won't render via WebFetch, fall back to WebSearch for the same content, or ask the user to paste it — do not guess.
4. Note the version and date of what you read; API facts decay fast.

---

## Reachability probe

Docs prove a product exists. They do not prove **your** credentials can call it. This is a separate check, and it is cheap — run it for anything gated behind a key before recommending it.

**Why it is not optional.** The two most expensive integration failures look identical to success on paper: a model fully documented but not enabled for your account, and one the provider's own list endpoint returns while every call 404s. Both yield a feature that cannot work *at all* — discovered only after it is built.

**The technique.** Send a request that is deliberately invalid in a cheap way — a bogus parameter value, a malformed size, `max_tokens: 1`. You are reading the **error**, not the result:

- `model_not_found` · `does not exist` · `no longer available` → **unavailable to this account**, whatever the docs say.
- `invalid parameter` · `unsupported value` → **reachable**; the credential works and the surface exists.
- `401` / `403` → a credential/scope problem, not an availability answer. Fix the key and re-probe.

Invalid requests are rejected before billing on most APIs, so this is usually free. Exception: **queue-based APIs** that accept a submission and validate later — there a probe enqueues real (paid) work, so probe with a valid id and read the queued result instead.

**Availability is not compatibility.** Models within one family routinely differ on which sampling and token parameters they accept, so a reachable model id can still 400 on the exact call you designed. Probe the **request shape** you intend to send, not just the name.

**Record it.** Per tool: *Reachable on our account: yes/no — checked YYYY-MM-DD*, tagged `[Verified]`. Anything unprobed stays `[Docs]` — say so rather than implying you tested it.

---

## Perishable facts → implementation constants

The failure this prevents: a correct number in a brief becomes a hardcoded constant, loses its provenance, and is trusted long after it stops being true. Prices change, models retire, API versions sunset — and nothing in the code says where the value came from or when it was checked.

Any figure a reader will hardcode goes in the brief's **Constants handed to implementation** table:

| What | Value | **Unit** | Checked | Re-verify by | Source |
|---|---|---|---|---|---|
| e.g. model input price | 2.50 | **USD per 1M tokens** | 2026-07-29 | 2026-10-29 | [url] |

Three rules:

- **Write the unit out.** `$5/$15` is not a unit. A correct figure in an unstated unit becomes an incorrect constant, and unit errors survive review because the digits look right.
- **Set a re-verify date, not just a checked date.** Dating a fact records decay; it does not prevent it. Default to 3 months for pricing and model ids, sooner where the brief itself flags version churn as a risk.
- **If the brief names volatility as a top risk, every constant inherits a short horizon.** A brief that says "API version churn is HIGH" and then hands over undated version numbers has documented the danger without defending against it.

Tag non-obvious claims inline so the reader can weight them:

- **`[Verified]`** — tested or observed first-hand (ran it, hit the endpoint, read the source). Safe to act on.
- **`[Docs]`** — stated in official documentation. Trust, but version-check.
- **`[Inferred]`** — Analyst's own reasoning connecting facts. Never present as fact; state the reasoning.

Vendor marketing claims are not `[Docs]` — treat them as claims and verify, or label `[Inferred]` with the caveat.

---

## Quality checklist

Before the brief ships:

- [ ] Official **docs were read** for every tool evaluated (not blog summaries).
- [ ] Every credential-gated tool was **probed with the real key** — reachability stated per tool, unprobed ones marked `[Docs]`, not `[Verified]`.
- [ ] Every figure destined to be hardcoded is in the **Constants** table with its **unit spelled out** and a **re-verify date**.
- [ ] Decision criteria are stated **and weighted** before the recommendation.
- [ ] Any "X vs. Y" pick is backed by a **weighted decision matrix** with visible scores.
- [ ] Every library has a **health score** (cadence, maintainers, license, governance).
- [ ] Build-vs-buy states a **break-even point**, not just current pricing.
- [ ] The decision's **reversibility** (one-way / two-way door) is classified.
- [ ] Unresolved feasibility unknowns have a **spike proposed**, not a guess.
- [ ] §0 ends in a clear **recommendation**; every non-obvious claim has a source + confidence tag.
