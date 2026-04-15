# gh-management Skill Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `gh-management` skill suite repository containing a `/gh` coordinator and three specialist skills (`gh-repo`, `gh-commit`, `gh-pr`) for managing GitHub repos, commits, and PRs across any project.

**Architecture:** Coordinator + Specialist pattern. `/gh` routes and chains specialists. Each specialist is independently invocable. A shared `references/` layer provides conventions, templates, and defaults read at runtime. The suite wraps the existing `gh-issue` skill for issue context in `gh-pr`.

**Tech Stack:** Markdown skill files, GitHub CLI (`gh`), Git CLI. No build step — all files are `.md`.

**Spec:** `/mnt/c/Users/tez/projects/skills-grimoire/docs/superpowers/specs/2026-04-15-gh-management-design.md`

---

## File Map

| File | Status | Responsibility |
|------|--------|---------------|
| `gh-management/skills/gh/SKILL.md` | Create | Coordinator — routing, chained workflows, interactive menu |
| `gh-management/skills/gh-repo/SKILL.md` | Create | Repo creation + minimal GitHub initialization |
| `gh-management/skills/gh-commit/SKILL.md` | Create | Commit, revert, conflict resolution |
| `gh-management/skills/gh-pr/SKILL.md` | Create | PR open/status/merge, wraps gh-issue |
| `gh-management/references/conventions.md` | Create | Master human-readable rules doc |
| `gh-management/references/commit-template.md` | Create | Commit format spec + custom types |
| `gh-management/references/pr-template.md` | Create | PR body structure + checklist |
| `gh-management/references/repo-defaults.md` | Create | Branch protection rules, labels, README boilerplate |
| `gh-management/README.md` | Create | Install + usage guide |
| `gh-management/.gitignore` | Create | Standard ignores |

---

## Task 1: Scaffold the repo directory

**Files:**
- Create: `gh-management/` (all subdirectories)

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p /mnt/c/Users/tez/projects/gh-management/skills/gh
mkdir -p /mnt/c/Users/tez/projects/gh-management/skills/gh-repo
mkdir -p /mnt/c/Users/tez/projects/gh-management/skills/gh-commit
mkdir -p /mnt/c/Users/tez/projects/gh-management/skills/gh-pr
mkdir -p /mnt/c/Users/tez/projects/gh-management/references
```

- [ ] **Step 2: Verify structure**

```bash
find /mnt/c/Users/tez/projects/gh-management -type d
```

Expected output:
```
/mnt/c/Users/tez/projects/gh-management
/mnt/c/Users/tez/projects/gh-management/skills
/mnt/c/Users/tez/projects/gh-management/skills/gh
/mnt/c/Users/tez/projects/gh-management/skills/gh-repo
/mnt/c/Users/tez/projects/gh-management/skills/gh-commit
/mnt/c/Users/tez/projects/gh-management/skills/gh-pr
/mnt/c/Users/tez/projects/gh-management/references
```

- [ ] **Step 3: Create .gitignore**

Write `/mnt/c/Users/tez/projects/gh-management/.gitignore`:

```
.env
.env.local
node_modules/
.DS_Store
*.log
```

- [ ] **Step 4: Initialize git**

```bash
cd /mnt/c/Users/tez/projects/gh-management && git init && git checkout -b main
```

Expected: `Initialized empty Git repository` + `Switched to a new branch 'main'`

---

## Task 2: Write references/conventions.md

**Files:**
- Create: `gh-management/references/conventions.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/references/conventions.md`:

```markdown
# GitHub Conventions

This document is the master reference for how this project manages GitHub. Read it before using any `/gh` skill.

---

## Branch Naming

Branches must follow this pattern:

| Situation | Format | Example |
|-----------|--------|---------|
| No linked issue | `type/short-description` | `feat/add-hero-section` |
| Linked issue | `type/123-short-description` | `fix/42-broken-nav-link` |

- `type` must match a valid commit type (see Commit Types below)
- `short-description`: lowercase, hyphens only, ≤40 chars
- Branch type should match the primary commit type on the branch (warning, not a block)

---

## Commit Message Format

```
type(scope?): description

[optional body]

[optional footer — BREAKING CHANGE: description]
```

**Rules:**
- `type` is required. Must be a valid type from the list below.
- `scope` is optional. Lowercase, matches a directory or feature area.
- `description`: present tense, no capital first letter, no period at end, ≤72 chars total header.
- Breaking change: append `!` after type/scope (`feat!:`) OR add `BREAKING CHANGE:` footer.

### Commit Types

**Standard (Conventional Commits):**

| Type | Use when |
|------|----------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `chore` | Maintenance, config, non-code changes |
| `docs` | Documentation only |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `style` | Formatting, whitespace (no logic change) |

**Custom additions:**

| Type | Use when |
|------|----------|
| `build` | Scaffold, tooling, dependency changes |
| `deploy` | Deploy config changes (Netlify, Vercel, CI/CD) |
| `skill` | Skill suite authoring or updates (example project-specific type — add your own here) |

---

## Pull Request Standards

- **When to open:** After pushing a feature or fix branch — never commit directly to `main`.
- **Required fields:** Summary, Changes, Checklist (see `references/pr-template.md`)
- **Link issues:** Use `Closes #N` in the PR body to auto-close the linked issue on merge.
- **Labels:** Derived from commit types present in the branch. Applied automatically by `gh-pr`.
- **Reviews:** At least 1 approval required before merging.
- **Merge strategy:** Squash merge by default. Keeps `main` history clean and readable.
  - Use `strategy=merge` for PRs where commit history matters.
  - Use `strategy=rebase` for linear history preference.

