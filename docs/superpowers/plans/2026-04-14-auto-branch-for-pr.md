# Auto Branch for PR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the `branch` parameter default in site-builder from `main` to `new` so a feature branch is always created before any build commits, enabling `gh pr create` to succeed.

**Architecture:** One targeted text edit to the Parameters table in `skills/site-builder/SKILL.md`. The `new` branch behavior (create `feat/[business-name-slug]-site` at Phase 0) is already fully implemented — only the default value changes.

**Tech Stack:** Markdown skill instruction file only — no code compilation or tests.

---

## File Map

| File | Section changed |
|------|----------------|
| `skills/site-builder/SKILL.md` | Parameters table (~line 21) |

---

### Task 1: Change `branch` default from `main` to `new`

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Parameters table ~line 21)

- [ ] **Step 1: Make the edit**

  Find this exact line:

  ```
  | `branch` | `main` | Git branch strategy: `main` (commit directly to current branch), `new` (create a feature branch), `auto` (new branch if repo has existing commits) |
  ```

  Replace with:

  ```
  | `branch` | `new` | Git branch strategy: `new` (create a feature branch — default), `main` (commit directly to current branch), `auto` (new branch if repo has existing commits) |
  ```

  Note: The description is reordered to list `new` first since it is now the default, making the table easier to read.

- [ ] **Step 2: Verify**

  Read the Parameters table. Confirm:
  - The `branch` row now shows `new` as the default (second column)
  - The description lists `new` first with the note "(default)"
  - All other parameter rows are unchanged

---

## Self-Review

**Spec coverage:**
- ✓ `branch` default changed from `main` to `new` (Task 1)
- ✓ No other changes required — Phase 0 `new` logic is already implemented

**Placeholder scan:** None. Single literal text replacement.

**Consistency check:** The description reorder (new first) is a readability improvement consistent with convention — default option listed first. No other references to the `branch` parameter default exist in the file that need updating.
