# Design Spec: Web Studio Update Mode + Deploy Question Cleanup
**Date:** 2026-04-14
**Project:** `/mnt/c/Users/tez/projects/skills-grimoire`

---

## Problem

Two issues with the current web-studio skill:

1. **No update mode.** Once a site is built, there is no structured way to make changes (content edits, page removals, design tweaks) without re-running the full pipeline from scratch.

2. **Redundant deploy question.** web-studio Phase 0.5 offers a "Decide later" option that causes a second deploy question at Phase 6. This is confusing — site-discovery already asked about the deployment platform, and users don't expect to be asked about deployment a second time.

---

## Solution

### Fix 1: Update Mode

Add "Update" as a 4th choice in web-studio Phase 0 (the session detection menu). Also expose it as an `update="..."` parameter shortcut that bypasses Phase 0 entirely.

The update pipeline:
1. Collects a free-text change request (can list multiple changes)
2. Classifies each change into one of four buckets: Content/Copy, Page Structure, Design, Feature
3. Updates the relevant source docs via site-planner or site-designer in targeted update mode
4. Re-runs site-builder from the earliest build phase affected by the changes
5. After build, always asks the user whether to re-deploy

### Fix 2: Deploy Question Cleanup

Remove "Decide later" from Phase 0.5. The runtime question becomes a clean Yes/No. Phase 6's null-branch (`deploy_enabled === null`) is removed. State's `deploy_enabled` only ever holds `true` or `false` after Phase 0.5 completes.

---

## Architecture

```
/web-studio (fresh session)
  Phase 0:     State check → offer Resume / Update / Jump / Fresh start
  Phase 0.5:   Deploy preference → Yes / No  [Decide later removed]
  Phases 1–3:  site-discovery → site-planner → site-designer
  Checkpoint:  User approval before build
  Phase 4:     site-builder
  Phase 5:     site-reviewer
  Phase 6:     site-deploy (if deploy=yes) or skip (if deploy=no)  [no null branch]

/web-studio update="..."  OR  Phase 0 → pick "Update"
  Update Pipeline:
    Step 1: Collect / receive update request
    Step 2: Classify changes (Content | Page | Design | Feature)
    Step 3: Update source docs (site-planner and/or site-designer in update mode)
    Step 4: site-builder start-at={earliest affected phase}
    Step 5: Ask user about re-deployment (always)
    Step 6: site-deploy (if user says yes)
```

---

## Files Changed

| File | Change |
|------|--------|
| `skills/web-studio/SKILL.md` | Phase 0 (4th option + `update` param), Phase 0.5 (remove "Decide later"), Phase 6 (remove null branch), new Update Pipeline section |
| `skills/site-planner/SKILL.md` | New `update-request` parameter + Update Mode section |
| `skills/site-designer/SKILL.md` | New `update-request` parameter + Update Mode section |

`skills/site-builder/SKILL.md` requires no changes — `start-at` already supports arbitrary phase entry.

---

## web-studio — Phase 0 Changes

### Updated session menu

```
Found an existing web-studio session for [business name].
Last completed: [phase name]

How would you like to proceed?
1. Resume — continue from [next incomplete phase]
2. Update — make changes to the existing site
3. Jump to a specific phase — I'll ask which one
4. Fresh start — delete the session and start over
```

When "Update" is chosen, ask:
```
What would you like to change? (You can list multiple changes)
```

### `update` parameter shortcut

```
/web-studio update="add more copy to the about page, remove the blog page"
```

When `update` is passed as a parameter, skip Phase 0 entirely and enter the Update Pipeline directly with the provided request. The session must have an existing `state.json` — if not, stop with:
```
No existing web-studio session found. Run /web-studio first to build the site before updating it.
```

### State schema addition

```json
{
  "lastUpdate": {
    "request": "add more copy to the about page, remove the blog page",
    "ranAt": "2026-04-14T12:00:00Z",
    "phasesRerun": ["b4", "b5"]
  }
}
```

---

## web-studio — Phase 0.5 Changes

### Before (current)

```
Should I deploy the site when the build is complete?

1. Yes — run site-deploy automatically after review
2. No — stop after review, I'll deploy manually
3. Decide later — ask me again after the build is done
```

### After

```
Should I deploy the site when the build is complete?

1. Yes — run site-deploy automatically after review
2. No — stop after review, I'll deploy manually
```

`deploy_enabled` in state.json is set to `true` or `false` immediately. It is never `null` after this phase completes.

---

## web-studio — Phase 6 Changes

Remove the `deploy_enabled === null` branch entirely. Phase 6 is now:

- If `deploy=no`: Update state `{ "phases": { "deploy": "skipped" } }` and note: "Deployment skipped. Run `/web-studio start-at=deploy` to deploy manually."
- If `deploy=yes`: Announce `Phase 6: site-deploy`, invoke `/site-deploy`, capture live URL, update state.

No question is asked in Phase 6 during a normal build.

---

## web-studio — Update Pipeline

This section runs instead of Phases 1–6 when the user picks "Update" or passes `update="..."`.

### Step 1: Collect update request

If coming from the Phase 0 menu: free-text prompt already asked. If coming from the `update` parameter: use the parameter value directly.

### Step 2: Classify changes

Read the update request and categorise each change. Multiple changes can span multiple categories:

| Category | Signals | Affected doc | Earliest build phase |
|----------|---------|-------------|----------------------|
| Content/Copy | "more copy", "update headline", "add testimonials", "rewrite services description" | site-plan.md | B3 (homepage) or B4 (inner page) |
| Page Structure | "remove blog", "add FAQ page", "rename services to solutions", "add a pricing page" | site-plan.md | B4 + B5 (sitemap must update) |
| Design | "primary color", "font", "spacing", "dark mode", "make it bolder" | design-system.md | B2 (shared components rebuild) |
| Feature | "add contact form", "add auth", "Google Maps", "newsletter signup" | none (direct build) | B3–B6 depending on feature |

**Earliest phase rule:** when multiple changes span multiple categories, `start-at` is set to the earliest phase across all of them.

Example: "remove the blog page and make the primary color darker"
→ Page Structure (B4) + Design (B2) → start-at=B2

### Step 3: Update source docs

For each affected doc, invoke the relevant specialist skill in update mode:

- **site-plan.md changes** → invoke `/site-planner update-request="[content/page changes from request]"`
  - site-planner reads existing site-plan.md and applies only the requested changes
  - Writes updated site-plan.md

- **design-system.md changes** → invoke `/site-designer update-request="[design changes from request]"`
  - site-designer reads existing design-system.md and applies only the requested changes
  - Writes updated design-system.md

- **Feature-only changes** → skip doc update, proceed to Step 4

### Step 4: Rebuild

Invoke `/site-builder start-at=[earliest phase]`.

site-builder reads the updated docs and rebuilds from the specified phase. All subsequent phases run as normal through B7. A PR is opened at the end of B7.

### Step 5: Re-deployment prompt

After the site-builder PR is opened, always ask:

```
Update complete. Deploy these changes to [platform from product-marketing-context.md]?

1. Yes — deploy now
2. No — I'll deploy manually
```

**STOP — wait for the user's response.**

### Step 6: Deploy (if yes)

Invoke `/site-deploy`. Capture live URL. Update state.

### Step 7: Update state

```json
{
  "lastUpdate": {
    "request": "[original update request]",
    "ranAt": "[ISO timestamp]",
    "phasesRerun": ["b2", "b3", "b4", "b5", "b6", "b7"]
  }
}
```

---

## site-planner — Update Mode

### New parameter

| Parameter | Default | Description |
|-----------|---------|-------------|
| `update-request` | `""` | When set, run in update mode: apply the requested content/page changes to the existing site-plan.md instead of generating a fresh plan |

### Update Mode behaviour

When `update-request` is set:

1. **Read existing docs** — load `docs/product-marketing-context.md` and `docs/site-plan.md` (fail if either is missing)
2. **Parse the request** — identify which parts of site-plan.md are affected: pages list, copy blocks per page, SEO keyword map, lead offer, internal linking
3. **Apply changes**:
   - Page removal: remove the page entry, its copy block, its internal links, and its URL from the SEO map
   - Page addition: add a new page entry with a copy stub, derive URL from page name (lowercase, hyphenated), add to nav if top-level
   - Copy changes: locate the relevant page's copy block and update the specified section (headline, subheadline, body, CTA) with new or expanded content
4. **Write updated `docs/site-plan.md`** — preserve all unchanged sections exactly
5. **Report** — list every change applied and flag anything ambiguous that the user should review

Do not re-invoke `site-architecture`, `seo-audit`, or `copywriting` skills in update mode — only patch the existing document.

---

## site-designer — Update Mode

### New parameter

| Parameter | Default | Description |
|-----------|---------|-------------|
| `update-request` | `""` | When set, run in update mode: apply the requested design changes to the existing design-system.md instead of generating a fresh design |

### Update Mode behaviour

When `update-request` is set:

1. **Read existing docs** — load `docs/product-marketing-context.md` and `docs/design-system.md` (fail if either is missing)
2. **Parse the request** — identify which parts of design-system.md are affected: CSS variables (colors, typography), component specs, aesthetic brief, Image Brief
3. **Apply changes**:
   - Color change: locate the relevant CSS variable(s) and update the value; update any derived variables (e.g. hover states) proportionally
   - Font change: update the font stack and the Google Fonts / CDN reference
   - Layout/spacing: update the relevant spacing scale or component spec
   - Style direction: update the Aesthetic Brief section
4. **Write updated `docs/design-system.md`** — preserve all unchanged sections exactly
5. **Report** — list every change applied and flag anything ambiguous

Do not re-invoke `ui-ux-pro-max` or `frontend-design` skills in update mode — only patch the existing document.

---

## Error Handling

| Scenario | Action |
|----------|--------|
| `update` parameter used but no `state.json` exists | Stop. Report: "No existing session found. Run /web-studio first." |
| `update-request` passed to site-planner but `site-plan.md` missing | Stop. Report: "site-plan.md not found. Run /site-planner first to generate it." |
| `update-request` passed to site-designer but `design-system.md` missing | Stop. Report: "design-system.md not found. Run /site-designer first to generate it." |
| Update request is ambiguous (e.g. "make it better") | Ask one clarifying question before classifying |
| Change classification is unclear (feature vs content) | Default to the later phase (conservative — less rebuild) and note the assumption |
| site-builder fails during update rebuild | Report which phase failed; user can resume with `start-at=[failed phase]` |

---

## Tips

- List all changes in one update request — they're batched into a single rebuild from the earliest affected phase
- Design changes always trigger a B2 rebuild (shared components use CSS variables) — expect a full component regeneration
- Page removals also trigger B5 (sitemap.xml and schema markup update)
- The update does not re-run site-reviewer automatically — the PR is opened and the user can run `/site-reviewer` separately if desired