---

## Merge Policy

- Default: squash merge
- Branch deleted on merge automatically
- Never force-push to `main`
- Reverts are always done with `git revert` (new commit) — never `--hard` reset

---

## Label Taxonomy

| Label | Color | Purpose |
|-------|-------|---------|
| `feat` | `#0075ca` | New feature |
| `fix` | `#d93f0b` | Bug fix |
| `chore` | `#e4e669` | Maintenance |
| `docs` | `#0052cc` | Documentation |
| `breaking` | `#b60205` | Breaking change |
| `deploy` | `#f9d0c4` | Deploy-related |
| `build` | `#bfd4f2` | Build/tooling |

---

## Using This Suite in a New Project

1. Install the suite: `claude plugin add github.com/[user]/gh-management`
2. Optionally copy and customize references: `cp gh-management/references/ ./references/`
3. Skills read from `./references/` in your project first; fall back to the suite's own `references/` if not found.
4. To add project-specific commit types: copy `references/commit-template.md` to your project and add rows to the Custom additions section.
```

- [ ] **Step 2: Verify all sections present**

```bash
grep -n "^##" /mnt/c/Users/tez/projects/gh-management/references/conventions.md
```

Expected — all 6 sections:
```
## Branch Naming
## Commit Message Format
## Pull Request Standards
## Merge Policy
## Label Taxonomy
## Using This Suite in a New Project
```

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add references/conventions.md
git commit -m "docs: add conventions reference doc"
```

---

## Task 3: Write references/commit-template.md

**Files:**
- Create: `gh-management/references/commit-template.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/references/commit-template.md`:

```markdown
# Commit Template

Machine-readable by `gh-commit` for message validation. Human-readable as a reference.

---

## Format

```
type(scope?)[!]?: description
```

## Validation Rules

| Field | Rule |
|-------|------|
| `type` | Required. Must match a type in the TYPES list below. |
| `scope` | Optional. Lowercase letters and hyphens only. Max 20 chars. |
| `!` | Optional. Append after type or scope to mark a breaking change. |
| `description` | Required. Present tense. No capital first letter. No period. Max 72 chars total header line. |
| Body | Optional. Blank line after header. Any length. |
| Footer | Optional. `BREAKING CHANGE: description` or `Closes #N`. |

---

## TYPES

### Standard (Conventional Commits)

```
feat       New feature
fix        Bug fix
chore      Maintenance, config, non-code tasks
docs       Documentation only
refactor   Code restructuring — no behavior change
perf       Performance improvement
test       Adding or fixing tests
style      Formatting, whitespace — no logic change
```

### Custom Additions

```
build      Scaffold, tooling, dependency changes
deploy     Deploy config (Netlify, Vercel, CI/CD)
skill      Skill suite authoring or updates
```

> **Project-specific:** Copy this file to your project's `references/` directory and add rows
> to the Custom Additions section for types specific to your project.

---

## Examples

```
feat: add hero section with lead capture form
fix(nav): resolve mobile hamburger menu not closing
chore: update dependencies to latest
docs: add contributing guide
feat!: change API response shape — breaks existing consumers
build: scaffold Next.js project with Tailwind
deploy: add netlify.toml with www redirect
skill: add site-reviewer to web-studio pipeline
```

---

## Invalid Examples (and why)

```
Feature: add hero section       ← type must be lowercase
feat: Add hero section          ← description must not start with capital
feat: add hero section.         ← no period at end
feat: this is a very long description that exceeds the 72 character limit for the header line ← too long
```
```

- [ ] **Step 2: Verify TYPES section is present**

```bash
grep -n "^###\|^## " /mnt/c/Users/tez/projects/gh-management/references/commit-template.md
```

Expected — Format, Validation Rules, TYPES, Standard, Custom Additions, Examples, Invalid Examples sections present.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add references/commit-template.md
git commit -m "docs: add commit-template reference"
```

---

## Task 4: Write references/pr-template.md

**Files:**
- Create: `gh-management/references/pr-template.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/references/pr-template.md`:

```markdown
# PR Template

Machine-readable by `gh-pr` for PR body generation. Also used as the `.github/pull_request_template.md` content when projects want GitHub's native template.

---

## PR Body Structure

```markdown
## Summary
- [auto-generated from commit messages on this branch — one bullet per commit type present]

## Changes
- [list of changed files grouped by commit type]

## Closes
Closes #[issue number]
[omit this section if no issue is linked]

## Checklist
- [ ] Tests pass (or no tests applicable)
- [ ] No secrets or credentials committed
- [ ] Branch is up to date with main
- [ ] PR title matches the primary commit type
```

---

## Label Mapping

Labels applied automatically by `gh-pr open` based on commit types present in the branch:

| Commit type(s) present | Labels applied |
|------------------------|----------------|
| `feat` | `feat` |
| `fix` | `fix` |
| `feat` + any `!` or `BREAKING CHANGE` | `feat`, `breaking` |
| `chore` | `chore` |
| `docs` | `docs` |
| `deploy` | `deploy` |
| `build` | `build` |
| Multiple types | All matching labels |

---

## Reviewer Assignment Rules

- If `reviewers=` is passed to `gh-pr open`: assign those GitHub usernames directly.
- If no reviewers passed and a `CODEOWNERS` file exists: assign per CODEOWNERS rules.
- If neither: open without assigned reviewers.

---

## Merge Strategy Guidance

| Situation | Recommended strategy |
|-----------|----------------------|
| Feature branch (1-5 commits) | `squash` (default) |
| Feature branch (many logical commits worth keeping) | `merge` |
| Linear history preference | `rebase` |
| Hotfix | `squash` |

Override default at any time with `strategy=merge` or `strategy=rebase` on `/gh pr merge`.
```

