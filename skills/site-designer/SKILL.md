---
name: site-designer
description: "Use after site-planner to design the visual system and component specs. Reads docs/product-marketing-context.md and docs/site-plan.md, invokes ui-ux-pro-max and frontend-design skills, then writes docs/design-system.md. Called by web-studio coordinator (Phase 3) or standalone."
---

# Site Designer

Design the complete visual system for the site. Invokes two specialist skills — ui-ux-pro-max and frontend-design — and synthesizes their output into `docs/design-system.md`. This file defines CSS variables, typography, spacing, component specs, and aesthetic direction consumed by site-builder's research agents.

## When to Use

- After `site-planner` has written `docs/site-plan.md`
- Invoked automatically by `/web-studio` Phase 3
- Re-running design after a change to brand or style direction (without full rebuild)
- Updating visual system for an existing site via `update-request=`

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `update-request` | `""` | Free-text description of design changes to apply to an existing `docs/design-system.md`. When provided, reads the existing file and applies only the requested changes. |

## Invocation

```
/site-designer
/site-designer update-request="change primary color to navy blue"
/site-designer update-request="use a bolder sans-serif font, increase heading size"
/site-designer update-request="make the hero darker, more industrial feel"
```

---

## Workflow

### Phase 0: Load Context

Read both context docs:
- `docs/product-marketing-context.md`
- `docs/site-plan.md`

If either file is missing, stop with a specific error:

```
Error: docs/site-plan.md not found.
Run /site-planner first to generate the site plan, then re-run /site-designer.
```

If `update-request` is provided, also read `docs/design-system.md`. If it does not exist:

```
Error: docs/design-system.md not found.
update-request mode requires an existing design system. Run /site-designer (without update-request) first.
```

---

### Phase 1: UX/UI System

Invoke `/ui-ux-pro-max` with the full context from both docs.

The ui-ux-pro-max skill must produce:

**Color System:**
- `--color-primary` — main brand color (CTA buttons, links, accents)
- `--color-primary-dark` — hover/active state for primary
- `--color-accent` — secondary accent (badges, highlights)
- `--color-bg` — page background
- `--color-surface` — card/section background
- `--color-text` — body text
- `--color-text-muted` — secondary/muted text
- `--color-border` — dividers and outlines
- `--color-success`, `--color-warning`, `--color-error`

**Color sourcing:**
- If brand colors were provided in `docs/product-marketing-context.md` → derive the full system from those
- If "Inferred" → pick an industry-appropriate palette:
  - Flooring / Remodeling: warm neutrals, charcoal, amber accent
  - Roofing: slate gray, deep blue, orange accent
  - Landscaping: forest green, earth brown, cream
  - HVAC / Plumbing: navy, white, orange accent
  - Auto / Mechanic: charcoal, red, white
  - Cleaning: sky blue, white, mint
  - SaaS: varies — default to deep indigo + electric accent

**Typography:**
- `--font-display` — heading font (Google Fonts or system stack)
- `--font-body` — body font
- `--font-mono` — monospace (only for SaaS/tech sites)
- Type scale: `--text-xs` through `--text-6xl` (rem values)
- Line heights and letter-spacing values for headings

**Spacing System:**
- `--space-1` through `--space-16` (4px base, multiples thereof)
- Section vertical padding values (`--section-py`)

**Accessibility:**
- Contrast ratio check: `--color-primary` on `--color-bg` must meet WCAG AA (4.5:1 for text, 3:1 for large text)
- If the chosen primary color fails contrast, adjust lightness/darkness until it passes
- Note pass/fail in output

**Mobile-first interaction patterns:**
- Sticky header scroll behavior spec (height reduction on scroll, background opacity change)
- MobileStickyBar: fixed bottom bar, z-index, safe-area-inset-bottom for iOS
- Click-to-call: all phone number links must be `<a href="tel:...">` — document in the spec
- Touch targets: minimum 44×44px for all interactive elements

Collect the full output for synthesis in Phase 3.

