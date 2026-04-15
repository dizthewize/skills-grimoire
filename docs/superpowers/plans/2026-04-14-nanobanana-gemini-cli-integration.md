# Nanobanana Gemini CLI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `site-builder` and `web-studio` skills to invoke nanobanana via the Gemini CLI, replacing the vague "Call Nano Banana" placeholder and removing stale alternate key names.

**Architecture:** Four targeted text edits across two skill files. No new files created. Each task edits one logical section and commits independently.

**Tech Stack:** Markdown skill files only — no code compilation or tests. Verification is reading the file after editing.

---

## File Map

| File | Section | Change |
|------|---------|--------|
| `skills/site-builder/SKILL.md` | Phase B1 Step 5 — `.env.example` comment | Update comment text |
| `skills/site-builder/SKILL.md` | Phase B1.5 Step 3 — credential priority list | Remove two stale key aliases |
| `skills/site-builder/SKILL.md` | Phase B1.5 Step 4 — image generation invocation | Replace vague text with concrete bash sequence |
| `skills/site-builder/SKILL.md` | Phase B1.5 Step 6 — no-key warning | Remove two stale key names from warning |
| `skills/web-studio/SKILL.md` | Phase 0.1 — Image API keys section | Add Gemini CLI check, simplify to two key names |

---

### Task 1: Update `.env.example` comment in site-builder

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase B1, Step 5, lines ~191–195)

- [ ] **Step 1: Make the edit**

  In `skills/site-builder/SKILL.md`, find this block (inside the Phase B1 Step 5 `.env.example` code block):

  ```
     # Image Generation (web-studio)
     # Primary: Nano Banana / Gemini AI image generation
     # Get your key at: https://aistudio.google.com/apikey
     NANOBANANA_API_KEY=
  ```

  Replace with:

  ```
     # Image Generation (web-studio)
     # Nanobanana (Gemini CLI extension) — AI image generation
     # Get your key at: https://aistudio.google.com/apikey
     NANOBANANA_API_KEY=
  ```

- [ ] **Step 2: Verify**

  Read lines 189–202 of `skills/site-builder/SKILL.md`. Confirm:
  - Comment reads `# Nanobanana (Gemini CLI extension) — AI image generation`
  - `NANOBANANA_API_KEY=` is present
  - `NANOBANANA_GEMINI_API_KEY=` is absent (it was already absent — confirm no regression)
  - `PEXELS_API_KEY=` is still present

---

### Task 2: Simplify credential priority list in site-builder

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase B1.5 Step 3, lines ~228–233)

- [ ] **Step 1: Make the edit**

  Find this block:

  ```
     **Priority order:**
     - `NANOBANANA_API_KEY` → use Nano Banana (photorealistic AI generation)
     - `NANOBANANA_GEMINI_API_KEY` → use Nano Banana (same path, alternate key name)
     - `GEMINI_API_KEY` → use Nano Banana (same path, fallback key name)
     - `PEXELS_API_KEY` (no Nano Banana key found) → use `/seo images generate` (Pexels stock photos)
     - Neither key found → skip image generation (see step 6)
  ```

  Replace with:

  ```
     **Priority order:**
     - `NANOBANANA_API_KEY` → use Nano Banana via Gemini CLI (photorealistic AI generation)
     - `PEXELS_API_KEY` (no Nano Banana key found) → use `/seo images generate` (Pexels stock photos)
     - Neither key found → skip image generation (see step 6)
  ```

- [ ] **Step 2: Verify**

  Read lines 226–235 of `skills/site-builder/SKILL.md`. Confirm:
  - Priority list has exactly two entries (NANOBANANA_API_KEY and PEXELS_API_KEY) plus the skip case
  - `NANOBANANA_GEMINI_API_KEY` and `GEMINI_API_KEY` lines are gone
  - `NANOBANANA_API_KEY` description now says "via Gemini CLI"

---

### Task 3: Wire up the actual nanobanana invocation in site-builder

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase B1.5 Step 4, lines ~235–249)