- [ ] **Step 2: Verify sections present**

```bash
grep -n "^## " /mnt/c/Users/tez/projects/gh-management/references/pr-template.md
```

Expected: PR Body Structure, Label Mapping, Reviewer Assignment Rules, Merge Strategy Guidance.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add references/pr-template.md
git commit -m "docs: add pr-template reference"
```

---

## Task 5: Write references/repo-defaults.md

**Files:**
- Create: `gh-management/references/repo-defaults.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/references/repo-defaults.md`:

```markdown
# Repo Defaults

Machine-readable by `gh-repo` at creation time. Override this file in your project's `references/` directory to customize defaults per-project.

---

## Branch Protection Rules

Applied to `main` via `gh api` after repo creation.

```json
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "delete_branch_on_merge": true
}
```

**gh CLI command used by gh-repo:**

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field enforce_admins=false \
  --field restrictions=null \
  --field required_status_checks=null
```

---

## Default Labels

Created via `gh label create` after repo initialization. These replace GitHub's default labels.

| Name | Color | Description |
|------|-------|-------------|
| `feat` | `#0075ca` | New feature |
| `fix` | `#d93f0b` | Bug fix |
| `chore` | `#e4e669` | Maintenance |
| `docs` | `#0052cc` | Documentation |
| `breaking` | `#b60205` | Breaking change |
| `deploy` | `#f9d0c4` | Deployment change |
| `build` | `#bfd4f2` | Build or tooling |
| `wip` | `#cccccc` | Work in progress |

**gh CLI commands used by gh-repo:**

```bash
# Delete GitHub defaults first
gh label delete bug --yes --repo {owner}/{repo}
gh label delete documentation --yes --repo {owner}/{repo}
gh label delete duplicate --yes --repo {owner}/{repo}
gh label delete enhancement --yes --repo {owner}/{repo}
gh label delete "good first issue" --yes --repo {owner}/{repo}
gh label delete "help wanted" --yes --repo {owner}/{repo}
gh label delete invalid --yes --repo {owner}/{repo}
gh label delete question --yes --repo {owner}/{repo}
gh label delete wontfix --yes --repo {owner}/{repo}

# Create suite labels
gh label create feat --color "0075ca" --description "New feature" --repo {owner}/{repo}
gh label create fix --color "d93f0b" --description "Bug fix" --repo {owner}/{repo}
gh label create chore --color "e4e669" --description "Maintenance" --repo {owner}/{repo}
gh label create docs --color "0052cc" --description "Documentation" --repo {owner}/{repo}
gh label create breaking --color "b60205" --description "Breaking change" --repo {owner}/{repo}
gh label create deploy --color "f9d0c4" --description "Deployment change" --repo {owner}/{repo}
gh label create build --color "bfd4f2" --description "Build or tooling" --repo {owner}/{repo}
gh label create wip --color "cccccc" --description "Work in progress" --repo {owner}/{repo}
```

---

## README Boilerplate

Used by `gh-repo` when creating `README.md` for new repos.

```markdown
# {repo-name}

{description}

## Getting Started

_Add setup instructions here._

## Usage

_Add usage instructions here._

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) if present, or submit a PR against the `main` branch.
```

---

## .gitignore Defaults

```
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build output
dist/
.next/
.astro/
out/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
```

> **Project-specific:** Copy this file to your project `references/` and modify to suit your stack.
```

- [ ] **Step 2: Verify key sections present**

```bash
grep -n "^## " /mnt/c/Users/tez/projects/gh-management/references/repo-defaults.md
```

Expected: Branch Protection Rules, Default Labels, README Boilerplate, .gitignore Defaults.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add references/repo-defaults.md
git commit -m "docs: add repo-defaults reference"
```

---

## Task 6: Write skills/gh-repo/SKILL.md

**Files:**
- Create: `gh-management/skills/gh-repo/SKILL.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/skills/gh-repo/SKILL.md`:

