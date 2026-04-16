# Fix-Issue Missing References — Design Spec

**Date:** 2026-04-15
**Status:** Approved
**Scope:** Add the two reference files that fix-issue is missing to bring it to parity with fix-ticket

---

## Overview

`fix-issue` was derived from `fix-ticket` (Jira → GitHub Issues) but its `references/` folder was never created. The skill's `SKILL.md` already references both files correctly — they simply don't exist yet. This spec covers creating them.

---

## Files to Create

| File | Source | Change Type |
|------|--------|-------------|
| `skills/fix-issue/references/qa-integration.md` | `startup-claude-skills/skills/fix-ticket/references/qa-integration.md` | Copy + targeted substitutions |
| `skills/fix-issue/CONFIG.template.md` | `startup-claude-skills/CONFIG.template.md` | Copy + Jira section replaced with GitHub section |

---

## File 1: `skills/fix-issue/references/qa-integration.md`

Direct copy of fix-ticket's `references/qa-integration.md` with three substitutions only. All playwright-cli steps, auth flow, provisioning, verify/check modes, cleanup, and error handling are identical.

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

Copy of `startup-claude-skills/CONFIG.template.md` with the Jira section replaced by a GitHub section. All other sections (Deployment, QA Testing, Complex Fix Delegation) are carried over verbatim.

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

## Out of Scope

- Changes to `fix-issue/SKILL.md` — it already references both files correctly
- Changes to fix-ticket, playwright-qa-cli, review-team, or develop-team
- Any new features or behavior changes to fix-issue
