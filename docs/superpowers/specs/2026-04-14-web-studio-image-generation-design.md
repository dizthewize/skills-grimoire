# Design Spec: Web Studio Image Generation
**Date:** 2026-04-14
**Project:** `/mnt/c/Users/tez/projects/skills-grimoire`

---

## Problem

The web-studio pipeline produces sites with no real images — hero sections use CSS gradients, service cards use placeholder divs. The result looks incomplete and unprofessional out of the box.

---

## Solution

Integrate AI image generation (Nano Banana / Gemini API) as the primary image source, with Pexels stock photo fetching as a graceful fallback. Images are generated after scaffold (Phase B1.5) so all subsequent build phases reference real file paths. The `seo-images` skill is extended with a `generate` command that handles the Pexels fallback path and feeds results through its existing optimization pipeline.

---

## Architecture

```
site-designer
  → writes "Image Brief" section to docs/design-system.md
    (one entry per image: prompt, Pexels query, dimensions, alt text)

site-builder Phase R
  → Agent 7: Image Planner reads Image Brief
  → writes .web-studio/image-manifest.json

site-builder Phase B1.5  [NEW — between B1 scaffold and B2 components]
  → reads image-manifest.json
  → credential check from project .env:
      NANOBANANA_API_KEY / NANOBANANA_GEMINI_API_KEY / GEMINI_API_KEY
        → Nano Banana generates each image (photorealistic)
      PEXELS_API_KEY (no Nano Banana key found)
        → /seo-images generate fetches + optimizes each image
      Neither key found
        → skip, CSS fallbacks, note in final report
  → all images → public/assets/images/ as optimized WebP
  → seo-images optimization runs on every image (IPTC, responsive variants)
  → writes public/assets/images/CREDITS.md (Pexels attribution)
  → commits: feat: generate site images (N images via [source])

Phases B2–B7
  → components reference /assets/images/{filename}.webp
  → no placeholders, no CSS-only backgrounds

seo-images skill
  → new /seo images generate command
    (Pexels search → download → resize → WebP + IPTC → responsive variants)
```

---

## Files Changed

| File | Change |
|------|--------|
| `skills/site-designer/SKILL.md` | Add Image Brief section to Phase 3 output template |
| `skills/site-builder/SKILL.md` | Add Phase B1.5, Agent 7, `start-at=images`, `.env.example` keys, state schema update |
| `skills/site-builder/references/agent-prompts.md` | Add Agent 7: Image Planner prompt |
| `~/.claude/skills/seo-images/SKILL.md` | Add `/seo images generate` command |

---

## Image Package (Full Site — Option C)

### Service-Based Trade Sites

| Filename | Dimensions | Usage | Notes |
|----------|-----------|-------|-------|
| `hero-bg.webp` | 1920×1080 | Hero section background | CSS overlay applied in component |
| `service-{slug}.webp` | 800×600 | One per service card | Dynamic — one per service in site-plan.md |
| `about-team.webp` | 800×600 | About page / team section | |
| `testimonial-avatar-{1-3}.webp` | 200×200 | Reviewer photos | No responsive variants |
| `og-image.webp` | 1200×630 | og:image meta tag on all pages | Same prompt as hero-bg |

Service image count is dynamic. Agent 7 reads the services list from `site-plan.md` and produces one manifest entry per service.

### SaaS Sites
Hero background (abstract tech), one feature image per key feature, OG image.

### E-commerce Sites
Hero lifestyle shot, OG image. Product images assumed client-supplied.

---

## Phase B1.5: Image Generation

```
1. Read .web-studio/image-manifest.json

2. Credential check (from project .env):
   Priority: NANOBANANA_API_KEY → NANOBANANA_GEMINI_API_KEY → GEMINI_API_KEY

   a. Nano Banana key found:
      → generate each image via Nano Banana (style=photorealistic)
      → save raw output to public/assets/images/{filename}.png
      → run seo-images optimization on each file

   b. No Nano Banana key, PEXELS_API_KEY found:
      → log: "Nano Banana key not found — using Pexels stock photos (fallback)"
      → for each image: invoke /seo images generate with pexels_query from manifest
      → outputs land in public/assets/images/ as WebP (handled by seo-images)

   c. Neither key found:
      → log warning with both missing key names and where to obtain them
      → skip image generation entirely
      → B2–B7 use CSS gradient placeholders
      → final report includes resume instructions

3. Per-image failure handling:
   → log failure (filename + error message)
   → continue with remaining images
   → CSS placeholder for that specific image only
   → list all failures in B1.5 summary

4. Update .web-studio/state.json:
   { "lastCompletedPhase": "images", "imagesGenerated": N, "imagesFailed": N }

5. Commit:
   feat: generate site images (N images via [nano-banana|pexels|skipped])
```