```markdown
---
name: gh-repo
description: "Use to create and initialize a new GitHub repository with minimal setup. Creates the repo on GitHub, sets default branch to main, applies branch protection rules, creates standard labels, and optionally clones locally. Part of the gh-management suite — also invoked by /gh repo and /gh init."
---

# GitHub Repo

Create and minimally initialize a new GitHub repository. Handles everything needed to get the repo live on GitHub with branch protection and standard labels. Does not scaffold project folder structure — other tools handle that.

## When to Use

- Creating a new GitHub repo for any project
- Invoked automatically by `/gh repo new` or `/gh init`
- Setting up a fresh repo with consistent conventions across projects

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `name` | required | Repository name |
| `private` | `false` | `true` for private, `false` for public |
| `description` | `""` | GitHub repo description (shown on GitHub) |
| `org` | (current user) | GitHub org or username to create under |
| `clone` | `true` | Clone the repo locally after creation |

## Invocation

```
/gh-repo my-project
/gh-repo my-project private=true
/gh-repo my-project description="A new web project" org=my-org
/gh-repo my-project clone=false
```

---

## Workflow

### Step 1: Pre-flight check

Run `gh auth status`. If not authenticated, stop immediately:

```
Error: GitHub CLI not authenticated.
Run: gh auth login
Then re-run /gh-repo.
```

Read `references/repo-defaults.md` — from the current project's `./references/` first; fall back to the skill suite's own `references/repo-defaults.md` if not found.

### Step 2: Create repo

```bash
gh repo create {name} --{public|private} --description "{description}"
```

If `org` is provided:

```bash
gh repo create {org}/{name} --{public|private} --description "{description}"
```

On failure:
- **Name taken:** Stop. Report: "Repository '{name}' already exists. Choose a different name."
- **Org not found / no permission:** Stop. Report the exact error from `gh` output and link to GitHub org settings.

### Step 3: Add README.md

Create `README.md` using the boilerplate from `references/repo-defaults.md`, replacing `{repo-name}` and `{description}` with the provided values.

Push to GitHub to initialize the default branch:

```bash
cd {clone-dir} && git add README.md && git commit -m "chore: initial commit" && git push origin main
```

(If `clone=false`, use the GitHub API to create the file directly via `gh api`.)

### Step 4: Add .gitignore

Create `.gitignore` using the defaults from `references/repo-defaults.md`.

```bash
git add .gitignore && git commit -m "chore: add .gitignore" && git push origin main
```

### Step 5: Apply branch protection

Apply branch protection rules to `main` using the exact `gh api` command from `references/repo-defaults.md`, substituting `{owner}` and `{repo}` with the actual values.

If the API call fails, warn and continue:

```
Warning: Branch protection could not be applied automatically.
Apply manually at: github.com/{owner}/{name}/settings/branches
Rules to apply: require 1 PR approval, dismiss stale reviews, block direct push to main.
```

### Step 6: Create labels

Delete GitHub's default labels and create the suite labels using the exact `gh label` commands from `references/repo-defaults.md`.

If any individual label command fails, log the failure and continue with the rest.

### Step 7: Clone (if clone=true)

```bash
gh repo clone {owner}/{name}
```

### Step 8: Report

```
gh-repo complete.

Repo:   https://github.com/{owner}/{name}
Local:  ./{name}/  (cloned)

Branch protection:  ✓ applied
Labels:             ✓ 8 labels created
Default branch:     main
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Not authenticated | Hard stop with `gh auth login` instruction |
| Repo name already taken | Stop with clear error — suggest alternative |
| Org not found / no permission | Stop with GitHub org settings link |
| Branch protection API fails | Warn + continue — show manual steps |
| Label creation fails (individual) | Log failure, continue with remaining labels |
| Clone fails | Report error, provide manual clone command |
```

- [ ] **Step 2: Verify frontmatter and key sections**

```bash
head -5 /mnt/c/Users/tez/projects/gh-management/skills/gh-repo/SKILL.md
grep -n "^## \|^### " /mnt/c/Users/tez/projects/gh-management/skills/gh-repo/SKILL.md
```

Expected: frontmatter has `name: gh-repo`, sections include When to Use, Parameters, Invocation, Workflow (Steps 1–8), Error Handling.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add skills/gh-repo/SKILL.md
git commit -m "skill: add gh-repo specialist"
```

---

## Task 7: Write skills/gh-commit/SKILL.md

**Files:**
- Create: `gh-management/skills/gh-commit/SKILL.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/skills/gh-commit/SKILL.md`:

```markdown
---
name: gh-commit
description: "Use to stage and commit changes with validated conventional commit messages, revert a commit safely (creates revert commit — never --hard), or resolve local merge conflicts interactively. Part of the gh-management suite — also invoked by /gh commit and /gh ship."
---

# GitHub Commit

Stage and commit changes with validated commit messages, revert commits safely, and resolve local merge conflicts. Reads commit type rules from `references/commit-template.md`.

## When to Use

- Committing changes to any branch
- Reverting a specific commit or the last commit
- Resolving merge conflicts after a pull or rebase
- Invoked automatically by `/gh commit`, `/gh ship`, and `/gh init`

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| (first arg) | `ask` | Commit message string, `revert`, or `resolve` |
| `--all` / `-a` | `false` | Stage all tracked modified files before committing |
| `files` | (staged) | Specific files to stage (space-separated paths) |
| `push` | `true` | Push to remote after committing |
| `branch` | (current) | Remote branch to push to |

## Invocation

```
/gh-commit "feat: add hero section"
/gh-commit "feat(nav): add mobile hamburger menu" --all
/gh-commit files="src/components/Hero.astro src/layouts/Layout.astro" "feat: add hero and layout"
/gh-commit revert a3f2c1
/gh-commit revert last
/gh-commit resolve
```

---

## Workflow

### Pre-flight

Read `references/commit-template.md` — from `./references/` in the current project first; fall back to the suite's own `references/commit-template.md` if not found.

---

### Mode 1: Normal Commit

**Triggered when:** first argument is a commit message string (not `revert` or `resolve`).

**Step 1: Stage files**

- If `--all` or `-a`: run `git add -u` (stage all tracked modified files)
- If `files=` provided: run `git add {files}`
- If neither: use already-staged files. If nothing is staged, run `git status` and report:
  ```
  Nothing staged to commit.
  Use --all to stage all tracked changes, or files="path1 path2" to stage specific files.
  ```
  Then stop.

**Step 2: Validate commit message**

Parse the message against rules in `references/commit-template.md`:

- Extract `type`, optional `scope`, optional `!`, and `description` using pattern:
  `^(type)(\(scope\))?(!)?:\s(.+)$`
- Check `type` is in the TYPES list
- Check `description` starts with lowercase
- Check `description` does not end with `.`
- Check total header line is ≤72 characters

If invalid, show the specific error and a suggested correction:

```
Invalid commit message: "Feature: add hero section"

Error: type "Feature" is not valid. Did you mean "feat"?

Suggested: feat: add hero section

