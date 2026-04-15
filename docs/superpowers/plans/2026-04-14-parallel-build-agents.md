# Parallel Build Agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sequential Phase B3 (Homepage) + Phase B4 (Inner Pages) in site-builder with a single Phase B3: Pages that dispatches 2 or 3 parallel agents based on page count, collects their output, and issues one detailed commit.

**Architecture:** Five targeted text edits to `skills/site-builder/SKILL.md` only. No new files. Agent count is determined by a simple page-count threshold (1–4 → 2 agents, 5+ → 3 agents) read from `docs/site-plan.md` at the start of B3. Agents write files only — no commits — and the coordinator issues a single detailed commit after all agents complete.

**Tech Stack:** Markdown skill instruction file only — no code compilation or tests.

---

## File Map

| File | Sections changed |
|------|-----------------|
| `skills/site-builder/SKILL.md` | Architecture diagram, Parameters table, Phase B3, Phase B4, Error Handling, State File |

---

### Task 1: Update architecture diagram and Parameters `start-at` row

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Architecture diagram ~lines 41–72, Parameters table ~lines 19–23)

- [ ] **Step 1: Update the architecture diagram**

  Find this exact block:

  ```
  +-- Phase B3: Homepage
  +-- Phase B4: Inner Pages
  +-- Phase B5: SEO Layer
  ```

  Replace with:

  ```
  +-- Phase B3: Pages (parallel — 2 or 3 agents based on scope)
  +-- Phase B5: SEO Layer
  ```

- [ ] **Step 2: Update the `start-at` Parameters row**

  Find this exact line:

  ```
  | `start-at` | `research` | Resume from phase: `research`, `b1`, `images`, `b2`, `b3`, `b4`, `b5`, `b6`, `b7` |
  ```

  Replace with:

  ```
  | `start-at` | `research` | Resume from phase: `research`, `b1`, `images`, `b2`, `b3`, `b5`, `b6`, `b7` |
  ```

- [ ] **Step 3: Verify**

  Read the Architecture section and Parameters table. Confirm:
  - `+-- Phase B4: Inner Pages` is gone
  - `+-- Phase B3: Pages (parallel — 2 or 3 agents based on scope)` is present
  - `b4` is absent from the `start-at` description
  - All other architecture lines and parameter rows are unchanged

---

### Task 2: Replace Phase B3 and Phase B4 with new Phase B3: Pages

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase B3 ~lines 364–389, Phase B4 ~lines 391–412)

