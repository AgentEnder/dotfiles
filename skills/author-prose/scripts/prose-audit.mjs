#!/usr/bin/env node
/**
 * Repo-agnostic sweep for the prose habits that mark a document as
 * machine-written.
 *
 * Everything here is deterministic and boring by design. The judgment:
 * whether a repeated heading is redundancy or two pages that legitimately
 * share a section, whether a page is long because it earns it, belongs to
 * whoever reads the report. What a script is better at is remembering to
 * look.
 *
 * Advisory, not a gate. Always exits 0. A finding is a question to answer,
 * not a failure to fix.
 *
 *   node scripts/prose-audit.mjs [paths…] [--json] [--budget=1200]
 *
 * With no paths it walks the working directory for markdown, skipping vendor
 * and build trees. Pass paths (files or dirs) to scope it.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const BUDGET = Number(args.find((a) => a.startsWith('--budget='))?.slice(9) ?? 1200);
const TARGETS = args.filter((a) => !a.startsWith('--'));
const ROOT = process.cwd();

/** Trees that hold code someone else wrote, or output nobody edits by hand. */
const SKIP = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  'target',
  'vendor',
  '.next',
  '.nx',
  'coverage',
  '.venv',
  '__pycache__',
]);

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.claude') continue;
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md') || e.name.endsWith('.mdoc')) out.push(p);
  }
  return out;
}

function collect() {
  if (!TARGETS.length) return walk(ROOT, []);
  const out = [];
  for (const t of TARGETS) {
    const p = resolve(ROOT, t);
    if (!existsSync(p)) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md') || p.endsWith('.mdoc')) out.push(p);
  }
  return out;
}

const rel = (p) => relative(ROOT, p) || p;
/** Strip fenced code so prose checks don't fire on sample output. */
const prose = (text) => text.replace(/```[\s\S]*?```/g, '');

const findings = {};
const add = (key, rows) => {
  if (rows.length) findings[key] = rows;
};

const files = collect().sort();
if (!files.length) {
  console.log('No markdown found. Pass paths explicitly, e.g. `prose-audit.mjs docs README.md`.');
  process.exit(0);
}
const texts = files.map((f) => readFileSync(f, 'utf8'));

// ── Em dashes ─────────────────────────────────────────────────────────────
// Reducible debt, not style. Bracketing pairs are called out separately
// because they are the worst of it: an aside nobody asked for, twice punctuated.
const dashRows = [];
for (const [i, text] of texts.entries()) {
  const p = prose(text);
  const lines = p.split('\n').length;
  const dashes = (p.match(/—/g) || []).length;
  if (!dashes) continue;
  const paired = (p.match(/—[^—\n]{1,80}—/g) || []).length;
  const per100 = ((dashes / lines) * 100).toFixed(0);
  const flag = paired > 0 ? '  ← bracketing pair(s)' : per100 > 4 ? '  ← high' : '';
  dashRows.push(
    `${String(dashes).padStart(3)} dashes  ${String(per100).padStart(2)}/100 lines  ` +
      `${paired} paired  ${rel(files[i])}${flag}`,
  );
}
add(
  'Em dashes (reduce: comma, parens, full stop)',
  dashRows.sort((a, b) => parseInt(b) - parseInt(a)),
);

// ── Paragraphs that open on a code span ───────────────────────────────────
// Prose motivates, then code. A paragraph that opens with `someIdentifier`
// reads like reference material, and they arrive in clusters: one per config
// key, in the order the keys appear in the file.
const openerRows = [];
for (const [i, text] of texts.entries()) {
  const lines = text.split('\n');
  let fenced = false;
  const hits = [];
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    if (line.startsWith('```')) { fenced = !fenced; continue; }
    if (fenced) continue;
    const blankBefore = n === 0 || lines[n - 1].trim() === '';
    if (blankBefore && line.startsWith('`')) hits.push(n + 1);
  }
  if (hits.length) {
    openerRows.push(
      `${String(hits.length).padStart(3)} openers  ${rel(files[i])}  lines ${hits.slice(0, 6).join(', ')}` +
        (hits.length > 6 ? ' …' : ''),
    );
  }
}
add(
  'Paragraphs opening on a code span (motivate in prose first)',
  openerRows.sort((a, b) => parseInt(b) - parseInt(a)),
);