Use this message? (yes / edit)
```

**STOP — wait for response.**

If "yes": use the suggested message. If "edit": ask for new message and re-validate.

**Step 3: Commit**

```bash
git commit -m "{validated message}"
```

**Step 4: Push (if push=true)**

```bash
git push origin {branch}
```

If branch has no upstream yet:

```bash
git push --set-upstream origin {branch}
```

**Step 5: Report**

```
Committed: {short hash} {message}
Files:     {N} files changed
Pushed:    origin/{branch}
```

---

### Mode 2: Revert

**Triggered when:** first argument is `revert`.

**Step 1: Resolve target commit**

- If argument after `revert` is `last`: resolve to `git rev-parse HEAD`
- Otherwise: use provided hash directly

**Step 2: Display what will be undone**

```bash
git show {hash} --stat --format="Commit: %H%nMessage: %s%nAuthor: %an%nDate: %ad"
```

Show the output, then:

```
This will create a new revert commit undoing the above. The original commit will remain in history.
Proceed? (yes / no)
```

**STOP — wait for confirmation. Do NOT proceed without explicit "yes".**

**Step 3: Revert**

```bash
git revert {hash} --no-edit
```

Never use `git reset --hard`. Never use `git revert --no-commit` without immediately completing the commit.

**Step 4: Push**

```bash
git push origin {branch}
```

**Step 5: Report**

```
Reverted: {original hash} "{original message}"
Revert commit: {new hash}
Pushed: origin/{branch}
```

---

### Mode 3: Conflict Resolver

**Triggered when:** first argument is `resolve`, OR when a `git pull` / `git merge` run by this skill exits with conflict errors.

**Step 1: Find conflicted files**

```bash
git diff --name-only --diff-filter=U
```

If no conflicts found:

```
No merge conflicts detected. Run git status to check current state.
```

Stop.

**Step 2: Resolve each file**

For each conflicted file, display the conflict section:

```bash
grep -n "<<<<<<\|=======\|>>>>>>" {file} | head -30
```

Then ask:

```
Conflict in {file}:

<<<<<<< HEAD (ours)
{ours content}
=======
{theirs content}
>>>>>>> {branch} (theirs)

How to resolve?
1. Keep ours (HEAD)
2. Keep theirs ({branch})
3. Show full file — I'll decide
```

**STOP — wait for response per file.**

| Choice | Action |
|--------|--------|
| Keep ours | Run `git checkout --ours {file}` |
| Keep theirs | Run `git checkout --theirs {file}` |
| Show full file | Print full file content, then re-ask |

After applying choice: `git add {file}`.

**Step 3: Complete merge commit**

```bash
git commit --no-edit
```

**Step 4: Push**

```bash
git push origin {branch}
```

**Step 5: Report**

```
Conflicts resolved: {N} files
Merge commit: {hash}
Pushed: origin/{branch}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Nothing staged and no --all or files= | Stop with staging instructions |
| Commit message fails validation | Show error + suggest correction — STOP for confirmation |
| Push rejected (not up to date) | Report: "Push rejected — pull first: git pull origin {branch}" |
| Revert hash not found | Stop: "Commit {hash} not found in this repo. Run git log to find the correct hash." |
| No conflicts found in resolve mode | Report and stop cleanly |
| Merge commit fails after resolving | Report git error output, provide manual completion command |
```

- [ ] **Step 2: Verify frontmatter and modes**

```bash
head -5 /mnt/c/Users/tez/projects/gh-management/skills/gh-commit/SKILL.md
grep -n "^### Mode" /mnt/c/Users/tez/projects/gh-management/skills/gh-commit/SKILL.md
```

Expected: `name: gh-commit`, three modes (Normal Commit, Revert, Conflict Resolver).

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add skills/gh-commit/SKILL.md
git commit -m "skill: add gh-commit specialist"
```

---

## Task 8: Write skills/gh-pr/SKILL.md

**Files:**
- Create: `gh-management/skills/gh-pr/SKILL.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/skills/gh-pr/SKILL.md`:

```markdown
---
name: gh-pr
description: "Use to open, track, or merge a GitHub pull request. Generates PR body from commit history, links issues via gh-issue when issue= is passed, and supports auto-merge polling. Part of the gh-management suite — also invoked by /gh pr and /gh ship."
---

# GitHub PR

Open, track, and merge GitHub pull requests. Wraps `gh-issue` when an issue is linked. Supports auto-merge polling after opening.

## When to Use

- Opening a PR from a feature branch
- Checking PR review and CI status
- Merging an approved PR and cleaning up the branch
- Invoked automatically by `/gh pr`, `/gh ship`, and `/gh ship issue=N`

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| (subcommand) | `open` | `open`, `status`, or `merge` |
| `issue` | `""` | Link PR to a GitHub issue number — invokes gh-issue for context |
| `reviewers` | `""` | Comma-separated GitHub usernames to assign as reviewers |
| `draft` | `false` | Open as draft PR |
| `auto` | `false` | Enable auto-merge polling after opening (set to `true` by `/gh ship`) |
| `strategy` | `squash` | Merge strategy: `squash`, `merge`, or `rebase` |
| `pr-url` | `auto` | Target PR URL — defaults to current branch's open PR |

## Invocation

```
/gh-pr open
/gh-pr open issue=42
/gh-pr open reviewers=alice,bob draft=true
/gh-pr open auto=true
/gh-pr status
/gh-pr merge
/gh-pr merge strategy=rebase
/gh-pr merge pr-url=https://github.com/owner/repo/pull/42
```

---

## Workflow

### Pre-flight

Read `references/pr-template.md` — from `./references/` in the current project first; fall back to the suite's own `references/pr-template.md` if not found.

---

### Mode 1: Open

**Step 1: Verify branch has commits ahead of main**

```bash
git log main..HEAD --oneline
```

If empty, stop:

```
No commits on this branch ahead of main.
Make at least one commit before opening a PR.
```

**Step 2: Fetch issue context (if issue= provided)**

Invoke `gh-issue {issue}` — it writes `.gh-issue/context.json`. Read that file:

```bash
cat .gh-issue/context.json
```

Extract `title`, `body`, and `labels`.

**Step 3: Generate PR body**

Build PR body from `references/pr-template.md` structure:

**Summary section:** Parse commit messages on this branch:

```bash
git log main..HEAD --pretty=format:"%s"
```

Group by type prefix and generate one bullet per type:

```
## Summary
- feat: add hero section, services grid, mobile sticky bar
- fix: resolve nav link to /about
```

**Changes section:** List changed files grouped by their commit type:

```bash
git diff main..HEAD --name-only
```

**Closes section:** Include only if `issue=` was passed:

```
## Closes
Closes #{issue}
```

**Checklist section:** Use the checklist from `references/pr-template.md`.

**Step 4: Apply labels**

Parse commit types from this branch's commits (from Step 3). Look up the label mapping in `references/pr-template.md`. Apply all matching labels.

Check for `!` or `BREAKING CHANGE:` in any commit — if found, also apply `breaking` label.

**Step 5: Assign reviewers (if reviewers= provided)**

```bash
# Passed as --reviewer flags to gh pr create
```

**Step 6: Create PR**

```bash
gh pr create \
  --title "{issue title if issue= provided, else first commit message}" \
  --body "{generated body}" \
  --label "{label1}" --label "{label2}" \
  [--reviewer alice --reviewer bob] \
  [--draft]
