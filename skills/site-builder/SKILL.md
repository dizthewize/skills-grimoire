---
name: site-builder
description: "Use after site-designer to build the website codebase. Runs parallel research agents, then implements in sequential phases with per-phase commits. Reads docs/product-marketing-context.md, docs/site-plan.md, and docs/design-system.md. Outputs full codebase and opens a GitHub PR."
---

# Site Builder

Build the full website codebase from the three context docs produced by earlier web-studio pipeline steps. Spawns six parallel research agents, synthesizes their output into a build plan, then implements the site in sequential phases with a per-phase commit after each. Ends by opening a GitHub PR.

## When to Use This Skill

- After site-designer has written `docs/design-system.md`
- Called automatically by the `/web-studio` coordinator skill
- Resuming a partially completed build with `start-at=`
- Rebuilding from an existing design after changes to any context doc

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `start-at` | `research` | Resume from phase: `research`, `b1`, `images`, `b2`, `b3`, `b5`, `b6`, `b7` |
| `skip-auth` | `auto` | `auto` reads context file. `true` forces skipping B6 even if auth is selected. |
| `branch` | `new` | Git branch strategy: `new` (create a feature branch), `main` (commit directly to current branch), `auto` (new branch if repo has existing commits) |
| `managed` | `false` | When `true`, suppresses three interactive prompts: the Phase 0 resume check (resume vs. fresh start), the Phase R "proceed" gate (confirmation before build phases begin), and the Phase B6 credential prompt (Supabase credentials request). Intended only for the web-studio coordinator — do not set to `true` on a standalone invocation, as it will skip prompts you need. |

## Invocation

```
/site-builder
/site-builder start-at=b3
/site-builder skip-auth=true
/site-builder branch=new
/site-builder start-at=b5 skip-auth=true
/site-builder start-at=images
/site-builder managed=true
/site-builder start-at=b3 managed=true
```

## Architecture

```
ORCHESTRATOR (main session — manages state, cross-references agent outputs)
|
+-- Phase 0: LOAD CONTEXT
|   Read all 3 docs files — fail with clear error if any missing
|   Check .web-studio/state.json for resume offer
|   Initialize git repo if needed
|
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
+-- Phase B1.5: Image Generation
+-- Phase B2: Shared Components
+-- Phase B3: Pages (parallel — 2 or 3 agents based on scope)
+-- Phase B5: SEO Layer
+-- Phase B6: Auth + Supabase    [conditional — skipped if no auth]
+-- Phase B7: Deploy Prep + Build Verify
|
+-- PR Creation (gh pr create)
+-- Phase 8: Handoff → .web-studio/state.json updated
```

---

## Workflow

### Phase 0: Load Context

1. Read all three docs files:
   - `docs/product-marketing-context.md`
   - `docs/site-plan.md`
   - `docs/design-system.md`

   If any file is missing, stop immediately with a specific error:

   ```
   Error: docs/design-system.md not found.
   Run /site-designer first to generate the design system, then re-run /site-builder.
   ```

2. Check `skip-auth` parameter:
   - If `auto`: read the `Auth` field from `docs/product-marketing-context.md` — if it references Supabase, set `auth_enabled=true`; otherwise `auth_enabled=false`
   - If `true`: set `auth_enabled=false` regardless of context

3. Check `branch` parameter:
   - `main`: commit to current branch as-is
   - `new`: create `feat/[business-name-slug]-site` branch now
   - `auto`: check `git log --oneline -1`; if repo has existing commits, create the new branch; if empty repo, commit to current branch

4. If `managed=false` (standalone use): check `.web-studio/state.json` — if it exists AND `start-at` was not explicitly passed by the user, display:

   ```
   A previous build session was found at .web-studio/state.json.
   Last completed phase: [phase]

   1. Resume from [next phase]
   2. Start fresh (overwrites state)

   How would you like to proceed?
   ```

   **STOP — wait for response.**

   Else (`managed=true`): skip this check entirely — web-studio has already offered the resume/fresh-start choice in its own Phase 0, so site-builder must not re-prompt.

5. Initialize git if needed (`git init`) and create `.web-studio/` directory.

---

### Phase R: Parallel Research Agents

Spawn all 7 agents simultaneously with `run_in_background: true`. See `references/agent-prompts.md` for the full prompt text for each agent.

