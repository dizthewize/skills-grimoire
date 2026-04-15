# Mandatory Site Reviewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make site-reviewer run automatically after every code-producing phase in web-studio, including the Update Pipeline which currently skips it.

**Architecture:** Five targeted text edits to `skills/web-studio/SKILL.md` only. No new files. Changes follow the existing pattern established by Phase 5 in the main pipeline.

**Tech Stack:** Markdown skill instruction file only — no code compilation or tests.

---

## File Map

| File | Sections changed |
|------|-----------------|
| `skills/web-studio/SKILL.md` | Execution Model, Update Pipeline Steps 4–7, Final Report, Error Handling, Tips |

---

### Task 1: Add global policy statement to Execution Model

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Execution Model section, ~lines 86–91)

- [ ] **Step 1: Make the edit**

  Find this exact block:

  ```
  ## Execution Model

  **Phases run sequentially and autonomously — do NOT pause between them.**

  Only stop when a `STOP — wait for the user's response` instruction explicitly appears (Phase 0 state check, Phase 0.5 deploy preference, and the USER CHECKPOINT before Phase 4). Every other transition happens immediately: when a phase completes, announce the next phase and begin it.
  ```

  Replace with:

  ```
  ## Execution Model

  **Phases run sequentially and autonomously — do NOT pause between them.**

  Only stop when a `STOP — wait for the user's response` instruction explicitly appears (Phase 0 state check, Phase 0.5 deploy preference, and the USER CHECKPOINT before Phase 4). Every other transition happens immediately: when a phase completes, announce the next phase and begin it.

  **site-reviewer runs automatically after every code-producing phase (full build and update runs alike). It cannot be omitted unless `skip-review=true` is explicitly passed.**
  ```

- [ ] **Step 2: Verify**

  Read the Execution Model section. Confirm the new bold sentence is present immediately after the "Every other transition" sentence, and that no other content was changed.

---

### Task 2: Update Step 4 and insert new Step 5 (Site Review) in Update Pipeline

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Update Pipeline Steps 4–5, ~lines 557–574)

- [ ] **Step 1: Make the edit**

  Find this exact block (Step 4 through the end of Step 5):

  ```
  ### Step 4: Rebuild

  Invoke `/site-builder start-at=[earliest phase from Step 2] managed=true`.

  site-builder reads the updated docs and rebuilds from the specified phase forward through B7. A PR is opened at the end of B7. site-reviewer is not re-invoked on update runs — the PR can be reviewed manually if desired.

  ### Step 5: Re-deployment prompt

  After the site-builder PR is opened, read `docs/product-marketing-context.md` to determine the deploy platform, then always ask:

  ```
  Update complete. Deploy these changes to [platform]?

  1. Yes — deploy now
  2. No — I'll deploy manually
  ```

  **STOP — wait for the user's response.**
  ```

  Replace with:

  ```
  ### Step 4: Rebuild

  Invoke `/site-builder start-at=[earliest phase from Step 2] managed=true`.

  site-builder reads the updated docs and rebuilds from the specified phase forward through B7. A PR is opened at the end of B7.

  ### Step 5: Site Review

  Announce: `Update review: site-reviewer`

  Invoke `/site-reviewer`.

  Wait for the skill to complete fully.

  **CRITICAL findings gate:** If site-reviewer reports unresolved CRITICAL findings, do NOT proceed to the re-deployment prompt. Report:

  ```
  site-reviewer found unresolved critical findings. Deployment is blocked.

  Resolve the critical findings flagged in the PR, then resume the update:
  /web-studio update="[original update request]"
  ```

  ### Step 6: Re-deployment prompt

  After site-reviewer completes, read `docs/product-marketing-context.md` to determine the deploy platform, then always ask:

  ```
  Update complete. Deploy these changes to [platform]?

  1. Yes — deploy now
  2. No — I'll deploy manually
  ```

  **STOP — wait for the user's response.**
  ```

- [ ] **Step 2: Verify**

  Read the Update Pipeline from Step 4 through Step 6. Confirm:
  - Step 4 ends after "A PR is opened at the end of B7." — no "not re-invoked" sentence
  - Step 5 is titled "Site Review" and contains the `/site-reviewer` invocation and CRITICAL findings gate
  - Step 6 is the re-deployment prompt (renumbered from 5), its lead sentence now says "After site-reviewer completes"

---

### Task 3: Renumber Steps 6→7 and 7→8, add reviewer_complete to state

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Update Pipeline Steps 6–7, ~lines 576–592)

- [ ] **Step 1: Make the edit**

  Find this exact block:

  ```
  ### Step 6: Deploy (if yes)

  Announce `Deploying update` and invoke `/site-deploy`. Capture live URL. Update state.

  ### Step 7: Update state

  ```json
  {
    "last_update": {
      "request": "[original update request text]",
      "ran_at": "[ISO timestamp]",
      "phases_rerun": ["b2", "b3", "b4", "b5", "b6", "b7"]
    }
  }
  ```

  Also write `live_url` to state if Step 6 ran (deploy happened). Merge all fields into existing `.web-studio/state.json` — do not overwrite other keys.
  ```

  Replace with:

  ```
  ### Step 7: Deploy (if yes)

  Announce `Deploying update` and invoke `/site-deploy`. Capture live URL. Update state.

  ### Step 8: Update state

  ```json
  {
    "last_update": {
      "request": "[original update request text]",
      "ran_at": "[ISO timestamp]",
      "phases_rerun": ["b2", "b3", "b4", "b5", "b6", "b7"],
      "reviewer_complete": true
    }
  }
  ```

  Also write `live_url` to state if Step 7 ran (deploy happened). Merge all fields into existing `.web-studio/state.json` — do not overwrite other keys.
  ```

- [ ] **Step 2: Verify**

  Read the renumbered steps. Confirm:
  - "Step 6: Deploy (if yes)" is gone — it is now "Step 7: Deploy (if yes)"
  - "Step 7: Update state" is gone — it is now "Step 8: Update state"
  - `reviewer_complete: true` is present in the state JSON block
  - The "if Step 6 ran" reference in the prose now says "Step 7"

---

### Task 4: Add site-reviewer line to Final Report (update run block)

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Final Report update run block, ~lines 598–616)

- [ ] **Step 1: Make the edit**

  Find this exact block inside the update run Final Report fenced block:

  ```
  Changes applied:
    ✓ [site-plan.md updated / skipped — no content changes]
    ✓ [design-system.md updated / skipped — no design changes]
    ✓ site-builder rebuilt from [earliest phase]
    ✓ PR opened: [PR URL]
    ✓ Deployed: [live URL or "Not deployed"]
  ```

  Replace with:

  ```
  Changes applied:
    ✓ [site-plan.md updated / skipped — no content changes]
    ✓ [design-system.md updated / skipped — no design changes]
    ✓ site-builder rebuilt from [earliest phase]
    ✓ site-reviewer: [N findings, N critical auto-fixed / no findings]
    ✓ PR opened: [PR URL]
    ✓ Deployed: [live URL or "Not deployed"]
  ```

- [ ] **Step 2: Verify**

  Read the Final Report section. Confirm:
  - The `site-reviewer:` line appears between "site-builder rebuilt" and "PR opened"
  - All other lines in the block are unchanged

---

### Task 5: Add error handling rows and update Tips

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Error Handling table ~lines 663–665, Tips ~line 670)

- [ ] **Step 1: Add error handling rows**

  Find this exact block (the last two rows of the error handling table):

  ```
  | Update request is ambiguous (e.g. "make it better") | Ask one clarifying question before classifying. Do not enter Step 3 until the request is specific enough to classify. |
  | site-builder fails during update rebuild | Report which phase failed. User can resume the update with `/web-studio start-at=[failed phase]`. |
  ```

  Replace with:

  ```
  | Update request is ambiguous (e.g. "make it better") | Ask one clarifying question before classifying. Do not enter Step 3 until the request is specific enough to classify. |
  | site-builder fails during update rebuild | Report which phase failed. User can resume the update with `/web-studio start-at=[failed phase]`. |
  | site-builder opens PR during update run but reviewer fails | State has `reviewer=failed`. Report: "Builder succeeded (PR open). Reviewer failed. Resolve manually or re-run `/site-reviewer`." |
  | site-reviewer leaves CRITICAL findings in update run | Do NOT proceed to re-deployment prompt. Report: "Resolve critical findings in the PR, then resume the update." |
  ```

- [ ] **Step 2: Update the Tips line**

  Find this exact line:

  ```
  - For fast prototyping: `skip-review=true deploy=no` — gets a built site without review or deploy overhead
  ```

  Replace with:

  ```
  - For fast prototyping: `skip-review=true deploy=no` — gets a built site without review or deploy overhead (applies to full builds only; update runs always review)
  ```

- [ ] **Step 3: Verify**

  Read the Error Handling table. Confirm:
  - Two new rows are present at the bottom of the table
  - Row for "opens PR during update run but reviewer fails" is present
  - Row for "CRITICAL findings in update run" is present

  Read the Tips section. Confirm:
  - The fast-prototyping tip now ends with "(applies to full builds only; update runs always review)"

---

## Self-Review

**Spec coverage:**
- ✓ Global policy statement (Task 1)
- ✓ Remove "not re-invoked" sentence from Step 4 (Task 2)
- ✓ New Step 5 Site Review with `/site-reviewer` invocation and CRITICAL findings gate (Task 2)
- ✓ Renumber Steps 5→6, 6→7, 7→8 (Tasks 2 and 3)
- ✓ `reviewer_complete` field in state (Task 3)
- ✓ `site-reviewer:` line in Final Report (Task 4)
- ✓ Two new error handling rows (Task 5)
- ✓ Tips clarification (Task 5)

**Placeholder scan:** No TBDs. All replacement text is complete and literal.

**Consistency check:** Step 6 re-deployment prompt now says "After site-reviewer completes" — consistent with Step 5 completing before Step 6 begins. State block says "Step 7 ran" — consistent with renumbering.