```

**Step 7: Report**

```
PR opened: #{number} — {title}
URL:       {pr-url}
Labels:    {labels}
Reviewers: {reviewers or "none assigned"}
```

**Step 8: Auto-merge (if auto=true)**

Immediately begin polling (see Auto-Merge Polling section below).

---

### Mode 2: Status

**Step 1: Determine target PR**

```bash
gh pr list --state open --json number,title,url,reviewDecision,statusCheckRollup,mergeable
```

If `pr-url=` provided: filter to that PR. Else: find PR for current branch.

**Step 2: Display status table**

```
PR #42 — feat: add hero section
URL:       https://github.com/owner/repo/pull/42

Reviews:   ✓ 1 approval (alice)
CI:        ✓ All checks passing
Conflicts: ✗ Merge conflict detected — pull main and rebase

Ready to merge? NO — resolve merge conflict first
```

Verdict logic:

| Condition | Verdict |
|-----------|---------|
| ≥1 approval AND CI green AND no conflicts | YES |
| Pending reviews | NO — awaiting review |
| CI failing | NO — CI checks failing |
| Merge conflicts | NO — resolve conflicts first |
| Changes requested | NO — changes requested by {reviewer} |

---

### Mode 3: Merge

**Step 1: Verify conditions**

Run the same checks as Mode 2 Status. If conditions not met, stop:

```
Cannot merge: {reason from verdict table}
```

**Step 2: Confirm strategy**

If `strategy=` was not explicitly passed, confirm:

```
Merge strategy: squash (default)
Override with strategy=merge or strategy=rebase if needed.
Proceed with squash merge? (yes / no)
```

**STOP — wait for response.**

**Step 3: Merge**

```bash
gh pr merge {pr-url} --{squash|merge|rebase} --delete-branch
```

**Step 4: Pull main locally**

```bash
git checkout main && git pull origin main
```

**Step 5: Report**

```
Merged: PR #{number} — {title}
Strategy: squash
Branch:   feat/my-feature deleted
Commit:   {merged commit hash} on main
```

---

### Auto-Merge Polling

When `auto=true` (set after `open` or explicitly):

1. Poll every 60 seconds using Mode 2 Status logic
2. Print progress on each poll:
   ```
   Waiting for approval and CI... (attempt N — {status summary})
   ```
3. When conditions met (≥1 approval + CI green + no conflicts): trigger Mode 3 Merge automatically
4. Maximum poll time: 30 minutes (30 attempts)
5. If not met after 30 minutes:
   ```
   Auto-merge timeout after 30 minutes.
   Current status: {last status summary}
   Merge manually when ready: /gh pr merge
   ```

---

## gh-issue Integration

When `issue=N` is passed:

1. Invoke `gh-issue N` to fetch and write `.gh-issue/context.json`
2. Read context file — extract `title`, `body`, `labels`
3. PR title set to issue title
4. Issue body prepended to PR Summary section
5. `Closes #N` added to PR body
6. Issue labels carried over (in addition to commit-type labels)

If `gh-issue` skill is not found, warn and continue without issue context:

```
Warning: gh-issue skill not found — PR will be opened without issue context.
Expected at: skills/gh-issue/SKILL.md
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| No commits ahead of main | Stop with commit instructions |
| gh-issue not found when issue= passed | Warn and continue without issue context |
| PR already exists for this branch | Show existing PR URL, ask: "Update PR body or open a new one?" |
| gh pr create fails | Report full error, save PR body to `.gh-pr/pr-body.md`, provide manual command |
| Merge blocked (no approval) | Stop with clear reason — do not proceed |
| Merge blocked (CI failing) | Stop with CI status link |
| Auto-merge timeout | Report last status, provide manual merge command |
| strategy= value invalid | Stop: "Invalid strategy '{value}'. Valid: squash, merge, rebase." |
```

- [ ] **Step 2: Verify frontmatter and modes**

