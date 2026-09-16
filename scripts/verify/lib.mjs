// Общие функции проверочных скриптов. Запуск из корня репозитория.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Файлы, которые попадут в публикацию: отслеживаемые и новые, кроме игнорируемых.
export function repoFiles() {
  const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return out.split('\0').filter((f) => f && existsSync(join(ROOT, f)));
}

export function isText(file) {
  return /\.(md|mjs|js|json|ya?ml|txt|feature)$/i.test(file) || !/\.[^/]+$/.test(file);
}

export function read(file) {
  return readFileSync(join(ROOT, file), 'utf8');
}

// Фронтматтер SKILL.md: только плоские ключи "ключ: значение".
export function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return data;
}

export function fail(errors, label) {
  if (errors.length) {
    for (const e of errors) console.error(`FAIL: ${e}`);
    console.error(`${label}: ${errors.length} problem(s)`);
    process.exit(1);
  }
}

export const SKILLS = ['grill', 'spec', 'tickets', 'step', 'vanessa-pitfalls', 'setup', 'bsl-standards', 'bsl-module-skeleton', 'yaxunit-test-skeleton'];
export const PLUGIN_DIR = 'plugins/1c-dev';
