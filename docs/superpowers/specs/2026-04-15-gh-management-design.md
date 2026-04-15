# Design Spec: gh-management Skill Suite
**Date:** 2026-04-15
**Status:** Approved
**Repo:** standalone — `gh-management` (tested against `skills-grimoire`)

---

## Overview

A standalone GitHub management skill suite delivered as its own repository. Provides agentic skills for creating GitHub repositories, managing commits (including reverts and conflict resolution), and handling the full PR lifecycle. Designed to be installed into any project via the Claude Code plugin system.

Wraps the existing `gh-issue` skill for issue context. Does not touch `fix-issue`.

---

## Skill Tree

```
/gh  (coordinator)
│
├── gh-repo      — create + initialize GitHub repositories
├── gh-commit    — stage, commit, revert, resolve conflicts
└── gh-pr        — open, track, merge PRs (wraps gh-issue)

references/      — shared conventions, templates, defaults
                   (read by all specialists at runtime)
```

---

## Repository Structure

```
gh-management/
  skills/
    gh/
      SKILL.md              ← coordinator
    gh-repo/
      SKILL.md              ← specialist
    gh-commit/
      SKILL.md              ← specialist
    gh-pr/
      SKILL.md              ← specialist (wraps gh-issue)
  references/
    conventions.md          ← master rules (human-readable)
    commit-template.md      ← commit format + custom types
    pr-template.md          ← PR body structure + checklist
    repo-defaults.md        ← branch protection, labels, README boilerplate
  README.md                 ← install + usage guide
  .gitignore
```

---

## Skill 1: /gh (Coordinator)

### Purpose

Entry point for the suite. Routes to specialists by subcommand, orchestrates chained workflows, and presents an interactive menu when invoked with no arguments.

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| (subcommand) | `ask` | `repo`, `commit`, `pr` — routes to specialist |
| (remaining args) | — | Passed through to the specialist |

### Invocation

```
/gh                           # interactive menu
/gh repo new my-project
/gh repo new my-project private=true
/gh commit "feat: add hero section"
/gh commit revert a3f2c1
/gh commit --all
/gh pr open
/gh pr open issue=42
/gh pr merge
/gh pr merge auto=true
/gh pr status
/gh init                      # chained: repo new → initial commit
/gh ship                      # chained: commit → push → pr open
/gh ship issue=42             # chained: gh-issue fetch → commit → push → pr open (linked)
```

### Routing Logic

| Input | Action |
|-------|--------|
| `repo …` | Invoke gh-repo with remaining args |
| `commit …` | Invoke gh-commit with remaining args |
| `pr …` | Invoke gh-pr with remaining args |
| `init` | Chained: gh-repo → gh-commit (initial commit) |
| `ship` | Chained: gh-commit → push → gh-pr open |
| `ship issue=N` | Chained: gh-issue → gh-commit → push → gh-pr open (linked) |
| No args | Interactive menu |

### Interactive Menu (no-args)

```
What would you like to do?

1. Create a new GitHub repo
2. Stage and commit changes
3. Revert a commit
4. Resolve merge conflicts
5. Open a pull request
6. Check PR status
7. Merge an approved PR
8. Ship (commit + push + PR)
```

### Chained Workflows

**`/gh init`**
1. Invoke gh-repo (creates repo, sets up branch protection, clones locally)
2. Invoke gh-commit with message `chore: initial commit`
3. Report: repo URL + local path

**`/gh ship [issue=N]`**
1. If `issue=N`: invoke gh-issue to fetch context → read `.gh-issue/context.json`
2. Invoke gh-commit with `push=false` (stage all changes, generate message from diff if not provided)
3. Push branch to remote (coordinator handles push — prevents double-push since gh-commit defaults to push=true)
4. Invoke gh-pr open (linked to issue if applicable)
5. If `auto=true` (default from ship): gh-pr polls for approval and auto-merges

---

## Skill 2: gh-repo

### Purpose

Create and minimally initialize a new GitHub repository. Handles everything needed to get the repo live and the default branch protected. Does not scaffold project folder structure — that is handled by other tools.

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `name` | required | Repository name |
| `private` | `false` | Public or private repo |
| `description` | `""` | GitHub repo description |
| `org` | (current user) | GitHub org or user to create under |
| `clone` | `true` | Clone the repo locally after creation |

### Workflow