```bash
head -5 /mnt/c/Users/tez/projects/gh-management/skills/gh-pr/SKILL.md
grep -n "^### Mode\|^### Auto" /mnt/c/Users/tez/projects/gh-management/skills/gh-pr/SKILL.md
```

Expected: `name: gh-pr`, Mode 1 (Open), Mode 2 (Status), Mode 3 (Merge), Auto-Merge Polling.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add skills/gh-pr/SKILL.md
git commit -m "skill: add gh-pr specialist"
```

---

## Task 9: Write skills/gh/SKILL.md (coordinator)

**Files:**
- Create: `gh-management/skills/gh/SKILL.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/skills/gh/SKILL.md`:

```markdown
---
name: gh
description: "Use to manage GitHub repositories, commits, and pull requests. Routes to specialist skills (gh-repo, gh-commit, gh-pr) by subcommand, or chains them for one-shot workflows (/gh init, /gh ship). Invoke with no arguments for an interactive menu."
---

# GitHub Management

Entry point for the gh-management suite. Route to any specialist skill by subcommand, or use chained workflows to do multi-step GitHub operations in a single command.

## When to Use

- Any GitHub operation — creating repos, committing, managing PRs
- Chaining operations: `init` (repo + first commit), `ship` (commit + push + PR)
- When you want an interactive menu to pick what to do

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| (subcommand) | `ask` | `repo`, `commit`, `pr`, `init`, or `ship` — routes to specialist or runs chain |
| (remaining args) | — | Passed through directly to the specialist |

## Invocation

```
/gh                              # interactive menu
/gh repo new my-project
/gh repo new my-project private=true description="My project"
/gh commit "feat: add hero section"
/gh commit "feat: add hero section" --all
/gh commit revert a3f2c1
/gh commit revert last
/gh commit resolve
/gh pr open
/gh pr open issue=42
/gh pr open reviewers=alice,bob
/gh pr status
/gh pr merge
/gh pr merge strategy=rebase
/gh init                         # repo new → initial commit
/gh ship                         # commit --all → push → pr open
/gh ship issue=42                # gh-issue 42 → commit --all → push → pr open (linked)
/gh ship auto=true               # commit → push → pr open → auto-merge when approved
```

---

## Routing

| Subcommand | Action |
|------------|--------|
| `repo …` | Invoke `/gh-repo` with remaining arguments |
| `commit …` | Invoke `/gh-commit` with remaining arguments |
| `pr …` | Invoke `/gh-pr` with remaining arguments |
| `init` | Run `/gh init` chain (below) |
| `ship` | Run `/gh ship` chain (below) |
| No args | Display interactive menu |

---

## Interactive Menu

When invoked with no arguments:

```
gh-management — what would you like to do?

1. Create a new GitHub repo        → /gh repo new
2. Stage and commit changes        → /gh commit
3. Revert a commit                 → /gh commit revert
4. Resolve merge conflicts         → /gh commit resolve
5. Open a pull request             → /gh pr open
6. Check PR status                 → /gh pr status
7. Merge an approved PR            → /gh pr merge
8. Ship (commit + push + PR)       → /gh ship
```

**STOP — wait for response.**

Map the number to the corresponding subcommand and proceed as if it were passed directly.

---

## Chained Workflows

### /gh init

Creates a new GitHub repo and makes an initial commit in one shot.

**Step 1:** Invoke `/gh-repo` with all arguments passed after `init` (e.g., `name`, `private=`, `description=`).

**Step 2:** Wait for gh-repo to complete and confirm the repo was created and cloned.

**Step 3:** `cd` into the cloned directory.

**Step 4:** Invoke `/gh-commit "chore: initial commit" push=true`.

**Step 5:** Report:

```
/gh init complete.

Repo:   https://github.com/{owner}/{name}
Local:  ./{name}/
Commit: chore: initial commit
```

---

### /gh ship [issue=N] [auto=true]

Commits all staged/tracked changes, pushes, and opens a PR in one shot.

**Step 1 (if issue=N provided):** Invoke `gh-issue {N}` to fetch issue context. Read `.gh-issue/context.json`. Use the issue title as the PR title later.

**Step 2:** Invoke `/gh-commit push=false --all`.

- `push=false` because the coordinator handles push separately to avoid double-push.
- If no commit message was passed with `ship`: generate one from the diff summary — use the most prominent change type as the type prefix (e.g., `feat:` if most changed files are new features).
- If commit message is provided (`/gh ship "feat: add about page"`): use it.

**Step 3:** Push:

```bash
git push origin {current-branch}
```

Or if no upstream:

```bash
git push --set-upstream origin {current-branch}
```

**Step 4:** Invoke `/gh-pr open [issue={N}] [auto={auto}]`.

- Pass `issue=N` if it was provided to `ship`.
- Pass `auto=true` if it was provided to `ship` (default `false`).

**Step 5:** Report:

```
/gh ship complete.

Commit: {hash} {message}
Branch: {branch} pushed to origin
PR:     #{number} — {title} — {pr-url}
Auto-merge: {enabled/disabled}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Unknown subcommand | Stop: "Unknown subcommand '{value}'. Valid: repo, commit, pr, init, ship. Run /gh for the menu." |
| Specialist skill not found | Stop: "Skill '{name}' not found at skills/{name}/SKILL.md. Ensure gh-management is installed correctly." |
| init — gh-repo fails | Stop chain. Report gh-repo error. Do not attempt to commit. |
| ship — gh-commit fails | Stop chain. Report gh-commit error. Do not attempt to push or open PR. |
| ship — push fails | Stop chain. Report push error. Do not open PR. |
| ship — gh-pr fails | Report partial success: "Committed and pushed, but PR creation failed." Provide manual PR command. |
```

