// Поведенческие тест-кейсы плагина проходят. Запускает claude plugin eval: это платные
// прогоны модели на вашей учётной записи, отчёт остаётся локальным.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, fail, PLUGIN_DIR } from './lib.mjs';

const MIN_CASES = 11;
const evalDir = join(ROOT, PLUGIN_DIR, 'evals');
const cases = existsSync(evalDir)
  ? readdirSync(evalDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && ['prompt.md', 'case.yaml'].some((f) => existsSync(join(evalDir, d.name, f))))
      .map((d) => d.name)
  : [];
if (cases.length < MIN_CASES) fail([`only ${cases.length} eval case(s), need ${MIN_CASES}`], 'evals');

// Результаты пишутся во временный каталог: внутри плагина они попали бы в локальную установку.
const work = mkdtempSync(join(tmpdir(), 'evals-'));
const out = join(work, 'result.json');
const r = spawnSync(
  'claude',
  [
    'plugin', 'eval', PLUGIN_DIR,
    '--runs', process.env.EVAL_RUNS || '1',
    '--threshold', '1.0',
    '--ablation', 'none',
    '--no-publish',
    '--trust-plugin',
    '--scaffold',
    '--allow-tools', 'Write', 'Edit', 'Bash',
    '--max-cost-usd', process.env.EVAL_MAX_USD || '10',
    '--output-dir', join(work, 'results'),
    '--report', join(work, 'report.html'),
    '--json', out,
  ],
  { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);
if (r.error) fail([`claude not runnable: ${r.error.message}`], 'evals');
if (r.status !== 0) fail([`eval exit ${r.status}\n${r.stdout.slice(-4000)}${r.stderr.slice(-2000)}`], 'evals');
if (!existsSync(out)) fail(['no JSON result written'], 'evals');
const result = JSON.parse(readFileSync(out, 'utf8'));
const errors = [];
if (result.partial) errors.push(`partial run: ${result.partialReason}`);
const ran = (result.cases || []).map((c) => c.name);
const missing = cases.filter((c) => !ran.includes(c));
if (missing.length) errors.push(`cases absent from result: ${missing.join(', ')}`);
for (const c of result.cases || []) {
  for (const run of c.arms?.with || []) {
    if (run.error) errors.push(`${c.name}: ${run.error}`);
    for (const g of run.graders || []) if (g.scored && !g.passed) errors.push(`${c.name}/${g.name}: ${g.explanation}`);
  }
}
const agg = result.aggregates || {};
if (agg.casesPassed !== agg.casesTotal || agg.casesTotal < MIN_CASES) errors.push(`passed ${agg.casesPassed} of ${agg.casesTotal}`);
fail(errors, 'evals');
console.log(`EVALS OK (${cases.length} cases)`);
