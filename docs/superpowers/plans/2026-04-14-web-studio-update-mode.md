# Web Studio Update Mode + Deploy Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an update mode to web-studio so users can change existing sites, and remove the confusing "Decide later" option from the deploy question.

**Architecture:** All changes are edits to three existing Markdown skill files — no new files created. web-studio gains a 4th Phase 0 menu option ("Update"), a new `update` parameter, and a full Update Pipeline section. site-planner and site-designer each gain an `update-request` parameter and a new Update Mode workflow section. Phase 0.5 drops "Decide later" to a clean Yes/No; Phase 6 drops its null-branch.

**Tech Stack:** Markdown skill files only. No code, no tests, no build step.

---

### Task 1: web-studio — Deploy question cleanup

This task removes "Decide later" from Phase 0.5 and the corresponding null-branch from Phase 6. These are the simplest, most self-contained edits in the whole plan — do them first.

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Phase 0.5 at lines ~146–166, Phase 6 at lines ~346–382)

---

- [ ] **Step 1: Remove "Decide later" from Phase 0.5**

Find this exact block in `skills/web-studio/SKILL.md`:

```
If `deploy=ask` (default) and this is a fresh start, ask:

```
Should I deploy the site when the build is complete?

1. Yes — run site-deploy automatically after review
2. No — stop after review, I'll deploy manually
3. Decide later — ask me again after the build is done
```

**STOP — wait for the user's response.**

| Choice | Action |
|--------|--------|
| Yes | Set `deploy_enabled=true` in state, set `deploy=yes` |
| No | Set `deploy_enabled=false` in state, set `deploy=no` |
| Decide later | Leave `deploy_enabled=null`, will ask again after Phase 5 |
```

Replace with:

```
If `deploy=ask` (default) and this is a fresh start, ask:

```
Should I deploy the site when the build is complete?

1. Yes — run site-deploy automatically after review
2. No — stop after review, I'll deploy manually
```

**STOP — wait for the user's response.**

| Choice | Action |
|--------|--------|
| Yes | Set `deploy_enabled=true` in state, set `deploy=yes` |
| No | Set `deploy_enabled=false` in state, set `deploy=no` |
```

- [ ] **Step 2: Remove the null-branch from Phase 6**

Find this exact block in `skills/web-studio/SKILL.md`:

```
### Phase 6: site-deploy

**Skip if `deploy=no`.**

**If `deploy_enabled` is still null** (user chose "Decide later" in Phase 0.5), ask now:

```
Build and review are complete. Deploy to [platform from docs/product-marketing-context.md]?

1. Yes — deploy now
2. No — stop here, I'll deploy manually
```

**STOP — wait for the user's response.**

If yes: Announce `Phase 6: site-deploy` and invoke `/site-deploy`.
```

Replace with:

```
### Phase 6: site-deploy

**Skip if `deploy=no`.**

Announce `Phase 6: site-deploy` and invoke `/site-deploy`.
```

- [ ] **Step 3: Fix the "deferred" label in the Final Report**

Find in `skills/web-studio/SKILL.md`:

```
  ✓ site-deploy    [or — skipped (deploy=no / deferred)]
```

Replace with:

```
  ✓ site-deploy    [or — skipped (deploy=no)]
```

- [ ] **Step 4: Verify**

Read lines 146–170 and 346–370 of `skills/web-studio/SKILL.md`. Confirm:
- Phase 0.5 has exactly 2 numbered choices (no option 3)
- Phase 0.5 routing table has exactly 2 rows (Yes / No)
- Phase 6 no longer contains "deploy_enabled is still null" or "Decide later"
- Phase 6 no longer contains a STOP block asking "Deploy now?"

- [ ] **Step 5: Commit**

```bash
git add skills/web-studio/SKILL.md
git commit -m "fix: remove Decide later from web-studio deploy question

Simplifies Phase 0.5 to a clean Yes/No. Removes the Phase 6
null-branch that caused a second deploy question after long builds."
```

---

### Task 2: web-studio — Add Update option to Phase 0

This task adds "Update" as option 2 in the Phase 0 session menu (bumping Jump and Fresh start to 3 and 4) and updates the routing table and Architecture diagram accordingly.

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Phase 0 at lines ~96–118, Architecture at lines ~40–77)

---

