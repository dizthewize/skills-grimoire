---
name: site-planner
description: "Use after site-discovery to plan the site structure, SEO strategy, and copy brief. Reads docs/product-marketing-context.md, invokes site-architecture, seo-audit, and copywriting skills, then writes docs/site-plan.md. Called by web-studio coordinator (Phase 2) or standalone."
---

# Site Planner

Build the complete site plan from the discovery context. Invokes three specialist skills — site-architecture, seo-audit, and copywriting — and synthesizes their output into `docs/site-plan.md`. This file is the single source of truth for page structure, copy, and SEO consumed by site-designer and site-builder.

## When to Use

- After `site-discovery` has written `docs/product-marketing-context.md`
- Invoked automatically by `/web-studio` Phase 2
- Re-running planning after a change to business details (without full rebuild)
- Updating site structure or copy for an existing site via `update-request=`

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `update-request` | `""` | Free-text description of changes to apply to an existing `docs/site-plan.md`. When provided, reads the existing file and applies only the requested changes rather than generating from scratch. |

## Invocation

```
/site-planner
/site-planner update-request="add a FAQ page, remove the blog"
/site-planner update-request="update the hero headline to focus on commercial clients"
```

---

## Workflow

### Phase 0: Load Context

Read `docs/product-marketing-context.md`. If the file does not exist, stop:

```
Error: docs/product-marketing-context.md not found.
Run /site-discovery first to generate the business context, then re-run /site-planner.
```

If `update-request` is provided, also read `docs/site-plan.md`. If it does not exist, stop:

```
Error: docs/site-plan.md not found.
update-request mode requires an existing site plan. Run /site-planner (without update-request) first.
```

---

### Phase 1: Site Architecture

Invoke `/site-architecture` with the full contents of `docs/product-marketing-context.md` as context.

The site-architecture skill must produce:

- **Page hierarchy** — complete ASCII tree of all pages and their URLs
- **URL map** — each page with its canonical URL
- **Nav structure** — primary nav items and any dropdown structure
- **Internal linking plan** — key cross-page link relationships
- **3-click rule** — verify no content is more than 3 clicks from the homepage

**For service sites**, the standard page structure is:

```
/ (Homepage)
/services (Services overview)
  /services/[service-slug] (one page per service)
/about
/contact
/service-areas
  /service-areas/[city-slug] (optional — city landing pages for local SEO)
```

Additional pages based on industry norms (e.g., `/gallery` for contractors, `/pricing` for SaaS).

Collect the output for synthesis in Phase 4.

---

### Phase 2: SEO Strategy

Invoke `/seo-audit` in pre-build planning mode with `docs/product-marketing-context.md` as context.

The seo-audit skill must produce:

- **Local keyword strategy** — primary keyword cluster per page (e.g., "flooring contractor [city]", "hardwood floor installation [city]")
- **Title tag** — recommended `<title>` value per page (under 60 chars)
- **Meta description** — recommended `<meta name="description">` per page (under 160 chars)
- **H1 target** — the primary heading keyword per page
- **Schema markup plan** — LocalBusiness JSON-LD for homepage, Service schema for service pages
- **Core Web Vitals targets** — LCP, CLS, FID targets appropriate for the stack

Collect the output for synthesis in Phase 4.

---

### Phase 3: Copy Brief

Invoke `/copywriting` with `docs/product-marketing-context.md` as context and the page structure from Phase 1.

The copywriting skill must produce, for each page:

- **Headline** — primary H1 (keyword-targeted, benefit-forward)
- **Subheadline** — supporting statement under the headline
- **Hero copy block** — 2–4 sentences for the hero section
- **Section copy** — body copy for each major section on the page

For the **homepage**, also produce:

- **Irresistible offer** — the lead capture headline + urgency line (industry-specific norm)
  - Flooring: "Free In-Home Estimate — No Obligation"
  - Roofing: "Free Roof Inspection + Same-Day Quote"
  - HVAC: "Free Diagnostic — $0 Service Call Fee"
  - Generic: "Free Estimate — Fast Response"
- **3 CTA variants**: primary (value), secondary (urgency), ghost (low-friction)
- **Trust signals copy**: "Licensed & Insured", "Family-owned since [year if known]", job/customer count
- **3 testimonial templates** (structured placeholders with [customer name], [city], [service], [quote])
- **FAQ content** — 5–8 questions and answers common to the industry/trade
- **Service area paragraph** — 2–3 sentences naming key cities, linking to service-area page

For **service pages**, also produce:

- Service-specific headline and benefit statement
- 2-paragraph service description (what it is + why hire a professional)
- 3 bullet-point benefits
- CTA text specific to that service

Collect the output for synthesis in Phase 4.

---

### Phase 4: Synthesize → docs/site-plan.md

Combine all three specialist outputs into a single structured document. Create the `docs/` directory if needed:

```bash
mkdir -p docs
```

Write `docs/site-plan.md`:

```markdown
# Site Plan

Generated by /site-planner from docs/product-marketing-context.md

---

## Page Hierarchy

[ASCII tree from site-architecture output]

---

## URL Map

| Page | URL | Nav? |
|------|-----|------|
| Homepage | / | — |
| Services | /services | Yes |
| [Service name] | /services/[slug] | Dropdown |
| About | /about | Yes |
| Contact | /contact | Yes |
| Service Areas | /service-areas | Yes |

---

## SEO Keyword Map

| Page | Primary Keyword | Title Tag | Meta Description |
|------|----------------|-----------|-----------------|
| Homepage | [keyword] | [title] | [description] |
| [page] | [keyword] | [title] | [description] |

---

## Schema Markup Spec

- **Homepage:** LocalBusiness JSON-LD
  ```json
  {
    "@type": "LocalBusiness",
    "name": "[business name]",
    "telephone": "[phone]",
    "address": { "@type": "PostalAddress", "addressLocality": "[city]" },
    "areaServed": [[city list]],
    "url": "[domain or TBD]"
  }
  ```
- **Service pages:** Service schema (type, name, description, areaServed)

---

## Copy Brief

### Homepage

**H1:** [headline]
**Subheadline:** [subheadline]

**Hero copy:**
[hero paragraph]

**Irresistible Offer:**
[offer headline]
[urgency line]

**CTAs:**
- Primary: [text]
- Urgency: [text]
- Ghost: [text]

**Services Grid** (from site-plan):
[section intro copy]

**Trust Signals:**
[trust signals copy]

**Testimonials:**
1. "[quote]" — [Customer Name], [City] ([Service])
2. "[quote]" — [Customer Name], [City] ([Service])
3. "[quote]" — [Customer Name], [City] ([Service])

**FAQ:**
Q: [question]
A: [answer]
[repeat for all FAQs]

**Service Area:**
[service area paragraph]

**Final CTA:**
[final CTA headline + CTA button text]

---

### Services Overview Page

**H1:** [headline]
**Copy:** [intro paragraph]
[services grid intro]

---

### [Service Name] Page

**H1:** [headline]
**Benefit statement:** [subheadline]
**Copy:**
[paragraph 1]
[paragraph 2]

**Benefits:**
- [benefit 1]
- [benefit 2]
- [benefit 3]

**CTA:** [cta text]

---

[repeat for each service page]

---

### About Page

**H1:** [headline]
**Copy:** [about copy block]
**Owner/Team:** [if applicable]
**Trust signals:** [copy]

---

### Contact Page

**H1:** [headline]
**Intro:** [short intro under headline]
**Business hours:** [hours if available, else "Mon–Fri 8am–6pm"]
**Form CTA button:** [button text]

---

### Service Areas Page

**H1:** [headline]
**Intro:** [service area intro paragraph]
**City list:** [list from product-marketing-context.md]

---

## Internal Linking Plan

[from site-architecture output]

---

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | ≤ 2.5s |
| CLS | ≤ 0.1 |
| FID / INP | ≤ 200ms |
```

---

### Update Mode

When `update-request` is provided:

1. Read the current `docs/site-plan.md`
2. Classify the request:
   - **Content/Copy changes** → update only the affected Copy Brief sections
   - **Page Structure changes** → update Page Hierarchy, URL Map, SEO table, and Copy Brief for affected pages
   - **Both** → update all affected sections
3. Apply only the requested changes — do not modify unrelated sections
4. Overwrite `docs/site-plan.md` with the updated version
5. Report which sections were changed:

```
docs/site-plan.md updated.
Changes applied:
  ✓ [section name] — [brief description of change]
  ✓ [section name] — [brief description of change]
```

---

### Phase 5: Completion

After writing `docs/site-plan.md`, report:

```
site-planner complete.

Pages planned: [N]
Copy brief written for: [list of pages]
SEO keywords mapped: [N pages]

Written: docs/site-plan.md
```

Return control to web-studio (or report done on standalone invocation).

---

## Error Handling

| Scenario | Action |
|----------|--------|
| `docs/product-marketing-context.md` missing | Stop with specific error, tell user to run `/site-discovery` |
| `docs/site-plan.md` missing in update mode | Stop with specific error, tell user to run `/site-planner` first |
| site-architecture skill not found | Stop. Report: "site-architecture skill not found at skills/site-architecture/SKILL.md." |
| seo-audit skill not found | Stop. Report: "seo-audit skill not found at skills/seo-audit/SKILL.md." |
| copywriting skill not found | Stop. Report: "copywriting skill not found at skills/copywriting/SKILL.md." |
| Copy Integrator produces sparse output | Use industry-standard copy patterns as fallback. Never write lorem ipsum or placeholder text. |

---

## Tips

- Open `docs/site-plan.md` and review it carefully before approving the web-studio checkpoint — this file controls all copy and page structure in the build
- The copy brief section is read directly by site-builder's Copy Integrator research agent — full sentences produce better output than fragments
- For service sites: if you want to add city landing pages for local SEO, mention it in the update-request or at the web-studio checkpoint
