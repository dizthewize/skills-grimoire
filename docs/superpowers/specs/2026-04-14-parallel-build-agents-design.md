# Parallel Page Build Agents Design

**Date:** 2026-04-14
**Status:** Approved
**Scope:** `skills/site-builder/SKILL.md` only

---

## Problem

The current site-builder runs Phase B3 (Homepage) and Phase B4 (Inner Pages) sequentially in the main session. For sites with 5+ pages this means the build agent handles all pages one after another — slow, and leaves parallelism on the table. Pages are independent of each other once shared components (B2) are built, making them an ideal candidate for parallel execution.

---

## Requirement

After B2 completes, the coordinator assesses the site scope, determines how many build agents to spawn (2 or 3), assigns pages to agents by role, spawns them in parallel, waits for completion, then commits all pages in a single well-detailed commit. B5 (SEO) proceeds after the commit as before.

---

## Changes

### 1. Phase restructuring

Current B3 (Homepage) and B4 (Inner Pages) are replaced by a single **Phase B3: Pages** that dispatches parallel agents.

- `b4` is removed from the valid `start-at` values
- Valid `start-at` values become: `research`, `b1`, `images`, `b2`, `b3`, `b5`, `b6`, `b7`
- The architecture diagram updates to remove the separate B4 entry
- `lastCompletedPhase` in state.json no longer includes `b4` as a possible value

### 2. Scope assessment

At the start of Phase B3, before spawning agents, the coordinator:

1. Reads `docs/site-plan.md` and counts the total number of pages in the page hierarchy (homepage + all inner pages)
2. Prints a one-line summary:
   ```
   Pages: [N] (homepage + [N-1] inner) → [2 or 3] build agents
   ```
3. Determines agent count by threshold:
   - **1–4 total pages → 2 agents**
   - **5+ total pages → 3 agents**

### 3. Page assignment by role (Option A)

**2-agent split:**
| Agent | Pages |
|-------|-------|
| Agent 1 | Homepage |
| Agent 2 | All inner pages |

**3-agent split:**
| Agent | Pages |
|-------|-------|
| Agent 1 | Homepage |
| Agent 2 | Service pages (all pages under a `/services/` hierarchy in site-plan.md) |
| Agent 3 | Utility pages (About, Contact, Service Areas, any extras from site-plan.md) |

**Edge case — no service subpages but 5+ total pages:** If services is a single page (not a subpage hierarchy), Agent 2 gets the first half of inner pages and Agent 3 gets the second half (split evenly by count).

### 4. Agent context and execution

Each agent is spawned with `run_in_background: true`. The coordinator provides all context inline — agents do not read files themselves.

**Every agent receives:**
- Full text of `.web-studio/build-plan.md` (Copy Integrator output, Component Analyst map, CTA placement, SEO data)
- Their specific page assignment (explicit list of pages to build)
- List of shared components built in B2 (exact component names and file paths for correct imports)
- Framework in use (Astro or Next.js, from state.json)
- Explicit rule: **write files only — no git commits**

**Every agent must follow the same rules as the current B3/B4:**
- All copy comes from Copy Integrator output in build-plan.md — no placeholder text, no lorem ipsum, no invented copy
- Every page uses the `Layout` component
- Every phone number is `<a href="tel:...">`— never plain text
- All internal links are correct (services pages link to homepage, inner pages link to relevant service pages)

**When an agent finishes**, it reports a completion summary listing every file it wrote.

### 5. Single detailed commit

The coordinator collects all agent completion summaries, verifies all expected page files exist, then issues one commit:

```
feat: build all pages ([N] pages via [N] parallel agents)

Agent 1 (Homepage):
  - src/pages/index.astro

Agent 2 (Service pages):
  - src/pages/services/index.astro
  - src/pages/services/[service-slug].astro
  - ...

Agent 3 (Utility pages):
  - src/pages/about.astro
  - src/pages/contact.astro
  - src/pages/service-areas.astro
  - ...
```

The commit title includes the total page count and agent count. The body lists every file under each agent's heading.

### 6. Error handling

| Scenario | Action |
|----------|--------|
| An agent fails or times out | Retry once with the same assignment. If it fails again, coordinator builds those pages itself (sequential fallback, same rules). Commit message notes which pages were built by fallback. |
| An agent writes incomplete output (missing pages) | Coordinator identifies missing files by diffing expected page list against files actually written. Coordinator builds missing pages itself before committing. |

### 7. State file updates

Two changes to `.web-studio/state.json`:

1. `lastCompletedPhase` no longer includes `b4` as a valid value — `b3` now represents all pages built
2. New fields written after B3 completes:

```json
{
  "parallelBuildAgents": 3,
  "pagesBuilt": 7,
  "lastCompletedPhase": "b3"
}
```

`pagesBuilt` is populated after B3 (previously populated only at handoff). `parallelBuildAgents` is new.

---

## What Does Not Change

- Phase B2 (Shared Components) — unchanged; must complete before B3 agents spawn
- Phase B5 (SEO Layer) — unchanged; runs after B3 commit as before
- Phase B6 (Auth + Supabase) — unchanged
- Phase B7 (Deploy Prep) — unchanged
- PR creation and Phase 8 handoff — unchanged
- All page content rules (copy, phone numbers, Layout, internal links) — unchanged
- `start-at=b3` still works as the resume point for the pages phase
- `managed=true` behavior — unchanged (no new interactive prompts added)