1. Check `gh auth status` — hard stop if not authenticated
2. Run `gh repo create [name] --[public|private] --description "[description]"` 
3. Add `README.md` with repo name as H1 and a one-line description placeholder
4. Add `.gitignore` (Node default — override via `references/repo-defaults.md`)
5. Set default branch to `main`
6. Apply branch protection rules from `references/repo-defaults.md`:
   - Require PR before merging
   - Require 1 approval
   - Dismiss stale reviews on new commits
   - Block direct push to `main`
   - Delete branch on merge (enabled)
7. Create standard labels from `references/repo-defaults.md` label list
8. If `clone=true`: `git clone` to current directory
9. Report: GitHub URL, local path (if cloned), branch protection summary

### Error Handling

| Scenario | Action |
|----------|--------|
| Not authenticated | Hard stop: `gh auth login` instruction |
| Repo name already taken | Stop with clear error + suggest alternatives |
| Org not found / no permission | Stop with permission instructions |
| Branch protection API fails | Warn + continue — report manual steps |

---

## Skill 3: gh-commit

### Purpose

Stage and commit changes with validated commit messages, revert commits safely, and resolve local merge conflicts interactively.

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| (first arg) | `ask` | Commit message string, `revert`, or `resolve` |
| `--all` / `-a` | `false` | Stage all tracked changes before committing |
| `files` | (staged) | Specific files to stage (space-separated) |
| `push` | `true` | Push to remote after committing |
| `branch` | (current) | Branch to push to |

### Mode 1: Normal Commit

1. Stage files (`--all` or specific `files=`, or use already-staged)
2. Validate commit message against `references/commit-template.md`:
   - Format: `type(scope?): description` — type required, scope optional
   - Valid types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `style`, `build`, `deploy`, `skill`
   - Description: present tense, no period at end, ≤72 chars
   - Breaking change: append `!` after type or add `BREAKING CHANGE:` footer
   - If message is invalid: show the error and suggest a corrected version — STOP for confirmation
3. Commit with validated message
4. If `push=true`: push to remote
5. Report: commit hash, message, files changed, push status

### Mode 2: Revert (`revert`)

```
/gh commit revert a3f2c1
/gh commit revert last
```

1. Resolve `last` to the most recent commit hash if needed
2. Display what will be undone (commit message, files affected, author, date)
3. **STOP — require explicit confirmation before proceeding**
4. Run `git revert [hash] --no-edit` (creates a revert commit — never uses `--hard`)
5. Push the revert commit
6. Report: revert commit hash, original commit that was reverted

### Mode 3: Conflict Resolver (`resolve`)

Triggered automatically when a merge/pull detects conflicts, or invoked directly.

1. Run `git status` to identify files with conflict markers
2. For each conflicted file:
   - Display the conflict section (ours vs. theirs)
   - Ask: "Keep ours / Keep theirs / Show full file to decide"
   - Apply the chosen resolution
3. Stage all resolved files
4. Complete the merge commit (`git commit --no-edit`)
5. Push
6. Report: files resolved, merge commit hash

### Commit Message Validation (from references/commit-template.md)

**Standard types (Conventional Commits):**
`feat` · `fix` · `chore` · `docs` · `refactor` · `perf` · `test` · `style`

**Custom additions:**
- `build` — scaffold, tooling, dependency changes
- `deploy` — deploy config changes (Netlify, Vercel, CI)
- `skill` — skill suite authoring or updates (example of a project-specific type — any project can define its own)

**Branch naming (enforced on push):**
- No issue: `feat/description`, `fix/description`, `chore/description`
- With issue: `feat/123-description`, `fix/42-short-name`
- Branch type must match commit type (warns but does not block)

---

## Skill 4: gh-pr

### Purpose

