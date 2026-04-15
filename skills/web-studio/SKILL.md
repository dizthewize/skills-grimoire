---
name: web-studio
description: "Use to build a new website or web app from scratch. Orchestrates the full pipeline: discovery → planning → design → build → review → deploy. Invoke standalone with no arguments to start the guided intake, or pass parameters to pre-configure phases."
---

# Web Studio

Orchestrate the full website build pipeline end-to-end. Runs six specialist skills in sequence — discovery → planner → designer → builder → reviewer → deploy — with state persistence so any interrupted session can be resumed exactly where it left off.

## When to Use

- Starting any new website or web app project from scratch
- Resuming an interrupted web-studio session
- Updating an existing site — modifying content, pages, or design from a completed session
- Running the full pipeline with a single command
- Pre-configuring phases by passing parameters (e.g. skipping review, jumping straight to builder)

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `deploy` | `ask` | `yes` / `no` / `ask` — whether to run site-deploy after build |
| `start-at` | `discovery` | Skip to a phase: `discovery`, `planner`, `designer`, `builder`, `reviewer`, `deploy` |
| `skip-review` | `false` | Skip site-reviewer (not recommended — removes adversarial quality gate) |
| `site-type` | `ask` | Pass-through to site-discovery: `service`, `saas`, `ecommerce`, `blog`, `portfolio`, `landing` |
| `industry` | `ask` | Pass-through to site-discovery: `flooring`, `roofing`, `landscaping`, etc. |
| `update` | `""` | Free-text description of changes to apply to an existing site. Bypasses Phase 0 and enters the Update Pipeline directly. Requires an existing `.web-studio/state.json`. |

## Invocation

```
/web-studio
/web-studio deploy=yes
/web-studio start-at=builder
/web-studio site-type=service industry=flooring deploy=yes
/web-studio start-at=reviewer skip-review=false
/web-studio deploy=no skip-review=true
/web-studio update="add more copy to the about page, remove the blog page"
/web-studio update="change primary color to navy, make typography bolder"
```

## Architecture

```
/web-studio
│
├── Phase 0: State Check
│   Check .web-studio/state.json → offer resume / update / jump / fresh start
│
├── Phase 0.5: Deploy Preference
│   If deploy=ask → ask user now (yes / no)
│
├── Phase 1: site-discovery
│   Invoke /site-discovery [site-type=X] [industry=Y]
│   → docs/product-marketing-context.md
│
├── Phase 2: site-planner
│   Invoke /site-planner
│   → docs/site-plan.md
│
├── Phase 3: site-designer
│   Invoke /site-designer
│   → docs/design-system.md
│
├── ─────────────── USER CHECKPOINT ───────────────
│   Present: business name, pages list, lead offer,
│   color palette preview, component list, stack
│   Ask: "Ready to build? (yes / adjust)"
│   Only proceed on "yes"
│
├── Phase 4: site-builder
│   Invoke /site-builder managed=true
│   → full codebase + GitHub PR
│
├── Phase 5: site-reviewer (unless skip-review=true)
│   Invoke /site-reviewer
│   → PR reviewed + merged
│
└── Phase 6: site-deploy (if deploy=yes)
    Invoke /site-deploy
    → live URL
```

---

## Execution Model

**Phases run sequentially and autonomously — do NOT pause between them.**

Only stop when a `STOP — wait for the user's response` instruction explicitly appears (Phase 0 state check, Phase 0.5 deploy preference, and the USER CHECKPOINT before Phase 4). Every other transition happens immediately: when a phase completes, announce the next phase and begin it.

---

## Workflow

### Phase 0: State Check

**This phase ALWAYS runs first**, before any other work.

Check whether `.web-studio/state.json` exists in the current directory.

**If the file exists**, read it and display:

```
Found an existing web-studio session for [business name].
Completed phases: [list of complete phases]
Last completed: [phase name]

How would you like to proceed?
1. Resume — continue from [next incomplete phase]
2. Update — make changes to the existing site
3. Jump to a specific phase — I'll ask which one
4. Fresh start — delete the session and start over
```

**STOP — wait for the user's response.**

| Choice | Action |
|--------|--------|
| Resume | Set `start-at` to the next incomplete phase, proceed |
| Update | Ask "What would you like to change?" (free-text, multiple changes allowed), then enter the Update Pipeline |
| Specific phase | Ask which phase, set `start-at` accordingly, proceed |
| Fresh start | Delete `.web-studio/state.json`, proceed to initialize |

