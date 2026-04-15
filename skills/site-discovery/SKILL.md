---
name: site-discovery
description: "Use to run the intake Q&A for a new website. Asks minimal questions, infers industry norms, and writes docs/product-marketing-context.md. Called by web-studio coordinator (Phase 1) or standalone for fresh discovery without a full build."
---

# Site Discovery

Run the intake interview for a new website project. Asks the fewest questions possible — industry and site type determine defaults, so only genuinely unknowable details are asked. Writes `docs/product-marketing-context.md` as the shared context file consumed by all downstream skills.

## When to Use

- Starting a new site and need to capture business context
- Invoked automatically by `/web-studio` Phase 1
- Re-running discovery to update context without rebuilding the full site

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `site-type` | `ask` | Pre-set site type: `service`, `saas`, `ecommerce`, `blog`, `portfolio`, `landing` |
| `industry` | `ask` | Pre-set industry for service sites: `flooring`, `roofing`, `landscaping`, `hvac`, `plumbing`, `remodeling`, `cleaning`, `painting`, `auto`, `other` |

## Invocation

```
/site-discovery
/site-discovery site-type=service
/site-discovery site-type=service industry=flooring
```

---

## Workflow

### Phase 1: Universal Questions

Ask these questions to every user regardless of site type. Ask them one at a time in sequence — do not batch.

**Q1: Business name**

```
Do you have a business name? (optional — press Enter to skip and I'll suggest some)
```

**If name provided:** store it and continue.

**If skipped (empty response):** after Phase 2 is complete and you know the trade and city, generate 3–5 name options in three styles:

| Style | Example |
|-------|---------|
| Location-based | "Dixon Flooring Co." |
| Descriptive | "Premier Floors & Install" |
| Brandable/memorable | "FloorCraft Co." |

Present them:

```
Here are 5 business name suggestions based on your trade and city:

1. [Location-based option]
2. [Location-based option]
3. [Descriptive option]
4. [Brandable option]
5. [Brandable option]

Pick a number, type your own, or say "more options" to see a fresh set.
```

**STOP — wait for the user's response.**

---

**Q2: Site type**

**Skip if `site-type` parameter was provided.**

```
What type of site is this?

1. Service-based business (contractor, tradesperson, local service)
2. SaaS / web app
3. E-commerce / online store
4. Blog / content site
5. Portfolio
6. Landing page
```

**STOP — wait for response.** Store the choice. Map to internal values: `service`, `saas`, `ecommerce`, `blog`, `portfolio`, `landing`.

---

**Q3: City / region**

```
What city or region is the business based in? (used for local SEO + branding)
```

**STOP — wait for response.**

---

### Phase 2: Type-Specific Branch

Run the branch that matches the site type from Phase 1.

---

#### Phase 2A — Service-Based Business

Ask these 5 questions only. Everything else is inferred by site-planner and site-designer.

**Q4: Trade / industry**

**Skip if `industry` parameter was provided.**

```
What trade or industry?

1. Flooring
2. Roofing
3. Remodeling / General Contractor
4. Landscaping / Lawn Care
5. HVAC
6. Plumbing
7. Electrical
8. Auto / Mobile Mechanic
9. Cleaning / Maid Service
10. Painting
11. Other — describe it
```

**STOP — wait for response.** If "Other", ask for a one-line description.

---

**Q5: Phone number**

```
What's the primary contact phone number?
```

**STOP — wait for response.**

---

**Q6: Service areas**

```
What cities or areas do you serve? (list as many as you want)
```

**STOP — wait for response.**

---

**Q7: Brand colors**

```
Do you have brand colors? (hex codes, color names, or describe the vibe)
Press Enter to skip — I'll pick industry-appropriate colors.
```

**STOP — wait for response.** Mark as `provided` or `inferred`.

---

**Q8: Reference sites**

```
Any competitor or reference sites you admire? (optional — paste URLs or describe)
Press Enter to skip.
```

**STOP — wait for response.**

---

The following are **NOT asked** for service sites — they are inferred by site-planner and site-designer:

- Services list (derived from trade/industry)
- Lead capture offer (recommended per trade norms)
- Copy tone (industry-appropriate — contractors: bold/direct; landscaping: friendly/local)
- Trust signals (licensed & insured, years in business, etc.)
- Color palette (when no brand colors provided: industry-appropriate defaults)
- Page structure (site-planner recommends)
- Urgency copy (site-planner recommends)

---

#### Phase 2B — SaaS / Web App

Ask these questions:

**Q4:** Who is your target user persona? (role, company size, problem they have)

**Q5:** What's the pricing model? (free, freemium, subscription — monthly/annual)

**Q6:** Top 3 differentiators vs. alternatives?

**Q7:** Is there a free trial or free tier?

**Q8:** What key integrations matter to your users? (Slack, Stripe, etc.)

**Q9:** Primary CTA goal: sign-up, book demo, or start free trial?

Ask one at a time. **STOP after each question.**

---

#### Phase 2C — E-Commerce

Ask these questions:

**Q4:** Describe your product catalog (types, count, categories).

**Q5:** Payment processor preference (Stripe, PayPal, Shopify Payments, other)?

**Q6:** Do you need shipping / fulfillment integration?

**Q7:** How many product collections or categories?

