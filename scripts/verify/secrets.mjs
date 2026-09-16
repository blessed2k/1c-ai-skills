// Скан секретов через gitleaks (нужен в PATH) с положительным контролем.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { ROOT, fail } from './lib.mjs';

function scan(path) {
  return spawnSync('gitleaks', ['dir', path, '--no-banner', '--redact', '--exit-code', '3'], { encoding: 'utf8' });
}

// Контроль: gitleaks обязан поймать сгенерированный токен GitHub.
const dir = mkdtempSync(join(tmpdir(), 'leak-control-'));
try {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const token = 'ghp_' + [...randomBytes(36)].map((b) => alphabet[b % alphabet.length]).join('');
  writeFileSync(join(dir, 'config.env'), `GITHUB_TOKEN=${token}\n`);
  const c = scan(dir);
  if (c.error) fail([`gitleaks not runnable: ${c.error.message}`], 'secrets');
  if (c.status !== 3) fail([`control not detected (exit ${c.status})`], 'secrets');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const r = scan(ROOT);
if (r.status !== 0) fail([`gitleaks exit ${r.status}\n${r.stdout}${r.stderr}`], 'secrets');
console.log('SECRETS CLEAN');
