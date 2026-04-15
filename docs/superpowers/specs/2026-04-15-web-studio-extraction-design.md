# Design Spec: Extract web-studio Suite into Standalone Repo
**Date:** 2026-04-15
**Status:** Approved

---

## Overview

Extract the web-studio skill suite from `skills-grimoire` into its own standalone repository (`dizthewize/web-studio-skills`, private). Update cross-project documentation in both repos to explicitly reference required tools and companion skills — both in `README.md` (human install guide) and per-skill `SKILL.md` files (machine-readable deps).

The two suites remain independent: web-studio calls `gh` CLI directly and does not invoke gh-management skills at runtime. Cross-references are documentation-only.

---

## Scope

**Moves out of skills-grimoire → web-studio-skills:**
- `skills/web-studio/`
- `skills/site-discovery/`
- `skills/site-planner/`
- `skills/site-designer/`
- `skills/site-builder/`
- `skills/site-reviewer/`
- `skills/site-deploy/`
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

**Stays in skills-grimoire:**
- `skills/gh-issue/`
- `skills/fix-issue/`
- `skills/develop-team/`
- `skills/review-team/`
- `docs/superpowers/specs/2026-04-15-gh-management-design.md`
- `docs/superpowers/specs/2026-04-14-nanobanana-gemini-cli-integration-design.md`
- `docs/superpowers/specs/2026-04-14-auto-branch-for-pr-design.md`
- `docs/superpowers/plans/2026-04-15-gh-management.md`
- `docs/superpowers/plans/2026-04-14-nanobanana-gemini-cli-integration.md`
- `docs/superpowers/plans/2026-04-14-auto-branch-for-pr.md`

---

## New Repo Structure

### `web-studio-skills/` (new, private GitHub repo)

```
web-studio-skills/
  skills/
    web-studio/SKILL.md         ← coordinator
    site-discovery/SKILL.md
    site-planner/SKILL.md
    site-designer/SKILL.md
    site-builder/SKILL.md
    site-reviewer/SKILL.md
    site-deploy/SKILL.md
  docs/
    superpowers/
      specs/                    ← 5 web-studio specs
      plans/                    ← 5 web-studio plans
  README.md
  .gitignore
```

### `skills-grimoire/` (after extraction)

```
skills-grimoire/
  skills/
    gh-issue/SKILL.md
    fix-issue/SKILL.md
    develop-team/SKILL.md
    review-team/SKILL.md
  docs/
    superpowers/
      specs/                    ← gh-management specs only
      plans/                    ← gh-management plans only
  README.md
```

---

## Migration Steps

1. **Create local directory** — `mkdir /mnt/c/Users/tez/projects/web-studio-skills && git init`
2. **Move skills** — copy the 7 skill directories into `web-studio-skills/skills/`
3. **Move docs** — copy the 10 web-studio spec/plan files into `web-studio-skills/docs/superpowers/`
4. **Write cross-reference docs** — README.md for both repos, `## Dependencies` section in each SKILL.md
5. **Create private GitHub repo** — `gh repo create dizthewize/web-studio-skills --private --source=. --push`
6. **Clean skills-grimoire** — delete the moved files, commit with `chore: extract web-studio suite to dizthewize/web-studio-skills`
7. **Update skills-grimoire README** — add companion reference to web-studio-skills
8. **Push skills-grimoire** — `git push`

---

## Cross-Project Documentation

### README.md format (both repos)

Each README includes:
- Suite overview
- Install command: `npx skills add dizthewize/<repo> -g`
- **External tools required** — explicit list with install links
- **Companion suite** — the other repo, with install command and one-line description of what it adds

### web-studio-skills README

| Section | Content |
|---------|---------|
| Install | `npx skills add dizthewize/web-studio-skills -g` |
| External tools | `gh` CLI, Node.js, Vercel CLI (site-deploy) |
| Companion | `npx skills add dizthewize/skills-grimoire -g` — "provides `/fix-issue`, `/develop-team`, `/review-team`, `/gh-issue` for managing the repos web-studio creates" |

### skills-grimoire README

| Section | Content |
|---------|---------|
| Install | `npx skills add dizthewize/skills-grimoire -g` |
| External tools | `gh` CLI, git |
| Companion | `npx skills add dizthewize/web-studio-skills -g` — "provides the full site build pipeline; install alongside if building sites" |

### SKILL.md `## Dependencies` section

Added near the top of each SKILL.md:

| Skill | External tools | Companion skills note |
|-------|---------------|----------------------|
| `web-studio` | `gh` CLI, Node.js | install `skills-grimoire` for git/PR workflow |
| `site-builder` | `gh` CLI, Node.js | — |
| `site-deploy` | `gh` CLI, Vercel CLI | — |
| `site-reviewer` | Node.js | — |
| `site-discovery` | — | — |
| `site-planner` | — | — |
| `site-designer` | — | — |
| `fix-issue` | `gh` CLI, git | install `web-studio-skills` if fixing site projects |
| `develop-team` | `gh` CLI, git | install `web-studio-skills` if developing site projects |
| `gh-issue` | `gh` CLI | — |
| `review-team` | `gh` CLI, git | — |

---

## Integration Boundary

The two suites are **documentation companions only**. web-studio-skills calls the `gh` CLI directly for all git/GitHub operations — it does not invoke gh-management skills at runtime. Cross-references in README.md and SKILL.md tell users what to install; no runtime coupling exists.

---

## Out of Scope

- Renaming skills-grimoire (stays as-is)
- Adding `references/` directories to either repo
- Restructuring existing SKILL.md content beyond adding `## Dependencies`
