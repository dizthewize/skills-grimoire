# Web Studio Pre-Flight Checks + Autonomous Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two-stage credential pre-flight checks to web-studio and a `managed=true` parameter to site-builder that suppresses mid-pipeline stops when called from the coordinator.

**Architecture:** Phase 0.1 (new) checks GitHub CLI auth and image API keys at session start. The USER CHECKPOINT (existing) is extended to collect Supabase/Vercel credentials after the user approves the design. site-builder gets a `managed` parameter — when `true`, its Phase 0 resume check, Phase R "proceed" gate, and Phase B6 credential prompt are all suppressed; web-studio always passes `managed=true` when invoking it.

**Tech Stack:** Markdown skill files only — no code, no tests. Verification for each task is reading back the modified file section and checking that the required strings are present and removed strings are absent.

---

## File Map

| File | Tasks |
|------|-------|
| `skills/site-builder/SKILL.md` | Tasks 1–4 |
| `skills/web-studio/SKILL.md` | Tasks 5–7 |

---

### Task 1: site-builder — Add `managed` parameter to Parameters table and Invocation

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Parameters table, Invocation section)

- [ ] **Step 1: Add `managed` row to Parameters table**

Find this exact string in `skills/site-builder/SKILL.md`:

```
| `branch` | `main` | Git branch strategy: `main` (commit directly to current branch), `new` (create a feature branch), `auto` (new branch if repo has existing commits) |
```

Replace with:

```
| `branch` | `main` | Git branch strategy: `main` (commit directly to current branch), `new` (create a feature branch), `auto` (new branch if repo has existing commits) |
| `managed` | `false` | When `true`, suppresses internal interactive stops (Phase 0 resume check, Phase R "proceed" gate, Phase B6 credential prompt). Set by the web-studio coordinator; standalone users leave at default. |
```

- [ ] **Step 2: Add invocation examples**

Find this exact string:

```
/site-builder start-at=images
```

Replace with:

```
/site-builder start-at=images
/site-builder managed=true
/site-builder start-at=b3 managed=true
```

- [ ] **Step 3: Verify**

Read `skills/site-builder/SKILL.md` lines 18–36. Confirm:
- `managed` row is present in the Parameters table with default `false`
- `managed=true` and `start-at=b3 managed=true` examples are present in Invocation

---

### Task 2: site-builder — Skip Phase 0 resume check when `managed=true`

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase 0, step 4)

- [ ] **Step 1: Apply the edit**

Find this exact string in `skills/site-builder/SKILL.md`:

```
4. Check `.web-studio/state.json` — if it exists AND `start-at` was not explicitly passed by the user, display:

   ```
   A previous build session was found at .web-studio/state.json.
   Last completed phase: [phase]

   1. Resume from [next phase]
   2. Start fresh (overwrites state)

   How would you like to proceed?
   ```

   **STOP — wait for response.**
```

Replace with:

```
4. If `managed=false` (standalone use): check `.web-studio/state.json` — if it exists AND `start-at` was not explicitly passed by the user, display:

   ```
   A previous build session was found at .web-studio/state.json.
   Last completed phase: [phase]

   1. Resume from [next phase]
   2. Start fresh (overwrites state)

   How would you like to proceed?
   ```

   **STOP — wait for response.**

   If `managed=true`: skip this check entirely. web-studio has already handled state management in its own Phase 0.
```

- [ ] **Step 2: Verify**

Read the Phase 0 section of `skills/site-builder/SKILL.md`. Confirm:
- Step 4 now begins with `If \`managed=false\``
- The original `STOP — wait for response` is still present under the `managed=false` branch
- A new `If \`managed=true\`: skip this check entirely` sentence follows it

---

### Task 3: site-builder — Auto-proceed Phase R when `managed=true`

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase R, summary block)

- [ ] **Step 1: Apply the edit**

Find this exact string in `skills/site-builder/SKILL.md`:

```
Present a summary of `build-plan.md` to the user:

```
Research complete (7 agents). Build plan written to .web-studio/build-plan.md.

Stack: [framework] | Pages: [N] | Components: [N] | Auth: [enabled/disabled]

Type "proceed" to begin the build phases.
```

**STOP — wait for "proceed" before starting B phases.**
```

