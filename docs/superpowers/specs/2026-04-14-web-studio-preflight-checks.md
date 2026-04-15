# Design Spec: Web Studio Pre-Flight Credential Checks + Autonomous Pipeline
**Date:** 2026-04-14
**Project:** `/mnt/c/Users/tez/projects/skills-grimoire`

---

## Problem

Two related issues with the current web-studio pipeline:

1. **Unintended mid-pipeline stops.** After the user approves the build at the USER CHECKPOINT and expects autonomous execution, the pipeline halts multiple times:
   - site-builder Phase 0 re-asks about resuming (redundant — web-studio already made this decision)
   - site-builder Phase R stops and waits for the user to type "proceed" after printing the build-plan summary
   - site-builder Phase B6 stops to ask for Supabase credentials that were never collected

2. **Credentials checked too late.** API keys for image generation (Nano Banana, Pexels) and stack-specific credentials (Supabase, Vercel) are discovered to be missing hours into the build — causing interruptions or degraded output at the worst possible moment.

---

## Solution

Two-stage pre-flight credential check + `managed=true` parameter in site-builder that suppresses internal stops when invoked from within the web-studio coordinator.

---

## Architecture

```
/web-studio
  Phase 0:    State check (existing)
  Phase 0.1:  [NEW] Start-of-session credential check
                → GitHub CLI (hard stop if not authed)
                → Image API keys (informational — never blocks)
  Phase 0.5:  Deploy preference (existing)
  Phase 1–3:  site-discovery → site-planner → site-designer (existing)

  USER CHECKPOINT  [EXTENDED]
                → Design approval (existing)
                → Pre-build credential check (NEW)
                    → Supabase (if auth=Supabase)
                    → Vercel token (if deploy=Vercel)
                    → Collect missing credentials → write to .env
                    → If all present: no stop

  Phase 4:    /site-builder managed=true  ← managed param added
                → Phase 0 resume check: SKIPPED
                → Phase R: auto-proceed after summary (no "proceed" gate)
                → Phase B6: reads .env directly, skips if still missing
                → Phase B1.5: explicit continue-without-stopping language
  Phase 5–6:  site-reviewer → site-deploy (existing)
```

---

## Files Changed

| File | Change |
|------|--------|
| `skills/web-studio/SKILL.md` | Add Phase 0.1, extend USER CHECKPOINT with pre-build credential check, pass `managed=true` on all site-builder invocations |
| `skills/site-builder/SKILL.md` | Add `managed` parameter, suppress Phase 0 resume check when managed, auto-proceed Phase R when managed, use .env in B6 when managed, tighten B1.5 continue language |

---

## web-studio — Phase 0.1: Start-of-Session Credential Check

Runs immediately after Phase 0 (state check) and before Phase 0.5 (deploy preference). Checks credentials that are always needed regardless of later configuration choices.

### GitHub CLI check

Run: `gh auth status`

- **If not authenticated:** hard stop.

  ```
  GitHub CLI is not authenticated.
  Run: gh auth login
  Then restart /web-studio.
  ```

- **If authenticated:** note the username for the compact status line.

### Image API key check

Check `.env` in the project directory for any of:
- `NANOBANANA_API_KEY`
- `NANOBANANA_GEMINI_API_KEY`
- `GEMINI_API_KEY`
- `PEXELS_API_KEY`

This check is **never a hard stop** — missing image keys degrade output quality but do not block the build.

### Output

**If GitHub authenticated AND at least one image key found:**
Print a compact one-line status and proceed immediately — no stop:

```
  ✓ GitHub authenticated (@username) | ✓ Image API ready (Pexels) — proceeding
```