Open, track, and merge GitHub pull requests. Wraps `gh-issue` when an issue is linked. Supports both manual merge-on-command and auto-merge polling.

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| (subcommand) | `open` | `open`, `status`, `merge` |
| `issue` | `""` | Link PR to a GitHub issue number |
| `reviewers` | `""` | Comma-separated GitHub usernames to request review |
| `draft` | `false` | Open as draft PR |
| `auto` | `false` | Enable auto-merge polling (true when called from `/gh ship`) |
| `strategy` | `squash` | Merge strategy: `squash`, `merge`, `rebase` |
| `pr-url` | `auto` | Target a specific PR URL (defaults to current branch's PR) |

### Mode 1: Open

1. Confirm current branch has upstream commits not in `main`; if not, stop with instructions
2. If `issue=N`: invoke `gh-issue N` → read `.gh-issue/context.json` for title, labels, description
3. Generate PR body from `references/pr-template.md`:
   - **Summary:** auto-generated from commit messages on this branch
   - **Changes:** files changed grouped by type (feat/fix/etc.)
   - **Closes:** `Closes #N` if issue was linked
   - **Checklist:** tests pass · no secrets committed · branch up to date
4. Apply labels derived from commit types present in the branch
5. If `reviewers=` provided: assign reviewers
6. Run `gh pr create` with generated body
7. Report: PR URL, title, labels applied
8. If `auto=true`: immediately begin polling (see auto-merge below)

### Mode 2: Status

```
/gh pr status
```

1. Fetch open PRs for the repo (`gh pr list`)
2. For the current branch's PR (if any), show:
   - Review status (approved / changes requested / pending)
   - CI check status (pass / fail / pending)
   - Merge conflict status
   - "Ready to merge?" verdict (yes / no + reason)
3. Report summary table

### Mode 3: Merge

```
/gh pr merge
/gh pr merge strategy=rebase
```

1. Verify PR has ≥1 approval and CI checks are green — if not, report blockers and stop
2. Confirm merge strategy (squash default, overridable)
3. Run `gh pr merge --[squash|merge|rebase] --delete-branch`
4. Pull `main` locally
5. Report: merged commit hash, PR URL, branch deleted

### Auto-Merge Polling

When `auto=true`:
- Poll PR status every 60 seconds, maximum 30 minutes
- When conditions met (≥1 approval + CI green): trigger merge automatically
- Report: `PR #N auto-merged — [commit hash]`
- If not met after 30 minutes: report current status and exit without merging

### gh-issue Integration

When `issue=N` is passed to `gh pr open`:
1. Invoke `gh-issue N` — reads issue title, body, labels
2. PR title: inherits issue title
3. PR body: auto-populates Summary from issue description
4. `Closes #N` added to PR body
5. Issue labels carried over to PR

---

## References Layer

### conventions.md

Master human-readable reference document. Contains:
- Branch naming rules with examples
- Commit message format (full spec + examples)
- PR standards (when to open, required fields, review expectations)
- Merge strategy policy (squash default, when to deviate)
- Label taxonomy (name, color, purpose)
- "How to use this suite in a new project" section

### commit-template.md

Machine-readable by `gh-commit` for validation. Contains:
- All valid commit types with descriptions
- Scope rules (optional, lowercase, matches directory/feature area)
- Description rules (present tense, ≤72 chars, no period)
- Breaking change format
- Custom project-specific type additions section (projects copy and extend this)

### pr-template.md

Machine-readable by `gh-pr` for body generation. Contains:
- PR body section definitions (Summary, Changes, Closes, Checklist)
- Label-to-commit-type mapping table
- Reviewer assignment rules
- Merge strategy guidance

### repo-defaults.md

Machine-readable by `gh-repo` at creation time. Contains:
- Branch protection ruleset (JSON-compatible format)
- Default labels: name, hex color, description
- README.md boilerplate template
- .gitignore base (Node — projects extend as needed)
- Projects can fork this file to override defaults per-repo

---

## Installation + Cross-Project Usage

The suite lives at `github.com/[user]/gh-management` as a public repo.

**Install via Claude Code plugin system:**
```
claude plugin add github.com/[user]/gh-management
```

**Or copy references for per-project customization:**
```bash
cp gh-management/references/ ./references/
```

The `references/` files are the extension point — projects copy and customize them without changing the skills themselves. The skills always read from `./references/` in the current project first; if not found, they fall back to the suite's own `references/`.

**Test bed:** `skills-grimoire` — used to validate the suite end-to-end after implementation.

---

## Error Handling (Global)

| Scenario | Action |
|----------|--------|
| `gh` CLI not installed | Hard stop: "Install GitHub CLI: https://cli.github.com" |
| Not authenticated (`gh auth status` fails) | Hard stop: "Run: gh auth login" |
| Git not initialized in current directory | Stop with: "Run: git init" |
| No remote set | Stop with: "Run: git remote add origin [url]" |
| Specialist skill not found | Stop: "gh-[skill] not found at skills/gh-[skill]/SKILL.md" |

---

## Key Design Decisions

1. **Squash merge default** — keeps main branch history clean and readable; overridable per-invocation
2. **Revert never uses `--hard`** — always creates a revert commit, never rewrites history; destructive ops require explicit confirmation
3. **References as extension points** — projects customize behavior by overriding `references/` files, not by modifying skills
4. **Auto-merge is opt-in** — default on `/gh ship`, off on direct `/gh pr open` invocation
5. **gh-issue is wrapped, not replaced** — gh-pr invokes it for context; gh-issue remains independently invocable
6. **Branch naming tied to commit type** — convention enforced by gh-commit on push (warn, not block) for consistency across projects
