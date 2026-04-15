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