- [ ] **Step 1: Make the edit**

  Find this block:

  ```
  4. **If Nano Banana key found:**

     For each image entry in the manifest:
     - Call Nano Banana with `prompt` field and `style=photorealistic`
     - Save raw output to `public/assets/images/{filename}.png`
     - Run seo-images optimization pipeline on each file (resize to manifest dimensions, convert to WebP with IPTC metadata)
     - Save final as `public/assets/images/{filename}.webp`
     - If `responsiveVariants: true` and dimensions width > 300px, generate 400w/800w/1200w variants
  ```

  Replace with:

  ```
  4. **If Nano Banana key found:**

     For each image entry in the manifest:

     ```bash
     # 1. Snapshot nanobanana-output/ before generation (detect new file afterward)
     before=$(ls ./nanobanana-output/ 2>/dev/null | sort)

     # 2. Invoke nanobanana via Gemini CLI, passing API key from .env
     NANOBANANA_API_KEY=$(grep '^NANOBANANA_API_KEY=' .env | cut -d= -f2) \
       gemini "/generate '{prompt}' --styles='photorealistic'"

     # 3. Detect the new file by diffing directory state before/after
     new_file=$(comm -13 <(echo "$before") <(ls ./nanobanana-output/ 2>/dev/null | sort) | head -1)

     # 4. Move to target path
     mv "./nanobanana-output/$new_file" "public/assets/images/{filename}.png"
     ```

     - Run seo-images optimization pipeline on `public/assets/images/{filename}.png` (resize to manifest dimensions, convert to WebP with IPTC metadata)
     - Save final as `public/assets/images/{filename}.webp`
     - If `responsiveVariants: true` and dimensions width > 300px, generate 400w/800w/1200w variants
  ```

  (The `og-image` block that follows — lines starting with `After hero-bg is generated` — is unchanged; leave it in place.)

- [ ] **Step 2: Verify**

  Read lines 235–260 of `skills/site-builder/SKILL.md`. Confirm:
  - Step 4 contains the bash block with the four numbered comments
  - `gemini "/generate ..."` is the invocation command
  - `comm -13` diff approach is present for file detection
  - `mv "./nanobanana-output/$new_file"` move is present
  - seo-images and og-image sections follow unchanged

---

### Task 4: Clean up the no-key warning in site-builder

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase B1.5 Step 6, lines ~278–291)

- [ ] **Step 1: Make the edit**

  Find this block:

  ```
     Warning: No image generation API keys found in .env.

     To enable AI-generated images, add one of these to .env:
       NANOBANANA_API_KEY=          (get at: https://aistudio.google.com/apikey)
       NANOBANANA_GEMINI_API_KEY=   (alternate name — same key)
       GEMINI_API_KEY=              (use your existing Google AI Studio key)

     To enable Pexels stock photo fallback, add to .env:
       PEXELS_API_KEY=        (get at: https://www.pexels.com/api/ — free, no billing)
  ```

  Replace with:

  ```
     Warning: No image generation API keys found in .env.

     To enable AI-generated images (requires Gemini CLI with nanobanana extension installed):
       NANOBANANA_API_KEY=    (get at: https://aistudio.google.com/apikey)

     To enable Pexels stock photo fallback, add to .env:
       PEXELS_API_KEY=        (get at: https://www.pexels.com/api/ — free, no billing)
  ```

- [ ] **Step 2: Verify**

  Read lines 275–295 of `skills/site-builder/SKILL.md`. Confirm:
  - Warning block shows only `NANOBANANA_API_KEY=` under the AI images section
  - `NANOBANANA_GEMINI_API_KEY=` and `GEMINI_API_KEY=` lines are gone
  - Parenthetical now reads "requires Gemini CLI with nanobanana extension installed"
  - Pexels section unchanged

- [ ] **Step 3: Commit all site-builder changes**

  ```bash
  git add skills/site-builder/SKILL.md
  git commit -m "feat(site-builder): wire up nanobanana Gemini CLI invocation, remove stale key aliases"
  ```

  _(If the project has no git repo, skip the commit step.)_

---

### Task 5: Update Phase 0.1 credential check in web-studio

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Phase 0.1 Image API keys section, lines ~173–202)

