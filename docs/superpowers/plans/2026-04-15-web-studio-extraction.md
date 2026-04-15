# Web Studio Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the web-studio skill suite from skills-grimoire into a standalone private GitHub repo (`dizthewize/web-studio-skills`), then update cross-project documentation in both repos.

**Architecture:** Create a new local git repo mirroring skills-grimoire's structure, move 7 skills + 10 doc files into it, write READMEs and per-skill `## Dependencies` sections for both repos, then create the private GitHub repo and push. skills-grimoire is cleaned up in a final commit.

**Tech Stack:** `gh` CLI, git, bash

---

## File Map

### New files (web-studio-skills)
- Create: `/mnt/c/Users/tez/projects/web-studio-skills/README.md`
- Create: `/mnt/c/Users/tez/projects/web-studio-skills/.gitignore`

### Moved from skills-grimoire → web-studio-skills
- `skills/web-studio/SKILL.md`
- `skills/site-discovery/SKILL.md`
- `skills/site-planner/SKILL.md`
- `skills/site-designer/SKILL.md`
- `skills/site-builder/SKILL.md`
- `skills/site-reviewer/SKILL.md`
- `skills/site-deploy/SKILL.md`
- `docs/superpowers/specs/2026-04-14-web-studio-image-generation-design.md`
- `docs/superpowers/specs/2026-04-14-web-studio-preflight-checks.md`
- `docs/superpowers/specs/2026-04-14-web-studio-update-mode.md`
- `docs/superpowers/specs/2026-04-14-mandatory-site-reviewer-design.md`
- `docs/superpowers/specs/2026-04-14-parallel-build-agents-design.md`
- `docs/superpowers/plans/2026-04-14-web-studio-image-generation.md`
- `docs/superpowers/plans/2026-04-14-web-studio-preflight-checks.md`
- `docs/superpowers/plans/2026-04-14-web-studio-update-mode.md`
- `docs/superpowers/plans/2026-04-14-mandatory-site-reviewer.md`
- `docs/superpowers/plans/2026-04-14-parallel-build-agents.md`

### Modified in web-studio-skills (add `## Dependencies`)
- `skills/web-studio/SKILL.md`
- `skills/site-discovery/SKILL.md`
- `skills/site-planner/SKILL.md`
- `skills/site-designer/SKILL.md`
- `skills/site-builder/SKILL.md`
- `skills/site-reviewer/SKILL.md`
- `skills/site-deploy/SKILL.md`

### Modified in skills-grimoire (add `## Dependencies` + write README)
- `skills/gh-issue/SKILL.md`
- `skills/fix-issue/SKILL.md`
- `skills/develop-team/SKILL.md`
- `skills/review-team/SKILL.md`
- `README.md` (new)

---

## Task 1: Initialize web-studio-skills local repo

**Files:**
- Create: `/mnt/c/Users/tez/projects/web-studio-skills/` (directory)

- [ ] **Step 1: Create directory and initialize git**

```bash
mkdir /mnt/c/Users/tez/projects/web-studio-skills
cd /mnt/c/Users/tez/projects/web-studio-skills
git init
```

Expected: `Initialized empty Git repository in .../web-studio-skills/.git/`

- [ ] **Step 2: Create the skills and docs directory structure**

```bash
mkdir -p /mnt/c/Users/tez/projects/web-studio-skills/skills
mkdir -p /mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/specs
mkdir -p /mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/plans
```

- [ ] **Step 3: Verify structure**

```bash
find /mnt/c/Users/tez/projects/web-studio-skills -type d
```

Expected output:
```
/mnt/c/Users/tez/projects/web-studio-skills
/mnt/c/Users/tez/projects/web-studio-skills/skills
/mnt/c/Users/tez/projects/web-studio-skills/docs
/mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers
/mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/specs
/mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/plans
```

---

## Task 2: Copy skill directories into web-studio-skills

**Files:**
- Copy from `skills-grimoire/skills/{web-studio,site-*}/` → `web-studio-skills/skills/`

- [ ] **Step 1: Copy all 7 skill directories**

