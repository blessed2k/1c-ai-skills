// Справочные скиллы дают измеримую пользу: кейсы из evals-knowledge прогоняются со скиллами и
// без них (claude plugin eval --ablation with-without). Платные прогоны модели, отчёт локальный.
// Условия: ни в одном кейсе со скиллом не хуже, чем без; средний балл со скиллом не ниже 0.8;
// скилл реально вызывается хотя бы в 75% прогонов. Таблица по кейсам печатается всегда.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, fail, PLUGIN_DIR } from './lib.mjs';

const DIR = 'evals-knowledge';
const MIN_CASES = 10;
const evalDir = join(ROOT, PLUGIN_DIR, DIR);
const cases = existsSync(evalDir)
  ? readdirSync(evalDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(evalDir, d.name, 'case.yaml')))
      .map((d) => d.name)
  : [];
if (cases.length < MIN_CASES) fail([`only ${cases.length} knowledge case(s), need ${MIN_CASES}`], 'evals-knowledge');

const work = mkdtempSync(join(tmpdir(), 'evals-knowledge-'));
const out = join(work, 'result.json');
const r = spawnSync(
  'claude',
  [
    'plugin', 'eval', PLUGIN_DIR,
    '--eval-dir', DIR,
    '--runs', process.env.EVAL_RUNS || '2',
    '--ablation', 'with-without',
    '--threshold', '0',
    '-j', '4',
    '--judge-model', process.env.EVAL_JUDGE || 'sonnet',
    '--no-publish',
    '--trust-plugin',
    '--max-cost-usd', process.env.EVAL_MAX_USD || '20',
    '--output-dir', join(work, 'results'),
    '--report', join(work, 'report.html'),
    '--json', out,
  ],
  { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);
if (r.error) fail([`claude not runnable: ${r.error.message}`], 'evals-knowledge');
if (!existsSync(out)) fail([`no JSON result (exit ${r.status})\n${r.stderr.slice(-2000)}`], 'evals-knowledge');

const result = JSON.parse(readFileSync(out, 'utf8'));
const errors = [];
if (result.partial) errors.push(`partial run: ${result.partialReason}`);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
let fired = 0;
let withRuns = 0;
const withScores = [];
const rows = [];
for (const c of result.cases || []) {
  const w = c.arms?.with || [];
  const wo = c.arms?.without || [];
  for (const run of [...w, ...wo]) if (run.error) errors.push(`${c.name}: ${run.error}`);
  for (const run of w) {
    withRuns += 1;
    if ((run.graders || []).some((g) => g.withOnly && g.passed)) fired += 1;
  }
  const sw = mean(w.map((x) => x.score));
  const swo = mean(wo.map((x) => x.score));
  withScores.push(sw);
  rows.push(`${c.name.padEnd(22)} with ${sw.toFixed(2)}  without ${swo.toFixed(2)}  delta ${(sw - swo >= 0 ? '+' : '') + (sw - swo).toFixed(2)}`);
  if (sw < swo) errors.push(`${c.name}: skill makes it worse (${sw.toFixed(2)} < ${swo.toFixed(2)})`);
}
console.log(rows.join('\n'));
const missing = cases.filter((n) => !(result.cases || []).some((c) => c.name === n));
if (missing.length) errors.push(`cases absent from result: ${missing.join(', ')}`);
const firedRate = withRuns ? fired / withRuns : 0;
console.log(`skill fired ${fired}/${withRuns}, mean with ${mean(withScores).toFixed(2)}, cost $${(result.costUsd || 0).toFixed(2)}`);
if (mean(withScores) < 0.8) errors.push(`mean score with skills ${mean(withScores).toFixed(2)} < 0.80`);
if (firedRate < 0.75) errors.push(`skills fired in ${(firedRate * 100).toFixed(0)}% of runs < 75%`);
fail(errors, 'evals-knowledge');
console.log(`KNOWLEDGE EVALS OK (${cases.length} cases)`);
