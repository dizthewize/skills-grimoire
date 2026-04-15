# Web Studio Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate AI image generation (Nano Banana / Gemini) with Pexels stock photo fallback into the web-studio pipeline, producing a full image package per site (hero, services, team, testimonial avatars, OG image).

**Architecture:** A new Phase B1.5 runs between scaffold (B1) and components (B2), reading a manifest from Agent 7 (Image Planner, added to Phase R), then either calling Nano Banana for photorealistic AI images or falling back to the extended `seo-images generate` command (Pexels stock photos). All images land in `public/assets/images/` as optimized WebP before any component is built.

**Tech Stack:** Nano Banana (Gemini 2.5 Flash image gen), Pexels REST API, cwebp, exiftool, ImageMagick. No new npm packages — all image processing uses system tools already referenced in seo-images.

---

## Files Changed

| File | Change |
|------|--------|
| `skills/site-designer/SKILL.md` | Add Image Brief section to Phase 3 design-system.md template |
| `skills/site-builder/SKILL.md` | Add Phase B1.5, Agent 7 to Phase R, `start-at=images`, state schema, .env.example keys, error handling row |
| `skills/site-builder/references/agent-prompts.md` | Add Agent 7: Image Planner prompt |
| `~/.claude/skills/seo-images/SKILL.md` | Add `/seo images generate` command section |

---

## Task 1: site-designer — Add Image Brief to Phase 3 Output Template

**Files:**
- Modify: `skills/site-designer/SKILL.md` (lines 392–396 — end of the design-system.md template)