- [ ] **Step 1: Update the session menu display block**

Find in `skills/web-studio/SKILL.md`:

```
Found an existing web-studio session for [business name].
Completed phases: [list of complete phases]
Last completed: [phase name]

How would you like to proceed?
1. Resume — continue from [next incomplete phase]
2. Jump to a specific phase — I'll ask which one
3. Fresh start — delete the session and start over
```

Replace with:

```
Found an existing web-studio session for [business name].
Completed phases: [list of complete phases]
Last completed: [phase name]

How would you like to proceed?
1. Resume — continue from [next incomplete phase]
2. Update — make changes to the existing site
3. Jump to a specific phase — I'll ask which one
4. Fresh start — delete the session and start over
```

- [ ] **Step 2: Update the routing table**

Find in `skills/web-studio/SKILL.md`:

```
| Choice | Action |
|--------|--------|
| Resume | Set `start-at` to the next incomplete phase, proceed |
| Specific phase | Ask which phase, set `start-at` accordingly, proceed |
| Fresh start | Delete `.web-studio/state.json`, proceed to initialize |
```

Replace with:

```
| Choice | Action |
|--------|--------|
| Resume | Set `start-at` to the next incomplete phase, proceed |
| Update | Ask "What would you like to change?" (free-text, multiple changes allowed), then enter the Update Pipeline |
| Specific phase | Ask which phase, set `start-at` accordingly, proceed |
| Fresh start | Delete `.web-studio/state.json`, proceed to initialize |
```

- [ ] **Step 3: Update the Architecture diagram**

Find in `skills/web-studio/SKILL.md`:

```
├── Phase 0: State Check
│   Check .web-studio/state.json → offer resume or fresh start
```

Replace with:

```
├── Phase 0: State Check
│   Check .web-studio/state.json → offer resume / update / jump / fresh start
```

- [ ] **Step 4: Add `lastUpdate` to the initial state schema**

Find in `skills/web-studio/SKILL.md`:

```
{
  "version": "1.0",
  "created_at": "[ISO timestamp]",
  "business_name": null,
  "site_type": null,
  "phases": {
    "discovery": "pending",
    "planner": "pending",
    "designer": "pending",
    "builder": "pending",
    "reviewer": "pending",
    "deploy": "skipped"
  },
  "deploy_enabled": null,
  "live_url": null
}
```

Replace with:

```
{
  "version": "1.0",
  "created_at": "[ISO timestamp]",
  "business_name": null,
  "site_type": null,
  "phases": {
    "discovery": "pending",
    "planner": "pending",
    "designer": "pending",
    "builder": "pending",
    "reviewer": "pending",
    "deploy": "skipped"
  },
  "deploy_enabled": null,
  "live_url": null,
  "lastUpdate": null
}
```

- [ ] **Step 5: Verify**

Read the Phase 0 section of `skills/web-studio/SKILL.md`. Confirm:
- Session menu shows 4 numbered options with "Update" at position 2
- Routing table has 4 rows (Resume / Update / Specific phase / Fresh start)
- Architecture diagram says "resume / update / jump / fresh start"
- Initial state.json includes `"lastUpdate": null`

- [ ] **Step 6: Commit**

```bash
git add skills/web-studio/SKILL.md
git commit -m "feat: add Update option to web-studio Phase 0 session menu"
```

---

### Task 3: web-studio — `update` parameter + Update Pipeline section + error handling

This task adds the `update` parameter to the Parameters table and Invocation examples, adds the full Update Pipeline section after Phase 6, and adds 3 new error handling rows.

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Parameters table ~lines 19–26, Invocation ~lines 28–36, after Phase 6 ~line 383, Error Handling ~lines 417–429)

---

- [ ] **Step 1: Add `update` to Parameters table**

Find in `skills/web-studio/SKILL.md`:

```
| Parameter | Default | Description |
|-----------|---------|-------------|
| `deploy` | `ask` | `yes` / `no` / `ask` — whether to run site-deploy after build |
| `start-at` | `discovery` | Skip to a phase: `discovery`, `planner`, `designer`, `builder`, `reviewer`, `deploy` |
| `skip-review` | `false` | Skip site-reviewer (not recommended — removes adversarial quality gate) |
| `site-type` | `ask` | Pass-through to site-discovery: `service`, `saas`, `ecommerce`, `blog`, `portfolio`, `landing` |
| `industry` | `ask` | Pass-through to site-discovery: `flooring`, `roofing`, `landscaping`, etc. |
```