- [ ] **Step 1: Make the edit**

  Find this block (the entire `#### Image API keys` section):

  ```
  #### Image API keys

  Check `.env` in the project directory for any of: `NANOBANANA_API_KEY`, `NANOBANANA_GEMINI_API_KEY`, `GEMINI_API_KEY`, `PEXELS_API_KEY`.

  This check is **never a hard stop** — missing image keys degrade build output but do not block the pipeline.

  **If GitHub authenticated AND at least one image key found:** print a compact one-line status and proceed — no stop:

  ```
    ✓ GitHub authenticated (@[username]) | ✓ Image API ready ([key name]) — proceeding
  ```

  **If GitHub authenticated AND no image key found:** print the full status block (informational only) and proceed without stopping:

  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Session Credential Check
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    GitHub CLI:   ✓ authenticated as @[username]
    Image API:    ✗ no key found

    Images will use CSS gradient placeholders during the build.
    To enable real images, add to .env before the build:
      NANOBANANA_API_KEY=    (AI images — https://aistudio.google.com/apikey)
      PEXELS_API_KEY=        (stock photos — https://www.pexels.com/api/)
    Or re-run just the image phase later: /site-builder start-at=images

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
  ```

  Replace with:

  ````
  #### Image API keys

  Run `gemini --version` to check whether the Gemini CLI is installed.

  Check `.env` in the project directory for `NANOBANANA_API_KEY` or `PEXELS_API_KEY`.

  This check is **never a hard stop** — missing image keys degrade build output but do not block the pipeline.

  **If GitHub authenticated AND Gemini CLI installed AND `NANOBANANA_API_KEY` found:** print compact one-line status and proceed — no stop:

  ```
    ✓ GitHub authenticated (@[username]) | ✓ Gemini CLI installed | ✓ NANOBANANA_API_KEY — AI images ready — proceeding
  ```

  **If GitHub authenticated AND `PEXELS_API_KEY` found (no nanobanana key or CLI):** print compact one-line status and proceed — no stop:

  ```
    ✓ GitHub authenticated (@[username]) | ✓ PEXELS_API_KEY — stock photos — proceeding
  ```

  **If GitHub authenticated AND no image key found:** print the full status block (informational only) and proceed without stopping:

  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Session Credential Check
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    GitHub CLI:   ✓ authenticated as @[username]
    Gemini CLI:   [✓ installed | ✗ not found (install from geminicli.com)]
    Image API:    ✗ no key found

    Images will use CSS gradient placeholders during the build.
    To enable AI-generated images, add to .env before the build:
      NANOBANANA_API_KEY=    (get at: https://aistudio.google.com/apikey — requires Gemini CLI + nanobanana extension)
    To enable stock photo fallback, add to .env:
      PEXELS_API_KEY=        (get at: https://www.pexels.com/api/ — free, no billing)
    Or re-run just the image phase later: /site-builder start-at=images

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

  **If GitHub authenticated AND `NANOBANANA_API_KEY` found BUT Gemini CLI not installed:** print the full status block and proceed without stopping:

  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Session Credential Check
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    GitHub CLI:   ✓ authenticated as @[username]
    Gemini CLI:   ✗ not found — NANOBANANA_API_KEY present but unusable without CLI
    Image API:    ✓ NANOBANANA_API_KEY

    AI image generation requires the Gemini CLI with the nanobanana extension:
      gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
    Falling back to Pexels if PEXELS_API_KEY is set, otherwise CSS gradient placeholders.
    Or re-run just the image phase after installing: /site-builder start-at=images

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
  ````

- [ ] **Step 2: Verify**

  Read lines 153–210 of `skills/web-studio/SKILL.md`. Confirm:
  - `gemini --version` check is present
  - Key check covers only `NANOBANANA_API_KEY` and `PEXELS_API_KEY`
  - `NANOBANANA_GEMINI_API_KEY` and `GEMINI_API_KEY` do not appear anywhere in the section
  - Four display cases are present: (1) CLI+key, (2) Pexels only, (3) no keys, (4) key but no CLI
  - The no-CLI warning includes the install command for nanobanana

- [ ] **Step 3: Commit**

  ```bash
  git add skills/web-studio/SKILL.md
  git commit -m "feat(web-studio): add Gemini CLI check to Phase 0.1, remove stale nanobanana key aliases"
  ```

  _(If the project has no git repo, skip the commit step.)_

---

## Self-Review

**Spec coverage:**
- ✓ `.env.example` comment updated (Task 1)
- ✓ Stale key aliases removed from credential priority list (Task 2)
- ✓ Actual `gemini "/generate ..."` invocation with before/after diff and `mv` (Task 3)
- ✓ Stale key aliases removed from no-key warning (Task 4)
- ✓ `gemini --version` check added, key list simplified to two, four display cases cover all states (Task 5)

**Placeholder scan:** No TBDs, all exact text shown.

**Consistency check:** `NANOBANANA_API_KEY` is the only nanobanana key name used across all tasks. The `gemini "/generate ..."` command is consistent with the headless mode syntax confirmed from Gemini CLI docs.