---

### Phase 2: Component Design

Invoke `/frontend-design` with the full context from both docs and the UX/UI system from Phase 1.

The frontend-design skill must produce specs for every component the site needs. At minimum:

**Layout Components:**

| Component | Spec |
|-----------|------|
| `Layout` | Wraps all pages; imports Header, Footer, MobileStickyBar; injects slot/children |
| `Header` | Sticky nav; logo position; nav items; CTA button in header; scroll-shrink behavior; mobile hamburger trigger |
| `Footer` | Column layout; contact info block; service area list; social links; copyright; phone CTA |
| `MobileStickyBar` | Fixed bottom; `md:hidden`; call button + quote button; spacing rules |

**Conversion Components:**

| Component | Spec |
|-----------|------|
| `Button` | Primary, secondary, ghost variants; size variants (sm, md, lg); CSS variable tokens only |
| `LeadCaptureForm` | Fields: Name, Phone, Email, service type dropdown; CTA button; trust micro-copy; honeypot; error states |
| `MobileStickyCTA` | Trigger for lead form or scroll-to-form on mobile |

**Content Section Components:**

| Component | Spec |
|-----------|------|
| `Hero` | Full-width; background image with overlay or gradient; headline + subheadline; primary + secondary CTA; embedded LeadCaptureForm position |
| `IrresistibleOffer` | Offer headline; urgency badge; dual CTA layout |
| `ServicesGrid` | Card grid; icon + name + benefit + CTA per card; responsive column counts |
| `TrustSignalsBar` | Horizontal badges/icons; Licensed & Insured, years in business, customer count |
| `TestimonialsSection` | 3-card layout; quote, name, location, star rating |
| `ServiceAreasSection` | City list or grid; optional service area map placeholder |
| `FAQAccordion` | Expand/collapse; accessible; question + answer |
| `FinalCTA` | Repeated offer + phone link + embedded form |

For each component, the spec must include:
- Layout approach (flex, grid, full-width vs. contained)
- Key CSS classes (Tailwind utility groups)
- Color variable assignments
- Responsive breakpoint behavior
- Any animation or interaction (hover, scroll trigger, expand/collapse)

**Aesthetic Direction:**

Describe the overall visual tone in 3–5 sentences:
- Is it bold and high-contrast, or soft and approachable?
- Photography/imagery style (action shots, before/after, lifestyle, minimal)
- Border radius convention (sharp, medium, rounded)
- Shadow / depth usage (flat, subtle, pronounced)
- Decoration elements (divider shapes, background patterns, gradients)

Collect the full output for synthesis in Phase 3.

---

### Phase 3: Synthesize → docs/design-system.md

Combine both specialist outputs into a single structured document. Create `docs/` if needed.

Write `docs/design-system.md`:

````markdown
# Design System

Generated by /site-designer from docs/product-marketing-context.md + docs/site-plan.md

---

## Color System

```css
:root {
  /* Brand colors */
  --color-primary: [hex];
  --color-primary-dark: [hex];
  --color-accent: [hex];

  /* Backgrounds */
  --color-bg: [hex];
  --color-surface: [hex];

  /* Text */
  --color-text: [hex];
  --color-text-muted: [hex];

  /* UI */
  --color-border: [hex];
  --color-success: [hex];
  --color-warning: [hex];
  --color-error: [hex];
}
```

**Contrast ratios:**
- `--color-primary` on `--color-bg`: [ratio] — [PASS/FAIL WCAG AA]
- `--color-text` on `--color-bg`: [ratio] — [PASS/FAIL WCAG AA]

---

## Typography

```css
:root {
  --font-display: '[font name]', [fallback stack];
  --font-body: '[font name]', [fallback stack];

  /* Type scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
}
```