Replace with:

```
| Parameter | Default | Description |
|-----------|---------|-------------|
| `deploy` | `ask` | `yes` / `no` / `ask` — whether to run site-deploy after build |
| `start-at` | `discovery` | Skip to a phase: `discovery`, `planner`, `designer`, `builder`, `reviewer`, `deploy` |
| `skip-review` | `false` | Skip site-reviewer (not recommended — removes adversarial quality gate) |
| `site-type` | `ask` | Pass-through to site-discovery: `service`, `saas`, `ecommerce`, `blog`, `portfolio`, `landing` |
| `industry` | `ask` | Pass-through to site-discovery: `flooring`, `roofing`, `landscaping`, etc. |
| `update` | `""` | Free-text description of changes to apply to an existing site. Bypasses Phase 0 and enters the Update Pipeline directly. Requires an existing `.web-studio/state.json`. |
```

- [ ] **Step 2: Add `update` invocation examples**

Find in `skills/web-studio/SKILL.md`:

```
/web-studio deploy=no skip-review=true
```

Replace with:

```
/web-studio deploy=no skip-review=true
/web-studio update="add more copy to the about page, remove the blog page"
/web-studio update="change primary color to navy, make typography bolder"
```

- [ ] **Step 3: Add the Update Pipeline section after Phase 6**

Find in `skills/web-studio/SKILL.md`:

```
---

### Final Report
```

Replace with:

```
---

## Update Pipeline

This section runs instead of Phases 0.5–6 when the user picks "Update" at Phase 0 or passes the `update` parameter.

**Entry conditions:**
- Via Phase 0 menu: user picked "Update", then answered "What would you like to change?"
- Via parameter: `update="..."` was passed. Skip Phase 0 entirely. If `.web-studio/state.json` does not exist, stop: `"No existing web-studio session found. Run /web-studio first to build the site before updating it."`

### Step 1: Receive update request

The update request is already collected (from the Phase 0 prompt or the `update` parameter value). No additional questions.

### Step 2: Classify changes

Read the update request and categorise each change. Multiple changes may span multiple categories:

| Category | Signals | Affected doc | Earliest build phase |
|----------|---------|-------------|----------------------|
| Content/Copy | "more copy", "update headline", "add testimonials", "rewrite services description" | `docs/site-plan.md` | B3 (homepage) or B4 (inner page) |
| Page Structure | "remove blog", "add FAQ page", "rename services to solutions", "add a pricing page" | `docs/site-plan.md` | B4 + B5 (sitemap must update) |
| Design | "primary color", "font", "spacing", "dark mode", "make it bolder" | `docs/design-system.md` | B2 (shared components rebuild) |
| Feature | "add contact form", "add auth", "Google Maps", "newsletter signup" | none (direct build) | B3–B6 depending on feature |

**Earliest phase rule:** when changes span multiple categories, `start-at` is set to the earliest phase across all of them.

Example: "remove the blog page and make the primary color darker"
→ Page Structure (B4) + Design (B2) → `start-at=b2`

If the update request is ambiguous (e.g. "make it better"), ask one clarifying question before classifying. Do not proceed until the request is specific enough to classify.

### Step 3: Update source docs

For each affected doc, invoke the relevant specialist skill in update mode:

- **`docs/site-plan.md` changes** — invoke `/site-planner update-request="[content/page changes extracted from request]"`
  - site-planner reads the existing file and applies only the requested changes
  - Writes updated `docs/site-plan.md`

- **`docs/design-system.md` changes** — invoke `/site-designer update-request="[design changes extracted from request]"`
  - site-designer reads the existing file and applies only the requested changes
  - Writes updated `docs/design-system.md`

- **Feature-only changes** — skip doc update, proceed to Step 4

### Step 4: Rebuild

Invoke `/site-builder start-at=[earliest phase from Step 2]`.

site-builder reads the updated docs and rebuilds from the specified phase forward through B7. A PR is opened at the end of B7.

### Step 5: Re-deployment prompt

After the site-builder PR is opened, always ask:

```
Update complete. Deploy these changes to [platform from docs/product-marketing-context.md]?

