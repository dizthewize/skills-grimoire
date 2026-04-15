# Nanobanana Gemini CLI Integration

**Date:** 2026-04-14  
**Status:** Approved  
**Scope:** `skills/site-builder/SKILL.md`, `skills/web-studio/SKILL.md`

---

## Background

The web-studio and site-builder skills previously referenced nanobanana as an image generation provider but never specified how to invoke it. The credential check accepted three key name variants (`NANOBANANA_API_KEY`, `NANOBANANA_GEMINI_API_KEY`, `GEMINI_API_KEY`) as interchangeable aliases, and Phase B1.5 said only "Call Nano Banana with `prompt` field and `style=photorealistic`" with no actual command.

Nanobanana is now installed as a Gemini CLI extension. This design wires up the real invocation and removes the stale alternate key names.

---

## What Nanobanana Is

Nanobanana is a Gemini CLI extension that exposes image generation via slash commands (`/generate`, `/edit`, `/restore`, etc.). It requires `NANOBANANA_API_KEY` (a Google AI Studio key) set as an environment variable. Generated images are saved to `./nanobanana-output/` with filenames derived from the prompt.

It can be invoked non-interactively via:
```bash
gemini "/generate 'prompt text' --styles='photorealistic'"
```

---

## Changes

### 1. `site-builder/SKILL.md` — Phase B1, Step 5 (`.env.example`)

Remove `NANOBANANA_GEMINI_API_KEY=` from the template. Update comment to reflect CLI-based usage:

```
# Nanobanana (Gemini CLI extension) — AI image generation
# Get your key at: https://aistudio.google.com/apikey
NANOBANANA_API_KEY=
```

### 2. `site-builder/SKILL.md` — Phase B1.5, Step 3 (credential check)

Simplify priority order to two entries only:

- `NANOBANANA_API_KEY` → use nanobanana via Gemini CLI  
- `PEXELS_API_KEY` (no nanobanana key) → use Pexels stock photos  
- Neither → skip image generation

Remove `NANOBANANA_GEMINI_API_KEY` and `GEMINI_API_KEY` from the priority list entirely.

### 3. `site-builder/SKILL.md` — Phase B1.5, Step 4 (image generation invocation)

Replace the vague "Call Nano Banana with `prompt` field and `style=photorealistic`" with:

For each image entry in the manifest:

```bash
# 1. Snapshot nanobanana-output/ before generation
before=$(ls ./nanobanana-output/ 2>/dev/null | sort)

# 2. Invoke nanobanana via Gemini CLI with API key from .env
NANOBANANA_API_KEY=$(grep '^NANOBANANA_API_KEY=' .env | cut -d= -f2) \
  gemini "/generate '{prompt}' --styles='photorealistic'"

# 3. Detect new file by diffing directory state
new_file=$(comm -13 <(echo "$before") <(ls ./nanobanana-output/ 2>/dev/null | sort) | head -1)

# 4. Move to target path
mv "./nanobanana-output/$new_file" "public/assets/images/{filename}.png"
```

Then continue: run seo-images optimization pipeline on the `.png`, save final as `.webp`, generate responsive variants if applicable.

Also update the no-key warning in Step 6 to remove the two stale key name references.

### 4. `web-studio/SKILL.md` — Phase 0.1 (credential check)

**Add Gemini CLI check** before the image key check:

```bash
gemini --version
```

- If CLI found: noted as `✓ Gemini CLI installed`
- If CLI not found: noted as `✗ Gemini CLI not found` — not a hard stop, but image generation via nanobanana will be unavailable

**Simplify image key check** from four variants to two:
- `NANOBANANA_API_KEY`
- `PEXELS_API_KEY`

Remove `NANOBANANA_GEMINI_API_KEY` and `GEMINI_API_KEY` from both the detection logic and the "add to `.env`" guidance block.

**Updated status line examples:**

```
✓ GitHub authenticated (@user) | ✓ Gemini CLI installed | ✓ NANOBANANA_API_KEY — AI images ready — proceeding
```

```
  Gemini CLI:   ✗ not found (install from geminicli.com — needed for AI image generation)
  Image API:    ✓ NANOBANANA_API_KEY found (unusable without Gemini CLI — falling back to Pexels)
```

---

## What Does Not Change

- Pexels fallback path (unchanged)
- CSS gradient placeholder path when no keys found (unchanged)
- seo-images optimization pipeline (unchanged)
- `imageSource` state values: `"nano-banana" | "pexels" | "skipped"` (unchanged)
- Per-image failure handling (unchanged)
- All other web-studio phases (unchanged)