**Font pairings:** [Display font] for headings — [reasoning]. [Body font] for body text — [reasoning].

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=[DisplayFont]:wght@700;800&family=[BodyFont]:wght@400;500;600&display=swap
```

---

## Spacing System

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  --section-py: 5rem;          /* default section vertical padding */
  --section-py-sm: 3rem;       /* mobile section vertical padding */
  --container-max: 1200px;
  --container-px: 1.5rem;
}
```

---

## Aesthetic Direction

[3–5 sentence description of visual tone, imagery style, border-radius convention, shadow usage, decoration elements]

---

## Component Specs

### Layout

**Header**
- Sticky (`position: sticky; top: 0; z-index: 50`)
- Height: 72px default, shrinks to 56px on scroll (CSS class swap via JS)
- Background: `--color-bg` with `backdrop-blur` when scrolled
- Logo: left-aligned text or image
- Nav: center or right — [from site-plan.md nav structure]
- CTA button: right-aligned, primary variant
- Mobile: hamburger icon at 768px breakpoint; nav collapses to fullscreen overlay

**Footer**
- 3-column layout on desktop, stacked on mobile
- Col 1: business name + tagline + social links
- Col 2: services list (links to service pages)
- Col 3: contact info — address, phone as `<a href="tel:...">`, hours
- Bottom bar: copyright + service areas summary
- Background: `--color-surface` or dark variant

**MobileStickyBar**
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 40`
- `display: md:none` (hidden on desktop)
- `padding-bottom: env(safe-area-inset-bottom)` (iOS notch support)
- Left button: `<a href="tel:...">` call button, primary color
- Right button: "Get Quote" — opens/links to lead capture form
- Height: 60px

---

### Conversion

**Button**
- Primary: `bg-[--color-primary] text-white hover:bg-[--color-primary-dark]`
- Secondary: `border-2 border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary] hover:text-white`
- Ghost: `text-[--color-primary] underline hover:no-underline`
- Sizes: sm (text-sm, px-4 py-2), md (text-base, px-6 py-3), lg (text-lg, px-8 py-4)
- Border radius: [from aesthetic direction]

**LeadCaptureForm**
- Fields in order: Name (text), Phone (tel), Email (email), Service Type (select dropdown)
- Service type options derived from site-plan.md services list
- Submit button: primary, full-width, lg size — "[CTA button text from copy brief]"
- Trust micro-copy below button: "Licensed & Insured · Fast Response · No Obligation"
- Honeypot: `<input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off">`
- Error state: red border + `--color-error` helper text below each invalid field

---

### Content Sections

**Hero**
- Full-width, min-height: `100vh` on desktop, `80vh` on mobile
- Background: image with dark overlay (`rgba(0,0,0,0.5)`) or gradient using `--color-primary`
- Content: max-width container, centered or left-aligned
- Headline: `--font-display`, `--text-5xl` / `--text-6xl`
- Subheadline: `--font-body`, `--text-xl`, `--color-text-muted` variant for dark bg
- CTA row: primary button + secondary button, gap-4
- Form: embedded `LeadCaptureForm`, right column on desktop (split layout), below headline on mobile

**ServicesGrid**
- 3-column grid on desktop, 2-column tablet, 1-column mobile
- Each card: border `--color-border`, `--color-surface` bg, rounded
- Card contents: icon (emoji or SVG), service name (h3), one-line benefit, "Learn More →" link to service page

**TrustSignalsBar**
- Horizontal flex row, centered, `--color-surface` bg, `--section-py` vertical padding halved
- 3–5 badges: icon + label pairs
- Default badges: "Licensed & Insured", "Family-Owned", "[N]+ Happy Customers", "[N]+ Years Experience"

**TestimonialsSection**
- 3-card grid, same responsive breakpoints as ServicesGrid
- Each card: quote text (italic), customer name (bold), city + service (muted), star rating (5 stars)
- Background: `--color-surface` or alternate section bg

**FAQAccordion**
- Vertical list; each item: question row (clickable, chevron icon) + answer panel (collapsible)
- Accessible: `aria-expanded`, `aria-controls`, keyboard navigation
- Border bottom on each item, no card borders