1. Yes — deploy now
2. No — I'll deploy manually
```

**STOP — wait for the user's response.**

### Step 6: Deploy (if yes)

Announce `Deploying update` and invoke `/site-deploy`. Capture live URL. Update state.

### Step 7: Update state

```json
{
  "lastUpdate": {
    "request": "[original update request text]",
    "ranAt": "[ISO timestamp]",
    "phasesRerun": ["b2", "b3", "b4", "b5", "b6", "b7"]
  }
}
```

Merge into existing `.web-studio/state.json` — do not overwrite other keys.

---

### Final Report
```

- [ ] **Step 4: Add 3 error handling rows**

Find in `skills/web-studio/SKILL.md`:

```
| state.json cannot be read (corrupted) | Warn user, offer to start fresh. Do not silently overwrite. |
| start-at phase references docs that don't exist | Warn: "Jumping to [phase] requires [missing doc]. Run the prior phases first or use start-at=[earlier phase]." |
```

Replace with:

```
| state.json cannot be read (corrupted) | Warn user, offer to start fresh. Do not silently overwrite. |
| start-at phase references docs that don't exist | Warn: "Jumping to [phase] requires [missing doc]. Run the prior phases first or use start-at=[earlier phase]." |
| `update` parameter passed but no `state.json` exists | Stop. Report: "No existing web-studio session found. Run /web-studio first to build the site before updating it." |
| Update request is ambiguous (e.g. "make it better") | Ask one clarifying question before classifying. Do not enter Step 3 until the request is specific enough to classify. |
| site-builder fails during update rebuild | Report which phase failed. User can resume the update with `/web-studio start-at=[failed phase]`. |
```

- [ ] **Step 5: Verify**

Read `skills/web-studio/SKILL.md` and confirm:
- Parameters table has 6 rows including `update`
- Invocation examples include two `update=` examples
- "Update Pipeline" section exists between Phase 6 and "Final Report"
- Update Pipeline has Steps 1–7 matching the spec exactly
- Error Handling table has 3 new rows at the end

- [ ] **Step 6: Commit**

```bash
git add skills/web-studio/SKILL.md
git commit -m "feat: add update parameter and Update Pipeline to web-studio"
```

---

### Task 4: site-planner — Add update mode

This task adds the `update-request` parameter and a new `## Update Mode` workflow section to site-planner. The update mode reads the existing `docs/site-plan.md`, applies targeted changes, and writes it back — without re-invoking any downstream skills.

**Files:**
- Modify: `skills/site-planner/SKILL.md` (Parameters table ~lines 23–27, Invocation ~lines 30–37, Architecture diagram ~lines 41–78, and append new section before Error Handling)

---

- [ ] **Step 1: Add `update-request` to Parameters table**

Find in `skills/site-planner/SKILL.md`:

```
| Parameter | Default | Description |
|-----------|---------|-------------|
| `context-file` | `docs/product-marketing-context.md` | Path to context file written by site-discovery |
| `skip-seo` | `false` | Skip SEO keyword research phase (faster, not recommended for service or local sites) |
| `skip-copy` | `false` | Skip copywriting phase (outputs copy brief as TBD stubs per page) |
```

Replace with:

```
| Parameter | Default | Description |
|-----------|---------|-------------|
| `context-file` | `docs/product-marketing-context.md` | Path to context file written by site-discovery |
| `skip-seo` | `false` | Skip SEO keyword research phase (faster, not recommended for service or local sites) |
| `skip-copy` | `false` | Skip copywriting phase (outputs copy brief as TBD stubs per page) |
| `update-request` | `""` | When set, run in update mode: apply the requested content/page changes to the existing `docs/site-plan.md` without re-running site-architecture, seo-audit, or copywriting. |
```

- [ ] **Step 2: Add `update-request` invocation example**

Find in `skills/site-planner/SKILL.md`:

```
/site-planner skip-seo=true skip-copy=true
```

Replace with:

```
/site-planner skip-seo=true skip-copy=true
/site-planner update-request="remove the blog page, add a FAQ page"
/site-planner update-request="add more copy to the about page hero section"
```

- [ ] **Step 3: Add Update Mode branch to Architecture diagram**

Find in `skills/site-planner/SKILL.md`:

```
+-- Phase 4: SYNTHESIZE AND WRITE OUTPUT
    Assemble docs/site-plan.md from all phase outputs
    Report: "site-planner complete. docs/site-plan.md written. Ready for site-designer."
```

Replace with:

```
+-- Phase 4: SYNTHESIZE AND WRITE OUTPUT
    Assemble docs/site-plan.md from all phase outputs
    Report: "site-planner complete. docs/site-plan.md written. Ready for site-designer."

[UPDATE MODE — only when update-request is set]
+-- Skip Phases 1–4
+-- UPDATE MODE: Read existing docs/site-plan.md → apply targeted changes → write back
    Does NOT invoke site-architecture, seo-audit, or copywriting
```

- [ ] **Step 4: Find the insertion point for the Update Mode section**

Read `skills/site-planner/SKILL.md` to find the line number of the `## Error Handling` heading (or the end of the Workflow section). The new `## Update Mode` section will be inserted immediately before it.

- [ ] **Step 5: Add the Update Mode workflow section**

Find the text immediately before the Error Handling section in `skills/site-planner/SKILL.md`. It will be the last workflow phase content, which ends with something like:

```
Report: "site-planner complete. docs/site-plan.md written. Ready for site-designer."
```

followed by a `---` separator and then `## Error Handling` (or `## Tips`).

Find that separator + heading:

```
---

## Error Handling
```

Replace with:

```
---

## Update Mode

Activated when `update-request` is set. Skips Phases 1–4. Does NOT invoke `site-architecture`, `seo-audit`, or `copywriting`.

### Step 1: Load existing docs

Read `docs/product-marketing-context.md` — stop if missing:
```
Error: docs/product-marketing-context.md not found. Run /site-discovery first.
```

Read `docs/site-plan.md` — stop if missing:
```
Error: docs/site-plan.md not found. Run /site-planner first to generate it before running in update mode.
```

### Step 2: Parse the update request

Identify which parts of `docs/site-plan.md` are affected:

| Change type | Affected section(s) in site-plan.md |
|-------------|--------------------------------------|
| Page removal | Page Inventory table, Copy Brief (remove the page's entry), SEO keyword map (remove page URL), internal linking plan (remove inbound links to the removed page) |
| Page addition | Page Inventory table (add new row), Copy Brief (add stub with headline TBD), SEO keyword map (add URL with primary keyword TBD), nav spec if it is a top-level page |
| Copy changes | Copy Brief → locate the relevant page's section and update the specified element (headline, subheadline, body, CTA) |

### Step 3: Apply changes

Make only the changes identified in Step 2. Preserve all other content exactly — do not reformat, reorder, or rewrite sections that are not part of the update request.

**Page removal rules:**
- Remove the row from the Page Inventory table
- Remove the page's section from the Copy Brief (the full `### /page-name` block)
- Remove the page's URL from the SEO keyword map
- Remove any internal links pointing to the removed page from the internal linking plan
- If the page was in the main nav, remove it from the nav spec

**Page addition rules:**
- Add a new row to the Page Inventory table: `| /page-name | Page Title | [nav position] |`
- Add a new section to the Copy Brief with the page name as heading and a headline stub: `**Headline:** [Derived from page purpose and business context]`
- Add the page URL to the SEO keyword map with a primary keyword derived from the page name and industry
- If it is a top-level page (not a sub-page under an existing section), add it to the main nav spec

**Copy change rules:**
- Locate the relevant page section in the Copy Brief
- Update the specified element only (e.g., `**Headline:**`, `**Hero Body:**`, `**CTA:**`)
- If the request says "more copy" or "expand", add 1–3 sentences to the existing content of the specified element

### Step 4: Write updated file

Overwrite `docs/site-plan.md` with the updated content.

### Step 5: Report

List every change applied:
```
site-planner update complete. Changes applied to docs/site-plan.md:
  ✓ Removed: /blog (Page Inventory, Copy Brief, SEO map, nav)
  ✓ Added: /faq (Page Inventory, Copy Brief stub, SEO map)
  ✓ Updated: /about → Hero Body (expanded)

Review docs/site-plan.md if you want to verify the changes before rebuilding.
```

Flag anything ambiguous that was resolved by assumption.

---