| Agent | Role | Condition |
|-------|------|-----------|
| Stack Scout | Scaffold command, dependencies, folder structure, config files | Always |
| Component Analyst | Component → file path + props + CSS classes + a11y | Always |
| SEO Mapper | Page → meta tags + JSON-LD schema + sitemap entry | Always |
| Copy Integrator | Copy brief → structured JSON blocks per page/section | Always |
| Auth + DB Planner | Supabase schema, RLS policies, env vars, auth routes | Only if `auth_enabled=true` |
| Conversion Optimizer | CTA placement, sticky logic, exit-intent, form position | Always |
| Image Planner | Image manifest JSON — one entry per image, prompts + Pexels queries | Always |

Collect all results. If an agent fails:
- Retry once
- If still failing, proceed without it and note the gap in `build-plan.md`

**Synthesize** all agent outputs into `.web-studio/build-plan.md` with:
- Dependency list and scaffold command (Stack Scout)
- Component file map with props and key classes (Component Analyst)
- Per-page SEO table (SEO Mapper)
- Structured copy JSON (Copy Integrator)
- CTA placement plan (Conversion Optimizer)
- Auth/DB plan if applicable (Auth + DB Planner)
- Image Planner writes `.web-studio/image-manifest.json` directly (not part of build-plan.md — referenced by Phase B1.5)

Present a summary of `build-plan.md` to the user:

```
Research complete (7 agents). Build plan written to .web-studio/build-plan.md.

Stack: [framework] | Pages: [N] | Components: [N] | Auth: [enabled/disabled]
```

If `managed=true`: print the summary above and immediately proceed to Phase B1. Do not wait for a response.

Else (`managed=false`, standalone): append the following line to the summary and wait:

```
Type "proceed" to begin the build phases.
```

**STOP — wait for "proceed" before starting B phases.**

---

### Phase B1: Scaffold

1. Run the framework scaffold command from Stack Scout (e.g., `npm create astro@latest .` or `npx create-next-app@latest .`). If it fails, report the full error output, suggest running the command manually in the terminal, and wait for the user to confirm before continuing.

2. Install all dependencies from Stack Scout's list (`npm install [packages]`).

3. Open `tailwind.config.*` (or `globals.css` / `app/globals.css`) and copy in all CSS custom property declarations from `docs/design-system.md`:
   - All `--color-*` variables
   - All `--font-*` variables
   - Any other design tokens specified

4. Create folder structure:
   ```
   src/
     components/
     layouts/
     pages/       (or app/ for Next.js)
     lib/         (only if auth_enabled)
   public/
   ```

5. Create `.env.example` with all required env var names (values empty). If auth is enabled, include Supabase vars from `references/supabase-setup.md`. Always include image generation keys:

   ```bash
   # Image Generation (web-studio)
   # Nanobanana (Gemini CLI extension) — AI image generation
   # Get your key at: https://aistudio.google.com/apikey
   NANOBANANA_API_KEY=

   # Fallback: Pexels stock photos (free)
   # Get your key at: https://www.pexels.com/api/
   PEXELS_API_KEY=
   ```

6. Commit:
   ```
   feat: scaffold [framework] project with design system tokens
   ```

---

### Phase B1.5: Image Generation

**Run this phase** only if `start-at` is `research`, `b1`, or `images`. Skip if `start-at` is `b2` or later.

1. Read `.web-studio/image-manifest.json`. If the file does not exist, stop Phase B1.5 and report:

   ```
   Error: Agent 7 (Image Planner) did not produce image-manifest.json.
   Re-run Phase R to regenerate the manifest, then resume with start-at=images.
   ```

2. Create the output directory:

   ```bash
   mkdir -p public/assets/images
   ```

3. Credential check — read `.env` in the project directory and run `gemini --version`:

   **Priority order:**
   - `NANOBANANA_API_KEY` found AND `gemini --version` succeeds → use Nano Banana via Gemini CLI (photorealistic AI generation)
   - `NANOBANANA_API_KEY` found BUT `gemini --version` fails → log warning, fall through to Pexels check:
     ```
     Warning: NANOBANANA_API_KEY is set but Gemini CLI is not installed.
     Install it and the nanobanana extension to enable AI image generation:
       gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
     Falling back to Pexels or CSS gradient placeholders.
     ```
   - `PEXELS_API_KEY` found (no usable Nano Banana path) → use `/seo images generate` (Pexels stock photos)
   - Neither key found → skip image generation (see step 6)

