# skills-grimoire

GitHub issue and development lifecycle skills for Claude Code. Covers the full loop from fetching issue context through fixing, reviewing, and handing off to QA — plus the product/research lenses that decide *what* to build before any of that starts.

## Skills

| Skill | Description |
|-------|-------------|
| `/gh-issue` | Fetch rich context for a GitHub issue or milestone; writes `.gh-issue/context.json` for downstream skills |
| `/fix-issue` | Full bug fix lifecycle: read → research → implement → review → commit → QA handoff |
| `/develop-team` | Feature development with parallel specialist agents |
| `/review-team` | PR review with a configurable team of specialist agents |
| `/build-with-agent-team` | Build a project from a plan doc using Agent Teams — lead defines contracts upfront, spawns specialist agents in parallel tmux panes, coordinates integration |
| `/review-fix` | Review-fix loop — 8 reviewers in parallel; auto-fixes quick items and accumulates strategic ones for you |
| `/playwright-qa-cli` | Headless-browser QA via `playwright-cli` (not MCP) — provisions a test user, logs in, navigates, screenshots |

## Product & Research Lenses

Four analyst lenses plus an orchestrator. Each writes a timestamped brief to `<lens>-briefs/`, so a decision keeps its dated record.

| Skill | Description |
|-------|-------------|
| `/commander` | Multi-lens orchestrator — runs Scout, Analyst, Architect and Strategist together, then synthesizes a verdict |
| `/scout` | Market lens — competitor research, feature tracking, market trends |
| `/analyst` | Technical lens — evaluate a library/framework, compare stacks, build-vs-buy |
| `/architect` | Product lens — PRDs, roadmaps, user stories, acceptance criteria, scope trade-offs |
| `/strategist` | Growth lens — marketing strategy, campaigns, email sequences, pricing/packaging |

**`/architect` has two output modes**, and the difference matters if you use the [web-studio-skills](https://github.com/dizthewize/web-studio-skills) feature pipeline:

- **Brief mode** (default) — one feature or initiative → a timestamped, immutable `architect-briefs/architect-brief_<ts>_<slug>.md`.
- **PRD mode** — the product itself → the **living** `docs/PRD.md`, updated in place. This is the artifact `feature-discovery`, `feature-studio` and `increment-studio` ground on and that `/prd-sync` refuses to run without — and architect is the skill they name as its author. Its §13 Capabilities and §14 Decision Record are the sections `/prd-sync` folds shipped features back into.

## Utility Skills

Standalone helpers outside the GitHub/dev-lifecycle loop.

| Skill | Description |
|-------|-------------|
| `/docs-to-pdf` | Convert Markdown docs (briefs, PRDs, tech specs) to styled A4 PDFs and, optionally, email them as attachments via Resend |

Requires Node with global `marked` + `playwright` (Chromium); the email step needs `RESEND_API_KEY`.

## Install

```bash
npx skills add dizthewize/skills-grimoire -g
```

## External Tools Required

| Tool | Install | Used by |
|------|---------|---------|
| [GitHub CLI (`gh`)](https://cli.github.com/) | `brew install gh` or [cli.github.com](https://cli.github.com/) | all skills |
| git | pre-installed on most systems | `fix-issue`, `develop-team`, `review-team` |
| [tmux](https://github.com/tmux/tmux) | `brew install tmux` / `apt install tmux` (WSL on Windows) | `build-with-agent-team` |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` env var | Add to `~/.claude/settings.json` — see [setup guide](skills/build-with-agent-team/README.md) | `build-with-agent-team` |

Authenticate before use:

```bash
gh auth login
```

## Companion Suite

```bash
npx skills add dizthewize/web-studio-skills -g
```

Provides the full site build pipeline (`/web-studio`, `/site-builder`, and specialist skills). Install alongside if you're building or maintaining websites — use `skills-grimoire` to manage the repos, issues, and PRs that web-studio creates.