- [ ] **Step 2: Verify frontmatter and routing table**

```bash
head -5 /mnt/c/Users/tez/projects/gh-management/skills/gh/SKILL.md
grep -n "^## \|^### " /mnt/c/Users/tez/projects/gh-management/skills/gh/SKILL.md
```

Expected: `name: gh`, sections include Routing, Interactive Menu, Chained Workflows (/gh init, /gh ship), Error Handling.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add skills/gh/SKILL.md
git commit -m "skill: add gh coordinator"
```

---

## Task 10: Write README.md

**Files:**
- Create: `gh-management/README.md`

- [ ] **Step 1: Write the file**

Write `/mnt/c/Users/tez/projects/gh-management/README.md`:

```markdown
# gh-management

A Claude Code skill suite for managing GitHub repositories, commits, and pull requests. Agentic-first — wraps the GitHub CLI with conventional commit validation, auto-merge polling, and shared conventions that travel with every project.

## Skills

| Skill | Purpose |
|-------|---------|
| `/gh` | Coordinator — routes to specialists, runs chained workflows |
| `/gh-repo` | Create + initialize GitHub repos |
| `/gh-commit` | Stage, commit (validated), revert, resolve conflicts |
| `/gh-pr` | Open, track, and merge PRs |

## Installation

### Via Claude Code plugin system

```bash
claude plugin add github.com/[user]/gh-management
```

### Manual install

Clone this repo and ensure the `skills/` directory is on your Claude Code skill path.

## Quick Start

```bash
# Create a new repo
/gh repo new my-project private=true

# Commit changes
/gh commit "feat: add homepage"

# Open a PR
/gh pr open

# Full ship in one command
/gh ship

# Ship with issue link + auto-merge
/gh ship issue=42 auto=true
```

## Conventions

The `references/` directory contains the shared conventions layer:

| File | Contents |
|------|---------|
| `conventions.md` | Branch naming, commit format, PR standards, merge policy |
| `commit-template.md` | Commit types, validation rules, examples |
| `pr-template.md` | PR body structure, label mapping, merge guidance |
| `repo-defaults.md` | Branch protection rules, labels, README boilerplate |

### Customizing for your project

Copy `references/` into your project and modify. Skills read `./references/` first and fall back to the suite defaults:

```bash
cp -r /path/to/gh-management/references ./references
```

Add project-specific commit types in `references/commit-template.md`. Override branch protection rules in `references/repo-defaults.md`.

## Requires

- [GitHub CLI](https://cli.github.com) — `gh auth login` before first use
- Git
- [Claude Code](https://claude.ai/code)

## License

MIT
```

- [ ] **Step 2: Verify sections present**

```bash
grep -n "^## " /mnt/c/Users/tez/projects/gh-management/README.md
```

Expected: Skills, Installation, Quick Start, Conventions, Requires, License.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git add README.md
git commit -m "docs: add README"
```

---

## Task 11: Create GitHub repo and push

**Files:** No new files — git operations only.

- [ ] **Step 1: Verify all files are committed**

```bash
cd /mnt/c/Users/tez/projects/gh-management && git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2: Verify git log**

```bash
git log --oneline
```

Expected — 8 commits in order:

```
[hash] docs: add README
[hash] skill: add gh coordinator
[hash] skill: add gh-pr specialist
[hash] skill: add gh-commit specialist
[hash] skill: add gh-repo specialist
[hash] docs: add repo-defaults reference
[hash] docs: add pr-template reference
[hash] docs: add commit-template reference
[hash] docs: add conventions reference doc
```

- [ ] **Step 3: Create GitHub repo**

```bash
gh repo create gh-management --public --description "GitHub management skill suite for Claude Code — repos, commits, PRs"
```

- [ ] **Step 4: Add remote and push**

```bash
cd /mnt/c/Users/tez/projects/gh-management
git remote add origin https://github.com/$(gh api user --jq '.login')/gh-management.git
git push -u origin main
```

- [ ] **Step 5: Verify**

```bash
gh repo view gh-management --web
```

Expected: browser opens to the new GitHub repo with all files visible.

- [ ] **Step 6: Report**

```
gh-management published.

Repo:    https://github.com/{username}/gh-management
Skills:  gh, gh-repo, gh-commit, gh-pr
Refs:    conventions.md, commit-template.md, pr-template.md, repo-defaults.md

Test with: /gh repo new skills-grimoire-test (or use on skills-grimoire directly)
```

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - gh coordinator: routing, interactive menu, /gh init, /gh ship — ✓ Task 9
  - gh-repo: create, branch protection, labels, clone — ✓ Task 6
  - gh-commit: normal commit, revert (no --hard), conflict resolve — ✓ Task 7
  - gh-pr: open, status, merge, auto-merge polling, gh-issue wrap — ✓ Task 8
  - references/: all 4 files with full content — ✓ Tasks 2–5
  - Standalone repo + GitHub push — ✓ Task 11
  - Squash merge default — ✓ Task 8, Mode 3
  - push=false when called from ship to prevent double-push — ✓ Task 9, /gh ship Step 2

- [x] **Placeholder scan:** All steps include exact commands, exact file contents, and exact expected outputs. No TBDs.

- [x] **Type/name consistency:**
  - `push=false` in /gh ship matches `push` parameter in gh-commit — ✓
  - `auto=true` in /gh ship matches `auto` parameter in gh-pr — ✓
  - `strategy=` in gh-pr merge matches parameter table — ✓
  - `pr-url=` in gh-pr matches parameter table — ✓
  - `references/commit-template.md` referenced consistently across gh-commit and conventions.md — ✓