4. **If Nano Banana key found:**

   For each image entry in the manifest:

   ```bash
   # 1. Snapshot nanobanana-output/ before generation (detect new file afterward)
   before=$(ls ./nanobanana-output/ 2>/dev/null | LC_ALL=C sort)

   # 2. Invoke nanobanana via Gemini CLI, passing API key from .env
   NANOBANANA_API_KEY=$(grep '^NANOBANANA_API_KEY=' .env | cut -d= -f2-) \
     gemini "/generate '{prompt}' --styles='photorealistic'"

   # 3. Detect the new file by diffing directory state before/after
   new_file=$(comm -13 <(echo "$before") <(ls ./nanobanana-output/ 2>/dev/null | LC_ALL=C sort) | head -1)

   # 4. Guard: if no new file detected, log failure and skip this image
   [ -z "$new_file" ] && { echo "Image failed: {filename} — no output file detected"; continue; }

   # 5. Move to target path
   mv "./nanobanana-output/$new_file" "public/assets/images/{filename}.png"
   ```

   - Run seo-images optimization pipeline on `public/assets/images/{filename}.png` (resize to manifest dimensions, convert to WebP with IPTC metadata)
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

   To enable AI-generated images (requires Gemini CLI with nanobanana extension installed):
     NANOBANANA_API_KEY=    (get at: https://aistudio.google.com/apikey)

   To enable Pexels stock photo fallback, add to .env:
     PEXELS_API_KEY=        (get at: https://www.pexels.com/api/ — free, no billing)

   Skipping image generation. Components will use CSS gradient placeholders.
   Add a key and re-run: /site-builder start-at=images
   ```

   Set `imageSource: "skipped"` in state and immediately continue to Phase B2. Do NOT stop, do NOT wait for a response, do NOT ask the user anything. CSS gradient placeholders are the intended degraded behavior — this is not an error state that requires user input.

7. **Per-image failure handling:**

   If a single image fails (network error, API error, tool error):
   - Log: `"Image failed: {filename} — {error message}"`
   - Continue with remaining images
   - CSS gradient placeholder for that specific image only
   - Track failed filenames for the B1.5 summary

8. Merge these fields into `.web-studio/state.json` (read existing state first, update only these keys — do not overwrite other fields like `framework`, `branchName`, etc.):
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

Build every shared component listed in `docs/design-system.md` component specs. At minimum:

- **`Header`** — sticky nav, logo text/image, primary phone number as `<a href="tel:...">`, primary CTA button, scroll-shrink behavior (reduces height on scroll)
- **`Footer`** — contact info, service area list, social links, phone CTA as `<a href="tel:...">`, copyright
- **`MobileStickyBar`** — fixed bottom bar visible only on mobile (`md:hidden`); contains `<a href="tel:...">` call button and "Get Quote" button that opens/links to lead form
- **`Layout`** — wraps all pages; imports Header, Footer, MobileStickyBar, and injects `<slot>` or `{children}`
- **`Button`** — primary, secondary, and ghost variants using CSS variable tokens
- **`LeadCaptureForm`** — fields: Name, Phone, Email, service type dropdown; submit button; trust micro-copy ("Licensed & Insured", "Fast Response"); honeypot field for spam protection
- Any additional shared components specified in `docs/design-system.md`

Rules:
- Use only CSS variables established in B1 — no hardcoded hex values
- Every phone number in every component MUST be `<a href="tel:[number]">` — never plain text
- Accessibility: all interactive elements have `aria-label` or visible label; color contrast meets WCAG AA

Commit:
```
feat: add shared layout components (header, footer, mobile CTA bar)
```

---

### Phase B3: Pages

**Step 1: Scope assessment**

Read `docs/site-plan.md` and count the total number of pages in the page hierarchy (homepage counts as 1; each listed inner page counts as 1).

Print:
```
Pages: [N] (homepage + [N-1] inner) → [2 or 3] build agents
```

Determine agent count by threshold:
- **1–4 total pages → 2 agents**
- **5+ total pages → 3 agents**

Immediately merge into `.web-studio/state.json`:
```json
{ "parallelBuildAgents": N }
```

**Step 2: Assign pages to agents**

**2-agent split:**

| Agent | Pages |
|-------|-------|
| Agent 1 | Homepage |
| Agent 2 | All inner pages listed in `docs/site-plan.md` |

**3-agent split:**

| Agent | Pages |
|-------|-------|
| Agent 1 | Homepage |
| Agent 2 | Service pages — all pages under the `/services/` hierarchy in `docs/site-plan.md` |
| Agent 3 | Utility pages — About, Contact, Service Areas, and any remaining pages not covered by Agent 2 |

**Edge case — 5+ pages but no service subpage hierarchy:** If services is a single page (not a `/services/*` hierarchy), Agent 2 gets the first half of inner pages and Agent 3 gets the second half (split evenly by count; on odd counts, Agent 2 gets the larger half).

**Step 3: Spawn agents in parallel**

Before spawning, derive each agent's exact target file paths from `docs/site-plan.md` (e.g., `src/pages/about.astro`, `src/pages/services/drain-cleaning.astro`) — include these paths in the inline context alongside the page type assignment.

Spawn all agents simultaneously with `run_in_background: true`. Provide each agent's full context inline — do NOT instruct agents to read files themselves.

**Every agent receives:**
- Full text of `.web-studio/build-plan.md` (contains Copy Integrator output, Component Analyst map, CTA placement, SEO data)
- Their explicit page assignment (exact list of pages to build with target file paths)
- List of shared components from B2 with exact component names and import paths (e.g., `import Layout from '../layouts/Layout.astro'`)
- Framework in use (Astro or Next.js, from `.web-studio/state.json`)
- Explicit rule: **write files only — no git commits**

**Every agent must follow:**
- All copy comes directly from Copy Integrator output in `build-plan.md` — no placeholder text, no lorem ipsum, no invented copy
- Every page uses the `Layout` component
- Every phone number must be `<a href="tel:...">` — never plain text
- Internal links are correct (inner pages link back to homepage; service subpages link to the services index)
- End your run by reporting a structured completion summary: `Files written: [path1, path2, ...]` — the coordinator uses this to verify all assigned pages were built

**Agent 1 (Homepage) — sections to build in order:**
1. **Hero** — full-width background image or gradient, headline, subheadline, primary + secondary CTA buttons, embedded `LeadCaptureForm`
2. **Irresistible Offer** — offer text from copy brief, urgency badge (e.g., "Limited slots this month"), dual CTA buttons
3. **Services Grid** — icon + service name + one-line benefit + "Learn More" CTA per service; sourced from site-plan.md services list
4. **Trust Signals Bar** — Licensed & Insured badge, years in business, customer/job count, any certifications mentioned in product-marketing-context.md
5. **Testimonials** — 3 cards with: quote text, customer name, location or role, star rating (structured from copy brief)
6. **Service Area** — city list or prose paragraph drawn from product-marketing-context.md service areas
7. **FAQ Accordion** — questions and answers from copy brief; accessible expand/collapse
8. **Final CTA** — repeat of primary offer + `<a href="tel:...">` call button + embedded `LeadCaptureForm`

**Agent 2 (Service pages in a 3-agent split, or all inner pages in a 2-agent split) — pages to build:**
- **Services index page** — overview of all services with descriptions and "Get a Quote" CTAs
- **Individual service subpages** — one page per service listed in site-plan.md (if applicable)
- *(2-agent split only: also includes About, Contact, Service Areas, and all other inner pages)*

**Agent 3 (Utility pages — 3-agent split only) — pages to build:**
- **About page** — business story, team/owner info, values, trust signals
- **Contact page** — full `LeadCaptureForm`, map embed placeholder (`<div id="map">` or Google Maps iframe), phone as `<a href="tel:...">`, business hours
- **Service Areas page** — city list with local copy per city if available in copy brief; links to any city-specific sub-pages
- Any additional pages from site-plan.md assigned to this agent

Wait for all agents to complete. If an agent has not reported completion within 10 minutes of spawning, treat it as timed out and apply Step 4 retry logic. Collect each agent's completion summary (list of files written).

**Step 4: Verify and fallback**

Independently verify each file from the completion summaries exists on disk before accepting the agent's report. Then compare the expected page file list (from Step 2 agent assignments) against the files confirmed on disk.

- **If an agent failed or timed out:** Retry that agent once with the same assignment and same context. If it fails a second time, build those pages yourself sequentially following the same rules above. Note which pages were built by fallback.
- **If an agent wrote incomplete output (some assigned pages missing or not confirmed on disk):** Build the missing pages yourself following the same rules above. Note which pages were built by fallback.

**Step 5: Commit**

After all pages are written and verified, issue a single commit. The title includes the total page count and agent count; the body lists every file under each agent's heading:

```
feat: build all pages ([PAGE_COUNT] pages via [AGENT_COUNT] parallel agents)

Agent 1 (Homepage):
  - src/pages/index.astro

Agent 2 ([Service pages | All inner pages]):
  - src/pages/services/index.astro
  - src/pages/services/[slug].astro
  [... one line per file ...]

Agent 3 (Utility pages):    [include only if 3-agent split]
  - src/pages/about.astro
  - src/pages/contact.astro
  - src/pages/service-areas.astro
  [... one line per file ...]

Fallback (coordinator):     [include only if any fallback occurred]
  - src/pages/[file].astro
```

Merge into `.web-studio/state.json`:
```json
{ "lastCompletedPhase": "b3" }
```

---

### Phase B5: SEO Layer

Apply all SEO data from SEO Mapper to every page:

- `<title>` tag — from SEO Mapper's page-level title field
- `<meta name="description">` — from SEO Mapper's description field
- Open Graph tags: `og:title`, `og:description`, `og:url`, `og:type`, `og:image` (use a placeholder `/og-image.png` if no image asset is available)
- **LocalBusiness JSON-LD** on homepage only — populate all fields from SEO Mapper's schema spec:
  - `@type`, `name`, `url`, `telephone`, `address`, `areaServed`, `openingHours`, `priceRange`
- `sitemap.xml` in `public/` — all page URLs from SEO Mapper's sitemap entries, with `<lastmod>` set to current date
- `robots.txt` in `public/` — allow all (`User-agent: *`, `Disallow:`), `Sitemap:` pointing to `/sitemap.xml`

Commit:
```
feat: add SEO layer (meta tags, LocalBusiness schema, sitemap)
```

---

### Phase B6: Auth + Supabase (Conditional)

**Skip entirely if `auth_enabled=false`.**

If Supabase auth is enabled:

1. Create Supabase client:
   - Follow the pattern in `references/supabase-setup.md` → Client Setup section
   - File: `src/lib/supabase.ts`

2. Create auth pages (using Auth + DB Planner's route plan):
   - Sign-up page
   - Sign-in page
   - Sign-out route/handler
   - Forgot password page

3. Create protected route middleware:
   - Redirects unauthenticated users to sign-in
   - Session check on each protected route load

4. Create SQL migration file at `supabase/migrations/[timestamp]_init.sql`:
   - Table definitions from Auth + DB Planner
   - RLS policies from Auth + DB Planner
   - Reference policy patterns in `references/supabase-setup.md`

5. Add Supabase env vars to `.env.example` (if not already present from B1):
   ```
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   **Credential check:**

   If `managed=true`: read `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `.env` directly (they were collected by web-studio's pre-build check). If either is missing, log a warning and skip B6:
   ```
   Warning: Supabase credentials not found in .env — skipping Phase B6.
   Add credentials and re-run: /site-builder start-at=b6
   ```

   Else (`managed=false`, standalone): check `docs/product-marketing-context.md` for credentials. If not provided, prompt:
   ```
   B6 requires Supabase credentials. Please provide:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

   Paste them now or press Enter to skip B6.
   ```

Commit:
```
feat: add Supabase auth and database integration
```

---

### Phase B7: Deploy Prep

1. Write deployment config based on platform in `docs/product-marketing-context.md`:

   **Netlify** → `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"      # or .next for Next.js

   [[plugins]]
     package = "@netlify/plugin-nextjs"  # only if Next.js

   [build.environment]
     NODE_VERSION = "20"

   [[redirects]]
     from = "https://www.*"
     to = "https://:splat"
     status = 301
     force = true
   ```

   **Vercel** → `vercel.json`:
   ```json
   {
     "framework": "astro",
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

2. Add redirect rules:
   - www → non-www (301)
   - Trailing slash normalization

3. Ensure `.gitignore` contains:
   ```
   .env
   .env.local
   node_modules/
   dist/
   .astro/
   .next/
   ```

4. Run `npm run build` and verify it succeeds. If it fails:
   - Read the full error output
   - Diagnose and fix the issue (type errors, missing imports, bad config)
   - Re-run `npm run build`
   - Repeat until build passes — **do not open a PR with a broken build**

Commit:
```
feat: add deployment config and deploy prep
```

---

### PR Creation

After B7, open a GitHub PR:

```bash
gh pr create \
  --title "feat: [business name] — initial site build" \
  --body "$(cat <<'EOF'
## Summary
- [N]-page [framework] site built from site-plan.md and design-system.md
- [N] shared components (Header, Footer, MobileStickyBar, LeadCaptureForm, Button)
- Auth: [enabled with Supabase / not included]

## Pages Built
[list of pages]

## Components
[list of shared components]

## SEO
- LocalBusiness JSON-LD on homepage
- Meta tags and OG tags on all pages
- sitemap.xml and robots.txt

## Stack
- Framework: [Astro / Next.js]
- Styling: Tailwind CSS with design system tokens
- Deployment target: [Netlify / Vercel]
- Auth: [Supabase / None]

## Build status
- [x] npm run build passes

---
Generated with [Claude Code](https://claude.com/claude-code) via /site-builder
EOF
)"
```

If `gh pr create` fails:
- Save the PR body to `.web-studio/pr-body.md`
- Report the error and provide manual PR instructions

---

### Phase 8: Handoff

Update `.web-studio/state.json`:
```json
{
  "status": "builder_complete",
  "prUrl": "[PR URL]",
  "parallelBuildAgents": N,
  "pagesBuilt": N,
  "lastCompletedPhase": "b7",
  "completedAt": "[ISO timestamp]"
}
```

Report:
```
site-builder complete. [N] pages built across [N] commits. PR opened at [URL].

Ready for site-reviewer.
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Any docs file missing | Stop with specific error naming the file; tell user which skill to run |
| Research agent fails | Retry once; if still fails, proceed without it and note the gap in build-plan.md |
| Framework scaffold fails | Report full error output, suggest running the command manually, wait for confirmation before continuing |
| Build fails at B7 | Debug and fix before proceeding — do not open PR with a broken build |
| GitHub PR creation fails | Report error, save body to `.web-studio/pr-body.md`, provide manual PR instructions |
| Supabase credentials not provided | Prompt for SUPABASE_URL and SUPABASE_ANON_KEY before starting B6; offer to skip B6 |
| Copy Integrator gaps flagged | Use the copy brief text directly from site-plan.md as fallback; never write placeholder text |
| `image-manifest.json` missing at B1.5 | Stop B1.5. Report: "Agent 7 (Image Planner) did not produce image-manifest.json. Re-run Phase R." |
| No API keys in .env at B1.5 | Skip image generation. Log both missing key names and signup URLs. Add resume note. Continue to B2 with CSS fallbacks. |
| Single image fails at B1.5 | Log failure (filename + error). Continue remaining images. CSS placeholder for that image only. |
| Page build agent fails or times out at B3 (10-minute timeout per Step 3) | Retry once with the same assignment. If it fails again, coordinator builds those pages sequentially using the same rules. Note fallback pages in the commit body. |
| Page build agent writes incomplete output at B3 | Identify missing files by diffing expected assignment against files confirmed on disk. Coordinator builds missing pages before committing. Note fallback pages in the commit body. |

---

## State File

**Location:** `.web-studio/state.json`

Fields written by site-builder (`parallelBuildAgents` and `pagesBuilt` are set after Phase B3 completes):

```json
{
  "skill": "site-builder",
  "status": "in_progress | builder_complete",
  "lastCompletedPhase": "research | b1 | images | b2 | b3 | b5 | b6 | b7",
  "imagesGenerated": 0,
  "imagesFailed": 0,
  "imageSource": "nano-banana | pexels | skipped | null",
  "authEnabled": true,
  "framework": "astro | next",
  "branchName": "feat/business-name-site",
  "buildPlanPath": ".web-studio/build-plan.md",
  "parallelBuildAgents": 0,
  "pagesBuilt": 0,
  "prUrl": null,
  "completedAt": null
}
```

---

## Tips

1. **`start-at=bN`** lets you resume from any phase — useful after fixing a scaffold error manually
2. **`branch=new`** is recommended for sites being built on top of an existing repo
3. **Never skip B7** — a broken build will fail in CI and block site-reviewer
4. **Check `.web-studio/build-plan.md`** after Phase R to verify the agents' output before proceeding
5. **Phone numbers** — every instance must be `<a href="tel:...">`. The build plan explicitly tracks this; check all components at B2 review time
6. **Copy comes from Copy Integrator** — if you find yourself writing copy, stop and re-read the agent's output
7. **`skip-auth=true`** safely bypasses B6 even if auth was selected in discovery — useful for launching an MVP first
8. **`start-at=images`** re-runs just the image generation phase — useful after adding a missing API key without rebuilding the whole site