### Resume Point
`start-at=images` is a valid value for site-builder's `start-at` parameter. Allows re-running just the image phase after adding a missing API key without rebuilding the whole site.

---

## Agent 7: Image Planner

**Type:** `general-purpose`
**Condition:** Always runs (needed for both Nano Banana and Pexels paths)
**Output:** `.web-studio/image-manifest.json`

Reads:
- `docs/design-system.md` — Image Brief section + Aesthetic Brief
- `docs/product-marketing-context.md` — business name, city, industry, services list
- `docs/site-plan.md` — services list with slugs

Produces a JSON manifest:

```json
{
  "images": [
    {
      "filename": "hero-bg",
      "prompt": "professional flooring contractor installing hardwood floors in modern home — cinematic, natural light, no text",
      "pexels_query": "flooring contractor installation professional",
      "dimensions": { "width": 1920, "height": 1080 },
      "usage": "hero-background",
      "alt": "Premier Floors — flooring contractor serving Sacramento",
      "htmlRef": "/assets/images/hero-bg.webp",
      "responsiveVariants": true
    },
    {
      "filename": "service-hardwood-flooring",
      "prompt": "professional hardwood floor installation in progress — clean, well-lit",
      "pexels_query": "hardwood floor installation professional",
      "dimensions": { "width": 800, "height": 600 },
      "usage": "service-card",
      "alt": "Hardwood flooring installation by Premier Floors",
      "htmlRef": "/assets/images/service-hardwood-flooring.webp",
      "responsiveVariants": true
    },
    {
      "filename": "testimonial-avatar-1",
      "prompt": "professional portrait, smiling, natural light, plain background — no text, no logo",
      "pexels_query": "professional portrait smiling person",
      "dimensions": { "width": 200, "height": 200 },
      "usage": "testimonial-avatar",
      "alt": "Customer review photo",
      "htmlRef": "/assets/images/testimonial-avatar-1.webp",
      "responsiveVariants": false
    }
  ]
}
```

---

## `site-designer` — Image Brief Section

Added at the end of `docs/design-system.md` during Phase 3 (Write Output). Written inline using already-available context: industry, business name, city, services list, aesthetic brief, site type.

````markdown
## Image Brief

> Consumed by site-builder Agent 7 (Image Planner) to produce the image manifest.
> Prompts written for Nano Banana (photorealistic). Pexels queries are fallback search terms.

### Hero Background
- **Filename:** `hero-bg`
- **Dimensions:** 1920×1080
- **Prompt:** "[trade] professional working on a job in [city] — cinematic, natural light,
  shallow depth of field, no text"
- **Pexels query:** "[trade] contractor professional working"
- **Alt text:** "[Business name] — [trade] contractor serving [city]"
- **Usage:** Hero section full-width background, darkened overlay applied in CSS

### Service Images
[One entry per service from site-plan.md]
- **Filename:** `service-{slug}`
- **Dimensions:** 800×600
- **Prompt:** "professional [service name] work in progress — clean, well-lit, high quality"
- **Pexels query:** "[service name] professional"
- **Alt text:** "[Service name] by [Business name]"
- **Usage:** Service card image

### About / Team
- **Filename:** `about-team`
- **Dimensions:** 800×600
- **Prompt:** "[trade] contractor or small team on a job site — approachable, professional,
  branded workwear"
- **Pexels query:** "[trade] contractor team professional"
- **Alt text:** "The [Business name] team"
- **Usage:** About page hero or team section

### Testimonial Avatars
[3 entries: testimonial-avatar-1, -2, -3]
- **Filename:** `testimonial-avatar-{N}`
- **Dimensions:** 200×200
- **Prompt:** "professional portrait, smiling, natural light, plain background — no text, no logo"
- **Pexels query:** "professional portrait smiling person"
- **Alt text:** "Customer review photo"
- **Usage:** Testimonial card reviewer photo
- **Note:** No responsive variants — single 200×200 WebP only

