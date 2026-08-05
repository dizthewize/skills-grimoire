# Strategist Playbooks

Per-request guidance. The **output format is always `strategist-brief-template.md`**. The request type only changes which sections you go deep on; skip sections that don't apply rather than padding them.

## Contents

- [Per-request emphasis](#per-request-emphasis) — which sections matter for each request type
- [Growth frameworks](#growth-frameworks) — AARRR, ICE, positioning, experiment design
- [Channel patterns](#channel-patterns) — email/drip, SEO, launch
- [External marketing skills](#external-marketing-skills) — the importable suite and when to reach for it
- [Quality checklist](#quality-checklist) — before the brief ships

---

## Per-request emphasis

| Request | Go deep on | Skip / keep light |
|---|---|---|
| **Marketing strategy / campaign plan** | §1 Diagnosis, §2 Strategy, §3 Campaign Plan, §7 Measurement | §4, §5 |
| **Email sequence / drip** | §4 Email Sequence, §7 Measurement | §3, §5, §6 |
| **SEO plan** | §5 SEO Plan, §2 Positioning | §3, §4 |
| **Launch plan** | §3 Campaign/Launch, §2 Strategy, §8 Budget | §5 |
| **Acquisition funnel** | §1 Funnel Diagnosis, §2 Channel strategy, §7 | §4, §5 |
| **Growth experiments** | §6 Experiments (ICE-ranked), §7 Measurement | §3, §5 |
| **Positioning** | §2 Positioning, §1 ICP | §3–§6 |

Always fill §0 Bottom Line Up Front, the funnel stage + target metric (header), and §7 Measurement Plan.

---

## Growth frameworks

Name the framework you used and show the inputs.

### AARRR (pirate funnel)
Map every plan to a stage: **Acquisition** (found us), **Activation** (first value), **Retention** (came back), **Referral** (told others), **Revenue** (paid). Diagnose the **binding constraint** — the leakiest stage — before prescribing tactics. Traffic poured into a leaky activation step is wasted spend.

### North Star metric
The single metric capturing the value delivered to users (e.g. weekly active teams, docs shipped). Every campaign should ladder up to it; if it doesn't, question the campaign.

### ICE prioritization
Score each experiment/channel 1–10 on **Impact** (if it works, how big), **Confidence** (how sure it works), **Ease** (how cheap/fast). `ICE = (Impact + Confidence + Ease) / 3`. Sort descending, run top-down. Show the three inputs so the ranking is auditable.

### Experiment design (hypothesis-first)
> We believe **[change]** will move **[metric]** by **[amount]** for **[segment]** because **[reason]**. We'll know it worked when **[success bar]**; we'll kill it if **[guardrail breached]**.
Define the variant vs. control, the **minimum detectable effect** and rough sample, the run length, and a **decision rule** (scale / iterate / kill) *before* launching. Always set a guardrail metric that must not regress.

### Positioning (competitive-alternatives method)
1. List the **competitive alternatives** (incl. "do nothing" / spreadsheet).
2. Isolate **unique attributes** you have and they don't.
3. Translate attributes → **value** the customer cares about.
4. Name the **target segment** that cares most.
5. Frame the **market category** that makes the value obvious.
Output the positioning statement in §2. (Market-truth inputs come from market research; user-truth from user research.)

---

## Channel patterns

**Email / drip**
- Start from the **trigger** (signup, inactivity, cart abandon) and the **goal metric**, not the number of emails.
- Each send has one purpose and one CTA; later sends fire **conditionally** (skip if the goal action is already done).
- Define the **exit/goal-met** condition so users don't get nagged after converting.
- This skill designs the sequence *map*; the email body copy is a separate copywriting concern.

**SEO**
- Target by **search intent** (informational vs. commercial), not just volume.
- Pillar/cluster topical authority; find the **content gap** vs. ranking competitors.
- Separate technical/on-page gating items (schema, site architecture, internal linking) from content needs.

**Launch**
- Three beats: **pre-launch** (build list, tease, seed proof), **launch** (coordinated push across channels in a tight window), **post-launch** (nurture, retarget, iterate on what converted).
- Every phase has an owner and an **exit signal**. Spec the copy assets needed and hand them off to copywriting.

---

## External marketing skills

A 47-skill marketing suite — **coreyhaines31/marketingskills** — covers many of these tactics in depth. **It is NOT installed by default; it must be imported before use.** See `references/marketing-skills-suite.md` for the relevant skills, the import commands, and which map to growth work vs. an adjacent concern. When a request would benefit from a specialized skill (e.g. detailed `ads`, `cro`, `programmatic-seo`), check whether it's been imported; if not, tell the user it needs importing first rather than assuming it's available.

---

## Quality checklist

Before the brief ships:

- [ ] Every tactic ties to an **AARRR stage** and a **named metric** (no "raise awareness").
- [ ] The **binding constraint** (leakiest funnel stage) is identified before tactics.
- [ ] Each experiment/campaign has a **falsifiable hypothesis** and a **success bar**.
- [ ] Experiments are **ICE-ranked** with visible inputs, not a flat list.
- [ ] §7 Measurement Plan has a **primary metric, a guardrail, and a decision rule**.
- [ ] Copy assets are **specced and handed off to copywriting**, not drafted here.
- [ ] Positioning (if present) names the alternative it differentiates against.
- [ ] Any specialized external skill referenced is flagged as **needing import** if not present.
- [ ] The header names a **reader** (`Written for`) and the plan is written in that reader's vocabulary.
- [ ] Every acronym and term of art is **spelled out at first use** and listed in §11 Glossary — growth writing is the most acronym-dense of the lenses, so this check bites hardest here.
- [ ] The **binding constraint is stated in plain terms** ("people sign up but never send their first message"), not as a stage name.
- [ ] Every baseline and target figure has a **"which means" clause**.
- [ ] No cross-reference is a **bare filename** — each names the conclusion the other brief reached.
- [ ] The `In one line` header survives the outsider test: a reader who knows nothing about this product understands the plan.
