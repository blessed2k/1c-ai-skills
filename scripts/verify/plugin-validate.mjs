// Строгая проверка манифестов средствами Claude Code (нужен CLI claude в PATH).
import { spawnSync } from 'node:child_process';
import { ROOT, fail, PLUGIN_DIR } from './lib.mjs';

const errors = [];
for (const target of ['.', PLUGIN_DIR]) {
  const r = spawnSync('claude', ['plugin', 'validate', '--strict', target], { cwd: ROOT, encoding: 'utf8' });
  if (r.error) errors.push(`${target}: ${r.error.message}`);
  else if (r.status !== 0) errors.push(`${target}: exit ${r.status}\n${r.stdout}${r.stderr}`);
}
fail(errors, 'plugin validate');
console.log('PLUGIN VALIDATE OK');
