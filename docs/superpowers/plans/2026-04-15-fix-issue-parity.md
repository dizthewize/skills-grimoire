# Fix-Issue Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring fix-issue to full parity with fix-ticket by creating two missing reference files and updating SKILL.md to integrate review-fix, review-team, milestone support, and gh-issue context documentation.

**Architecture:** Three files to create/modify — `references/qa-integration.md` (copy of fix-ticket's with GitHub substitutions), `CONFIG.template.md` (Jira section swapped for GitHub + milestones), and `SKILL.md` (new Phase 5.2 review-fix, new Phase 6.2 review-team, Phase 1 context field docs, phase order and parameter gate updates).

**Tech Stack:** Markdown file editing only — no code, no tests, no build step.

---

### Task 1: Create `skills/fix-issue/references/qa-integration.md`

**Files:**
- Read: `skills/fix-ticket/references/qa-integration.md`
- Create: `skills/fix-issue/references/qa-integration.md`

- [ ] **Step 1: Verify the directory and source file exist**

```bash
ls skills/fix-issue/
ls skills/fix-ticket/references/qa-integration.md
```

Expected: `fix-issue/` directory exists with only `SKILL.md`. Source file exists.

- [ ] **Step 2: Create the references directory**

```bash
mkdir -p skills/fix-issue/references
```

- [ ] **Step 3: Copy source file and apply all four substitutions**

```bash
sed \
  -e 's/# QA Integration for Fix-Ticket/# QA Integration for Fix-Issue/' \
  -e 's/{ticket-id}/{issue-number}/g' \
  -e 's/"Jira ticket description"/"GitHub issue body"/g' \
  -e "s/ticket's acceptance criteria/issue's expected behavior/g" \
  skills/fix-ticket/references/qa-integration.md \
  > skills/fix-issue/references/qa-integration.md
```

- [ ] **Step 4: Verify all four substitutions were applied**

```bash
grep "QA Integration for Fix-Issue" skills/fix-issue/references/qa-integration.md
grep "{issue-number}" skills/fix-issue/references/qa-integration.md
grep "GitHub issue body" skills/fix-issue/references/qa-integration.md
grep "issue's expected behavior" skills/fix-issue/references/qa-integration.md
# Confirm old strings are gone
grep "Fix-Ticket\|{ticket-id}\|Jira ticket\|ticket's acceptance" skills/fix-issue/references/qa-integration.md && echo "FAIL - old strings remain" || echo "PASS"
```

Expected: first 4 greps each return a match; final grep returns "PASS".

- [ ] **Step 5: Commit**

```bash
git add skills/fix-issue/references/qa-integration.md
git commit -m "feat(fix-issue): add qa-integration.md reference file"
```

---

### Task 2: Create `skills/fix-issue/CONFIG.template.md`

**Files:**
- Read: `CONFIG.template.md` (project root)
- Create: `skills/fix-issue/CONFIG.template.md`

- [ ] **Step 1: Verify the source file and confirm Jira section content**

```bash
grep -n "## Jira\|## Deployment\|## QA Testing\|## Complex Fix" CONFIG.template.md
```

Expected output (line numbers will vary):
```
8:## Jira
39:## Deployment
50:## QA Testing
89:## Complex Fix Delegation (Optional)
```

- [ ] **Step 2: Create the file with the header, GitHub section (replacing Jira), and all remaining sections**

Use the Write tool to create `skills/fix-issue/CONFIG.template.md` with this exact content:

```markdown
# Project Configuration

Copy this file to `CONFIG.md` and fill in your project-specific values.
**Do NOT commit CONFIG.md** — it may contain sensitive information.

---

## GitHub

| Setting | Value | Notes |
|---------|-------|-------|
| Repository | `owner/repo` | GitHub repo in owner/repo format (e.g., `acme/my-app`) |

### Labels

| Label | Default Value | Notes |
|-------|--------------|-------|
| In Progress | `in-progress` | Applied when work starts |
| In Review | `in-review` | Applied when review has open findings |
| QA Ready | `qa-ready` | Applied when fix is ready for QA |
| Done | `done` | Applied when issue is fully closed |

### Team

| Name | GitHub Username | Alias |
|------|----------------|-------|
| Jane Doe | `jane-doe` | `jane` |

To find a GitHub username: github.com/{username} or `gh api users/{name} --jq '.login'`.

### Milestones

| Setting | Value | Notes |
|---------|-------|-------|
| Default milestone | *(leave blank)* | Optional — milestone number to auto-assign when fixing an issue (e.g., `3`). Leave blank if not using milestones. |

Milestones are auto-populated from `.gh-issue/context.json` when gh-issue is run before fix-issue.
To find a milestone number: `gh api repos/{owner}/{repo}/milestones --jq '.[] | [.number, .title] | @tsv'`

### Project Board (Optional)

Leave blank if not using GitHub Projects.

| Setting | Value | Notes |
|---------|-------|-------|
| Project number | `5` | GitHub Projects board number (`gh project list`) |
| Status field ID | `PVTF_...` | Get via `gh project field-list {number} --owner {owner}` |
| QA column option ID | `...` | Get via `gh project field-list {number} --owner {owner} --format json` |

## Deployment

| Setting | Value | Notes |
|---------|-------|-------|
| Platform | `vercel` | Currently supported: `vercel`. Set to `none` to skip deployment monitoring. |
| Production URL | `https://yourapp.com` | Used for "test in prod" QA mode |

### Vercel (if applicable)

Read from `.vercel/project.json` automatically. No config needed here unless the file doesn't exist.

## QA Testing (Optional)

These settings are only needed if you want headless browser QA verification.

| Setting | Value | Notes |
|---------|-------|-------|
| QA tool | `playwright-cli` | CLI tool for headless browser testing |
| Dev server command | `npm run dev` | Command to start local dev server |
| Dev server port | `3000` | Port the dev server runs on |
| Test user email | `qa-test@yourapp.test` | Dedicated QA test user |
| Test user password | `YourSecurePassword` | Test user password |

### Auth Provider

| Setting | Value | Notes |
|---------|-------|-------|
| Provider | `supabase` | Auth provider: `supabase`, `firebase`, `auth0`, `custom` |
| Supabase project ID | `your-project-id` | Only if using Supabase |

### Test Data Schema

If your QA tests need to seed test data, document your table schemas here:

```sql
-- Example: seed a test record
INSERT INTO public.your_table (id, user_id, created_at, name)
VALUES (gen_random_uuid(), '{USER_ID}', now(), 'Test Record');
```

### Route Detection

Map file paths to routes for QA navigation:

| File Pattern | Route |
|-------------|-------|
| `dashboard/**` | `/dashboard` |
| `settings/**` | `/settings` |
| Default | `/` |

## Complex Fix Delegation (Optional)

| Setting | Value | Notes |
|---------|-------|-------|
| Delegation skill | `/develop-team` | Skill to invoke for complex (3+ file) fixes. Set to `none` to handle all fixes inline. |
```

- [ ] **Step 3: Verify file was created with correct sections**

```bash
grep -n "## GitHub\|## Deployment\|## QA Testing\|## Complex Fix\|### Milestones\|### Project Board" skills/fix-issue/CONFIG.template.md
# Confirm no Jira content
grep "## Jira\|Jira account\|transition ID\|customfield" skills/fix-issue/CONFIG.template.md && echo "FAIL - Jira content found" || echo "PASS"
```

Expected: GitHub, Deployment, QA Testing, Complex Fix sections present; "PASS" on Jira check.

- [ ] **Step 4: Commit**

```bash
git add skills/fix-issue/CONFIG.template.md
git commit -m "feat(fix-issue): add CONFIG.template.md with GitHub + milestone config"
```

---

### Task 3: Update SKILL.md — Phase 1 gh-issue context field documentation

**Files:**
- Modify: `skills/fix-issue/SKILL.md`

- [ ] **Step 1: Find the current Phase 1 context.json check**

```bash
grep -n "context.json\|gh-issue.*context\|fetchedAt" skills/fix-issue/SKILL.md | head -10
```

Expected: line around 241 containing `Check for .gh-issue/context.json`.

- [ ] **Step 2: Replace the brief context.json mention with the full field documentation**

Using the Edit tool, replace:

```
**Check for `.gh-issue/context.json`** — if the `/gh-issue` skill was run first, load this file instead of fetching fresh. Prefer it if it's less than 30 minutes old (check `fetchedAt`).
```

With:

```
**Check for `.gh-issue/context.json`** — if the `/gh-issue` skill was run first, load this file instead of fetching fresh. Prefer it if it is less than 30 minutes old (check `fetchedAt`).

Fields consumed from `context.json`:
- `number`, `title`, `body` → issue description and acceptance criteria for Phase 5 review
- `labels`, `assignees` → used in Phase 8 GitHub Handoff
- `milestone` → `{ number, title, dueOn, openIssues, closedIssues }` — if present, Phase 8 assigns the issue to this milestone
- `linkedPRs` → checked in Phase 2 research for past fix attempts
- `relatedIssues` → checked in Phase 2 research for related context
- `generatedSpec.acceptanceCriteria` → passed as acceptance criteria context to Phase 5 review agents and Phase 6.2 review-team

If `context.json` is absent or stale, fetch fresh and extract acceptance criteria manually from the issue body (look for sections titled "Acceptance Criteria", "Expected Behavior", or `- [ ]` checklists).
```

- [ ] **Step 3: Verify the edit**

```bash
grep -A 12 "Check for.*context.json" skills/fix-issue/SKILL.md | head -15
```

Expected: shows the expanded field documentation block.

- [ ] **Step 4: Commit**

```bash
git add skills/fix-issue/SKILL.md
git commit -m "docs(fix-issue): document gh-issue context.json fields consumed in Phase 1"
```

---

### Task 4: Update SKILL.md — Add Phase 5.2 (review-fix) to architecture diagram and workflow

**Files:**
- Modify: `skills/fix-issue/SKILL.md`

- [ ] **Step 1: Find Phase 5 and 5.5 in the architecture diagram**

```bash
grep -n "Phase 5\|Phase 5.5\|Phase 6" skills/fix-issue/SKILL.md | head -10
```

Expected: lines for `+-- Phase 5: REVIEW`, `+-- Phase 5.5: QA CHECK`, `+-- Phase 6: COMMIT`.

- [ ] **Step 2: Insert Phase 5.2 block in the architecture diagram**

Using the Edit tool, replace:

```
+-- Phase 5.5: QA CHECK <- headless browser fix verification (unless skip-qa-check=true)
|   Re-provision test user, re-run same steps as Phase 1.5
|   Verify the bug is resolved — expected behavior now works
|   If fix incomplete -> loop back to Phase 4 (max 1 retry)
|   -> Read references/qa-integration.md for full steps
```

With:

```
+-- Phase 5.2: REVIEW-FIX LOOP <- automated multi-reviewer fix (unless skip-review=true)
|   Spawns 8 specialist reviewers in parallel, auto-fixes quick-fix items
|   Commits fixes as "fix: address code review findings", up to 2 iterations
|   Strategic items accumulated and reported in Phase 9
|   -> Invokes /review-fix max-iterations=2 base-commit=HEAD~1
|
+-- Phase 5.5: QA CHECK <- headless browser fix verification (unless skip-qa-check=true)
|   Re-provision test user, re-run same steps as Phase 1.5
|   Verify the bug is resolved — expected behavior now works
|   If fix incomplete -> loop back to Phase 4 (max 1 retry)
|   -> Read references/qa-integration.md for full steps
```

- [ ] **Step 3: Add Phase 5.2 workflow section after Phase 5 review section**

Find the end of Phase 5 workflow (the "Iteration limit" line) and the start of Phase 5.5:

```bash
grep -n "Iteration limit\|### Phase 5.5" skills/fix-issue/SKILL.md
```

Using the Edit tool, replace:

```
**Iteration limit**: Max 2 fix-then-re-review cycles.

### Phase 5.5: QA Check (Headless Browser Fix Verification)
```

With:

```
**Iteration limit**: Max 2 fix-then-re-review cycles.

### Phase 5.2: Review-Fix Loop

**Skip if `skip-review=true`.**

After inline Phase 5 review agents complete, run the automated multi-reviewer fix loop to catch remaining issues and auto-fix quick-fix items before QA.

```bash
/review-fix max-iterations=2 base-commit=HEAD~1
```

review-fix spawns 8 specialist reviewers in parallel (Frontend Designer, Product Manager, QA Engineer, System Architect, Senior Developer, Code Maintainability, Reusable Components, Dead Code Hunter). It:
1. Auto-fixes quick-fix items (bugs, type errors, unused imports, missing hover states, etc.)
2. Commits each round of fixes as `fix: address code review findings`
3. Repeats until no quick-fix items remain (max 2 iterations)
4. Accumulates strategic items (major refactors, scope questions) for Phase 9 Summary

After review-fix completes, proceed to Phase 5.5 QA Check.

### Phase 5.5: QA Check (Headless Browser Fix Verification)
```

- [ ] **Step 4: Verify both Phase 5.2 edits are present**

```bash
grep -n "Phase 5.2\|review-fix\|max-iterations" skills/fix-issue/SKILL.md
```

Expected: at least 3 matches — one in the architecture diagram, one in the workflow section header, one with the `/review-fix` command.

- [ ] **Step 5: Commit**

```bash
git add skills/fix-issue/SKILL.md
git commit -m "feat(fix-issue): add Phase 5.2 review-fix loop after inline review"
```

---

### Task 5: Update SKILL.md — Add Phase 6.2 (review-team) to architecture diagram and workflow

**Files:**
- Modify: `skills/fix-issue/SKILL.md`

- [ ] **Step 1: Find Phase 6 and Phase 6.5 in the architecture diagram**

```bash
grep -n "Phase 6:\|Phase 6.5:\|Phase 7:" skills/fix-issue/SKILL.md | head -10
```

- [ ] **Step 2: Insert Phase 6.2 block in the architecture diagram**

Using the Edit tool, replace:

```
+-- Phase 6.5: WORKTREE MERGE (if branch=worktree, runs AFTER Phase 7)
```

With:

```
+-- Phase 6.2: REVIEW-TEAM <- adversarial PR review (unless skip-review=true)
|   Requires PR URL from Phase 6 push — runs post-push, not before
|   Spawns 5 reviewers: 4 specialists + Devil's Advocate
|   Findings non-blocking for deployment — reported in Phase 9 Summary
|   -> Invokes /review-team {pr-url} issue={issue-number}
|
+-- Phase 6.5: WORKTREE MERGE (if branch=worktree, runs AFTER Phase 7)
```

- [ ] **Step 3: Add Phase 6.2 workflow section after Phase 6 (Commit & Push section)**

```bash
grep -n "### Phase 6.5\|### Phase 7" skills/fix-issue/SKILL.md | head -5
```

Using the Edit tool, insert before the `### Phase 6.5` header (or `### Phase 7` if no 6.5 section):

Replace:
```
### Phase 7: Deployment Monitor
```

With:
```
### Phase 6.2: Review-Team (Adversarial PR Review)

**Skip if `skip-review=true`.**

After the PR is pushed in Phase 6, invoke review-team for adversarial multi-specialist review. review-team requires a PR URL — this is why it runs post-push.

Get the PR URL:
```bash
gh pr view --json url --jq '.url'
```

Then invoke:
```bash
/review-team {pr-url} issue={issue-number}
```

The `issue=` parameter gives review-team access to the acceptance criteria from the GitHub issue (and from `.gh-issue/context.json` if present and < 30 min old).

review-team spawns 5 reviewers (4 domain specialists + Devil's Advocate) and produces findings. Findings are **non-blocking** — Phase 7 deployment monitoring proceeds regardless. Any required fixes from review-team are reported in Phase 9 Summary for the user to action separately.

### Phase 7: Deployment Monitor
```

- [ ] **Step 4: Verify Phase 6.2 is present in both diagram and workflow**

```bash
grep -n "Phase 6.2\|review-team\|Devil's Advocate" skills/fix-issue/SKILL.md | head -10
```

Expected: at least 3 matches — diagram entry, workflow section header, Devil's Advocate mention.

- [ ] **Step 5: Commit**

```bash
git add skills/fix-issue/SKILL.md
git commit -m "feat(fix-issue): add Phase 6.2 review-team after PR push"
```

---

### Task 6: Update SKILL.md — Phase execution order, parameter gate, and mandatory checklist

**Files:**
- Modify: `skills/fix-issue/SKILL.md`

- [ ] **Step 1: Update the phase execution order string**

```bash
grep -n "0 -> 1 -> 1.5" skills/fix-issue/SKILL.md
```

Using the Edit tool, replace:

```
**You MUST execute phases 0 -> 1 -> 1.5 -> 2 -> 3 -> 4 -> 5 -> 5.5 -> 6 -> 7 -> 6.5 -> 8 -> 9 in order. Do NOT skip or reorder phases.** (Phase 0 always runs — it asks the user their branch preference when `branch=ask` (default), or sets up worktree when `branch=worktree`. Phase 1.5 skips when `skip-verify=true`. Phase 5.5 skips when `skip-qa-check=true`. Phase 6.5 only runs when worktree was chosen — it merges the worktree branch into main AFTER deployment succeeds.)
```

With:

```
**You MUST execute phases 0 -> 1 -> 1.5 -> 2 -> 3 -> 4 -> 5 -> 5.2 -> 5.5 -> 6 -> 6.2 -> 7 -> 6.5 -> 8 -> 9 in order. Do NOT skip or reorder phases.** (Phase 0 always runs — it asks the user their branch preference when `branch=ask` (default), or sets up worktree when `branch=worktree`. Phase 1.5 skips when `skip-verify=true`. Phase 5.2 and 5 both skip when `skip-review=true`. Phase 5.5 skips when `skip-qa-check=true`. Phase 6.2 skips when `skip-review=true`. Phase 6.5 only runs when worktree was chosen — it merges the worktree branch into main AFTER deployment succeeds.)
```

- [ ] **Step 2: Add Phase 5.2 and 6.2 to the Parameter Gate table**

Using the Edit tool, replace:

```
Phase 5:   Was `skip-review=true` in the user's invocation? YES -> skip. NO -> run it.
Phase 5.5: Was `skip-qa-check=true` in the user's invocation? YES -> skip. NO -> run it.
```

With:

```
Phase 5:   Was `skip-review=true` in the user's invocation? YES -> skip. NO -> run it.
Phase 5.2: Was `skip-review=true` in the user's invocation? YES -> skip. NO -> run it.
Phase 5.5: Was `skip-qa-check=true` in the user's invocation? YES -> skip. NO -> run it.
Phase 6.2: Was `skip-review=true` in the user's invocation? YES -> skip. NO -> run it.
```

- [ ] **Step 3: Add review-fix and review-team to the Mandatory Checklist**

Using the Edit tool, replace:

```
- [ ] **Review ran**: 3 agents were spawned (or `skip-review=true` was explicitly set)
```

With:

```
- [ ] **Review ran**: 3 agents were spawned (or `skip-review=true` was explicitly set)
- [ ] **Review-fix ran**: review-fix loop completed (or `skip-review=true`)
- [ ] **Review-team ran**: adversarial PR review completed (or `skip-review=true`)
- [ ] **Review findings reported**: Phase 9 summary includes review-fix strategic items and review-team findings
```

- [ ] **Step 4: Verify all three edits**

```bash
grep -n "5.2.*5.5\|Phase 5.2:\|Phase 6.2:\|Review-fix ran\|Review-team ran" skills/fix-issue/SKILL.md | head -10
```

Expected: phase order string with 5.2 and 6.2, parameter gate entries for 5.2 and 6.2, checklist entries.

- [ ] **Step 5: Final verification — confirm no broken references**

```bash
grep "references/qa-integration.md" skills/fix-issue/SKILL.md
grep "CONFIG.template.md" skills/fix-issue/SKILL.md
```

Expected: both references present (Phase 1.5, 5.5 for qa-integration; Phase 0 for CONFIG.template.md).

- [ ] **Step 6: Commit**

```bash
git add skills/fix-issue/SKILL.md
git commit -m "feat(fix-issue): update phase order, parameter gate, and mandatory checklist for 5.2 and 6.2"
```
