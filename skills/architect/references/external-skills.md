# External Marketing Skills (optional, import-required)

A marketing-skills suite — **https://github.com/coreyhaines31/marketingskills** — contains a few skills whose output is useful *input* to a spec. They inform the product definition; they don't replace it.

> ⚠️ **NOT installed by default — must be imported before use.** Architect works fully without them.
> If a request would benefit from one and it hasn't been imported, tell the user it needs importing
> first; do not assume it's available or invent its behavior.

## How to import

```bash
npx skills add coreyhaines31/marketingskills
# or clone and copy the one skill you want:
git clone https://github.com/coreyhaines31/marketingskills
cp -r marketingskills/skills/<skill> ~/.claude/skills/    # or ~/.agents/skills/
```

## Architect-relevant skills (input, not output)

| Skill | Feeds Architect section | What it provides |
|---|---|---|
| `product-marketing` *(foundation)* | §1 Problem Statement, §3 Stories | Creates `.agents/product-marketing.md` — target audience, personas, problems & pain points, differentiation, objections, switching dynamics. Strong raw material for the problem statement and user/persona sections. |
| `marketing-psychology` | §1 Problem framing | Jobs-to-Be-Done, first principles, inversion — problem-framing lenses for *why* users hire the product |
| `pricing` | §6 Scope & packaging | Value-metric, Good-Better-Best, tier structure — when a spec touches monetization or packaging |
| `offers` *(partial)* | §6 / §2 | Value framing and packaging construction |

> **Reference, don't absorb:** `pricing` and `offers` are growth/Treasurer-owned and `product-marketing`/`marketing-psychology` are growth-owned — Architect consumes their output as input to a spec, but the production stays with the owning role. Generate `.agents/product-marketing.md` once and Scout, Strategist, and Architect all benefit.