## Error Handling
```

- [ ] **Step 6: Verify**

Read `skills/site-planner/SKILL.md` and confirm:
- Parameters table has 4 rows including `update-request`
- Invocation examples include two `update-request=` examples
- Architecture diagram mentions UPDATE MODE branch
- `## Update Mode` section exists with Steps 1–5
- Update Mode section is positioned before `## Error Handling`
- Steps reference `site-plan.md` sections (Page Inventory, Copy Brief, SEO keyword map) — these are the actual section names site-planner writes to that file

- [ ] **Step 7: Commit**

```bash
git add skills/site-planner/SKILL.md
git commit -m "feat: add update-request parameter and update mode to site-planner"
```

---

### Task 5: site-designer — Add update mode

Same pattern as Task 4 but for `docs/design-system.md`. site-designer's update mode patches CSS variables, component specs, and the aesthetic brief without re-running `ui-ux-pro-max` or `frontend-design`.

**Files:**
- Modify: `skills/site-designer/SKILL.md` (Parameters table ~lines 23–26, Invocation ~lines 30–36, Architecture diagram ~lines 40–64, before Error Handling)

---

- [ ] **Step 1: Add `update-request` to Parameters table**

Find in `skills/site-designer/SKILL.md`:

```
| Parameter | Default | Description |
|-----------|---------|-------------|
| `style` | `auto` | Override aesthetic style (e.g. `modern`, `bold`, `minimal`, `luxury`). Default auto-selects based on industry from context file. |
| `skip-ux` | `false` | Skip ui-ux-pro-max phase (not recommended — accessibility and mobile rules are critical). |
```

Replace with:

```
| Parameter | Default | Description |
|-----------|---------|-------------|
| `style` | `auto` | Override aesthetic style (e.g. `modern`, `bold`, `minimal`, `luxury`). Default auto-selects based on industry from context file. |
| `skip-ux` | `false` | Skip ui-ux-pro-max phase (not recommended — accessibility and mobile rules are critical). |
| `update-request` | `""` | When set, run in update mode: apply the requested design changes to the existing `docs/design-system.md` without re-running ui-ux-pro-max or frontend-design. |
```

- [ ] **Step 2: Add `update-request` invocation examples**

Find in `skills/site-designer/SKILL.md`:

```
/site-designer skip-ux=true
```

Replace with:

```
/site-designer skip-ux=true
/site-designer update-request="change primary color to navy blue"
/site-designer update-request="switch to Inter font, increase base font size to 18px"
```

- [ ] **Step 3: Add Update Mode branch to Architecture diagram**

Find in `skills/site-designer/SKILL.md`:

```
+-- Phase 3: WRITE OUTPUT
    Assemble docs/design-system.md from all phase outputs
    Report: "site-designer complete. docs/design-system.md written. Ready for site-builder."
```

Replace with:

```
+-- Phase 3: WRITE OUTPUT
    Assemble docs/design-system.md from all phase outputs
    Report: "site-designer complete. docs/design-system.md written. Ready for site-builder."

[UPDATE MODE — only when update-request is set]
+-- Skip Phases 1–3
+-- UPDATE MODE: Read existing docs/design-system.md → apply targeted changes → write back
    Does NOT invoke ui-ux-pro-max or frontend-design
```

- [ ] **Step 4: Find the insertion point for the Update Mode section**

Read `skills/site-designer/SKILL.md` to find where the Workflow section ends and `## Error Handling` (or `## Tips`) begins.

- [ ] **Step 5: Add the Update Mode workflow section**

Find the `---` separator immediately before `## Error Handling` (or `## Tips`) in `skills/site-designer/SKILL.md`. Insert the new section before it.

Find:

```
---

## Error Handling
```

If there is no `## Error Handling` section, find the last `---` before `## Tips` and insert before it. Replace:

```
---

## Error Handling
```

With:

```
---

## Update Mode

Activated when `update-request` is set. Skips Phases 1–3. Does NOT invoke `ui-ux-pro-max` or `frontend-design`.

### Step 1: Load existing docs

Read `docs/product-marketing-context.md` — stop if missing:
```
Error: docs/product-marketing-context.md not found. Run /site-discovery first.
```

Read `docs/design-system.md` — stop if missing:
```
Error: docs/design-system.md not found. Run /site-designer first to generate it before running in update mode.
```

### Step 2: Parse the update request

Identify which parts of `docs/design-system.md` are affected:

| Change type | Affected section(s) in design-system.md |
|-------------|------------------------------------------|
| Color change | CSS Variables block — locate the relevant `--color-*` variable(s) |
| Font change | CSS Variables block — `--font-display` and/or `--font-body`; Google Fonts import line if present |
| Spacing/sizing | CSS Variables block — `--spacing-*` or `--font-size-base` |
| Style direction | Aesthetic Brief section |
| Component spec | Component Specs section — locate the relevant component block |

### Step 3: Apply changes

Make only the changes identified in Step 2. Preserve all other content exactly — do not reformat, reorder, or rewrite sections that are not part of the update request.

**Color change rules:**
- Locate the primary CSS variable for the requested color (e.g., `--color-primary`). Update its hex value to match the requested color.
- Update any derived variables proportionally: `--color-primary-dark` (darken ~15%), `--color-primary-light` (lighten ~15%), `--color-primary-hover` (darken ~10%).
- Update the `## Color Palette` prose description to match the new color.

**Font change rules:**
- Update `--font-display` and/or `--font-body` CSS variable values.
- If a Google Fonts import URL is present in the file, update the family names in the URL.
- Update the `## Typography` prose description to match the new font(s).

**Spacing/sizing rules:**
- Locate the specific CSS variable and update the value.
- Note in the report if the change may affect multiple components.

**Style direction rules:**
- Locate the `## Aesthetic Brief` section and update the relevant sentences.

### Step 4: Write updated file

Overwrite `docs/design-system.md` with the updated content.

### Step 5: Report

List every change applied:
```
site-designer update complete. Changes applied to docs/design-system.md:
  ✓ Color: --color-primary updated to #1e3a5f (navy blue)
           --color-primary-dark: #162c49, --color-primary-light: #2a5080, --color-primary-hover: #1a3356
  ✓ Aesthetic Brief: updated to reflect navy color direction

Review docs/design-system.md if you want to verify before rebuilding.
```

Flag anything ambiguous (e.g., if "make it bolder" could mean font weight or color contrast — state which interpretation was applied).

---

## Error Handling
```

- [ ] **Step 6: Verify**

Read `skills/site-designer/SKILL.md` and confirm:
- Parameters table has 3 rows including `update-request`
- Invocation examples include two `update-request=` examples
- Architecture diagram mentions UPDATE MODE branch
- `## Update Mode` section exists with Steps 1–5
- Color change rules mention derived variables (`--color-primary-dark`, etc.)
- Font change rules mention the Google Fonts import URL
- Update Mode section is positioned before `## Error Handling`

- [ ] **Step 7: Commit**

```bash
git add skills/site-designer/SKILL.md
git commit -m "feat: add update-request parameter and update mode to site-designer"
```

---

## Self-Review

**Spec coverage:**
- ✅ Update option in Phase 0 menu → Task 2
- ✅ `update` parameter shortcut → Task 3
- ✅ Free-text request, multiple changes → Task 3 (Update Pipeline Step 1)
- ✅ Change classification (Content/Page/Design/Feature) → Task 3 (Step 2 table)
- ✅ Doc update via site-planner/site-designer update mode → Task 3 (Step 3), Tasks 4 & 5
- ✅ Rebuild from earliest phase → Task 3 (Step 4)
- ✅ Always ask about re-deployment after update → Task 3 (Step 5)
- ✅ state.json `lastUpdate` field → Tasks 2 and 3
- ✅ "Decide later" removed from Phase 0.5 → Task 1
- ✅ Phase 6 null-branch removed → Task 1
- ✅ site-planner update mode: page removal, addition, copy changes → Task 4
- ✅ site-designer update mode: color, font, spacing, style, component → Task 5
- ✅ Error handling rows (no state.json, ambiguous request, rebuild failure) → Task 3
- ✅ Error handling in site-planner update mode (missing files) → Task 4
- ✅ Error handling in site-designer update mode (missing files) → Task 5

**No placeholders found.**

**Consistency:** `update-request` parameter name is consistent across web-studio (Step 3 invocations), site-planner, and site-designer. `lastUpdate` key name is consistent between Task 2 (state init) and Task 3 (Step 7).
