---
name: site-reviewer
description: "Use after site-builder to perform an adversarial quality review of the GitHub PR. Spawns 4 specialist reviewers + a Devil's Advocate, runs a defense round, auto-fixes critical findings, and merges the PR. Called by web-studio coordinator (Phase 5) or standalone."
---

# Site Reviewer

Perform a rigorous, adversarial review of the site-builder PR before it ships. Spawns four specialist reviewers in parallel, then brings in a Devil's Advocate to challenge every finding. Original reviewers respond in a defense round. Only findings that survive both rounds are acted on. Critical findings are auto-fixed before the PR is merged.

## When to Use

- After `site-builder` has opened a GitHub PR
- Invoked automatically by `/web-studio` Phase 5
- Re-reviewing a PR after manual fixes with `pr-url=` to target a specific PR
- Running a standalone quality gate on any site-builder output

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `pr-url` | `auto` | GitHub PR URL to review. `auto` reads from `.web-studio/state.json`. Pass explicitly when reviewing outside web-studio. |
| `auto-fix` | `true` | When `true`, critical surviving findings are auto-fixed before PR approval. Set to `false` to list critical findings without fixing them. |
| `auto-merge` | `true` | When `true`, merge the PR after review completes (no critical findings remaining). Set to `false` to approve but not merge. |

## Invocation

```
/site-reviewer
/site-reviewer pr-url=https://github.com/owner/repo/pull/42
/site-reviewer auto-fix=false
/site-reviewer auto-merge=false
```

---

## Workflow

### Phase 0: Load Context

1. Determine the PR URL:
   - If `pr-url` provided: use it directly
   - If `auto`: read `.web-studio/state.json` → `prUrl` field
   - If neither available: stop with error:
     ```
     Error: No PR URL found.
     Run /site-builder first, or pass pr-url= explicitly.
     ```

2. Read the three context docs:
   - `docs/product-marketing-context.md`
   - `docs/site-plan.md`
   - `docs/design-system.md`

   If any context doc is missing, continue with a note — the reviewer can still assess the code, but may flag inferences as low-confidence.

3. Fetch the PR diff and file list:
   ```bash
   gh pr view [PR_URL] --json title,body,files
   gh pr diff [PR_URL]
   ```

Announce:

```
site-reviewer starting.
PR: [title] — [URL]
Spawning 4 specialist reviewers in parallel...
```

---

### Phase 1: Parallel Review (4 Specialists)

Spawn all four reviewer agents simultaneously with `run_in_background: true`. Provide each agent with:
- Full PR diff
- The three context docs (full text, provided inline)
- Their specific review mandate (below)
- Output format instructions

---

**Reviewer 1: Frontend Specialist**

Review mandate:
- Component structure — are components properly separated, props typed, no monolithic files?
- CSS custom property usage — are all colors/fonts/spacing using `--color-*` and `--font-*` variables from design-system.md, or are there hardcoded hex values?
- Responsive layout — does each page/component have correct mobile breakpoint behavior as specified in design-system.md?
- Tailwind usage — consistent utility class patterns, no conflicting utilities
- Accessibility — `aria-label` / `aria-expanded` / `aria-controls` present on interactive elements; all images have `alt`; focus indicators visible
- Phone numbers — every phone number must be `<a href="tel:...">`, never plain text; flag any violations

Output format:
```
REVIEWER: Frontend Specialist
FINDINGS:
  [CRITICAL|HIGH|MEDIUM|LOW] [file:line if applicable] — [description]
```

---

**Reviewer 2: SEO + Performance**

Review mandate:
- Meta tags — `<title>` and `<meta name="description">` present and populated on every page; match site-plan.md SEO targets within reason
- Open Graph — `og:title`, `og:description`, `og:image`, `og:url` on every page
- LocalBusiness JSON-LD — present on homepage, fields populated (not empty strings)
- Sitemap — `public/sitemap.xml` exists and includes all pages
- Robots.txt — `public/robots.txt` exists, Sitemap directive points to correct URL
- Image optimization — images are WebP or have srcset; no unoptimized large PNGs in the build
- Core Web Vitals — flag obvious LCP risks (unoptimized hero image, render-blocking resources), layout shift risks (images without width/height or aspect-ratio)

Output format:
```
REVIEWER: SEO + Performance
FINDINGS:
  [CRITICAL|HIGH|MEDIUM|LOW] [file:line if applicable] — [description]
```

---

**Reviewer 3: Conversion + Copy Auditor**