### OG / Social Sharing Image
- **Filename:** `og-image`
- **Dimensions:** 1200×630
- **Prompt:** Same as hero-bg prompt
- **Pexels query:** Same as hero-bg query
- **Alt text:** "[Business name] — [trade] contractor in [city]"
- **Usage:** og:image meta tag on all pages
````

---

## `seo-images` — New Generate Command

### Invocation

```
/seo images generate "<prompt>" [--query="<pexels search terms>"]
                                [--width=<px>] [--height=<px>]
                                [--output="<path>"]
                                [--alt="<alt text>"]
                                [--credit="<business name>"]
```

### Workflow

```
1. Read PEXELS_API_KEY from .env or environment
   → if missing: stop with error message + https://www.pexels.com/api/ signup link

2. Search Pexels:
   GET https://api.pexels.com/v1/search
     ?query={--query}
     &per_page=5
     &orientation={landscape|square|portrait — inferred from width:height ratio}
     &size=large
   Authorization: {PEXELS_API_KEY}

3. Pick best result:
   → first result (Pexels relevance-ranks by default)
   → if zero results: drop last word from query, retry once
   → if still zero: report failure, return null — caller handles fallback

4. Download at appropriate resolution:
   → use src2x or original field depending on target dimensions

5. Resize to exact target dimensions (ImageMagick):
   convert {temp} -resize {width}x{height}^ -gravity Center -extent {width}x{height} {temp}

6. Convert to WebP + inject IPTC metadata:
   cwebp -q 82 -metadata all {temp} -o {output}.webp
   exiftool -IPTC:Caption-Abstract="{alt}"
            -IPTC:Credit="{credit}"
            -IPTC:CopyrightNotice="Copyright {year} {credit}"
            -XMP:Description="{alt}"
            -XMP:Creator="{credit}"
            {output}.webp

7. Generate responsive variants (skip if width ≤ 300px):
   400w → {output}-400w.webp
   800w → {output}-800w.webp
   1200w → {output}-1200w.webp

8. Append to CREDITS.md in same directory:
   | {filename} | {photographer name} | {pexels photo URL} |

9. Return:
   { path: "{output}.webp", variants: [...paths], pexelsUrl: "..." }
```

### Error Handling

| Scenario | Action |
|----------|--------|
| `PEXELS_API_KEY` missing | Stop. Report key name + signup URL. |
| Zero Pexels results | Broaden query (drop last word), retry once. If still zero, return failure. |
| Download fails | Report error + URL attempted. Return failure. Caller uses CSS placeholder. |
| ImageMagick not installed | Stop. Report: `sudo apt install imagemagick` |
| cwebp not installed | Fall back to ImageMagick WebP conversion. |
| exiftool not installed | Skip IPTC injection. Log warning. Continue. |

---

## `.env.example` Additions

site-builder's Phase B1 writes these to `.env.example`:

```bash
# Image Generation (web-studio)
# Primary: Nano Banana / Gemini AI image generation
# Get your key at: https://aistudio.google.com/apikey
NANOBANANA_API_KEY=

# Fallback: Pexels stock photos (free)
# Get your key at: https://www.pexels.com/api/
PEXELS_API_KEY=
```

---

## State Schema Addition

```json
{
  "lastCompletedPhase": "images",
  "imagesGenerated": 8,
  "imagesFailed": 0,
  "imageSource": "nano-banana | pexels | skipped"
}
```

---

## Error Handling (site-builder Phase B1.5)

| Scenario | Action |
|----------|--------|
| No API keys in .env | Skip images. Log both missing key names + where to get them. Add resume note to final report. |
| Single image fails | Log failure. Continue. CSS placeholder for that image only. |
| All images fail | Log all failures. Continue to B2. All components use CSS fallbacks. Final report lists all failures. |
| image-manifest.json missing | Stop B1.5. Report: "Agent 7 (Image Planner) did not produce image-manifest.json. Re-run Phase R." |
| public/assets/images/ not writable | Stop. Report permission error + fix command. |

---

## Tips

- Add `NANOBANANA_API_KEY` to `.env` for photorealistic AI-generated images
- Add `PEXELS_API_KEY` as a free fallback — sign up at pexels.com/api (no billing required)
- If you added a key after building, re-run just the image phase: `/site-builder start-at=images`
- All Pexels images require photographer attribution — `CREDITS.md` is written automatically
- Testimonial avatars never get responsive variants (200×200 is already small)
- OG image uses the same Pexels query as the hero — saves one API call