**If the file does not exist**, create the `.web-studio/` directory and initialize state:

```bash
mkdir -p .web-studio
```

Write `.web-studio/state.json`:

```json
{
  "version": "1.0",
  "created_at": "[ISO timestamp]",
  "business_name": null,
  "site_type": null,
  "phases": {
    "discovery": "pending",
    "planner": "pending",
    "designer": "pending",
    "builder": "pending",
    "reviewer": "pending",
    "deploy": "skipped"
  },
  "deploy_enabled": null,
  "live_url": null,
  "last_update": null
}
```

### Phase 0.1: Start-of-Session Credential Check

**This phase runs after Phase 0 on every fresh start.** It does not run when resuming (the pipeline was already underway), or when entering via the Update path or Jump option.

#### GitHub CLI

Run `gh auth status`.

- **If not authenticated:** hard stop.

  ```
  GitHub CLI is not authenticated.
  Run: gh auth login
  Then restart /web-studio.
  ```

  Do not proceed to Phase 0.5 until GitHub CLI is authenticated.

- **If authenticated:** note the username for the status line below.

#### Image API keys

Check `.env` in the project directory for any of: `NANOBANANA_API_KEY`, `NANOBANANA_GEMINI_API_KEY`, `GEMINI_API_KEY`, `PEXELS_API_KEY`.

This check is **never a hard stop** — missing image keys degrade build output but do not block the pipeline.

**If GitHub authenticated AND at least one image key found:** print a compact one-line status and proceed — no stop:

```
  ✓ GitHub authenticated (@[username]) | ✓ Image API ready ([key name]) — proceeding
```

