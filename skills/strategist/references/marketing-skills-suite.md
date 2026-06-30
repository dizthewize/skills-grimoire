# External Marketing Skills Suite

A 47-skill marketing suite by Corey Haines that deepens many of Strategist's tactics.
Repo: **https://github.com/coreyhaines31/marketingskills**

> ⚠️ **These skills are NOT installed by default — they must be imported before they can be used.**
> Strategist works without them; they're optional depth. If a request would benefit from one and it
> hasn't been imported, tell the user it needs importing first — do **not** assume it's available or
> invent its behavior.

## How to import

Any one of:

```bash
# CLI installer (adds to the agent's skills dir)
npx skills add coreyhaines31/marketingskills

# Or clone and copy into the skills directory
git clone https://github.com/coreyhaines31/marketingskills
cp -r marketingskills/<skill> ~/.claude/skills/      # or ~/.agents/skills/
```

Also installable via the Claude Code plugin system, a git submodule, or SkillKit (multi-agent). After importing, the skill appears in the available-skills list and can be invoked normally.

## Foundation file (read this first)

Most suite skills look for a shared context doc — **`.agents/product-marketing.md`** (or `.claude/product-marketing.md`) — and read it before asking questions. The suite's **`product-marketing`** skill creates it. If you import the suite, generate this file first; every other skill (and Strategist's own briefs) gets sharper for it. Strategist can also point Observer/Scout findings into it.

## Which skills produce which Strategist brief section

These are the high-value ones — verified by reading their SKILL.md. Each is a *deep-dive engine* for a section Strategist's template already scaffolds. Use Strategist for the integrated plan; invoke the imported skill when one section needs depth.

| Brief section | Imported skill | What it produces |
|---|---|---|
| §3 Campaign / Launch Plan | `launch` | Full launch plan via the ORB framework (owned/rented/borrowed channels), phased |
| §4 Email Sequence / Drip | `emails` | Sequence design — type, trigger, per-email purpose/goal (also drafts copy → that part is Herald's) |
| §5 SEO Plan | `seo-audit` → `programmatic-seo`, `schema`, `ai-seo` | Technical + on-page audit and prioritized fixes; scaled page templates; structured data |
| §6 Growth Experiments | `ab-testing` | Hypothesis-driven test design, single-variable rigor, pre-set sample size, ICE-ranked backlog |
| §2 Strategy & Positioning | `offers`, `marketing-psychology` | Offer construction (value stack, guarantee, scarcity); behavioral-science angles |
| §1/§2 Funnel & conversion (Activation) | `cro`, `onboarding`, `signup`, `popups`, `paywalls`, `lead-magnets`, `free-tools` | Page/flow conversion diagnosis and fixes; top-of-funnel capture assets |
| §1/§2 Funnel (Retention / Referral / Revenue) | `churn-prevention`, `referrals`, `community-marketing` | Cancel/save flows + dunning (Retention/Revenue); referral & affiliate loops (Referral); community flywheel |
| §4 Lifecycle (non-email) | `sms` | SMS/MMS flows + compliance (TCPA/10DLC) — the SMS analog of §4 |
| §2/§3 Earned & partner channels | `co-marketing`, `public-relations`, `directory-submissions`, `prospecting` | Partner campaigns; PR/journalist pitches; directory + Product Hunt submissions; outbound lead sheets |
| §5 SEO (extended) | `ai-seo`, `schema`, `site-architecture`, `aso` | Answer-engine optimization; JSON-LD structured data; sitemap/hierarchy (ASCII + Mermaid); app-store optimization |
| §7 Measurement Plan | `analytics` | Tracking plan — GA4 events, UTM conventions, object-action naming |
| §2 Channel strategy (paid) | `ads`, `ad-creative` | Paid campaign structure; platform-compliant ad copy variations |
| §2/§6 Ideation | `marketing-ideas`, `marketing-psychology` | Categorized growth-idea lists; behavioral-science / mental-model lenses |

> **Overlap with Strategist's own sections:** `launch`, `emails`, and `ab-testing` cover the *same* ground as §3/§4/§6 — they're the depth version. For a quick integrated brief, Strategist's template is enough; reach for the imported skill when that one section is the whole job.
>
> **`marketing-plan` is a near-superset of the whole brief.** It outputs a 13-section, AARRR-framed, Notion-paste-ready markdown plan and cross-references the other suite skills. If imported and the user wants a *full* marketing plan (not a focused brief), prefer `marketing-plan` over re-deriving it in Strategist's template — or use Strategist for the strategy spine and let `marketing-plan` expand it.
>
> **Copy-producing skills bleed into Herald's lane.** `ad-creative`, `cold-email`, and the RSA output of `ads`/the email bodies in `emails` generate *finished copy*. Strategist may invoke them for structure, but treat the actual words as Herald's deliverable per the routing rules.

## Strategist-relevant skills (import these for growth depth)

Grouped by Strategist's duties. Reach for one when the brief needs more than the in-template structure.

**Strategy & planning**
- `marketing-plan` — comprehensive marketing plans
- `marketing-ideas` — idea generation for SaaS growth
- `product-marketing` — product-marketing context doc (foundation skill many others build on)
- `offers` — offer design, value framing, positioning
- `marketing-psychology` — behavioral-science principles applied to marketing

**Acquisition & funnels**
- `ads` · `ad-creative` — paid acquisition across Google/Meta/LinkedIn/X
- `cro` — page/form conversion optimization
- `signup` · `onboarding` — registration → activation → time-to-value
- `popups` · `paywalls` — in-app conversion surfaces
- `lead-magnets` · `free-tools` — top-of-funnel capture
- `directory-submissions` · `co-marketing` · `public-relations` · `community-marketing` — earned/partner channels
- `prospecting` · `cold-email` — outbound

**Email & lifecycle**
- `emails` — sequences, drip, lifecycle flows
- `sms` — SMS/MMS campaigns
- `churn-prevention` — cancellation flows, save offers, payment recovery
- `referrals` — referral/affiliate programs

**SEO & launch**
- `seo-audit` · `ai-seo` · `programmatic-seo` · `schema` · `site-architecture` — search acquisition
- `launch` — launch & feature-announcement planning
- `aso` — app-store optimization

**Experiments & measurement**
- `ab-testing` — experiment design and programs
- `analytics` — tracking setup and audit

## Overlaps — route, don't absorb

Some suite skills belong to other fleet roles. If imported, prefer the owning role:

| Suite skill | Belongs to |
|---|---|
| `copywriting`, `copy-editing`, `content-strategy`, `social`, `image`, `video` | **Herald** (content) |
| `customer-research` | **Observer** (user-research) |
| `pricing`, `revops`, `sales-enablement` | **Treasurer** (revenue) / sales |
| `competitors`, `competitor-profiling` | **Scout** (market-research) |

Strategist may *reference* these for strategy, but the production/analysis belongs to the owning role.
