# gh-issue Generate & Annotate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade gh-issue from a read/cache tool to an AI-powered task spec generator that writes structured acceptance criteria to GitHub issues as comments.

**Architecture:** All changes are to `skills/gh-issue/SKILL.md`. Four additions: `generate` parameter, Phase 2.5 (AI generation), Phase 2.6 (post comment), `.gitignore` auto-update in Phase 4, updated context.json schema, and a downstream fallback section. No new files.

**Tech Stack:** Markdown file editing only — no code, no tests, no build step.

---

### Task 1: Add `generate` parameter and update architecture diagram

**Files:**
- Modify: `skills/gh-issue/SKILL.md`

- [ ] **Step 1: Confirm current parameter table**

```bash
grep -n "generate\|output.*display\|Parameters" skills/gh-issue/SKILL.md | head -10
```

Expected: no `generate` parameter exists yet; `output` and `type` parameters are present.

- [ ] **Step 2: Add `generate` parameter to the parameters table**

Using the Edit tool, replace:

```
| `repo` | (current) | Override repo: `owner/repo` — defaults to current directory's GitHub remote |
```

With:

```
| `repo` | (current) | Override repo: `owner/repo` — defaults to current directory's GitHub remote |
| `generate` | `true` | Set `false` to skip AI generation and comment posting (pure read mode). Also suppressed by `output=display`. |
```

- [ ] **Step 3: Update the architecture diagram to include Phase 2.5 and 2.6**

Using the Edit tool, replace the architecture block:

```
+-- Phase 3: DISPLAY
|   Format structured output for terminal
|
+-- Phase 4: WRITE FILE (unless output=display)
|   Write .gh-issue/context.json
|   Report: "Context written to .gh-issue/context.json — /fix-issue and /develop-team will use it automatically"
```

With:

```
+-- Phase 2.5: GENERATE TASK SPEC (unless output=display or generate=false)
|   AI generates acceptance criteria, expected vs. actual behavior, edge cases, technical context
|   Uses all data from Phase 1 and Phase 2 as input
|
+-- Phase 2.6: POST COMMENT TO GITHUB (unless output=display or generate=false)
|   Posts structured comment with <!-- gh-issue:generated --> marker via gh issue comment
|   Old generated comments preserved as history — always posts fresh
|
+-- Phase 3: DISPLAY
|   Format structured output for terminal
|
+-- Phase 4: WRITE FILE (unless output=display)
|   Write .gh-issue/context.json (includes generatedSpec fields)
|   Auto-update .gitignore to include .gh-issue/
|   Report: "Context written to .gh-issue/context.json — /fix-issue and /develop-team will use it automatically"
```

- [ ] **Step 4: Verify both edits**

```bash
grep -n "generate\|Phase 2.5\|Phase 2.6\|GENERATE TASK\|POST COMMENT" skills/gh-issue/SKILL.md | head -15
```

Expected: `generate` in parameters table, Phase 2.5 and 2.6 in architecture diagram.

- [ ] **Step 5: Commit**

```bash
git add skills/gh-issue/SKILL.md
git commit -m "feat(gh-issue): add generate param and Phase 2.5/2.6 to architecture diagram"
```

---

### Task 2: Add Phase 2.5 (Generate Task Spec) workflow section

**Files:**
- Modify: `skills/gh-issue/SKILL.md`

- [ ] **Step 1: Find the Phase 3 Display section**

```bash
grep -n "### Phase 3: Display\|### Phase 2:\|Enrich" skills/gh-issue/SKILL.md | head -10
```

Expected: Phase 2 (Enrich) and Phase 3 (Display) headers with line numbers.

- [ ] **Step 2: Insert Phase 2.5 workflow section before Phase 3**

Using the Edit tool, replace:

```
### Phase 3: Display
```

With:

```
### Phase 2.5: Generate Task Spec

**Skip if `output=display` or `generate=false`.**

Use all data collected in Phase 1 (issue title, body, labels, state, comments, author) and Phase 2 (linked PRs, related issues, project board status) as context. Generate a structured task spec by reasoning over the issue content.

**Generation prompt:**

```
You are a product manager writing a task spec for a developer.

Issue: #{number} — {title}
Description: {body — truncated to 3000 chars}
Labels: {labels joined by comma}
Recent comments: {last 3 comments, each truncated to 200 chars}
Linked PRs: {PR titles and states, or "None"}
Related issues: {issue titles and states, or "None"}

Write a task spec with these five sections. Be specific and concrete. Do not pad.