```bash
SRC=/mnt/c/Users/tez/projects/skills-grimoire/skills
DST=/mnt/c/Users/tez/projects/web-studio-skills/skills

cp -r "$SRC/web-studio"     "$DST/"
cp -r "$SRC/site-discovery" "$DST/"
cp -r "$SRC/site-planner"   "$DST/"
cp -r "$SRC/site-designer"  "$DST/"
cp -r "$SRC/site-builder"   "$DST/"
cp -r "$SRC/site-reviewer"  "$DST/"
cp -r "$SRC/site-deploy"    "$DST/"
```

- [ ] **Step 2: Verify all 7 skills are present**

```bash
ls /mnt/c/Users/tez/projects/web-studio-skills/skills/
```

Expected: `site-builder  site-deploy  site-designer  site-discovery  site-planner  site-reviewer  web-studio`

---

## Task 3: Copy docs into web-studio-skills

**Files:**
- Copy 5 specs + 5 plans from `skills-grimoire/docs/superpowers/` → `web-studio-skills/docs/superpowers/`

- [ ] **Step 1: Copy specs**

```bash
SRC=/mnt/c/Users/tez/projects/skills-grimoire/docs/superpowers/specs
DST=/mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/specs

cp "$SRC/2026-04-14-web-studio-image-generation-design.md" "$DST/"
cp "$SRC/2026-04-14-web-studio-preflight-checks.md"        "$DST/"
cp "$SRC/2026-04-14-web-studio-update-mode.md"             "$DST/"
cp "$SRC/2026-04-14-mandatory-site-reviewer-design.md"     "$DST/"
cp "$SRC/2026-04-14-parallel-build-agents-design.md"       "$DST/"
```

- [ ] **Step 2: Copy plans**

```bash
SRC=/mnt/c/Users/tez/projects/skills-grimoire/docs/superpowers/plans
DST=/mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/plans

cp "$SRC/2026-04-14-web-studio-image-generation.md" "$DST/"
cp "$SRC/2026-04-14-web-studio-preflight-checks.md" "$DST/"
cp "$SRC/2026-04-14-web-studio-update-mode.md"      "$DST/"
cp "$SRC/2026-04-14-mandatory-site-reviewer.md"     "$DST/"
cp "$SRC/2026-04-14-parallel-build-agents.md"       "$DST/"
```

- [ ] **Step 3: Verify counts**

```bash
echo "Specs: $(ls /mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/specs | wc -l)"
echo "Plans: $(ls /mnt/c/Users/tez/projects/web-studio-skills/docs/superpowers/plans | wc -l)"
```

Expected: `Specs: 5` and `Plans: 5`

---

## Task 4: Write web-studio-skills README.md and .gitignore

**Files:**
- Create: `/mnt/c/Users/tez/projects/web-studio-skills/README.md`
- Create: `/mnt/c/Users/tez/projects/web-studio-skills/.gitignore`

- [ ] **Step 1: Write README.md**

Create `/mnt/c/Users/tez/projects/web-studio-skills/README.md` with this exact content:

```markdown
# web-studio-skills

Full website build pipeline as a Claude Code skill suite. Orchestrates discovery → planning → design → build → review → deploy in a single guided workflow for service businesses, SaaS, e-commerce, portfolios, and landing pages.

## Skills

| Skill | Description |
|-------|-------------|
| `/web-studio` | Coordinator — runs the full pipeline or resumes an interrupted session |
| `/site-discovery` | Intake Q&A → writes `docs/product-marketing-context.md` |
| `/site-planner` | Site structure and page planning → writes `docs/site-plan.md` |
| `/site-designer` | Design system and visual direction → writes `docs/design-system.md` |
| `/site-builder` | Full codebase build with parallel research agents → opens GitHub PR |
| `/site-reviewer` | Adversarial quality gate with Devil's Advocate round before deploy |
| `/site-deploy` | Deploy to Netlify (default) or Vercel |

## Install

```bash
npx skills add dizthewize/web-studio-skills -g
```

## External Tools Required

| Tool | Install | Used by |
|------|---------|---------|
| [GitHub CLI (`gh`)](https://cli.github.com/) | `brew install gh` or [cli.github.com](https://cli.github.com/) | `site-builder`, `site-reviewer`, `site-deploy` |
| Node.js v18+ | [nodejs.org](https://nodejs.org/) | `site-builder`, `site-reviewer` |
| [Vercel CLI](https://vercel.com/docs/cli) | `npm i -g vercel` | `site-deploy` (Vercel only) |

Authenticate before use:

```bash
gh auth login
vercel login   # only needed if deploying to Vercel
```

## Companion Suite

```bash
npx skills add dizthewize/skills-grimoire -g
```

Provides `/fix-issue`, `/develop-team`, `/review-team`, and `/gh-issue` — use these to manage the GitHub repos and PRs that web-studio creates. Recommended for a complete site build + ongoing maintenance workflow.
```