- [ ] **Step 1: Make the edit**

  Find this exact block (Phase B3 through the end of Phase B4, including trailing `---`):

  ````markdown
  ### Phase B3: Homepage

  Build the homepage file (`src/pages/index.astro` or `app/page.tsx`) using:
  - Copy from Copy Integrator's structured JSON for the homepage
  - Component specs from Component Analyst
  - CTA placement and positioning from Conversion Optimizer

  Sections to build in order:

  1. **Hero** — full-width background image or gradient, headline, subheadline, primary + secondary CTA buttons, embedded `LeadCaptureForm`
  2. **Irresistible Offer** — offer text from copy brief, urgency badge (e.g., "Limited slots this month"), dual CTA buttons
  3. **Services Grid** — icon + service name + one-line benefit + "Learn More" CTA per service; sourced from site-plan.md services list
  4. **Trust Signals Bar** — Licensed & Insured badge, years in business, customer/job count, any certifications mentioned in product-marketing-context.md
  5. **Testimonials** — 3 cards with: quote text, customer name, location or role, star rating (structured from copy brief)
  6. **Service Area** — city list or prose paragraph drawn from product-marketing-context.md service areas
  7. **FAQ Accordion** — questions and answers from copy brief; accessible expand/collapse
  8. **Final CTA** — repeat of primary offer + `<a href="tel:...">` call button + embedded `LeadCaptureForm`

  All copy MUST come directly from Copy Integrator output. Do not write placeholder, lorem ipsum, or invented copy.

  Commit:
  ```
  feat: build homepage with all conversion sections
  ```

  ---

  ### Phase B4: Inner Pages

  Build all non-homepage pages defined in `docs/site-plan.md` page hierarchy. At minimum for a service site:

  - **Services page** — overview of all services with descriptions and "Get a Quote" CTAs
  - **Individual service subpages** — one page per service listed in site-plan.md (if sub-pages exist in the hierarchy)
  - **About page** — business story, team/owner info, values, trust signals
  - **Contact page** — full `LeadCaptureForm`, map embed placeholder (`<div id="map">` or Google Maps iframe), phone as `<a href="tel:...">`, business hours
  - **Service Areas page** — city list with local copy per city if available in copy brief; links to any city-specific sub-pages
  - Any additional pages in site-plan.md architecture not listed above

  Each inner page must:
  - Use the `Layout` component
  - Have all sections populated with real copy from Copy Integrator (not placeholder text)
  - Link internally to relevant service pages and to the homepage

  Commit:
  ```
  feat: add inner pages (services, about, contact, service areas)
  ```
  ````

  Replace with:

  ````markdown
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

  **Edge case — 5+ pages but no service subpage hierarchy:** If services is a single page (not a `/services/*` hierarchy), Agent 2 gets the first half of inner pages and Agent 3 gets the second half (split evenly by count).

  **Step 3: Spawn agents in parallel**

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

  Wait for all agents to complete. Collect each agent's completion summary (list of files written).

  **Step 4: Verify and fallback**

  Compare the expected page file list (from Step 2 agent assignments) against the files actually written.

  - **If an agent failed or timed out:** Retry that agent once with the same assignment and same context. If it fails a second time, build those pages yourself sequentially following the same rules above. Note which pages were built by fallback.
  - **If an agent wrote incomplete output (some assigned pages missing):** Build the missing pages yourself following the same rules above. Note which pages were built by fallback.

  **Step 5: Commit**

  After all pages are written and verified, issue a single commit. The title includes the total page count and agent count; the body lists every file under each agent's heading:

  ```
  feat: build all pages ([N] pages via [N] parallel agents)

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
  ````

- [ ] **Step 2: Verify**

  Read the Phase B3 section. Confirm:
  - Old "### Phase B3: Homepage" heading is gone
  - Old "### Phase B4: Inner Pages" heading is gone
  - New "### Phase B3: Pages" section is present with Steps 1–5
  - Scope assessment print statement is present
  - Both 2-agent and 3-agent assignment tables are present
  - The edge case for no service subpages is present
  - Agent 1 homepage sections list (Hero through Final CTA) is present
  - Agent 2 and Agent 3 page lists are present
  - Retry/fallback logic is present
  - Commit template with per-agent file listing is present

---

### Task 3: Update Error Handling table

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Error Handling table ~lines 616–628)

- [ ] **Step 1: Make the edit**

  Find this exact block (the last two rows of the error handling table):

  ```
  | Copy Integrator gaps flagged | Use the copy brief text directly from site-plan.md as fallback; never write placeholder text |
  | `image-manifest.json` missing at B1.5 | Stop B1.5. Report: "Agent 7 (Image Planner) did not produce image-manifest.json. Re-run Phase R." |
  | No API keys in .env at B1.5 | Skip image generation. Log both missing key names and signup URLs. Add resume note. Continue to B2 with CSS fallbacks. |
  | Single image fails at B1.5 | Log failure (filename + error). Continue remaining images. CSS placeholder for that image only. |
  ```

  Replace with:

  ```
  | Copy Integrator gaps flagged | Use the copy brief text directly from site-plan.md as fallback; never write placeholder text |
  | `image-manifest.json` missing at B1.5 | Stop B1.5. Report: "Agent 7 (Image Planner) did not produce image-manifest.json. Re-run Phase R." |
  | No API keys in .env at B1.5 | Skip image generation. Log both missing key names and signup URLs. Add resume note. Continue to B2 with CSS fallbacks. |
  | Single image fails at B1.5 | Log failure (filename + error). Continue remaining images. CSS placeholder for that image only. |
  | Page build agent fails or times out at B3 | Retry once with the same assignment. If it fails again, coordinator builds those pages sequentially using the same rules. Note fallback pages in the commit body. |
  | Page build agent writes incomplete output at B3 | Identify missing files by diffing expected assignment against files actually written. Coordinator builds missing pages before committing. Note fallback pages in the commit body. |
  ```

- [ ] **Step 2: Verify**

  Read the Error Handling table. Confirm:
  - Two new rows are present at the bottom of the table
  - "Page build agent fails or times out at B3" row is present
  - "Page build agent writes incomplete output at B3" row is present
  - All prior rows are unchanged

---

### Task 4: Update State File section

**Files:**
- Modify: `skills/site-builder/SKILL.md` (State File section ~lines 630–653)

- [ ] **Step 1: Make the edit**

  Find this exact block:

  ```
  {
    "skill": "site-builder",
    "status": "in_progress | builder_complete",
    "lastCompletedPhase": "research | b1 | images | b2 | b3 | b4 | b5 | b6 | b7",
    "imagesGenerated": 0,
    "imagesFailed": 0,
    "imageSource": "nano-banana | pexels | skipped | null",
    "authEnabled": true,
    "framework": "astro | next",
    "branchName": "feat/business-name-site",
    "buildPlanPath": ".web-studio/build-plan.md",
    "pagesBuilt": 0,
    "prUrl": null,
    "completedAt": null
  }
  ```

  Replace with:

  ```
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

  Then find this exact line (the note below the JSON block):

  ```
  Fields written by site-builder:
  ```

  Replace with:

  ```
  Fields written by site-builder (`parallelBuildAgents` and `pagesBuilt` are set after Phase B3 completes):
  ```

