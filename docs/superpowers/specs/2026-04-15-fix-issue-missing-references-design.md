# Fix-Issue Missing References — Design Spec

**Date:** 2026-04-15
**Status:** Approved
**Scope:** Bring fix-issue to full parity with fix-ticket — create missing reference files, update SKILL.md to integrate review-fix and review-team, add milestone support to CONFIG.template.md, and document the gh-issue context flow

---

## Overview

`fix-issue` was derived from `fix-ticket` (Jira → GitHub Issues) but has several gaps:

1. `references/qa-integration.md` — does not exist; referenced by Phase 1.5 and Phase 5.5
2. `CONFIG.template.md` — does not exist; referenced by Phase 0 and throughout
3. `SKILL.md` — Phase 5 does inline review but does not invoke `review-fix` for automated multi-reviewer fixing; no `review-team` invocation after PR creation
4. `CONFIG.template.md` GitHub section — needs milestone support
5. `SKILL.md` Phase 1 — needs explicit documentation of gh-issue context consumption (acceptance criteria, milestone data)

---

## Files to Create / Modify

| File | Action | Source |
|------|--------|--------|
| `skills/fix-issue/references/qa-integration.md` | Create | Copy of `skills/fix-ticket/references/qa-integration.md` + substitutions |
| `skills/fix-issue/CONFIG.template.md` | Create | Copy of `CONFIG.template.md` + Jira section replaced with GitHub section |
| `skills/fix-issue/SKILL.md` | Modify | Add review-fix (Phase 5.2) and review-team (Phase 6.2) invocations; document gh-issue context flow |

---

## File 1: `skills/fix-issue/references/qa-integration.md`

Direct copy of `skills/fix-ticket/references/qa-integration.md` with four substitutions only. All playwright-cli steps, auth flow, provisioning, verify/check modes, cleanup, and error handling are identical.

**Substitutions:**

| Fix-ticket text | Fix-issue replacement |
|---|---|
| `# QA Integration for Fix-Ticket` | `# QA Integration for Fix-Issue` |
| All `{ticket-id}` in screenshot paths | `{issue-number}` |
| `"Jira ticket description"` | `"GitHub issue body"` |
| `"ticket's acceptance criteria"` | `"issue's expected behavior"` |

No other changes. Every playwright-cli command, PATH setup, dev server check, provisioning SQL, API auth flow, verify/check mode steps, cleanup instructions, and error handling table is carried over verbatim.

---

## File 2: `skills/fix-issue/CONFIG.template.md`

Copy of root `CONFIG.template.md` with the Jira section replaced by a GitHub section. All other sections (Deployment, QA Testing, Complex Fix Delegation) are carried over verbatim.

**Remove — Jira section:**
- Project key
- Acceptance criteria field ID
- Jira transition IDs table (QA / In Review / Done)
- Jira account IDs for team members

**Replace with — GitHub section:**

```markdown
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
```

**Keep unchanged:**
- Deployment section (Vercel config is platform-agnostic)
- QA Testing section (playwright-cli, dev server, test user, auth provider, route detection)
- Complex Fix Delegation section (`/develop-team` reference)

---

## File 3: `skills/fix-issue/SKILL.md` — Changes

Three targeted additions to SKILL.md. No other changes.

### 3a. Phase 1 — gh-issue Context Consumption (documentation only)

The `if .gh-issue/context.json exists and is < 30 min old` block in Phase 1 already works. Add explicit documentation of what fields are consumed:

```
From .gh-issue/context.json (written by /gh-issue):
- number, title, body → issue description and acceptance criteria
- labels, assignees → used in Phase 8 GitHub Handoff
- milestone → { number, title, dueOn, openIssues, closedIssues }
  If milestone present, Phase 8 assigns the issue to that milestone.
- linkedPRs → checked in Phase 2 research (past fix attempts)
- relatedIssues → checked in Phase 2 research (related context)
- acceptanceCriteria → extracted from body by gh-issue; used in Phase 5 review
  and passed as issue= context to review-team in Phase 6.2
```

If `context.json` is absent or stale, fix-issue fetches fresh via:
```bash
gh issue view {number} --json number,title,body,labels,assignees,milestone,state,comments
```
Acceptance criteria are then extracted from the body manually (look for sections titled "Acceptance Criteria", "Expected Behavior", or checkboxes in the body).

### 3b. Phase 5.2 — Review-Fix (new phase, inserted between Phase 5 and Phase 5.5)

Insert after the Phase 5 inline review block and before Phase 5.5 QA Check:

```
### Phase 5.2: Review-Fix Loop

After inline Phase 5 review agents complete, run the automated multi-reviewer fix loop
to catch remaining issues and auto-fix quick-fix items before QA.

Invoke: /review-fix max-iterations=2 base-commit=HEAD~1

- Spawns 8 specialist reviewers in parallel
- Auto-fixes quick-fix items (bugs, type errors, unused imports, missing hover states, etc.)
- Commits fixes as "fix: address code review findings"
- Strategic items (major refactors, scope questions) are accumulated and reported at summary

Skip condition: `skip-review=true` in invocation (same flag as Phase 5).

After review-fix completes, proceed to Phase 5.5 QA Check.
```

Update the phase execution order line in the Architecture section:
```
0 -> 1 -> 1.5 -> 2 -> 3 -> 4 -> 5 -> 5.2 -> 5.5 -> 6 -> 7 -> 6.5 -> 8 -> 9
```

Update the Parameter Gate table:
```
Phase 5.2: Was `skip-review=true` in the user's invocation? YES -> skip. NO -> run it.
```

### 3c. Phase 6.2 — Review-Team (new phase, inserted after Phase 6 PR push)

Insert after Phase 6 (commit + push + PR creation) and before Phase 7 (deployment monitor):

```
### Phase 6.2: Review-Team (Adversarial PR Review)

After the PR is created in Phase 6, invoke review-team for adversarial multi-specialist review.
Review-team requires a PR URL — this is why it runs post-push, not earlier.

Invoke: /review-team {pr-url} issue={issue-number}

The `issue=` parameter passes the GitHub issue number so review-team can validate the fix
against acceptance criteria. If .gh-issue/context.json is present and < 30 min old,
review-team will use it automatically (no extra fetch needed).

Review-team spawns 5 reviewers (4 specialists + Devil's Advocate) and produces findings.
Findings are non-blocking for deployment — Phase 7 proceeds regardless. Any required
fixes from review-team are reported in Phase 9 Summary for the user to action.

Skip condition: `skip-review=true` in invocation.
```

Update the phase execution order line:
```
0 -> 1 -> 1.5 -> 2 -> 3 -> 4 -> 5 -> 5.2 -> 5.5 -> 6 -> 6.2 -> 7 -> 6.5 -> 8 -> 9
```

Update the Phase 9 Summary mandatory checklist to include:
```
- [ ] Review-team findings reported (if review-team ran)
- [ ] Review-fix strategic items reported (if review-fix ran)
```

---

## Out of Scope

- Changes to fix-ticket, playwright-qa-cli, review-team, develop-team, or review-fix SKILL.md files
- Any new features or behavior changes beyond the items above
- Changes to gh-issue SKILL.md — it already writes correct context.json format