- [ ] **Step 2: Write .gitignore**

Create `/mnt/c/Users/tez/projects/web-studio-skills/.gitignore` with this content:

```
.web-studio/
.gh-issue/
.superpowers/
node_modules/
.env
.env.local
```

- [ ] **Step 3: Verify files exist**

```bash
ls /mnt/c/Users/tez/projects/web-studio-skills/
```

Expected: `README.md  .gitignore  docs  skills`

---

## Task 5: Add `## Dependencies` to web-studio-skills SKILL.md files

**Files:**
- Modify: `web-studio-skills/skills/web-studio/SKILL.md`
- Modify: `web-studio-skills/skills/site-discovery/SKILL.md`
- Modify: `web-studio-skills/skills/site-planner/SKILL.md`
- Modify: `web-studio-skills/skills/site-designer/SKILL.md`
- Modify: `web-studio-skills/skills/site-builder/SKILL.md`
- Modify: `web-studio-skills/skills/site-reviewer/SKILL.md`
- Modify: `web-studio-skills/skills/site-deploy/SKILL.md`

Insert the `## Dependencies` section immediately before the `## Parameters` heading in each file. Use the Edit tool with `old_string` = the first line of the Parameters section.

- [ ] **Step 1: web-studio/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/web-studio/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required)
- Node.js v18+ — [nodejs.org](https://nodejs.org/)
- Vercel CLI — `npm i -g vercel` (only if deploying to Vercel via `site-deploy`)

**Companion suite (optional but recommended):**
- Install `dizthewize/skills-grimoire` (`npx skills add dizthewize/skills-grimoire -g`) for `/fix-issue`, `/develop-team`, `/review-team`, `/gh-issue` — manage the repos and PRs this pipeline creates

```

- [ ] **Step 2: site-discovery/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/site-discovery/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:** None — this skill only writes a local markdown file.

```

- [ ] **Step 3: site-planner/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/site-planner/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:** None — this skill only writes a local markdown file.

```

- [ ] **Step 4: site-designer/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/site-designer/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:** None — this skill only writes a local markdown file.

```

- [ ] **Step 5: site-builder/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/site-builder/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required) — used to open the GitHub PR
- Node.js v18+ — [nodejs.org](https://nodejs.org/) — used to build and verify the site

```

- [ ] **Step 6: site-reviewer/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/site-reviewer/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required) — used to review and merge the PR

```

- [ ] **Step 7: site-deploy/SKILL.md — insert before `## Parameters`**

In `web-studio-skills/skills/site-deploy/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required) — monitors deployment status
- Vercel CLI — `npm i -g vercel` then `vercel login` (Vercel deployments only)
- Netlify: no CLI needed — deploys automatically via GitHub integration when PR is merged

```

- [ ] **Step 8: Spot-check one file to verify**

```bash
grep -n "## Dependencies" /mnt/c/Users/tez/projects/web-studio-skills/skills/web-studio/SKILL.md
grep -n "## Dependencies" /mnt/c/Users/tez/projects/web-studio-skills/skills/site-deploy/SKILL.md
```

Expected: each file shows one match with a line number.

---

## Task 6: Initial commit, create GitHub repo, push

- [ ] **Step 1: Stage all files**

```bash
cd /mnt/c/Users/tez/projects/web-studio-skills
git add skills/ docs/ README.md .gitignore
```

- [ ] **Step 2: Initial commit**

```bash
git commit -m "$(cat <<'EOF'
feat: initial web-studio skills suite

Extracted from dizthewize/skills-grimoire. Contains web-studio coordinator + 6 specialist skills (site-discovery, site-planner, site-designer, site-builder, site-reviewer, site-deploy), design history in docs/superpowers/, and cross-project dependency documentation.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Create private GitHub repo and push**

```bash
gh repo create dizthewize/web-studio-skills --private --source=. --remote=origin --push
```

Expected: repo URL printed, e.g. `https://github.com/dizthewize/web-studio-skills`

- [ ] **Step 4: Verify push**

```bash
gh repo view dizthewize/web-studio-skills --json name,visibility,url
```

Expected: `{"name":"web-studio-skills","visibility":"PRIVATE","url":"https://github.com/dizthewize/web-studio-skills"}`

---

## Task 7: Remove moved files from skills-grimoire

**Files:**
- Delete: `skills-grimoire/skills/web-studio/`
- Delete: `skills-grimoire/skills/site-discovery/`
- Delete: `skills-grimoire/skills/site-planner/`
- Delete: `skills-grimoire/skills/site-designer/`
- Delete: `skills-grimoire/skills/site-builder/`
- Delete: `skills-grimoire/skills/site-reviewer/`
- Delete: `skills-grimoire/skills/site-deploy/`
- Delete: the 5 web-studio specs from `docs/superpowers/specs/`
- Delete: the 5 web-studio plans from `docs/superpowers/plans/`

- [ ] **Step 1: Remove skill directories**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git rm -r skills/web-studio skills/site-discovery skills/site-planner \
           skills/site-designer skills/site-builder skills/site-reviewer \
           skills/site-deploy
```

- [ ] **Step 2: Remove web-studio docs**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git rm \
  docs/superpowers/specs/2026-04-14-web-studio-image-generation-design.md \
  docs/superpowers/specs/2026-04-14-web-studio-preflight-checks.md \
  docs/superpowers/specs/2026-04-14-web-studio-update-mode.md \
  docs/superpowers/specs/2026-04-14-mandatory-site-reviewer-design.md \
  docs/superpowers/specs/2026-04-14-parallel-build-agents-design.md \
  docs/superpowers/plans/2026-04-14-web-studio-image-generation.md \
  docs/superpowers/plans/2026-04-14-web-studio-preflight-checks.md \
  docs/superpowers/plans/2026-04-14-web-studio-update-mode.md \
  docs/superpowers/plans/2026-04-14-mandatory-site-reviewer.md \
  docs/superpowers/plans/2026-04-14-parallel-build-agents.md
```

- [ ] **Step 3: Verify only gh-management skills remain**

```bash
ls /mnt/c/Users/tez/projects/skills-grimoire/skills/
```

Expected: `develop-team  fix-issue  gh-issue  review-team`

- [ ] **Step 4: Commit the removal**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git commit -m "$(cat <<'EOF'
chore: extract web-studio suite to dizthewize/web-studio-skills

Moved 7 skills and 10 design docs to the standalone web-studio-skills repo.
skills-grimoire now contains only the gh-management suite.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Write skills-grimoire README.md

**Files:**
- Create: `/mnt/c/Users/tez/projects/skills-grimoire/README.md`

- [ ] **Step 1: Write README.md**

Create `/mnt/c/Users/tez/projects/skills-grimoire/README.md` with this exact content:

```markdown
# skills-grimoire

GitHub issue and development lifecycle skills for Claude Code. Covers the full loop from fetching issue context through fixing, reviewing, and handing off to QA.

## Skills

| Skill | Description |
|-------|-------------|
| `/gh-issue` | Fetch rich context for a GitHub issue or milestone; writes `.gh-issue/context.json` for downstream skills |
| `/fix-issue` | Full bug fix lifecycle: read → research → implement → review → commit → QA handoff |
| `/develop-team` | Feature development with parallel specialist agents |
| `/review-team` | PR review with a configurable team of specialist agents |

## Install

```bash
npx skills add dizthewize/skills-grimoire -g
```

## External Tools Required

| Tool | Install | Used by |
|------|---------|---------|
| [GitHub CLI (`gh`)](https://cli.github.com/) | `brew install gh` or [cli.github.com](https://cli.github.com/) | all skills |
| git | pre-installed on most systems | `fix-issue`, `develop-team`, `review-team` |

Authenticate before use:

```bash
gh auth login
```

## Companion Suite

```bash
npx skills add dizthewize/web-studio-skills -g
```

Provides the full site build pipeline (`/web-studio`, `/site-builder`, and specialist skills). Install alongside if you're building or maintaining websites — use `skills-grimoire` to manage the repos, issues, and PRs that web-studio creates.
```

- [ ] **Step 2: Verify file was created**

```bash
ls /mnt/c/Users/tez/projects/skills-grimoire/README.md
```

---

## Task 9: Add `## Dependencies` to skills-grimoire SKILL.md files

**Files:**
- Modify: `skills-grimoire/skills/gh-issue/SKILL.md`
- Modify: `skills-grimoire/skills/fix-issue/SKILL.md`
- Modify: `skills-grimoire/skills/develop-team/SKILL.md`
- Modify: `skills-grimoire/skills/review-team/SKILL.md`

Insert `## Dependencies` immediately before the `## Parameters` heading in each file.

- [ ] **Step 1: gh-issue/SKILL.md — insert before `## Parameters`**

In `skills-grimoire/skills/gh-issue/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required)

```

- [ ] **Step 2: fix-issue/SKILL.md — insert before `## Parameters`**

In `skills-grimoire/skills/fix-issue/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required)
- git — pre-installed on most systems

**Companion suite (optional but recommended):**
- Install `dizthewize/web-studio-skills` (`npx skills add dizthewize/web-studio-skills -g`) if fixing bugs in a site built with web-studio — provides `/web-studio`, `/site-builder`, and related skills

```

- [ ] **Step 3: develop-team/SKILL.md — insert before `## Parameters`**

In `skills-grimoire/skills/develop-team/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required)
- git — pre-installed on most systems

**Companion suite (optional but recommended):**
- Install `dizthewize/web-studio-skills` (`npx skills add dizthewize/web-studio-skills -g`) if developing features for a site built with web-studio — provides `/site-builder`, `/site-designer`, and related skills

```

- [ ] **Step 4: review-team/SKILL.md — insert before `## Parameters`**

In `skills-grimoire/skills/review-team/SKILL.md`, find `## Parameters` and insert above it:

```markdown
## Dependencies

**External tools:**
- `gh` CLI — [cli.github.com](https://cli.github.com/) (`gh auth login` required)
- git — pre-installed on most systems

```

- [ ] **Step 5: Spot-check**

```bash
grep -n "## Dependencies" \
  /mnt/c/Users/tez/projects/skills-grimoire/skills/gh-issue/SKILL.md \
  /mnt/c/Users/tez/projects/skills-grimoire/skills/fix-issue/SKILL.md \
  /mnt/c/Users/tez/projects/skills-grimoire/skills/develop-team/SKILL.md \
  /mnt/c/Users/tez/projects/skills-grimoire/skills/review-team/SKILL.md
```

Expected: one match per file.

---

## Task 10: Commit and push skills-grimoire changes

- [ ] **Step 1: Stage README and updated SKILL.md files**

```bash
cd /mnt/c/Users/tez/projects/skills-grimoire
git add README.md \
  skills/gh-issue/SKILL.md \
  skills/fix-issue/SKILL.md \
  skills/develop-team/SKILL.md \
  skills/review-team/SKILL.md
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
docs: add README and Dependencies sections to all skills

Adds install guide with external tool requirements and companion suite
reference (dizthewize/web-studio-skills). Adds ## Dependencies to all
four gh-management SKILL.md files for per-skill machine-readable deps.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Push**

```bash
git push
```

Expected: `Branch 'main' set up to track remote branch 'main' from 'origin'.` or similar success message.

- [ ] **Step 4: Verify final state**

```bash
echo "=== skills-grimoire skills ===" && ls /mnt/c/Users/tez/projects/skills-grimoire/skills/
echo "=== web-studio-skills skills ===" && ls /mnt/c/Users/tez/projects/web-studio-skills/skills/
echo "=== GitHub repos ===" && gh repo list dizthewize --json name,visibility --jq '.[] | "\(.name) (\(.visibility))"'
```

Expected:
```
=== skills-grimoire skills ===
develop-team  fix-issue  gh-issue  review-team
=== web-studio-skills skills ===
site-builder  site-deploy  site-designer  site-discovery  site-planner  site-reviewer  web-studio
=== GitHub repos ===
skills-grimoire (PUBLIC)
web-studio-skills (PRIVATE)
```