**Q8:** Any existing product photography or brand assets?

Ask one at a time. **STOP after each question.**

---

#### Phase 2D — Blog / Portfolio / Landing Page

Ask these questions:

**Q4:** What is the primary purpose of the site? (describe in one sentence)

**Q5:** Who is the audience?

**Q6:** What's the single most important action a visitor should take?

**Q7:** Do you have existing content, or does copy need to be written from scratch?

Ask one at a time. **STOP after each question.**

---

### Phase 3: Tech Decisions

Ask regardless of site type.

**Q: Frontend stack**

```
Frontend stack preference? (I'll recommend based on your site type — you can override)

Recommended: [Astro for service/blog/portfolio, Next.js for SaaS/e-commerce]

1. Accept recommendation — [Astro / Next.js]
2. Astro (static-first, great for service sites + blogs)
3. Next.js (full-stack, great for SaaS + e-commerce)
4. Other — specify
```

**STOP — wait for response.**

---

**Q: Authentication**

```
Does the site need user authentication?

1. No
2. Yes — Supabase Auth (recommended)
3. Yes — other (specify)
```

**STOP — wait for response.**

---

**Q: Database / backend**

**Skip if auth answer was "No" and site type is `service`, `blog`, `portfolio`, or `landing`.**

```
Does the site need a database or backend?

1. No
2. Yes — Supabase (recommended — pairs with Supabase Auth)
3. Yes — other (specify)
```

**STOP — wait for response.**

---

**Q: Deployment platform**

```
Where should the site be deployed?

1. Netlify via GitHub integration (default — free, automatic deploys)
2. Vercel (great for Next.js — requires a Vercel token)
3. Decide later
```

**STOP — wait for response.**

---

### Phase 4: Write Output

Create the `docs/` directory if it does not exist:

```bash
mkdir -p docs
```

Write `docs/product-marketing-context.md` using all captured information. The file must include every section below, populated from user answers and inferred values:

```markdown
# Product & Marketing Context

## Business
- **Name:** [business name]
- **Site Type:** [service | saas | ecommerce | blog | portfolio | landing]
- **Industry / Trade:** [industry or "N/A"]
- **City / Region:** [location]

## Contact
- **Phone:** [phone number or "N/A"]
- **Service Areas:** [list of cities/regions or "N/A"]

## Site Goals
- **Primary CTA:** [book a quote / sign up / buy now / etc.]
- **Lead Capture Offer:** [inferred from industry — e.g. "Free Estimate"]
- **Target Audience:** [inferred or stated]

## Brand
- **Colors:** [provided hex codes / "Inferred — industry-appropriate palette" + describe direction]
- **Reference Sites:** [URLs or descriptions, or "None provided"]
- **Copy Tone:** [inferred from industry — e.g. "Bold and direct. Confidence-forward. Local."]

## Tech
- **Stack:** [Astro | Next.js | other]
- **Auth:** [None | Supabase Auth | other]
- **Database:** [None | Supabase | other]
- **Deploy:** [Netlify | Vercel | TBD]

## Service-Based Business Details
*(include only for service sites)*
- **Trade:** [flooring | roofing | etc.]
- **Services:** [inferred list — e.g. "Hardwood installation, LVP install, tile, carpet, refinishing"]
- **Trust Signals:** [inferred — e.g. "Licensed & Insured, Family-owned, 10+ years experience"]

## SaaS / Product Details
*(include only for SaaS sites)*
- **Persona:** [description]
- **Pricing Model:** [description]
- **Differentiators:** [list]
- **Trial / Free Tier:** [yes/no + details]
- **Key Integrations:** [list]
```

**Inferred values:** For service sites where brand colors, services list, trust signals, or copy tone were not explicitly provided, populate from industry knowledge. Note what was inferred vs. what was stated.

---

### Phase 5: Confirmation

After writing the file, present a summary to the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  site-discovery — Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business: [name]
Type: [type] | Industry: [industry]
City: [location]
Stack: [framework] | Deploy: [platform]

Inferred (not asked):
  ✦ Services: [comma-separated list]
  ✦ Lead offer: [offer]
  ✦ Tone: [copy tone]
  ✦ Colors: [description or "Using provided colors"]

Written: docs/product-marketing-context.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Anything to adjust? (or press Enter to continue)
```

**STOP — wait for response.**

| Response | Action |
|----------|--------|
| Empty / "no" / "looks good" | Complete — return control to web-studio or report done |
| Adjustment request | Apply the change, rewrite the file, re-display summary |

---

## Error Handling

| Scenario | Action |
|----------|--------|
| `docs/` directory not writable | Stop. Report: "Cannot write to docs/. Check permissions." |
| User skips city/region | Proceed without it, note "Service areas: TBD" in output file |
| User skips phone number | Proceed. Note "Phone: TBD" in output file. site-builder will use a placeholder. |
| Industry is "Other" with vague description | Ask one follow-up: "What kind of customers does this business serve, and what's the main service?" |

---

## Tips

- Service sites only need 5 real answers — the skill infers the rest from the trade
- Brand colors are optional; the skill picks industry-appropriate defaults if skipped
- The business name is optional; the skill generates name options if skipped
- `docs/product-marketing-context.md` is human-readable — review it before approving the web-studio checkpoint
