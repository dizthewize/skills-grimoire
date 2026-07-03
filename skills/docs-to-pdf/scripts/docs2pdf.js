#!/usr/bin/env node
/*
 * docs2pdf.js — Convert Markdown files to styled PDFs and (optionally) email them via Resend.
 *
 * Usage:
 *   node docs2pdf.js <md-file-or-glob>... [options]
 *
 * Options:
 *   --email <addr>    Email the generated PDFs to this address via Resend. Repeatable.
 *                     If omitted, PDFs are only generated (paths printed).
 *   --out <dir>       Output directory (default: a fresh temp dir).
 *   --prefix <str>    Prefix prepended to each output PDF filename (e.g. "OmniReach_").
 *   --subject <str>   Email subject (default: derived).
 *   --from <addr>     Resend "from" address (default: "onboarding@resend.dev").
 *   --intro <str>     Optional intro line for the email body.
 *   -h, --help        Show this help.
 *
 * Requires: global `marked` + `playwright` (Chromium installed); RESEND_API_KEY for --email.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseArgs } = require('util');
const { execFileSync, execSync } = require('child_process');

const HELP = `docs2pdf — Markdown -> styled PDFs (+ optional Resend email)

  node docs2pdf.js <md-file-or-glob>... [--email addr] [--out dir]
                   [--prefix str] [--subject str] [--from addr] [--intro str]

  --email is repeatable; omit it to only generate PDFs.`;

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      email: { type: 'string', multiple: true },
      out: { type: 'string' },
      prefix: { type: 'string', default: '' },
      subject: { type: 'string' },
      from: { type: 'string', default: 'onboarding@resend.dev' },
      intro: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
} catch (e) {
  console.error(e.message + '\n\n' + HELP);
  process.exit(2);
}
const { values, positionals } = parsed;
if (values.help || positionals.length === 0) {
  console.log(HELP);
  process.exit(values.help ? 0 : 2);
}
const emails = values.email || [];

// ---- Resolve inputs (shell-expanded paths OR globs) ----------------------
function expand(arg) {
  if (fs.existsSync(arg)) return [arg];
  if (typeof fs.globSync === 'function') {
    try { const m = fs.globSync(arg); if (m.length) return m; } catch {}
  }
  return [];
}
const files = [...new Set(positionals.flatMap(expand))]
  .filter((f) => /\.(md|markdown|mdx)$/i.test(f) && fs.statSync(f).isFile());
if (files.length === 0) {
  console.error('No Markdown files matched: ' + positionals.join(' '));
  process.exit(1);
}

// ---- Resolve global deps -------------------------------------------------
const gRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
let chromium;
try {
  ({ chromium } = require(path.join(gRoot, 'playwright')));
} catch {
  console.error('Cannot load global `playwright`. Install it: npm i -g playwright && npx playwright install chromium');
  process.exit(1);
}
const markedBin = path.join(path.dirname(process.execPath), 'marked');
function mdToHtml(file) {
  const args = ['-i', file, '--gfm'];
  const opts = { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };
  return fs.existsSync(markedBin)
    ? execFileSync(markedBin, args, opts)
    : execFileSync('npx', ['--no-install', 'marked', ...args], opts);
}

// ---- Print CSS -----------------------------------------------------------
const CSS = `
  *{box-sizing:border-box}
  body{font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.55;font-size:11pt}
  h1{font-size:22pt;line-height:1.2;margin:0 0 4pt;border-bottom:2px solid #2563eb;padding-bottom:6pt;color:#0f172a}
  h2{font-size:15pt;margin:20pt 0 6pt;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:3pt}
  h3{font-size:12.5pt;margin:14pt 0 4pt;color:#1e293b}
  h4{font-size:11pt;margin:12pt 0 3pt;color:#334155}
  p{margin:0 0 8pt}
  ul,ol{margin:0 0 8pt;padding-left:20pt}
  li{margin:0 0 3pt}
  a{color:#2563eb;text-decoration:none}
  code{font-family:"SFMono-Regular",Consolas,monospace;background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:9.5pt}
  pre{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10pt;overflow-x:auto;font-size:9pt;line-height:1.4}
  pre code{background:none;padding:0}
  blockquote{margin:0 0 8pt;padding:4pt 12pt;border-left:3px solid #cbd5e1;color:#475569;background:#f8fafc}
  table{border-collapse:collapse;width:100%;margin:8pt 0 12pt;font-size:9.5pt}
  th,td{border:1px solid #cbd5e1;padding:5pt 8pt;text-align:left;vertical-align:top}
  th{background:#f1f5f9;font-weight:600}
  tr:nth-child(even) td{background:#f8fafc}
  hr{border:none;border-top:1px solid #e2e8f0;margin:16pt 0}
  h1,h2,h3,h4{page-break-after:avoid}
  table,pre,blockquote{page-break-inside:avoid}
  img{max-width:100%}`;
const FOOTER =
  '<div style="font-size:8px;width:100%;padding:0 15mm;color:#94a3b8;display:flex;justify-content:space-between">' +
  '<span>PDF export</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>';

(async () => {
  const outDir = values.out || fs.mkdtempSync(path.join(os.tmpdir(), 'docs2pdf-'));
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const produced = [];
  for (const file of files) {
    const body = mdToHtml(file);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
    const name = values.prefix + path.basename(file).replace(/\.(md|markdown|mdx)$/i, '') + '.pdf';
    const out = path.join(outDir, name);
    await page.pdf({
      path: out, format: 'A4', printBackground: true,
      margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
      displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: FOOTER,
    });
    produced.push(out);
    console.log('PDF:', out);
  }
  await browser.close();
  console.log(`\n${produced.length} PDF(s) in ${outDir}`);

  if (emails.length === 0) return;

  // ---- Email via Resend --------------------------------------------------
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.error('\nRESEND_API_KEY not set — skipping email.'); process.exit(1); }
  const attachments = produced.map((p) => ({
    filename: path.basename(p),
    content: fs.readFileSync(p).toString('base64'),
  }));
  const list = produced.map((p) => `<li><code>${path.basename(p)}</code></li>`).join('');
  const html =
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.55">' +
    (values.intro ? `<p>${values.intro}</p>` : '') +
    `<p>Attached: ${produced.length} PDF(s).</p><ul style="padding-left:18px">${list}</ul></div>`;
  const subject = values.subject || `PDF export — ${produced.length} document(s)`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: values.from, to: emails, subject, html, attachments }),
  });
  const text = await res.text();
  console.log(`\nResend HTTP ${res.status}: ${text}`);
  if (!res.ok) process.exit(1);
  console.log(`Emailed to: ${emails.join(', ')}`);
})().catch((e) => { console.error(e); process.exit(1); });
