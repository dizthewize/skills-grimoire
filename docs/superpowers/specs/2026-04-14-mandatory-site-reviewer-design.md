# Mandatory Site Reviewer After Every Code Change

**Date:** 2026-04-14  
**Status:** Approved  
**Scope:** `skills/web-studio/SKILL.md` only

---

## Problem

The Update Pipeline in `web-studio` explicitly skipped site-reviewer with the note "site-reviewer is not re-invoked on update runs — the PR can be reviewed manually if desired." This caused the skill to prompt the user about review rather than running it automatically. The full build pipeline (Phase 5) already runs site-reviewer unconditionally — the Update Pipeline was inconsistent with this.

---

## Requirement

site-reviewer must run automatically after every code-producing phase (full build and update runs alike). No asking. No optional prompting. The only supported opt-out is the explicit `skip-review=true` parameter, which applies to full builds only.

---

## Changes

### 1. Execution Model — global policy statement

Add after the existing "Only stop when a `STOP`..." sentence:

> site-reviewer runs automatically after every code-producing phase (full build and update runs alike). It cannot be omitted unless `skip-review=true` is explicitly passed.

### 2. Update Pipeline Step 4 — remove skip note

Current Step 4 ends with:
> "site-reviewer is not re-invoked on update runs — the PR can be reviewed manually if desired."

Remove that sentence entirely. Step 4 becomes: invoke site-builder, wait for completion, capture the PR URL. Period.

### 3. Update Pipeline — insert Step 5: Site Review

Insert between current Step 4 (rebuild) and current Step 5 (re-deployment prompt):

---
**Step 5: Site Review**

Announce: `Update review: site-reviewer`

Invoke `/site-reviewer`.

Wait for the skill to complete fully.

**CRITICAL findings gate:** If site-reviewer reports unresolved CRITICAL findings, do NOT proceed to the re-deployment prompt. Report:

```
site-reviewer found unresolved critical findings. Deployment is blocked.

Resolve the critical findings flagged in the PR, then resume the update:
/web-studio update="[original update request]"
```

---

### 4. Renumber Update Pipeline steps

Insert of new Step 5 shifts subsequent steps:

| Old | New | Name |
|-----|-----|------|
| Step 5 | Step 6 | Re-deployment prompt |
| Step 6 | Step 7 | Deploy (if yes) |
| Step 7 | Step 8 | Update state |

### 5. Update state (new Step 8) — add reviewer field

Add `reviewer_complete` to the `last_update` block:

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

### 6. Final Report (update run block) — add site-reviewer line

```
Changes applied:
  ✓ [site-plan.md updated / skipped — no content changes]
  ✓ [design-system.md updated / skipped — no design changes]
  ✓ site-builder rebuilt from [earliest phase]
  ✓ site-reviewer: [N findings, N critical auto-fixed / no findings]
  ✓ PR opened: [PR URL]
  ✓ Deployed: [live URL or "Not deployed"]
```

### 7. Error handling table — add two rows

| Scenario | Action |
|----------|--------|
| site-builder opens PR during update run but reviewer fails | State has `reviewer=failed`. Report: "Builder succeeded (PR open). Reviewer failed. Resolve manually or re-run `/site-reviewer`." |
| site-reviewer leaves CRITICAL findings in update run | Do NOT proceed to re-deployment prompt. Report: "Resolve critical findings in the PR, then resume the update." |

### 8. Tips section — clarify skip-review=true scope

Current tip:
> "For fast prototyping: `skip-review=true deploy=no` — gets a built site without review or deploy overhead"

Updated:
> "For fast prototyping: `skip-review=true deploy=no` — gets a built site without review or deploy overhead (applies to full builds only; update runs always review)"

---

## What Does Not Change

- Phase 5 (site-reviewer) in the main pipeline — already mandatory, unchanged
- `skip-review=true` parameter behavior for full builds — unchanged
- site-reviewer's own behavior (phases, auto-fix, auto-merge) — unchanged
- All other Update Pipeline logic (classify, doc updates, rebuild, deploy) — unchanged