The Image Brief goes at the end of the `docs/design-system.md` markdown template in Phase 3 — directly after the closing backticks of the Aesthetic Brief example and before the `````  closing fence that ends the whole template.

- [ ] **Step 1: Open the file and verify the insertion point**

Read `skills/site-designer/SKILL.md` lines 390–403. Confirm line 392 contains `[Example for a bold-direct roofing company:` and line 396 contains the four closing backticks (``````) that end the design-system.md template block.

- [ ] **Step 2: Insert the Image Brief section before the closing backticks**

Find this exact text in `skills/site-designer/SKILL.md`:

```
[Example for a bold-direct roofing company: "The design leads with authority. Dark navy and high-contrast orange signal expertise and urgency without looking aggressive. Headlines are heavy-weight and left-aligned — no centered copy except in the testimonials section. Photography is real: job sites, finished roofs, and crew members in branded shirts. Stock photos are not acceptable. Whitespace is used generously between sections to let each conversion element breathe, but the hero is dense by design — headline, trust line, and form all above the fold. Hover states are fast (150ms) and subtle. Nothing animates except the mobile sticky bar fade-in on page load. The overall feel: you're dealing with a serious, established contractor — not a franchise site."]
````
```

Replace it with:

```
[Example for a bold-direct roofing company: "The design leads with authority. Dark navy and high-contrast orange signal expertise and urgency without looking aggressive. Headlines are heavy-weight and left-aligned — no centered copy except in the testimonials section. Photography is real: job sites, finished roofs, and crew members in branded shirts. Stock photos are not acceptable. Whitespace is used generously between sections to let each conversion element breathe, but the hero is dense by design — headline, trust line, and form all above the fold. Hover states are fast (150ms) and subtle. Nothing animates except the mobile sticky bar fade-in on page load. The overall feel: you're dealing with a serious, established contractor — not a franchise site."]

## Image Brief

> Consumed by site-builder Agent 7 (Image Planner) to produce the image manifest.
> Prompts written for Nano Banana (photorealistic). Pexels queries are fallback search terms.

### Hero Background
- **Filename:** `hero-bg`
- **Dimensions:** 1920×1080
- **Prompt:** "[trade] professional working on a job in [city] — cinematic, natural light, shallow depth of field, no text"
- **Pexels query:** "[trade] contractor professional working"
- **Alt text:** "[Business name] — [trade] contractor serving [city]"
- **Usage:** Hero section full-width background, darkened overlay applied in CSS

### Service Images
[One entry per service from site-plan.md services list]
- **Filename:** `service-{slug}`
- **Dimensions:** 800×600
- **Prompt:** "professional [service name] work in progress — clean, well-lit, high quality"
- **Pexels query:** "[service name] professional"
- **Alt text:** "[Service name] by [Business name]"
- **Usage:** Service card image

### About / Team
- **Filename:** `about-team`
- **Dimensions:** 800×600
- **Prompt:** "[trade] contractor or small team on a job site — approachable, professional, branded workwear"
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
- **Derived from:** `hero-bg` download — resized to 1200×630, no separate API call
- **Alt text:** "[Business name] — [trade] contractor in [city]"
- **Usage:** og:image meta tag on all pages
- **Note:** Agent 7 does not add a separate manifest entry for og-image. Phase B1.5 produces it automatically after hero-bg is generated by cropping/resizing.
````
```

- [ ] **Step 3: Verify the file renders correctly**

Read lines 390–460 of `skills/site-designer/SKILL.md` and confirm:
- The Aesthetic Brief example paragraph is intact
- The Image Brief section follows immediately after
- The closing ```````` fence closes cleanly at the end
- No duplicate backtick sequences or broken fences

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git add skills/site-designer/SKILL.md
git commit -m "feat(site-designer): add Image Brief section to design-system.md output template"
```

---

## Task 2: site-builder — Parameters, Architecture, Phase B1.5, State Schema

**Files:**
- Modify: `skills/site-builder/SKILL.md`

This task makes five targeted edits to `skills/site-builder/SKILL.md`. Apply them in order.

### Edit 2a: Parameters table — add `images` to `start-at`

- [ ] **Step 1: Find and update the Parameters table**

Find this exact text:

```
| `start-at` | `research` | Resume from phase: `research`, `b1`, `b2`, `b3`, `b4`, `b5`, `b6`, `b7` |
```

Replace with:

```
| `start-at` | `research` | Resume from phase: `research`, `b1`, `images`, `b2`, `b3`, `b4`, `b5`, `b6`, `b7` |
```

### Edit 2b: Invocation examples — add `start-at=images` example

- [ ] **Step 2: Find and update the invocation block**

Find this exact text:

```
/site-builder start-at=b5 skip-auth=true
```

Replace with:

```
/site-builder start-at=b5 skip-auth=true
/site-builder start-at=images
```

### Edit 2c: Architecture diagram — add Phase B1.5 and Agent 7

- [ ] **Step 3: Find and update the architecture diagram**

Find this exact text:

```
+-- Phase R: PARALLEL RESEARCH (6 agents, run_in_background: true)
|   Agent 1: Stack Scout          — scaffold command, deps, folder structure
|   Agent 2: Component Analyst    — component → file path + props + classes
|   Agent 3: SEO Mapper           — page → meta tags + schema + sitemap entry
|   Agent 4: Copy Integrator      — copy brief → component-ready JSON per page
|   Agent 5: Auth + DB Planner    — [conditional] Supabase schema + RLS + routes
|   Agent 6: Conversion Optimizer — CTA placement + sticky logic + exit-intent
|   ↓
|   Synthesize → .web-studio/build-plan.md
|   Present summary → wait for "proceed"
|
+-- Phase B1: Scaffold
+-- Phase B2: Shared Components
```

Replace with:

```
+-- Phase R: PARALLEL RESEARCH (7 agents, run_in_background: true)
|   Agent 1: Stack Scout          — scaffold command, deps, folder structure
|   Agent 2: Component Analyst    — component → file path + props + classes
|   Agent 3: SEO Mapper           — page → meta tags + schema + sitemap entry
|   Agent 4: Copy Integrator      — copy brief → component-ready JSON per page
|   Agent 5: Auth + DB Planner    — [conditional] Supabase schema + RLS + routes
|   Agent 6: Conversion Optimizer — CTA placement + sticky logic + exit-intent
|   Agent 7: Image Planner        — image manifest JSON from design-system.md Image Brief
|   ↓
|   Synthesize → .web-studio/build-plan.md
|   Present summary → wait for "proceed"
|
+-- Phase B1: Scaffold
+-- Phase B1.5: Image Generation  [NEW]
+-- Phase B2: Shared Components
```

### Edit 2d: Phase R agent table — add Agent 7

- [ ] **Step 4: Find and update the Phase R agent table**

Find this exact text:

```
| Conversion Optimizer | CTA placement, sticky logic, exit-intent, form position | Always |
```

Replace with:

```
| Conversion Optimizer | CTA placement, sticky logic, exit-intent, form position | Always |
| Image Planner | Image manifest JSON — one entry per image, prompts + Pexels queries | Always |
```

### Edit 2e: Phase B1 .env.example — add image generation keys

- [ ] **Step 5: Find and update the Phase B1 .env.example instructions**

Find this exact text:

```
5. Create `.env.example` with all required env var names (values empty). If auth is enabled, include Supabase vars from `references/supabase-setup.md`.
```

Replace with:

```
5. Create `.env.example` with all required env var names (values empty). If auth is enabled, include Supabase vars from `references/supabase-setup.md`. Always include image generation keys:

   ```bash
   # Image Generation (web-studio)
   # Primary: Nano Banana / Gemini AI image generation
   # Get your key at: https://aistudio.google.com/apikey
   NANOBANANA_API_KEY=

   # Fallback: Pexels stock photos (free)
   # Get your key at: https://www.pexels.com/api/
   PEXELS_API_KEY=
   ```
```

### Edit 2f: Insert Phase B1.5 between Phase B1 and Phase B2

- [ ] **Step 6: Find the end of Phase B1 and insert Phase B1.5**

Find this exact text (the B1 commit block and the start of B2 header):

```
6. Commit:
   ```
   feat: scaffold [framework] project with design system tokens
   ```

---

### Phase B2: Shared Components
```

Replace with:

```
6. Commit:
   ```
   feat: scaffold [framework] project with design system tokens
   ```

---

### Phase B1.5: Image Generation

**Skip this phase** if `start-at` is `b2` or later (unless `start-at=images` was explicitly passed).

1. Read `.web-studio/image-manifest.json`. If the file does not exist, stop Phase B1.5 and report:

   ```
   Error: Agent 7 (Image Planner) did not produce image-manifest.json.
   Re-run Phase R to regenerate the manifest, then resume with start-at=images.
   ```

2. Create the output directory:

   ```bash
   mkdir -p public/assets/images
   ```

3. Credential check — read `.env` in the project directory:

   **Priority order:**
   - `NANOBANANA_API_KEY` → use Nano Banana (photorealistic AI generation)
   - `NANOBANANA_GEMINI_API_KEY` → use Nano Banana (same path, alternate key name)
   - `GEMINI_API_KEY` → use Nano Banana (same path, fallback key name)
   - `PEXELS_API_KEY` (no Nano Banana key found) → use `/seo images generate` (Pexels stock photos)
   - Neither key found → skip image generation (see step 6)

4. **If Nano Banana key found:**

   For each image entry in the manifest:
   - Call Nano Banana with `prompt` field and `style=photorealistic`
   - Save raw output to `public/assets/images/{filename}.png`
   - Run seo-images optimization pipeline on each file (resize to manifest dimensions, convert to WebP with IPTC metadata)
   - Save final as `public/assets/images/{filename}.webp`
   - If `responsiveVariants: true` and dimensions width > 300px, generate 400w/800w/1200w variants

   After hero-bg is generated, produce og-image automatically:
   ```bash
   convert public/assets/images/hero-bg.webp \
     -resize 1200x630^ -gravity Center -extent 1200x630 \
     public/assets/images/og-image.webp
   ```

5. **If no Nano Banana key, PEXELS_API_KEY found:**

   Log: `"Nano Banana key not found — using Pexels stock photos (fallback)"`

   For each image entry in the manifest, invoke `/seo images generate`:
   ```
   /seo images generate "{prompt}"
     --query="{pexels_query}"
     --width={dimensions.width}
     --height={dimensions.height}
     --output="public/assets/images/{filename}"
     --alt="{alt}"
     --credit="{business name from product-marketing-context.md}"
   ```

   The seo-images skill writes the WebP file and responsive variants to the output path. It also appends a row to `public/assets/images/CREDITS.md`.

   After hero-bg is fetched, produce og-image:
   ```bash
   convert public/assets/images/hero-bg.webp \
     -resize 1200x630^ -gravity Center -extent 1200x630 \
     public/assets/images/og-image.webp
   ```

6. **If neither key found:**

   Log a warning with the exact missing key names and where to obtain them:
   ```
   Warning: No image generation API keys found in .env.

   To enable AI-generated images, add to .env:
     NANOBANANA_API_KEY=    (get at: https://aistudio.google.com/apikey)

   To enable Pexels stock photo fallback, add to .env:
     PEXELS_API_KEY=        (get at: https://www.pexels.com/api/ — free, no billing)

   Skipping image generation. Components will use CSS gradient placeholders.
   Add a key and re-run: /site-builder start-at=images
   ```

   Set `imageSource: "skipped"` in state. Do NOT stop the build — continue to B2 with CSS fallbacks.

7. **Per-image failure handling:**

   If a single image fails (network error, API error, tool error):
   - Log: `"Image failed: {filename} — {error message}"`
   - Continue with remaining images
   - CSS gradient placeholder for that specific image only
   - Track failed filenames for the B1.5 summary

8. Update `.web-studio/state.json`:
   ```json
   {
     "lastCompletedPhase": "images",
     "imagesGenerated": N,
     "imagesFailed": N,
     "imageSource": "nano-banana | pexels | skipped"
   }
   ```

9. Commit (skip if imageSource is "skipped"):
   ```
   feat: generate site images (N images via [nano-banana|pexels])
   ```

---

### Phase B2: Shared Components
```

### Edit 2g: Error handling table — add image-manifest.json row

- [ ] **Step 7: Find and update the error handling table**

Find this exact text in the Error Handling table:

```
| Copy Integrator gaps flagged | Use the copy brief text directly from site-plan.md as fallback; never write placeholder text |
```

Replace with:

```
| Copy Integrator gaps flagged | Use the copy brief text directly from site-plan.md as fallback; never write placeholder text |
| `image-manifest.json` missing at B1.5 | Stop B1.5. Report: "Agent 7 (Image Planner) did not produce image-manifest.json. Re-run Phase R." |
| No API keys in .env at B1.5 | Skip image generation. Log both missing key names and signup URLs. Add resume note. Continue to B2 with CSS fallbacks. |
| Single image fails at B1.5 | Log failure (filename + error). Continue remaining images. CSS placeholder for that image only. |
```

### Edit 2h: State file schema — add image fields and `images` to lastCompletedPhase

- [ ] **Step 8: Find and update the State File schema**

Find this exact text:

```
  "lastCompletedPhase": "research | b1 | b2 | b3 | b4 | b5 | b6 | b7",
```

Replace with:

```
  "lastCompletedPhase": "research | b1 | images | b2 | b3 | b4 | b5 | b6 | b7",
  "imagesGenerated": 0,
  "imagesFailed": 0,
  "imageSource": "nano-banana | pexels | skipped | null",
```

### Edit 2i: Tips — add start-at=images tip

- [ ] **Step 9: Find and update the Tips section**

Find this exact text:

```
7. **`skip-auth=true`** safely bypasses B6 even if auth was selected in discovery — useful for launching an MVP first
```

Replace with:

```
7. **`skip-auth=true`** safely bypasses B6 even if auth was selected in discovery — useful for launching an MVP first
8. **`start-at=images`** re-runs just the image generation phase — useful after adding a missing API key without rebuilding the whole site
```

- [ ] **Step 10: Verify all edits applied cleanly**

Read `skills/site-builder/SKILL.md` and confirm:
- Parameters table has `images` in start-at values
- Architecture diagram shows Phase B1.5 and Agent 7
- Phase R table has Agent 7 row
- Phase B1.5 exists between B1 and B2 with all 9 steps
- Error handling table has the 3 new image rows
- State schema has imagesGenerated, imagesFailed, imageSource fields
- Tips has item 8

- [ ] **Step 11: Commit**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git add skills/site-builder/SKILL.md
git commit -m "feat(site-builder): add Phase B1.5 image generation, Agent 7, start-at=images"
```

---

## Task 3: agent-prompts.md — Add Agent 7: Image Planner

**Files:**
- Modify: `skills/site-builder/references/agent-prompts.md` (append at end of file)

- [ ] **Step 1: Verify the current end of the file**

Read the last 20 lines of `skills/site-builder/references/agent-prompts.md`. Confirm the file ends with the closing triple-backtick of the Conversion Optimizer prompt block (the final ```` ``` ```` followed by nothing or a trailing newline).

- [ ] **Step 2: Append Agent 7 prompt**

Add the following at the end of `skills/site-builder/references/agent-prompts.md`:

```markdown

---

## Agent 7: Image Planner

**Agent type:** general-purpose
**Background role:** Run in parallel with other research agents before site build begins.
**Condition:** Always runs — needed for both Nano Banana and Pexels paths.

### Prompt

```
You are the Image Planner for a website build. Your job is to read the Image Brief section from docs/design-system.md and produce a structured JSON manifest of every image needed for the site. The build agent will use this manifest in Phase B1.5 to generate or fetch each image.

## Files to Read
1. docs/design-system.md — find the "## Image Brief" section at the bottom of the file. Read every image entry: filename, prompt, Pexels query, dimensions, alt text, usage, and responsive variants note.
2. docs/product-marketing-context.md — extract: business name, city, industry/trade, services list (to verify service image count matches actual services).
3. docs/site-plan.md — find the services list with slugs. Verify one service image entry exists per service.

## Your Tasks

### 1. Parse the Image Brief
Read every image entry in the "## Image Brief" section of docs/design-system.md. For each entry, extract:
- Filename (without extension)
- Generation prompt (for Nano Banana)
- Pexels search query (for fallback)
- Target dimensions (width × height)
- Alt text
- Usage description
- Whether responsive variants are needed (true for all images except testimonial avatars ≤ 300px wide)

### 2. Expand Dynamic Entries
The Image Brief uses placeholder patterns for dynamic entries. Expand them:

**Service images:** The brief says "[One entry per service from site-plan.md services list]". Read the services list from docs/site-plan.md and produce one manifest entry per service, using the service slug for the filename (e.g., `service-hardwood-flooring`). Fill in the prompt and Pexels query by substituting the actual service name into the template.

**Testimonial avatars:** The brief says "[3 entries: testimonial-avatar-1, -2, -3]". Always produce exactly 3 entries. These get `responsiveVariants: false` because their dimensions are 200×200.

**OG image:** Do NOT create a manifest entry for og-image. The build phase produces it automatically by resizing hero-bg after it is generated. If you see an OG image entry in the Image Brief, omit it from your output.

### 3. Validate the Manifest
Before outputting, verify:
- hero-bg entry exists with dimensions 1920×1080
- about-team entry exists with dimensions 800×600
- One service-{slug} entry per service in site-plan.md
- Three testimonial-avatar entries (1, 2, 3)
- No og-image entry
- All prompts are complete (no template placeholders like "[trade]" remain — substitute the real industry/trade from context)
- All alt texts are complete (no "[Business name]" placeholders — substitute the real name)

## Output Format

Write the manifest to `.web-studio/image-manifest.json`:

```json
{
  "images": [
    {
      "filename": "hero-bg",
      "prompt": "professional flooring contractor installing hardwood floors in modern home — cinematic, natural light, shallow depth of field, no text",
      "pexels_query": "flooring contractor installation professional",
      "dimensions": { "width": 1920, "height": 1080 },
      "usage": "hero-background",
      "alt": "Premier Floors — flooring contractor serving Sacramento",
      "htmlRef": "/assets/images/hero-bg.webp",
      "responsiveVariants": true
    },
    {
      "filename": "service-hardwood-flooring",
      "prompt": "professional hardwood floor installation in progress — clean, well-lit, high quality",
      "pexels_query": "hardwood floor installation professional",
      "dimensions": { "width": 800, "height": 600 },
      "usage": "service-card",
      "alt": "Hardwood flooring installation by Premier Floors",
      "htmlRef": "/assets/images/service-hardwood-flooring.webp",
      "responsiveVariants": true
    },
    {
      "filename": "about-team",
      "prompt": "flooring contractor or small team on a job site — approachable, professional, branded workwear",
      "pexels_query": "flooring contractor team professional",
      "dimensions": { "width": 800, "height": 600 },
      "usage": "about-team",
      "alt": "The Premier Floors team",
      "htmlRef": "/assets/images/about-team.webp",
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
    },
    {
      "filename": "testimonial-avatar-2",
      "prompt": "professional portrait, smiling, natural light, plain background — no text, no logo",
      "pexels_query": "professional portrait smiling person",
      "dimensions": { "width": 200, "height": 200 },
      "usage": "testimonial-avatar",
      "alt": "Customer review photo",
      "htmlRef": "/assets/images/testimonial-avatar-2.webp",
      "responsiveVariants": false
    },
    {
      "filename": "testimonial-avatar-3",
      "prompt": "professional portrait, smiling, natural light, plain background — no text, no logo",
      "pexels_query": "professional portrait smiling person",
      "dimensions": { "width": 200, "height": 200 },
      "usage": "testimonial-avatar",
      "alt": "Customer review photo",
      "htmlRef": "/assets/images/testimonial-avatar-3.webp",
      "responsiveVariants": false
    }
  ]
}
```

After writing the file, return:
```json
{
  "status": "complete",
  "manifestPath": ".web-studio/image-manifest.json",
  "imageCount": N,
  "serviceImages": N,
  "flags": ["FLAG: ...", "MISSING: ..."]
}
```

Include a "flags" array for any issues:
- "MISSING: Image Brief section not found in design-system.md" — critical, manifest cannot be produced
- "FLAG: {N} services found in site-plan.md, {N} service images produced" — if counts differ
- "FLAG: og-image entry found in Image Brief and omitted from manifest"
```

### Expected Output Format

A complete `.web-studio/image-manifest.json` file written to disk, plus the JSON status object returned to the orchestrator. Every image entry must have all fields filled with real values — no template placeholders.
```

- [ ] **Step 3: Verify the append**

Read the last 50 lines of `skills/site-builder/references/agent-prompts.md`. Confirm:
- The `---` separator appears between Agent 6 and Agent 7
- Agent 7 has all sections: type, condition, prompt, output format, expected output format
- The closing triple-backtick of the prompt block closes cleanly
- No broken markdown fences

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git add skills/site-builder/references/agent-prompts.md
git commit -m "feat(site-builder): add Agent 7 Image Planner prompt"
```

---

## Task 4: seo-images — Add `/seo images generate` Command

**Files:**
- Modify: `~/.claude/skills/seo-images/SKILL.md`

The new section goes between the existing `## Image File Optimization` section and the `## Error Handling` section.

- [ ] **Step 1: Find the insertion point**

Read `~/.claude/skills/seo-images/SKILL.md`. Locate the `## Error Handling` section header. The generate command section will be inserted immediately before it.

- [ ] **Step 2: Insert the generate command section**

Find this exact text in `~/.claude/skills/seo-images/SKILL.md`:

```
## Error Handling
```

Replace with:

```
## Image Generation from Pexels

Fetch stock photos from Pexels and run them through the full optimization pipeline. Used by site-builder Phase B1.5 as a fallback when no Nano Banana API key is available.

### `/seo images generate "<prompt>" [options]`

Fetch an image from Pexels matching the query, resize it to target dimensions, convert to WebP with IPTC metadata, and generate responsive variants.

**Options:**

| Option | Description |
|--------|-------------|
| `--query="<terms>"` | Pexels search query (required — use descriptive terms, not the generation prompt) |
| `--width=<px>` | Target width in pixels (default: 1200) |
| `--height=<px>` | Target height in pixels (default: 800) |
| `--output="<path>"` | Output path without extension (default: `public/assets/images/image`) |
| `--alt="<text>"` | Alt text for IPTC metadata injection |
| `--credit="<name>"` | Business name for IPTC Credit and Copyright fields |

**Before running:** Check that PEXELS_API_KEY is set in the project's `.env` file.

**Workflow:**

```
1. Read PEXELS_API_KEY from .env or environment
   → if missing: stop with error:
     "PEXELS_API_KEY not found. Sign up for a free key at https://www.pexels.com/api/"

2. Determine orientation from width:height ratio:
   → width > height × 1.2  → orientation=landscape
   → height > width × 1.2  → orientation=portrait
   → else                  → orientation=square

3. Search Pexels:
   GET https://api.pexels.com/v1/search
     ?query={--query value}
     &per_page=5
     &orientation={landscape|square|portrait}
     &size=large
   Authorization: {PEXELS_API_KEY}

4. Pick best result:
   → use first result (Pexels relevance-ranks by default)
   → if zero results: drop the last word from --query, retry once
   → if still zero: report failure, return null — caller handles fallback

5. Download at appropriate resolution:
   → use src2x or original field depending on target dimensions
   → save to a temp path (e.g., /tmp/seo-images-{filename}.jpg)

6. Resize to exact target dimensions (ImageMagick):
   convert {temp} -resize {width}x{height}^ -gravity Center -extent {width}x{height} {temp_resized}

7. Convert to WebP + inject IPTC metadata:
   cwebp -q 82 -metadata all {temp_resized} -o {output}.webp

   exiftool -overwrite_original \
     -IPTC:Caption-Abstract="{--alt value}" \
     -IPTC:Credit="{--credit value}" \
     -IPTC:CopyrightNotice="Copyright {year} {--credit value}" \
     -XMP:Description="{--alt value}" \
     -XMP:Creator="{--credit value}" \
     {output}.webp

8. Generate responsive variants (skip if --width ≤ 300):
   convert {temp_resized} -resize 400x -quality 82 {output}-400w.webp
   convert {temp_resized} -resize 800x -quality 82 {output}-800w.webp
   convert {temp_resized} -resize 1200x -quality 82 {output}-1200w.webp

9. Append to public/assets/images/CREDITS.md:
   If the file does not exist, write header first:
   ```
   # Image Credits
   Images sourced from Pexels (https://www.pexels.com). Used under Pexels License.

   | File | Photographer | Source |
   |------|-------------|--------|
   ```
   Then append one row per image:
   | {filename}.webp | {photographer name from Pexels response} | {pexels photo URL} |

10. Clean up temp files

11. Return:
    {
      "path": "{output}.webp",
      "variants": ["{output}-400w.webp", "{output}-800w.webp", "{output}-1200w.webp"],
      "pexelsUrl": "{pexels photo page URL}",
      "photographer": "{photographer name}"
    }
    Return null if any step before WebP conversion fails.
```

**Error handling for generate command:**

| Scenario | Action |
|----------|--------|
| `PEXELS_API_KEY` missing | Stop. Report key name + `https://www.pexels.com/api/` signup link. |
| Zero Pexels results | Drop last word from query, retry once. If still zero, return null. Caller uses CSS placeholder. |
| Download fails | Report error + URL attempted. Return null. Caller uses CSS placeholder. |
| ImageMagick not installed | Stop. Report: `sudo apt install imagemagick` |
| cwebp not installed | Fall back to ImageMagick WebP conversion: `convert {temp} -quality 82 {output}.webp` |
| exiftool not installed | Skip IPTC injection. Log warning: "exiftool not found — IPTC metadata skipped. Install: sudo apt install libimage-exiftool-perl". Continue. |

---

## Error Handling
```

- [ ] **Step 3: Verify the insertion**

Read the modified section of `~/.claude/skills/seo-images/SKILL.md`. Confirm:
- `## Image Generation from Pexels` section appears before `## Error Handling`
- The workflow steps 1–11 are present and complete
- The error handling table for the generate command is inside the section (before the `---` separator)
- The existing `## Error Handling` section follows after the `---`
- No broken markdown

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git add ~/.claude/skills/seo-images/SKILL.md
git commit -m "feat(seo-images): add /seo images generate command with Pexels fetch and optimization pipeline"
```

Note: If `~/.claude/skills/seo-images/SKILL.md` is outside the skills-grimoire repo, commit it with `git` in the `~/.claude/skills/` directory instead, or just save the file without committing (it's a local user skill file, not in the repo).

---

## Verification Checklist

After all 4 tasks are complete:

- [ ] `skills/site-designer/SKILL.md` — Image Brief section appears at end of design-system.md template, with Hero Background, Service Images, About/Team, Testimonial Avatars (3), and OG image note
- [ ] `skills/site-builder/SKILL.md` — `images` appears in start-at parameter; Phase B1.5 exists between B1 and B2; Agent 7 row in Phase R table; imagesGenerated/imagesFailed/imageSource in state schema; 3 new error handling rows; tip 8
- [ ] `skills/site-builder/references/agent-prompts.md` — Agent 7 section with complete prompt including file reading instructions, dynamic expansion rules, validation checklist, and full JSON output format
- [ ] `~/.claude/skills/seo-images/SKILL.md` — `/seo images generate` command section with 11-step workflow, options table, and per-scenario error handling table