**If GitHub authenticated AND no image key found:** print the full status block (informational only) and proceed without stopping:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Session Credential Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  GitHub CLI:   ✓ authenticated as @[username]
  Image API:    ✗ no key found

  Images will use CSS gradient placeholders during the build.
  To enable real images, add to .env before the build:
    NANOBANANA_API_KEY=    (AI images — https://aistudio.google.com/apikey)
    PEXELS_API_KEY=        (stock photos — https://www.pexels.com/api/)
  Or re-run just the image phase later: /site-builder start-at=images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Phase 0.5: Deploy Preference

**Skip this phase** if `deploy=yes` or `deploy=no` was passed explicitly — the preference is already known.

If `deploy=ask` (default) and this is a fresh start, ask:

```
Should I deploy the site when the build is complete?

1. Yes — run site-deploy automatically after review
2. No — stop after review, I'll deploy manually
```

**STOP — wait for the user's response.**

| Choice | Action |
|--------|--------|
| Yes | Set `deploy_enabled=true` in state, set `deploy=yes` |
| No | Set `deploy_enabled=false` in state, set `deploy=no` |

### Phase 1: site-discovery

**Skip if `start-at` is `planner`, `designer`, `builder`, `reviewer`, or `deploy`.**

Announce: `Phase 1: site-discovery`

Invoke `/site-discovery`, passing through parameters:
- If `site-type` was provided: pass `site-type=[value]`
- If `industry` was provided: pass `industry=[value]`

Wait for the skill to complete fully (it has its own internal phases and user gates — do not interrupt).

After completion:
1. Read `docs/product-marketing-context.md` and extract the business name
2. Update state:

```json
{
  "phases": { "discovery": "complete" },
  "business_name": "[extracted name]",
  "site_type": "[extracted type]"
}
```

**Immediately proceed to Phase 2. Do not pause.**

### Phase 2: site-planner

**Skip if `start-at` is `designer`, `builder`, `reviewer`, or `deploy`.**

Announce: `Phase 2: site-planner`

Invoke `/site-planner`.

Wait for the skill to complete fully.

After completion, update state:

```json
{
  "phases": { "planner": "complete" }
}
```

**Immediately proceed to Phase 3. Do not pause.**

### Phase 3: site-designer

**Skip if `start-at` is `builder`, `reviewer`, or `deploy`.**

Announce: `Phase 3: site-designer`

Invoke `/site-designer`.

Wait for the skill to complete fully.

After completion, update state:

```json
{
  "phases": { "designer": "complete" }
}
```

**Immediately proceed to the USER CHECKPOINT below. Do not pause.**

---

### ─── USER CHECKPOINT ───

**This gate runs before Phase 4 every time, regardless of `start-at`.**

Before invoking site-builder, read `docs/product-marketing-context.md`, `docs/site-plan.md`, and `docs/design-system.md`. Extract the key fields and present this summary to the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  web-studio — Ready to Build
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business: [name]
Site type: [type] | Stack: [stack]

Pages ([N] total):
  / Homepage
  /services
  /about
  /contact
  /service-areas
  [... full list from site-plan.md]

Lead offer: [offer from site-plan.md]

Design:
  Primary: [color hex] | Accent: [color hex]
  Font: [display font] / [body font]
  Style: [style from design-system.md]

Components: Header, Footer, MobileStickyCTA, Hero,
  LeadCaptureForm, ServicesGrid, TestimonialsSection...
  [full list from design-system.md]

Auth: [Yes — Supabase / No]
Deploy: [Netlify / Vercel / Not yet decided]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ready to build? (yes / adjust)
```

**STOP — wait for the user's response. Do NOT invoke site-builder until confirmed.**

| Response | Action |
|----------|--------|
| "yes" / "looks good" / "let's go" | Run pre-build credential check (below), then proceed to Phase 4 |
| "adjust" / specific change | Ask which aspect to change, then re-invoke the relevant specialist skill (e.g. `/site-designer` for color/font changes, `/site-planner` for page structure changes). After re-invoking, re-read the docs and re-display this checkpoint. |
| Abandons / no response | Save state as-is, report: "Session saved. Resume with /web-studio" |

**Tip for the user**: The three docs files are human-readable — open them before approving this checkpoint if you want to review the full detail.

#### Pre-Build Credential Check

Runs automatically after the user confirms "yes". Reads `docs/product-marketing-context.md` to determine which stack-specific credentials are required for this particular site.

**Determine what's needed:**
- Auth field references Supabase → require `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- Deploy platform is Vercel → require `VERCEL_TOKEN`
- Deploy platform is Netlify → no token needed (uses GitHub integration)

If `.env` does not exist in the project directory, treat all credentials as missing.

**If all required credentials are present in `.env`:** print a compact one-line status and proceed to Phase 4 immediately — no stop:

```
  ✓ Supabase credentials found | ✓ Vercel token found — starting build
```

**If any required credential is missing:** display the full check block, then collect each missing value one at a time:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Pre-Build Credential Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  GitHub CLI:   ✓ authenticated
  Image API:    ✓ PEXELS_API_KEY (stock photos)
  Supabase:     ✗ SUPABASE_URL missing — required (auth enabled)
                ✗ SUPABASE_ANON_KEY missing — required (auth enabled)
  Deploy:       — Netlify (no token needed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask for each missing credential one at a time, with a hint about where to find it:

```
Please provide your SUPABASE_URL:
(Find it at: supabase.com → project → Settings → API)
```

After the user provides each value, append `KEY=value` to `.env` immediately, then ask for the next missing credential. Once all required credentials are collected (or intentionally skipped), proceed to Phase 4.

**Empty response / skip handling:** if the user presses Enter without providing a required credential, ask once:

```
Skip auth and continue without Supabase? Phase B6 will be skipped.
You can add credentials later and re-run: /site-builder start-at=b6

1. Yes — skip auth, continue build
2. No — I'll provide the credential now
```

**STOP — wait for the user's response.**

| Choice | Action |
|--------|--------|
| Yes | Set `auth_enabled=false` for this run, proceed to Phase 4 |
| No | Re-prompt for the credential |

---

### Phase 4: site-builder

Announce: `Phase 4: site-builder`

Invoke `/site-builder managed=true`.
(`managed=true` tells site-builder it is being orchestrated by web-studio — it suppresses site-builder's internal resume check and "proceed" gate, since web-studio handles those through its own checkpoints.)

Wait for the skill to complete fully. It will produce a full codebase and open a GitHub PR.

After completion, capture the PR URL from the builder output. Update state:

```json
{
  "phases": { "builder": "complete" },
  "pr_url": "[PR URL from builder output]"
}
```

**Immediately proceed to Phase 5 (or Phase 6 if skip-review=true). Do not pause.**

### Phase 5: site-reviewer

**Skip if `skip-review=true`.**

Announce: `Phase 5: site-reviewer`

Invoke `/site-reviewer`.

Wait for the skill to complete fully. It will review the PR and merge it if no critical findings remain.

After completion, update state:

```json
{
  "phases": { "reviewer": "complete" }
}
```

**Immediately proceed to Phase 6. Do not pause.**

**If `skip-review=true`**, update state and note the skip:

```json
{
  "phases": { "reviewer": "skipped" }
}
```

And note to the user: "Review skipped. Deployment will proceed without the adversarial quality gate."

**Critical finding gate:** If site-reviewer reports unresolved CRITICAL findings, do NOT proceed to Phase 6. Report:

```
site-reviewer found unresolved critical findings. Deployment is blocked.

Resolve the critical findings flagged in the PR, then resume with:
/web-studio start-at=deploy
```

### Phase 6: site-deploy

**Skip if `deploy=no`.**

Announce `Phase 6: site-deploy` and invoke `/site-deploy`.

Wait for the skill to complete fully. It will push the site live and return a URL.

After completion, update state:

```json
{
  "phases": { "deploy": "complete" },
  "live_url": "[URL from deploy output]"
}
```

---

## Update Pipeline

This section runs instead of Phases 0.5–6 when the user picks "Update" at Phase 0 or passes the `update` parameter.

**Entry conditions:**
- Via Phase 0 menu: user picked "Update", then answered "What would you like to change?"
- Via parameter: `update="..."` was passed. Skip Phase 0 entirely. If `.web-studio/state.json` does not exist, stop: `"No existing web-studio session found. Run /web-studio first to build the site before updating it."`

### Step 1: Receive update request

The update request is already collected — from the Phase 0 "What would you like to change?" prompt (do not ask again), or from the `update` parameter value. No additional questions at this step.

### Step 2: Classify changes

Read the update request and categorise each change. Multiple changes may span multiple categories:

| Category | Signals | Affected doc | Earliest build phase |
|----------|---------|-------------|----------------------|
| Content/Copy | "more copy", "update headline", "add testimonials", "rewrite services description" | `docs/site-plan.md` | B3 (homepage) or B4 (inner page) |
| Page Structure | "remove blog", "add FAQ page", "rename services to solutions", "add a pricing page" | `docs/site-plan.md` | B4 + B5 (sitemap must update) |
| Design | "primary color", "hero color", "section color", "background color", "font", "spacing", "dark mode", "make it bolder" — any visual or aesthetic property, even when scoped to a named section | `docs/design-system.md` | B2 (shared components rebuild) |
| Feature | "add contact form", "add auth", "Google Maps", "newsletter signup" | none (direct build) | B3–B6 depending on feature |

**Earliest phase rule:** when changes span multiple categories, `start-at` is set to the earliest phase across all of them. These phase codes (B2–B7) are site-builder internal phases passed to `/site-builder start-at=B2 managed=true` — they are not web-studio's own `start-at` values (`discovery`, `planner`, etc.).

Example: "remove the blog page and make the primary color darker"
→ Page Structure (B4) + Design (B2) → `start-at=b2`

If the update request is ambiguous (e.g. "make it better"), ask one clarifying question before classifying. Do not proceed until the request is specific enough to classify.

### Step 3: Update source docs

For each affected doc, invoke the relevant specialist skill in update mode:

- **`docs/site-plan.md` changes** — invoke `/site-planner update-request="[content/page changes extracted from request]"`
  - site-planner reads the existing file and applies only the requested changes
  - Writes updated `docs/site-plan.md`

- **`docs/design-system.md` changes** — invoke `/site-designer update-request="[design changes extracted from request]"`
  - site-designer reads the existing file and applies only the requested changes
  - Writes updated `docs/design-system.md`

- **Feature-only changes** — skip doc update, proceed to Step 4

**Ordering rule for multi-doc updates:** if both `docs/site-plan.md` and `docs/design-system.md` need updating, always run site-planner first, then site-designer. site-designer reads `docs/site-plan.md` when running; updating site-plan first ensures it reads the correct page list.

### Step 4: Rebuild

Invoke `/site-builder start-at=[earliest phase from Step 2] managed=true`.

site-builder reads the updated docs and rebuilds from the specified phase forward through B7. A PR is opened at the end of B7. site-reviewer is not re-invoked on update runs — the PR can be reviewed manually if desired.

### Step 5: Re-deployment prompt

After the site-builder PR is opened, read `docs/product-marketing-context.md` to determine the deploy platform, then always ask:

```
Update complete. Deploy these changes to [platform]?

1. Yes — deploy now
2. No — I'll deploy manually
```

**STOP — wait for the user's response.**

### Step 6: Deploy (if yes)

Announce `Deploying update` and invoke `/site-deploy`. Capture live URL. Update state.

### Step 7: Update state

```json
{
  "last_update": {
    "request": "[original update request text]",
    "ran_at": "[ISO timestamp]",
    "phases_rerun": ["b2", "b3", "b4", "b5", "b6", "b7"]
  }
}
```

Also write `live_url` to state if Step 6 ran (deploy happened). Merge all fields into existing `.web-studio/state.json` — do not overwrite other keys.

---

### Final Report

**For update runs** (entered via "Update" at Phase 0 or via `update=` parameter), display instead:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  web-studio — Update Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business: [name]
Update: [original update request text]

Changes applied:
  ✓ [site-plan.md updated / skipped — no content changes]
  ✓ [design-system.md updated / skipped — no design changes]
  ✓ site-builder rebuilt from [earliest phase]
  ✓ PR opened: [PR URL]
  ✓ Deployed: [live URL or "Not deployed"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**For normal build runs**, after all phases complete (or are intentionally skipped), display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  web-studio — Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business: [name]
Stack: [stack] | Pages: [N]

Phases completed:
  ✓ site-discovery
  ✓ site-planner
  ✓ site-designer
  ✓ site-builder
  ✓ site-reviewer  [or — skipped (skip-review=true)]
  ✓ site-deploy    [or — skipped (deploy=no)]

Live URL: [url or "Not deployed"]

Docs written:
  docs/product-marketing-context.md
  docs/site-plan.md
  docs/design-system.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Specialist skill not found | Stop immediately with a clear error: list the missing skill name and the expected path (`skills/[skill-name]/SKILL.md`). Do not attempt to continue or work around it. |
| Phase fails mid-pipeline | Save state with the current phase marked `"failed"`, then report: "Phase [N] failed. Resume with /web-studio start-at=[phase]" |
| User abandons at checkpoint | Save state as-is, report: "Session saved. Resume with /web-studio" |
| docs/ directory not writable | Stop. Report: "Cannot write to docs/. Check permissions and try again." Include the exact permission fix command if determinable. |
| site-builder opens PR but reviewer fails | State has `builder=complete` and `reviewer=failed`. Report: "Builder succeeded (PR open). Reviewer failed. Resume with /web-studio start-at=reviewer" |
| site-reviewer leaves CRITICAL findings unresolved | Do NOT proceed to deploy. Report: "Resolve critical findings in the PR, then run /web-studio start-at=deploy" |
| state.json cannot be read (corrupted) | Warn user, offer to start fresh. Do not silently overwrite. |
| start-at phase references docs that don't exist | Warn: "Jumping to [phase] requires [missing doc]. Run the prior phases first or use start-at=[earlier phase]." |
| `update` parameter passed but no `state.json` exists | Stop. Report: "No existing web-studio session found. Run /web-studio first to build the site before updating it." |
| GitHub CLI not authenticated at Phase 0.1 | Hard stop. Report: "GitHub CLI is not authenticated. Run: `gh auth login` then restart /web-studio." Do not proceed to Phase 0.5. |
| Supabase credentials skipped at pre-build check | Set `auth_enabled=false` for this run. Include note in Final Report: "Phase B6 was skipped — Supabase credentials not provided. Add to .env and re-run: `/site-builder start-at=b6`" |
| Update request is ambiguous (e.g. "make it better") | Ask one clarifying question before classifying. Do not enter Step 3 until the request is specific enough to classify. |
| site-builder fails during update rebuild | Report which phase failed. User can resume the update with `/web-studio start-at=[failed phase]`. |

---

## Tips

- For fast prototyping: `skip-review=true deploy=no` — gets a built site without review or deploy overhead
- The USER CHECKPOINT is your last chance to course-correct before hours of build work — read the docs before approving
- To update an existing site, use `/web-studio update="describe your changes"` or pick "Update" at the Phase 0 session menu — this runs the full Update Pipeline including state tracking and optional re-deployment
- All three docs files are human-readable — open and review them before approving the checkpoint
- Sessions are fully resumable — if you need to stop, just close the terminal. Run `/web-studio` again and state is restored automatically
- Use `start-at=designer` to regenerate the design without re-running the intake questionnaire