**FinalCTA**
- Full-width, `--color-primary` background or gradient
- Headline + CTA button + `<a href="tel:...">` phone link
- Embedded `LeadCaptureForm` below or beside (split layout on desktop)

---

## Image Brief

Describes images needed for the build. Agent 7 (Image Planner) reads this section to generate `image-manifest.json`.

| Filename | Purpose | Dimensions | Alt text | Prompt notes |
|----------|---------|------------|----------|--------------|
| `hero-bg` | Hero section background | 1920×1080 | [descriptive alt] | [photorealistic prompt based on industry] |
| `og-image` | Social sharing image | 1200×630 | [business name] | Derived from hero-bg |
| `service-[slug]` | Service page header | 800×600 | [service name alt] | [trade-specific prompt] |
| `about-team` | About page | 800×600 | [team/owner alt] | Professional, warm, [industry] setting |

Add rows for each service page listed in `docs/site-plan.md`.

All images:
- `responsiveVariants: true` for images wider than 300px
- Output format: WebP
- Quality target: 85

---

## Accessibility Checklist

- [ ] Color contrast: all text/background combos meet WCAG AA
- [ ] Touch targets: all interactive elements ≥ 44×44px
- [ ] Focus indicators: visible on all focusable elements
- [ ] Phone links: all `<a href="tel:...">`, never plain text
- [ ] Form labels: all form fields have associated `<label>`
- [ ] Images: all `<img>` have descriptive `alt` attributes
- [ ] Accordion: `aria-expanded`, `aria-controls` on all FAQ items
- [ ] Mobile sticky bar: not present on desktop (`md:hidden`)
````

---

### Update Mode

When `update-request` is provided:

1. Read the current `docs/design-system.md`
2. Classify the request:
   - **Color changes** → update Color System section and any component specs that reference specific colors
   - **Typography changes** → update Typography section
   - **Layout/component changes** → update the affected Component Specs subsection
   - **Aesthetic direction changes** → update Aesthetic Direction and affected component specs
3. Apply only the requested changes — do not modify unrelated sections
4. Overwrite `docs/design-system.md` with the updated version
5. Report which sections were changed:

```
docs/design-system.md updated.
Changes applied:
  ✓ [section name] — [brief description of change]
```

---

### Phase 4: Completion

After writing `docs/design-system.md`, report:

```
site-designer complete.

Colors: [primary hex] / [accent hex]
Fonts: [display font] / [body font]
Components: [N] specs written
Images: [N] image brief entries

Written: docs/design-system.md
```

Return control to web-studio (or report done on standalone invocation).

---

## Error Handling

| Scenario | Action |
|----------|--------|
| `docs/product-marketing-context.md` missing | Stop. Tell user to run `/site-discovery` first. |
| `docs/site-plan.md` missing | Stop. Tell user to run `/site-planner` first. |
| `docs/design-system.md` missing in update mode | Stop. Tell user to run `/site-designer` first. |
| ui-ux-pro-max skill not found | Stop. Report: "ui-ux-pro-max skill not found at skills/ui-ux-pro-max/SKILL.md." |
| frontend-design skill not found | Stop. Report: "frontend-design skill not found at skills/frontend-design/SKILL.md." |
| Brand colors provided but fail WCAG AA contrast | Adjust lightness until WCAG AA is met. Note the adjustment in the design system. |
| Color change update request scoped to a named section | Treat it as a design-category change — update `--color-primary` / `--color-accent` to match the requested section's visual intent, then update all component specs that use those variables. |

---

## Tips

- The Image Brief section of `docs/design-system.md` is read by Agent 7 (Image Planner) — the more specific the prompt notes, the better the generated images
- For service sites without brand colors: trust the industry-appropriate defaults — they are battle-tested combinations
- The Aesthetic Direction paragraph sets the tone for all of site-builder's component implementation — write it in concrete visual terms, not abstract ones
- You can update just the color palette with `/site-designer update-request="change primary color to [color]"` without redoing the full design