1. Acceptance Criteria (3-6 items) — testable checkboxes written from the user's perspective
2. Expected Behavior (1-3 sentences) — what the system should do when working correctly
3. Actual Behavior (1-2 sentences) — what is currently happening, derived from the issue description
4. Edge Cases (2-4 bullets) — scenarios that should also be verified when fixing this issue
5. Technical Context (1-3 sentences) — which components or code areas are likely involved, based on labels and related issues
```

Store the five sections as `GENERATED_SPEC` for use in Phase 2.6.

If the issue body is less than 50 characters (too sparse to generate from), set `GENERATION_SKIPPED=true` and report: "Issue body too sparse to generate a meaningful spec — add more detail to the issue and re-run."

### Phase 2.6: Post Comment to GitHub Issue

**Skip if `output=display`, `generate=false`, or `GENERATION_SKIPPED=true`.**

Format the generated spec as a GitHub comment and post it:

```bash
gh issue comment {number} --repo {owner}/{repo} --body "$(cat <<'COMMENT'
<!-- gh-issue:generated -->
## Task Spec

> Generated by /gh-issue on {YYYY-MM-DD}. Update this issue if requirements change.

### Acceptance Criteria
{GENERATED_SPEC acceptance criteria as - [ ] checkboxes}

### Expected Behavior
{GENERATED_SPEC expected behavior}

### Actual Behavior
{GENERATED_SPEC actual behavior}

### Edge Cases
{GENERATED_SPEC edge cases as bullet list}

### Technical Context
{GENERATED_SPEC technical context}
COMMENT
)"
```

Capture the response to get the comment URL:

```bash
gh issue comment {number} --repo {owner}/{repo} --body "..." 2>&1
# Then get the URL of the most recent comment:
gh issue view {number} --repo {owner}/{repo} --comments --json comments \
  --jq '.comments[-1].url'
```

Store the comment URL as `GENERATED_COMMENT_URL` for use in Phase 4 (context.json).

After posting, print:
```
Task spec posted to issue #{number}.
/fix-issue and /develop-team will use this spec automatically.
```

### Phase 3: Display
```

- [ ] **Step 3: Verify both new sections exist**

```bash
grep -n "### Phase 2.5\|### Phase 2.6\|GENERATION_SKIPPED\|gh-issue:generated\|GENERATED_COMMENT_URL" skills/gh-issue/SKILL.md | head -15
```

Expected: all five patterns found.

- [ ] **Step 4: Commit**

```bash
git add skills/gh-issue/SKILL.md
git commit -m "feat(gh-issue): add Phase 2.5 generate and Phase 2.6 post comment workflow"
```

---

### Task 3: Update context.json schema and add .gitignore step to Phase 4

**Files:**
- Modify: `skills/gh-issue/SKILL.md`

- [ ] **Step 1: Find the context.json schema block**

```bash
grep -n "fetchedAt\|generatedSpec\|Write File\|Phase 4" skills/gh-issue/SKILL.md | head -10
```

Expected: Phase 4 header and `fetchedAt` in the JSON schema, no `generatedSpec` yet.

- [ ] **Step 2: Add `generatedSpec` and `generatedAt` fields to the issue-mode JSON schema**

Using the Edit tool, replace:

```
  "fetchedAt": "2026-04-14T08:30:00Z",
  "repo": "owner/repo"
}
```

With (the first occurrence — issue mode schema):

```
  "generatedSpec": {
    "acceptanceCriteria": ["User can complete checkout on mobile without form errors", "Submit button remains enabled during validation"],
    "expectedBehavior": "The checkout form submits successfully on mobile viewports (320px–768px).",
    "actualBehavior": "The submit button becomes unclickable on viewports below 768px due to an overlapping element.",
    "edgeCases": ["iOS Safari 16", "Android Chrome with zoom enabled", "Landscape orientation on small phones"],
    "technicalContext": "Affects CheckoutForm component. Likely a z-index or pointer-events issue in the mobile breakpoint styles."
  },
  "generatedAt": "2026-04-14T08:30:00Z",
  "fetchedAt": "2026-04-14T08:30:00Z",
  "repo": "owner/repo"
}
```

- [ ] **Step 3: Add .gitignore auto-update step to Phase 4**

Using the Edit tool, replace:

```
After writing, report:

```
Context written to .gh-issue/context.json
```

With:

```
After writing the file, auto-update `.gitignore` if needed:

```bash
grep -q "\.gh-issue/" .gitignore 2>/dev/null || echo ".gh-issue/" >> .gitignore
```

After writing, report:

```
Context written to .gh-issue/context.json
```

- [ ] **Step 4: Update the null-fields note to mention generatedSpec**

Using the Edit tool, replace:

```
> **Null fields:** Write `milestone.dueOn` as `null` (not omitted) when the milestone has no due date. If `milestone` itself is null (issue not in a milestone), write `"milestone": null`.
```

With:

```
> **Null fields:** Write `milestone.dueOn` as `null` (not omitted) when the milestone has no due date. If `milestone` itself is null (issue not in a milestone), write `"milestone": null`. If generation was skipped (`output=display`, `generate=false`, or body too sparse), write `"generatedSpec": null` and omit `"generatedAt"`.
```

- [ ] **Step 5: Verify schema edits**

```bash
grep -n "generatedSpec\|generatedAt\|\.gh-issue.*gitignore\|gitignore.*gh-issue" skills/gh-issue/SKILL.md | head -10
```

Expected: `generatedSpec` in the JSON schema, `generatedAt` after it, and the `.gitignore` bash command.

- [ ] **Step 6: Commit**

```bash
git add skills/gh-issue/SKILL.md
git commit -m "feat(gh-issue): add generatedSpec to context.json schema and .gitignore auto-update"
```

---

### Task 4: Add downstream skill fallback section and update the report message

**Files:**
- Modify: `skills/gh-issue/SKILL.md`

- [ ] **Step 1: Find the downstream skill section**

```bash
grep -n "How Downstream Skills\|downstream\|fix-issue.*develop-team" skills/gh-issue/SKILL.md | head -10
```

Expected: "How Downstream Skills Use the Context File" section exists.

- [ ] **Step 2: Replace the downstream section with the updated version including comment fallback**

Using the Edit tool, replace:

```
## How Downstream Skills Use the Context File

Both `/fix-issue` and `/develop-team` check for `.gh-issue/context.json` at the start of their Phase 1 (Read Issue / Gather Context). If the file exists AND `fetchedAt` is within 30 minutes, they use it instead of fetching fresh from the GitHub API. This saves ~3 API calls and surfaces richer context (linked PRs, related issues) that those skills don't fetch themselves.

**To force a fresh fetch** in downstream skills, either:
- Delete `.gh-issue/context.json`
- Re-run `/gh-issue {number}` to refresh it
- The downstream skill always accepts `skip-gh-context=true` to bypass it
```

With:

```
## How Downstream Skills Use the Context File

Both `/fix-issue` and `/develop-team` check for `.gh-issue/context.json` at the start of their Phase 1. If the file exists AND `fetchedAt` is within 30 minutes, they use it instead of fetching fresh. This surfaces richer context (linked PRs, related issues, generated spec) that those skills don't fetch themselves.

**Fallback when context.json is absent or stale:** downstream skills look for the most recent gh-issue generated comment on the issue:

```bash
gh issue view {number} --comments --json comments \
  --jq '[.comments[] | select(.body | startswith("<!-- gh-issue:generated -->"))] | last'
```

If a generated comment is found, the `acceptanceCriteria`, `expectedBehavior`, and `edgeCases` sections are parsed from the comment body and used as the task spec context.

If neither context.json nor a generated comment exists, downstream skills fall back to extracting acceptance criteria from the issue body directly (looking for `## Acceptance Criteria`, `### AC`, or `- [ ]` checklists).

**To force a fresh fetch** in downstream skills, either:
- Delete `.gh-issue/context.json`
- Re-run `/gh-issue {number}` to refresh it
- Pass `skip-gh-context=true` to the downstream skill to bypass both context.json and the comment fallback
```

- [ ] **Step 3: Update the report message in Phase 4 to mention comment fallback**

Using the Edit tool, replace:

```
/fix-issue and /develop-team will automatically use this context (valid for 30 minutes).
To refresh: run /gh-issue {number} again.
```

With:

```
/fix-issue and /develop-team will automatically use this context (valid for 30 minutes).
If context.json expires, they will fall back to the generated comment on the issue.
To refresh: run /gh-issue {number} again.
```

- [ ] **Step 4: Final verification — confirm all spec requirements are covered**

```bash
# Phase 2.5 present
grep -c "Phase 2.5\|GENERATE TASK" skills/gh-issue/SKILL.md
# Phase 2.6 present
grep -c "Phase 2.6\|POST COMMENT\|gh-issue:generated" skills/gh-issue/SKILL.md
# generate parameter present
grep -c "generate.*true\|generate=false" skills/gh-issue/SKILL.md
# generatedSpec in schema
grep -c "generatedSpec" skills/gh-issue/SKILL.md
# .gitignore update present
grep -c "\.gh-issue.*gitignore\|gitignore.*gh-issue" skills/gh-issue/SKILL.md
# comment fallback present
grep -c "gh-issue:generated.*last\|fallback.*comment\|comment.*fallback" skills/gh-issue/SKILL.md
```

Expected: each command returns 1 or more.

- [ ] **Step 5: Commit**

```bash
git add skills/gh-issue/SKILL.md
git commit -m "feat(gh-issue): add comment fallback for downstream skills and update report message"
```