// ── Hard-wrapped prose ────────────────────────────────────────────────────
// One line per paragraph. A paragraph broken across several short lines is a
// hand-wrap, and it survives edits unevenly: a human editor rewrites a
// paragraph and returns it unwrapped, so a file ends up mixed, which reads as
// two authors. Detect a prose line that stops well short of the width its own
// file usually runs to, with more prose directly under it.
const wrapRows = [];
for (const [i, text] of texts.entries()) {
  // Blog content only. READMEs, docs and these skill files are hard-wrapped by
  // convention, and flagging them would drown the useful finding.
  if (!files[i].endsWith('.mdoc')) continue;
  const lines = text.split('\n');
  let fenced = false;
  const hits = [];
  const isProse = (l) =>
    l.trim() !== '' &&
    !l.startsWith('```') &&
    !l.startsWith('|') &&
    !l.startsWith('!') &&
    !l.startsWith('#') &&
    !l.startsWith('>') &&
    !/^\s/.test(l) &&
    !/^[-*+]\s/.test(l) &&
    !/^\d+[.)]\s/.test(l);

  // Skip YAML frontmatter: its keys are long single lines, not wrapped prose.
  let start = 0;
  if (lines[0]?.trim() === '---') {
    const close = lines.indexOf('---', 1);
    if (close > 0) start = close + 1;
  }

  for (let n = start; n < lines.length; n++) {
    const line = lines[n];
    if (line.startsWith('```')) { fenced = !fenced; continue; }
    if (fenced || !isProse(line)) continue;
    const next = lines[n + 1];
    // A wrapped line is short, and the line under it continues the paragraph.
    if (line.length >= 45 && line.length <= 88 && next && isProse(next)) hits.push(n + 1);
  }
  if (hits.length) {
    wrapRows.push(
      `${String(hits.length).padStart(3)} wrapped  ${rel(files[i])}  lines ${hits.slice(0, 6).join(', ')}` +
        (hits.length > 6 ? ' …' : ''),
    );
  }
}
add(
  'Hard-wrapped paragraphs (one line per paragraph)',
  wrapRows.sort((a, b) => parseInt(b) - parseInt(a)),
);

// ── Default-model prose ───────────────────────────────────────────────────
const TICS = [
  'deliberately',
  'precisely',
  'genuinely',
  'exactly the',
  'on purpose',
  'carefully',
  'thoughtfully',
  'it is worth',
  'worth noting',
  'worth knowing',
  'honestly',
];
const BUZZ = [
  'delve',
  'tapestry',
  'paramount',
  'pivotal',
  'leverage',
  'showcase',
  'underscore',
  'seamless',
  'robust',
  'crucial',
  'vital',
  'realm',
  'landscape',
  'crux',
  'load-bearing',
];
// Absolutes about what something cannot do. A model reaches for the strongest
// word available; "not yet" is usually the true claim. See MARKERS.md.
const ABSOLUTES =
  /\b(impossible|cannot ever|will never be|does not have|no way to)\b|\bnever (possible|supported)\b/i;