Review mandate:
- CTA placement — primary CTA present in Hero, in Irresistible Offer section, and in Final CTA section
- Click-to-call — `<a href="tel:...">` present in Header, Footer, and MobileStickyBar; flag any phone numbers as plain text
- MobileStickyBar — present in Layout, hidden on desktop (`md:hidden`), call + quote buttons functional
- LeadCaptureForm — all required fields present (Name, Phone, Email, Service Type); trust micro-copy present; honeypot field present
- Copy accuracy — compare key copy (H1 headlines, offer text, CTA text) against `docs/site-plan.md` copy brief. Flag major divergences or placeholder text (`[PLACEHOLDER]`, `Lorem ipsum`, `Coming soon`)
- Services — all services listed in `docs/site-plan.md` appear in the Services Grid and have individual service pages

Output format:
```
REVIEWER: Conversion + Copy Auditor
FINDINGS:
  [CRITICAL|HIGH|MEDIUM|LOW] [file:line if applicable] — [description]
```

---

**Reviewer 4: Security + Deploy**

Review mandate:
- Env var handling — no credentials or API keys hardcoded in source files; `.env` is in `.gitignore`
- Form security — LeadCaptureForm honeypot field present; no obvious XSS vectors in form handling
- Supabase RLS (if auth enabled) — check `supabase/migrations/*.sql` for Row Level Security policies; flag if tables are created without RLS enabled
- Deploy config — `netlify.toml` or `vercel.json` present and correctly configured; www-to-non-www redirect present; NODE_VERSION set
- Build output — `npm run build` was confirmed passing (check PR body for build status checkbox)
- Secrets scan — no `BEGIN PRIVATE KEY`, `sk_live_`, `supabase_service_role`, or other secret patterns in committed files

Output format:
```
REVIEWER: Security + Deploy
FINDINGS:
  [CRITICAL|HIGH|MEDIUM|LOW] [file:line if applicable] — [description]
```

---

Wait for all four agents to complete. Collect all findings.

---

### Phase 2: Devil's Advocate

Once all four reviewers have reported, spawn one Devil's Advocate agent (non-background — this is a sequential step).

Provide the agent with:
- All four reviewer reports (full text)
- Full PR diff
- The three context docs

**Devil's Advocate mandate:**

For every finding in every reviewer's report, challenge it with these questions:

1. **Is this actually a problem in context?** (e.g., a "missing aria-label" on a decorative element is not a real finding)
2. **Does this match the spec, or contradict it?** (e.g., if design-system.md specified a hardcoded color for a specific element, that's not a violation)
3. **Is the severity justified given the site type?** (e.g., a MEDIUM "missing FAQ schema" is probably LOW for a portfolio site)
4. **Could this be a false positive from the design-system.md choices?** (e.g., flat design with no box shadows is not an accessibility issue)

For each finding, return one of:
- `OVERRULE` — finding is incorrect or not applicable in context (brief reason)
- `DOWNGRADE` — finding is valid but severity is overstated (proposed new severity + reason)
- `SUSTAIN` — finding is valid and severity is appropriate (no change)

Output format:
```
DEVIL'S ADVOCATE RULINGS:
  [Reviewer name] / [Finding short description]:
    Ruling: OVERRULE | DOWNGRADE | SUSTAIN
    Reason: [one-line explanation]
```

---

### Phase 3: Defense Round

After the Devil's Advocate reports, notify each original reviewer of their challenged findings. Spawn all four reviewers again simultaneously with `run_in_background: true`.

Provide each reviewer with:
- Only their own findings and the Devil's Advocate rulings on those findings
- Instructions: for each challenged finding, respond with one of:
  - `DEFENDED` — finding stands as written, confidence: HIGH/MEDIUM/LOW, brief defense
  - `ADJUSTED` — finding is valid but severity or description is revised (provide revised version)
  - `WITHDRAWN` — finding is acknowledged as incorrect or not applicable

Output format:
```
DEFENSE — [Reviewer name]:
  [Finding]: DEFENDED (HIGH/MEDIUM/LOW) | ADJUSTED | WITHDRAWN
  [Brief defense or revision if applicable]
```

---

### Phase 4: Triage Final Findings

After the defense round, compile the final findings list. Apply this logic:

| DA Ruling | Defense Response | Final Status | Action |
|-----------|-----------------|--------------|--------|
| SUSTAIN | DEFENDED | Active | Include in final report |
| SUSTAIN | ADJUSTED | Active (revised) | Include revised version |
| SUSTAIN | WITHDRAWN | Resolved | Log as withdrawn, not blocking |
| DOWNGRADE | DEFENDED | Active (downgraded severity) | Include with new severity |
| DOWNGRADE | WITHDRAWN | Resolved | Log as withdrawn |
| OVERRULE | — | Resolved | Log as overruled, not blocking |

**Severity → action mapping for active findings:**

| Severity | Action |
|----------|--------|
| CRITICAL | Auto-fix (if `auto-fix=true`) before PR approval. If unfixable, block PR. |
| HIGH | Include in PR comment as recommended fixes — reviewer approves anyway |
| MEDIUM | Include in PR comment as suggestions |
| LOW | Include in PR comment as minor notes |

---

### Phase 5: Auto-Fix Critical Findings

**Skip if `auto-fix=false` or no CRITICAL findings.**

For each CRITICAL finding:

1. Identify the specific file and line from the finding description
2. Apply the fix directly (Edit the file)
3. Commit the fix:
   ```
   fix: [short description of critical finding fixed]
   ```
4. Mark the finding as `RESOLVED` in the final report

If a CRITICAL finding cannot be automatically fixed (e.g., requires a credential, requires manual design decision, or the root cause is unclear):

- Mark it as `BLOCKED — requires manual fix`
- Do NOT proceed to Phase 6 (PR approval)
- Report:
  ```
  BLOCKED: [N] critical finding(s) require manual fixes before this PR can be merged.

  [List each blocked finding with file reference and description]

  Fix these manually, then re-run: /site-reviewer pr-url=[URL]
  ```

---

### Phase 6: Post PR Comment + Merge

**Format the final report** as a GitHub PR comment:

```markdown
## site-reviewer — Review Report

**4 specialists + Devil's Advocate | Defense round complete**

---

### Findings Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | N | N auto-fixed / N resolved / N blocked |
| HIGH | N | Listed as recommended fixes |
| MEDIUM | N | Listed as suggestions |
| LOW | N | Listed as notes |
| Withdrawn/Overruled | N | Not blocking |

---

### Active Findings

#### HIGH — Recommended Fixes
- **[file:line]** — [description] *([Reviewer name])*
- ...

#### MEDIUM — Suggestions
- **[file:line]** — [description] *([Reviewer name])*
- ...

#### LOW — Notes
- **[file:line]** — [description] *([Reviewer name])*
- ...

---

### Critical Findings (Auto-Fixed)
- ✓ **[file]** — [description] — fixed in commit [hash]
- ...

### Resolved (Withdrawn / Overruled)
<details>
<summary>Show [N] resolved findings</summary>

- [Reviewer] / [finding] — WITHDRAWN: [reason]
- [Reviewer] / [finding] — OVERRULED: [reason]
</details>

---

*Generated by /site-reviewer via Claude Code*
```

Post the comment to the PR:

```bash
gh pr comment [PR_URL] --body "[formatted report]"
```

**Approve the PR:**

```bash
gh pr review [PR_URL] --approve --body "Review complete. [N] active findings (see comment). Approved for merge."
```

**Merge the PR (if `auto-merge=true`):**

```bash
gh pr merge [PR_URL] --merge --delete-branch
```

If merge fails, report:
```
PR approved but merge failed. Merge it manually at: [PR_URL]
```

---

### Phase 7: Completion

Update `.web-studio/state.json`:
```json
{
  "phases": { "reviewer": "complete" },
  "reviewSummary": {
    "critical": N,
    "criticalAutoFixed": N,
    "high": N,
    "medium": N,
    "low": N,
    "withdrawn": N,
    "overruled": N,
    "merged": true/false
  }
}
```

Report:
```
site-reviewer complete.
Findings: [N] critical (auto-fixed), [N] high, [N] medium, [N] low
PR: approved + merged → [PR_URL]
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| PR URL not found (no state.json, no pr-url param) | Stop. Report: "No PR URL found. Run /site-builder first, or pass pr-url= explicitly." |
| Reviewer agent fails | Retry once. If still failing, proceed without it — note the gap in the final report. |
| CRITICAL finding cannot be auto-fixed | Mark as BLOCKED. Do not merge. Report with instructions for manual fix. |
| PR comment post fails | Save the report to `.web-studio/review-report.md`, report the gh error, provide instructions to post manually |
| PR merge fails after approval | Report merge failure, provide manual merge URL, do not block further pipeline |
| Context docs missing | Proceed with a note that findings may have lower confidence without spec context |

---

## Tips

- The Devil's Advocate is not optional — it's the mechanism that removes false positives. A finding that can't survive the DA challenge is not worth shipping a fix for.
- `auto-merge=false` is useful when you want to review the PR comment yourself before it goes live
- `auto-fix=false` is useful when you want to see what would be fixed without actually changing code
- Re-running after manual fixes: use `pr-url=` to target the same PR — the reviewer will re-read the current diff
- For update runs: site-reviewer is always invoked — there is no way to skip it on update runs (unlike full builds where `skip-review=true` is available)
