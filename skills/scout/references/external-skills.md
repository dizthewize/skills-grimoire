# External Marketing Skills (optional, import-required)

A marketing-skills suite — **https://github.com/coreyhaines31/marketingskills** — contains a few skills that deepen Scout's competitive work.

> ⚠️ **NOT installed by default — must be imported before use.** Scout works fully without them.
> If a request would benefit from one and it hasn't been imported, tell the user it needs importing
> first; do not assume it's available or invent its behavior.

## How to import

```bash
npx skills add coreyhaines31/marketingskills
# or clone and copy the one skill you want:
git clone https://github.com/coreyhaines31/marketingskills
cp -r marketingskills/skills/<skill> ~/.claude/skills/    # or ~/.agents/skills/
```

## Scout-relevant skills

| Skill | Feeds Scout section | What it produces |
|---|---|---|
| `competitor-profiling` | §2 Competitive Landscape (per-player blocks + §2.1 matrix) | Scrapes a competitor's URLs (Firecrawl) + SEO/market data (DataForSEO) into a structured, facts-over-opinions profile doc with an At-a-Glance summary |
| `competitors` *(partial)* | §2 framing only | Builds "vs" / alternative comparison logic — but its **output is a published SEO/sales page**, which is content production (Herald/Strategist). Borrow the framing; route the page out. |
| `product-marketing` *(foundation)* | §2 Positioning inputs | Creates `.agents/product-marketing.md` (differentiation, competitive landscape, switching dynamics) — shared context that sharpens positioning reads |

> **Route, don't absorb:** `competitor-profiling` is Scout's work even though it lives in a marketing repo. `customer-research` from that suite is **Observer's** (user-research), not Scout's — don't pull it in here.
