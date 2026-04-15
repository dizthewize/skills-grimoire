# Auto Branch for PR Design

**Date:** 2026-04-14
**Status:** Approved
**Scope:** `skills/site-builder/SKILL.md` only

---

## Problem

`site-builder` defaults to `branch=main`, committing all build phases directly to the current branch. When `gh pr create` runs at the end of the build, GitHub rejects it because the head branch and base branch are both `main` — a PR cannot be opened from a branch to itself.

This affects all runs where `branch` is not explicitly set: standalone `/site-builder` invocations and web-studio-orchestrated runs (`/site-builder managed=true`).

---

## Requirement

Change the default value of the `branch` parameter from `main` to `new`. The existing `new` behavior (create `feat/[business-name-slug]-site` branch at Phase 0, before any commits) already handles this correctly — no new logic is needed.

---

## Change

### Parameters table — one field updated

| Parameter | Old Default | New Default |
|-----------|-------------|-------------|
| `branch` | `main` | `new` |

The description of the `branch` parameter and the Phase 0 Step 3 logic are unchanged.

---

## Runtime Behavior After Fix

| Invocation | Branch behavior |
|---|---|
| `/web-studio` (calls `site-builder managed=true`) | Creates `feat/[business-slug]-site` branch at Phase 0; all commits go there; `gh pr create` succeeds |
| `/site-builder` (standalone, no branch param) | Same — creates feature branch, PR succeeds |
| `/site-builder branch=main` | Explicit opt-in to commit directly to current branch (same as old default) |
| `/site-builder branch=auto` | Unchanged — creates new branch if repo has prior commits, stays on current branch if fresh repo |
| `/site-builder branch=new` | Unchanged — always creates `feat/[business-slug]-site` branch |

---

## What Does Not Change

- Phase 0 Step 3 branch logic — all three modes (`main`, `new`, `auto`) behave identically to before
- `branch=main` still works as an explicit opt-out
- `branch=auto` behavior unchanged
- No other files or skills need updating — web-studio passes no `branch` param, so it inherits the new default automatically
