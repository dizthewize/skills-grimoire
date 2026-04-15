---
name: site-deploy
description: "Use after site-reviewer merges the PR to deploy the site live. Supports Netlify (default, via GitHub integration) and Vercel. Polls for the live URL and returns a deploy summary. Called by web-studio coordinator (Phase 6) or standalone."
---

# Site Deploy

Deploy the reviewed and merged site to production. Netlify is the default — it auto-deploys when the PR is merged to the main branch via GitHub integration. Vercel is supported when a `VERCEL_TOKEN` is available. Polls until the live URL is confirmed, then returns a full deploy summary with next steps.

## When to Use

- After `site-reviewer` has merged the PR
- Invoked automatically by `/web-studio` Phase 6 (when `deploy=yes`)
- Running a standalone deploy of an already-merged site

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `platform` | `auto` | `auto` reads from `docs/product-marketing-context.md`. Or pass `netlify` / `vercel` explicitly. |
| `vercel-token` | `env` | Source of Vercel token: `env` reads `VERCEL_TOKEN` from `.env`, or pass the token directly (not recommended — use `.env`). |

## Invocation

```
/site-deploy
/site-deploy platform=netlify
/site-deploy platform=vercel
```

---

## Workflow

### Phase 0: Load Context

1. Read `docs/product-marketing-context.md`. Extract:
   - `Deploy` field → `netlify`, `vercel`, or `TBD`
   - Business name (for the final report)

2. Determine platform:
   - If `platform` parameter provided: use it
   - Else if `Deploy` field is `netlify` or `vercel`: use that
   - Else: stop with error:
     ```
     Error: Deploy platform not set.
     Pass platform=netlify or platform=vercel, or update docs/product-marketing-context.md.
     ```

3. Read `.web-studio/state.json` → confirm `phases.reviewer` is `"complete"`. If not:
   - Warn: "site-reviewer has not completed for this session. Proceeding anyway, but review is recommended."
   - Continue (do not hard stop — the user may be running deploy standalone)

---

### Phase 1A: Netlify Deploy

**Netlify deploys automatically when the PR is merged to the default branch.** There is no CLI command to trigger it — the GitHub integration handles it.

1. Wait for the merge to be reflected (confirm the PR is merged):

   ```bash
   gh pr view [PR_URL] --json state --jq '.state'
   ```

   If state is not `MERGED`, report:
   ```
   Warning: The PR has not been merged yet. Netlify deploys trigger on merge.
   Merge the PR first, then re-run /site-deploy.
   ```
   **STOP.**

2. Check if a Netlify site is already connected to this repo:

   ```bash
   netlify status
   ```

   - If a site is linked: note the site ID and Netlify dashboard URL, proceed to polling.
   - If no site linked (first deploy): guide the user through linking:
     ```
     This repo is not yet connected to Netlify. Let's set it up:

     1. Run: netlify init
        Choose "Connect this directory to an existing Netlify site" or "Create & configure a new site"
     2. Follow the prompts to authorize and select/create your site
     3. Run /site-deploy again once the site is linked

     Or connect manually at: app.netlify.com → "New site" → "Import an existing project" → GitHub
     ```
     **STOP — wait for user to complete Netlify setup.**

3. Poll for the deploy to complete (max 5 minutes, check every 30 seconds):

   ```bash
   netlify deploys --json | head -1
   ```

   Check the `state` field of the latest deploy:
   - `"ready"` → deploy complete, extract `deploy_url` and `url`
   - `"building"` / `"enqueued"` → continue polling
   - `"error"` / `"failed"` → stop polling, report failure

   Print progress on each poll:
   ```
   Waiting for Netlify deploy... (attempt N/10)
   ```

   If deploy does not complete after 5 minutes (10 polls × 30 seconds):
   ```
   Netlify deploy is taking longer than expected.
   Check status at: app.netlify.com/sites/[site-name]/deploys
   Once deployed, the live URL will appear there.
   ```
   Continue to Phase 2 with `live_url` set to the Netlify dashboard URL as fallback.

---

### Phase 1B: Vercel Deploy

1. Read `VERCEL_TOKEN` from `.env`:

   ```bash
   grep '^VERCEL_TOKEN=' .env | cut -d= -f2-
   ```

   If not found, stop:
   ```
   Error: VERCEL_TOKEN not found in .env.
   Add it and re-run: /site-deploy platform=vercel
   (Get your token at: vercel.com/account/tokens)
   ```

2. Deploy via Vercel CLI:

   ```bash
   VERCEL_TOKEN=[token] npx vercel --prod --yes --token=[token]
   ```

   Capture stdout for the deployment URL. If the command fails:
   - Print the full error output
   - Offer fallback:
     ```
     Vercel deployment failed. You can try manually:
     1. Install: npm i -g vercel
     2. Run: vercel --prod
     3. Follow the prompts to authenticate and deploy
     ```

3. Extract the `live_url` from the Vercel output (look for the production URL line).

4. Poll for readiness (max 3 minutes, check every 20 seconds):

   ```bash
   curl -s -o /dev/null -w "%{http_code}" [live_url]
   ```

   - `200` → live and responding
   - `404` / `5xx` → still deploying, continue polling
   - After 3 minutes with no `200`: proceed with the URL noted as "may still be propagating"

---

### Phase 2: Final Report

After the live URL is confirmed (or timed out with the best URL available), display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  site-deploy — Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business: [name]
Platform: [Netlify / Vercel]

  Live URL: [url]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SEO Checklist — do this after launch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [ ] Submit sitemap to Google Search Console:
      search.google.com/search-console → Add property → [live URL]
      Sitemaps → Submit: [live URL]/sitemap.xml

  [ ] Verify Google Business Profile is linked to this domain
      (if applicable for local service businesses)

  [ ] Test site speed at: pagespeed.web.dev

  [ ] Verify all pages are indexed:
      Google: site:[live URL]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Recommended Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Share the live URL with the client for review
  2. Set up a custom domain in [Netlify / Vercel] dashboard
  3. Run a Lighthouse audit and address any flags
  4. Add the site to a monitoring service (UptimeRobot, Better Uptime)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Phase 3: Update State

Merge into `.web-studio/state.json`:

```json
{
  "phases": { "deploy": "complete" },
  "live_url": "[live URL]",
  "deploy_platform": "[netlify | vercel]",
  "deployed_at": "[ISO timestamp]"
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Platform not determinable | Stop. Ask user to pass `platform=netlify` or `platform=vercel`. |
| PR not merged (Netlify) | Stop. Tell user to merge the PR first. |
| Netlify not linked to repo | Guide user through `netlify init` or manual connection. STOP. |
| Netlify deploy times out after 5 min | Continue with dashboard URL. Provide manual check instructions. |
| `VERCEL_TOKEN` missing | Stop. Tell user to add it to `.env`. |
| Vercel CLI deploy fails | Print error output. Provide manual deploy instructions. |
| Live URL not responding after poll period | Report URL with note: "may still be propagating — check in 2–3 minutes" |

---

## Tips

- Netlify is zero-config for GitHub repos — the PR merge triggers the deploy automatically via the GitHub integration
- Set up the custom domain in the Netlify/Vercel dashboard after confirming the default URL works
- The SEO checklist in the final report is the minimum required for a service site to start ranking — submit the sitemap immediately
- For Vercel: if you're deploying a Next.js app, Vercel is the preferred platform — it handles ISR, edge functions, and Next.js-specific optimizations automatically
- `VERCEL_TOKEN` should be added to `.env` before running `/web-studio` — the pre-build credential check will catch it if missing