- [ ] **Step 2: Verify**

  Read the State File section. Confirm:
  - `"lastCompletedPhase"` enum no longer contains `b4`
  - `"parallelBuildAgents": 0` field is present (between `buildPlanPath` and `pagesBuilt`)
  - The introductory sentence notes that `parallelBuildAgents` and `pagesBuilt` are set after B3
  - All other fields are unchanged

---

## Self-Review

**Spec coverage:**
- ✓ Architecture diagram updated — B4 removed, B3 relabeled (Task 1)
- ✓ `start-at` valid values updated — `b4` removed (Task 1)
- ✓ Phase B3 and B4 replaced with new Phase B3: Pages (Task 2)
- ✓ Scope assessment (page count threshold, 2 vs 3 agents) (Task 2)
- ✓ Role-based page assignment (homepage / service pages / utility pages) (Task 2)
- ✓ Edge case — no service subpages with 5+ total pages (Task 2)
- ✓ Agent context spec (inline, no self-reading, framework, no-commit rule) (Task 2)
- ✓ Per-agent page rules (copy, Layout, tel links, internal links) (Task 2)
- ✓ Homepage sections list preserved in Agent 1 instructions (Task 2)
- ✓ Inner page types preserved in Agent 2/3 instructions (Task 2)
- ✓ Retry/fallback for failed agents (Task 2)
- ✓ Fallback for incomplete agent output (Task 2)
- ✓ Single detailed commit with per-agent file listing (Task 2)
- ✓ Error Handling table — 2 new rows (Task 3)
- ✓ State file — `parallelBuildAgents` field added (Task 4)
- ✓ State file — `b4` removed from `lastCompletedPhase` enum (Task 4)
- ✓ State file — `pagesBuilt` timing note added (Task 4)

**Placeholder scan:** No TBDs. All replacement text is complete and literal.

**Consistency check:** `b4` removed in three places (diagram, start-at table, state enum) — all consistent. New Phase B3: Pages section is self-contained with all rules from old B3+B4 preserved and distributed to the correct agents.