const formulas = [];
for (const [i, text] of texts.entries()) {
  const p = prose(text);
  const hits = [];

  if (/\bnot (just |merely |only )?\w[^.\n]{0,50}, but\b/i.test(p)) hits.push('"not X, but Y"');

  const tics = TICS.filter((w) => new RegExp(`\\b${w}`, 'i').test(p));
  if (tics.length) hits.push(`editorialising: ${tics.join(', ')}`);

  const buzz = BUZZ.filter((w) => new RegExp(`\\b${w}`, 'i').test(p));
  if (buzz.length) hits.push(`buzzwords: ${buzz.join(', ')}`);

  const trans = (p.match(/^(Moreover|Furthermore|Consequently|Additionally),/gm) || []).length;
  if (trans) hits.push(`forced transitions ×${trans}`);

  const threes = (p.match(/\b\w+, \w+,? and \w+\b/g) || []).length;
  if (threes >= 3) hits.push(`rule-of-three ×${threes}`);

  if (ABSOLUTES.test(p)) hits.push('absolute about a limit: is it "not yet"?');

  // Sentences past ~30 words. Real docs sit at 8–18.
  const long = p
    .replace(/\|.*\|/g, '')
    .replace(/[#>*`[\]()]/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.split(/\s+/).filter(Boolean).length)
    .filter((n) => n > 30).length;
  if (long) hits.push(`sentences >30 words ×${long}`);

  const paras = p.trim().split(/\n\s*\n/);
  const last = (paras[paras.length - 1] || '').trim();
  if (/^(In (short|summary)|Overall|To sum|Taken together|All told|Ultimately)\b/i.test(last)) {
    hits.push('summarising closer');
  }

  if (hits.length) formulas.push(`${rel(files[i])}: ${hits.join('; ')}`);
}
add('Default-model prose (see MARKERS.md)', formulas);

// ── Sections that say too much ────────────────────────────────────────────
// A list whose every item is a bolded sentence followed by a paragraph. The
// giveaway is not the bold: it is that each item grew to a paragraph, so the
// list carries prose it never announced. The fix is almost never to unbullet
// it. It is to find the fact each item exists to state and drop the rest.
const bulky = [];
for (const [i, text] of texts.entries()) {
  const lines = prose(text).split('\n');
  const groups = [];
  let run = [];
  for (const line of lines) {
    if (/^[-*] /.test(line)) run.push(line);
    else if (/^\s+\S/.test(line) && run.length) run[run.length - 1] += ` ${line.trim()}`;
    else if (line.trim() === '' && run.length) continue;
    else {
      if (run.length) groups.push(run);
      run = [];
    }
  }
  if (run.length) groups.push(run);

  for (const g of groups) {
    if (g.length < 3) continue;
    if (!g.every((b) => /^[-*] \*\*/.test(b))) continue;
    const sentences = g.filter((b) => /^[-*] \*\*[^*]*[.:?]\*\*/.test(b)).length;
    const avg = Math.round(g.reduce((n, b) => n + b.split(/\s+/).length, 0) / g.length);
    if (sentences >= Math.ceil(g.length * 0.6) && avg >= 25) {
      bulky.push(`${rel(files[i])}: ${g.length} bullets averaging ${avg} words`);
    }
  }
}
add('Bulleted paragraphs (cut the bullet down, do not unbullet it)', bulky);

// ── One topic, many pages ─────────────────────────────────────────────────
// A heading repeated across files is the cheapest signal that two pages are
// explaining the same thing. Sometimes correct ("Install" on two guides);
// worth reading when the sections beneath say the same words.
const headings = new Map();
for (const [i, text] of texts.entries()) {
  for (const m of text.matchAll(/^#{2,3} (.+)$/gm)) {
    const h = m[1].trim().toLowerCase();
    if (!headings.has(h)) headings.set(h, new Set());
    headings.get(h).add(rel(files[i]).replace(/\.md$/, ''));
  }
}
add(
  'Same heading on multiple pages',
  [...headings.entries()]
    .filter(([, s]) => s.size > 1)
    .map(([h, s]) => `"${h}"  →  ${[...s].join(', ')}`)
    .sort(),
);

// ── Volume ────────────────────────────────────────────────────────────────
// Prose words, not lines. Lines move when a paragraph becomes bullets, which
// is exactly the reformatting that reads as editing and isn't. Measure a file
// before and after a cleanup: under ~10% and you rearranged it.
//
// The budget is a reading budget, not a rule. Generated files and reference
// catalogues legitimately blow past it; pass --budget= to move it.
const volume = files
  .map((p, i) => [rel(p), prose(texts[i]).split(/\s+/).filter(Boolean).length])
  .sort((a, b) => b[1] - a[1]);
// A budget that flags most of the corpus is telling you what kind of corpus it
// is, not which file is bloated. A tree of design notes or reference material
// is long by nature. Past half the files, drop the marker and report the
// numbers alone, which are still what you measure a cut against.
const over = volume.filter(([, n]) => n > BUDGET).length;
const calibrated = over <= files.length / 2;
add(
  calibrated
    ? `Prose words per file (over ${BUDGET} needs a reason)`
    : `Prose words per file (${over}/${files.length} over ${BUDGET}, long-form tree, no flags)`,
  volume
    .slice(0, 10)
    .map(
      ([p, n]) => `${String(n).padStart(5)}  ${p}${calibrated && n > BUDGET ? '  ← over budget' : ''}`,
    ),
);

// ── Report ────────────────────────────────────────────────────────────────
if (JSON_OUT) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const keys = Object.keys(findings);
  if (!keys.length) console.log('No findings.');
  for (const key of keys) {
    console.log(`\n${key.toUpperCase()}  (${findings[key].length})`);
    for (const row of findings[key]) console.log(`  ${row}`);
  }
  console.log(
    `\n${files.length} files swept. Advisory only: verify each finding before acting; ` +
      'see SKILL.md for what is a real defect and what is house style.',
  );
}