**If GitHub authenticated AND no image key found:**
Print the full status block (informational only) and proceed without stopping:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Session Credential Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  GitHub CLI:   ✓ authenticated as @username
  Image API:    ✗ no key found

  Images will use CSS gradient placeholders during the build.
  To enable real images, add to .env before the build:
    NANOBANANA_API_KEY=    (AI images — https://aistudio.google.com/apikey)
    PEXELS_API_KEY=        (stock photos — https://www.pexels.com/api/)
  Or re-run just the image phase later: /site-builder start-at=images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If GitHub not authenticated:** hard stop (see above).

---

## web-studio — Extended USER CHECKPOINT

The existing USER CHECKPOINT ("Ready to build?") is extended. After the user responds "yes", and before invoking site-builder, run the pre-build credential check.

### Determine what's needed

Read `docs/product-marketing-context.md` and extract:
- Auth choice → if Supabase: require `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- Deploy platform → if Vercel: require `VERCEL_TOKEN`; if Netlify: no token needed

### Check `.env` for each required credential

**If all present:** print a compact one-line status and proceed immediately — no stop:

```
  ✓ Supabase credentials found | ✓ Vercel token found — starting build
```

**If any required credential is missing:** display the full check block:

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

Then ask for each missing credential one at a time:

```
Please provide your SUPABASE_URL:
(Find it at: supabase.com → project → Settings → API)
```

After collecting each value, ask for the next. Once all are collected, append them to `.env` and proceed to Phase 4.

### Empty response handling

If the user presses Enter without providing a required credential, ask once:

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

## site-builder — `managed` Parameter

### New parameter

| Parameter | Default | Description |
|-----------|---------|-------------|
| `managed` | `false` | When `true`, suppress internal interactive stops — Phase 0 resume check, Phase R "proceed" gate, and Phase B6 credential prompt. Set by web-studio coordinator; standalone users leave this at default. |

### Behavior changes when `managed=true`

**Phase 0 — Resume check:** Skip entirely. web-studio already made the resume/fresh-start decision in its own Phase 0. Do not display the resume prompt or wait for a response.

**Phase R — "proceed" gate:** Print the build-plan summary as usual, then proceed to Phase B1 automatically. Replace the STOP with a status line:

```
Research complete (7 agents). Build plan written to .web-studio/build-plan.md.
Stack: Astro | Pages: 6 | Components: 8 | Auth: disabled

Starting Phase B1...
```

**Phase B6 — Supabase credential prompt:** Read `SUPABASE_URL` and `SUPABASE_ANON_KEY` directly from `.env`. Do not prompt the user. If credentials are still missing when `managed=true`, log a warning and skip B6:

```
Warning: Supabase credentials not found in .env — skipping Phase B6.
Add credentials and re-run: /site-builder start-at=b6
```

**Phase B1.5 — No image keys:** Strengthen the existing "do NOT stop" instruction with unambiguous language:

> When no image API keys are found, log the warning block and immediately continue to Phase B2. Under no circumstances stop the build or wait for a user response. The CSS placeholder fallback is the intended degraded behavior — it is not an error state.

### Standalone behavior unchanged

When `managed=false` (the default), site-builder behaves exactly as today:
- Phase 0 resume check is displayed and waits for a response
- Phase R "proceed" gate is active
- Phase B6 prompts for Supabase credentials if missing

### web-studio invocation pattern

All site-builder calls from web-studio pass `managed=true`:

```
/site-builder managed=true
/site-builder start-at=images managed=true
/site-builder start-at=b2 managed=true     ← update pipeline
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| GitHub not authenticated at Phase 0.1 | Hard stop with `gh auth login` instruction |
| `.env` does not exist at Phase 0.1 | Treat as "no image keys found" — proceed with informational message |
| Supabase credentials collected but malformed (no `https://`) | Accept as-is, note "verify URL format" in output. site-builder will surface any API error during B6. |
| User skips required credential (presses Enter) | Ask once to confirm skip — if confirmed, skip auth/deploy for this run with resume instructions |
| site-builder Phase B6 missing creds when managed=true | Log warning, skip B6, add note to Final Report |

---

## Tips

- Phase 0.1 only ever stops for GitHub auth — image key warnings are informational and never block
- Add image API keys to `.env` before running `/web-studio` to avoid CSS placeholder fallback
- If you forgot to add Supabase credentials before the build, provide them at the USER CHECKPOINT prompt — they're written to `.env` and used immediately by B6
- Re-run just the image phase after adding a key: `/site-builder start-at=images`
- Re-run just the auth phase after adding Supabase credentials: `/site-builder start-at=b6`
- Standalone `/site-builder` users are not affected — `managed=true` is only set by the web-studio coordinator