Replace with:

```
Present a summary of `build-plan.md` to the user:

```
Research complete (7 agents). Build plan written to .web-studio/build-plan.md.

Stack: [framework] | Pages: [N] | Components: [N] | Auth: [enabled/disabled]
```

If `managed=true`: print the summary above and immediately proceed to Phase B1. Do not wait for a response.

If `managed=false` (standalone): append the following line to the summary and wait:

```
Type "proceed" to begin the build phases.
```

**STOP — wait for "proceed" before starting B phases.**
```

- [ ] **Step 2: Verify**

Read the Phase R section of `skills/site-builder/SKILL.md`. Confirm:
- The summary block no longer contains `Type "proceed"` in the code fence
- A `managed=true` auto-proceed branch is present
- A `managed=false` branch retains the `STOP` instruction

---

### Task 4: site-builder — Tighten Phase B1.5 language + add managed path to Phase B6

**Files:**
- Modify: `skills/site-builder/SKILL.md` (Phase B1.5 step 6, Phase B6 credential prompt)

- [ ] **Step 1: Tighten Phase B1.5 "neither key" continue language**

Find this exact string in `skills/site-builder/SKILL.md`:

```
   Set `imageSource: "skipped"` in state. Do NOT stop the build — continue to B2 with CSS fallbacks.
```

Replace with:

```
   Set `imageSource: "skipped"` in state and immediately continue to Phase B2. Do NOT stop, do NOT wait for a response, do NOT ask the user anything. CSS gradient placeholders are the intended degraded behavior — this is not an error state that requires user input.
```

- [ ] **Step 2: Add managed path to Phase B6 credential prompt**

Find this exact string in `skills/site-builder/SKILL.md`:

```
   If Supabase credentials were not provided in `docs/product-marketing-context.md`, prompt:
   ```
   B6 requires Supabase credentials. Please provide:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

   Paste them now or press Enter to skip B6.
   ```
```

Replace with:

```
   **Credential check:**

   If `managed=true`: read `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `.env` directly (they were collected by web-studio's pre-build check). If either is missing, log a warning and skip B6:
   ```
   Warning: Supabase credentials not found in .env — skipping Phase B6.
   Add credentials and re-run: /site-builder start-at=b6
   ```

   If `managed=false` (standalone): check `docs/product-marketing-context.md` for credentials. If not provided, prompt:
   ```
   B6 requires Supabase credentials. Please provide:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

   Paste them now or press Enter to skip B6.
   ```
```

- [ ] **Step 3: Verify**

Read the Phase B1.5 and Phase B6 sections of `skills/site-builder/SKILL.md`. Confirm:
- Phase B1.5 step 6 last line now reads "immediately continue to Phase B2. Do NOT stop..."
- Phase B6 now has a `managed=true` branch (reads from `.env`, skips with warning) and a `managed=false` branch (original prompt behavior)

---

### Task 5: web-studio — Add Phase 0.1 start-of-session credential check

**Files:**
- Modify: `skills/web-studio/SKILL.md` (insert Phase 0.1 before Phase 0.5, add error handling rows)

- [ ] **Step 1: Insert Phase 0.1**

Find this exact string in `skills/web-studio/SKILL.md`:

```
### Phase 0.5: Deploy Preference
```

Replace with:

```
### Phase 0.1: Start-of-Session Credential Check

**This phase runs after Phase 0 on every fresh start.** It does not run when resuming (the pipeline was already underway). Skip on resume, update, and jump entries.

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
```

- [ ] **Step 2: Add error handling rows to web-studio Error Handling table**

Find this exact string in `skills/web-studio/SKILL.md`:

```
| `update` parameter passed but no `state.json` exists | Stop. Report: "No existing web-studio session found. Run /web-studio first to build the site before updating it." |
```

Replace with:

```
| `update` parameter passed but no `state.json` exists | Stop. Report: "No existing web-studio session found. Run /web-studio first to build the site before updating it." |
| GitHub CLI not authenticated at Phase 0.1 | Hard stop. Report: "GitHub CLI is not authenticated. Run: `gh auth login` then restart /web-studio." Do not proceed to Phase 0.5. |
| Supabase credentials skipped at pre-build check | Set `auth_enabled=false` for this run. Include note in Final Report: "Phase B6 was skipped — Supabase credentials not provided. Add to .env and re-run: `/site-builder start-at=b6`" |
```

- [ ] **Step 3: Verify**

Read the web-studio SKILL.md around the Phase 0.1 insertion and Error Handling section. Confirm:
- `### Phase 0.1: Start-of-Session Credential Check` section exists between Phase 0 and Phase 0.5
- GitHub hard-stop block is present in Phase 0.1
- Image key informational block (no hard stop) is present in Phase 0.1
- Two new error rows are present in the Error Handling table

---

### Task 6: web-studio — Extend USER CHECKPOINT with pre-build credential check

**Files:**
- Modify: `skills/web-studio/SKILL.md` (USER CHECKPOINT response table and section body)

- [ ] **Step 1: Apply the edit**

Find this exact string in `skills/web-studio/SKILL.md`:

```
| Response | Action |
|----------|--------|
| "yes" / "looks good" / "let's go" | Proceed to Phase 4 |
| "adjust" / specific change | Ask which aspect to change, then re-invoke the relevant specialist skill (e.g. `/site-designer` for color/font changes, `/site-planner` for page structure changes). After re-invoking, re-read the docs and re-display this checkpoint. |
| Abandons / no response | Save state as-is, report: "Session saved. Resume with /web-studio" |

**Tip for the user**: The three docs files are human-readable — open them before approving this checkpoint if you want to review the full detail.
```

Replace with:

```
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
```

- [ ] **Step 2: Verify**

Read the USER CHECKPOINT section of `skills/web-studio/SKILL.md`. Confirm:
- The "yes" row now reads "Run pre-build credential check (below), then proceed to Phase 4"
- The `#### Pre-Build Credential Check` subsection is present after the tip
- The skip-handling STOP block is present with the Yes/No table
- The original "adjust" and "Abandons" rows are unchanged

---

### Task 7: web-studio — Pass `managed=true` on all site-builder invocations

**Files:**
- Modify: `skills/web-studio/SKILL.md` (Phase 4, Update Pipeline Step 4)

- [ ] **Step 1: Update Phase 4 invocation**

Find this exact string in `skills/web-studio/SKILL.md`:

```
Invoke `/site-builder`.
```

Replace with:

```
Invoke `/site-builder managed=true`.
```

- [ ] **Step 2: Update Update Pipeline Step 4 invocation**

Find this exact string in `skills/web-studio/SKILL.md`:

```
Invoke `/site-builder start-at=[earliest phase from Step 2]`.
```

Replace with:

```
Invoke `/site-builder start-at=[earliest phase from Step 2] managed=true`.
```

- [ ] **Step 3: Verify**

Read Phase 4 and Update Pipeline Step 4 of `skills/web-studio/SKILL.md`. Confirm:
- Phase 4 reads `Invoke \`/site-builder managed=true\`.`
- Update Pipeline Step 4 reads `Invoke \`/site-builder start-at=[earliest phase from Step 2] managed=true\`.`
- No other site-builder invocations exist in the file without `managed=true`

- [ ] **Step 4: Commit**

```bash
git add skills/web-studio/SKILL.md skills/site-builder/SKILL.md
git commit -m "feat: add pre-flight credential checks and managed pipeline mode to web-studio"
```

---

## Self-Review

**Spec coverage:**
- Phase 0.1 GitHub check → Task 5 ✓
- Phase 0.1 image key check (informational) → Task 5 ✓
- Pre-build credential check at USER CHECKPOINT → Task 6 ✓
- Supabase collection + .env write → Task 6 ✓
- Skip handling for missing credentials → Task 6 ✓
- `managed` parameter added → Task 1 ✓
- Phase 0 resume check suppressed when managed → Task 2 ✓
- Phase R auto-proceed when managed → Task 3 ✓
- Phase B1.5 continue-without-stopping language → Task 4 ✓
- Phase B6 reads .env when managed → Task 4 ✓
- web-studio passes managed=true → Task 7 ✓
- Error handling rows for new scenarios → Task 5 ✓

**All tasks covered. No placeholders.**
