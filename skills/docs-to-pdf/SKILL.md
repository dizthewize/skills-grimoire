---
name: docs-to-pdf
description: Convert Markdown documents (briefs, PRDs, tech specs, notes) into cleanly styled temporary PDF copies and optionally email them as attachments via Resend. Use when the user asks to "make PDF copies", "temp PDF copies", "export these docs/briefs to PDF", "PDF and email me these files", or otherwise turn Markdown into shareable PDF attachments.
---

# Docs → PDF (+ optional email)

Converts one or more Markdown files into cleanly styled PDFs (`marked` → HTML → Playwright/Chromium print) and, optionally, emails them as attachments through the Resend API. Output defaults to a throwaway temp dir — nothing is written into the project repo.

## When to use

- "make temp pdf copies of the briefs / PRD / spec and email them to `<addr>`"
- "export these markdown docs to PDF"
- "pdf these and send them to me"

## Requirements (already present in this environment)

- Global `marked` and `playwright` (with Chromium installed).
- `RESEND_API_KEY` in the environment — only needed for the `--email` step.

## Usage

```bash
node ~/.claude/skills/docs-to-pdf/scripts/docs2pdf.js <md-file-or-glob>... [options]
```

| Flag | Purpose |
|------|---------|
| `--email <addr>` | Email the PDFs to this address via Resend (repeatable). Omit to only generate PDFs. |
| `--out <dir>` | Output directory (default: a fresh temp dir, printed on completion). |
| `--prefix <str>` | Prefix prepended to each output filename, e.g. `OmniReach_`. |
| `--subject <str>` | Email subject (default derived). |
| `--from <addr>` | Resend sender (default `onboarding@resend.dev`). |
| `--intro <str>` | Optional intro line for the email body. |

Positional args accept literal file paths (the shell usually expands globs) **or** quoted glob patterns (expanded internally). Only `.md` / `.markdown` / `.mdx` files are processed.

### Examples

Generate only — prints the temp dir + PDF paths:

```bash
node ~/.claude/skills/docs-to-pdf/scripts/docs2pdf.js docs/**/*.md --prefix MyProject_
```

Convert specific docs and email them:

```bash
node ~/.claude/skills/docs-to-pdf/scripts/docs2pdf.js \
  docs/architect-briefs/*.md TECH_SPECS.md \
  --prefix OmniReach_ \
  --email martezpromos@gmail.com \
  --subject "OmniReach — updated docs"
```

## Notes

- **Sender / deliverability:** the default `onboarding@resend.dev` is Resend's shared sender — it delivers reliably only to the Resend **account owner's** address and may land in Promotions/Spam. For other recipients or cleaner deliverability, pass `--from you@your-verified-domain` (domain must be verified in Resend).
- PDFs are A4 with page-number footers; headings, tables, code blocks, and blockquotes are styled for print.
- Output filenames derive from the source basename (`--prefix` optional); no dates are added.
- The script exits non-zero on a failed conversion or a non-2xx Resend response, so failures surface clearly.
