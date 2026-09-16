// Ни один публикуемый файл не содержит строк из приватного списка.
// Список лежит вне репозитория: FORBIDDEN_LIST или ~/.config/1c-ai-skills/forbidden.txt.
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { repoFiles, isText, read, fail } from './lib.mjs';

const listPath = process.env.FORBIDDEN_LIST || join(homedir(), '.config', '1c-ai-skills', 'forbidden.txt');
if (!existsSync(listPath)) fail([`list not found: ${listPath}`], 'forbidden');
const terms = readFileSync(listPath, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));
if (terms.length < 5) fail([`list too short (${terms.length})`], 'forbidden');

// Строка с префиксом "=" ищется только целым словом, остальные как подстрока.
const matchers = terms.map((t) => {
  const word = t.startsWith('=');
  const body = (word ? t.slice(1) : t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(word ? `(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])` : body, 'iu');
});
const hits = (text) => terms.filter((t, i) => matchers[i].test(text));

// Контроль: матчер обязан найти каждую строку списка, в том числе в другом регистре.
const control = terms.filter((t, i) => !matchers[i].test(`x ${t.replace(/^=/, '').toLocaleUpperCase('ru')} x`));
// Контроль режима целого слова: внутри другого слова совпадения быть не должно.
if (matchers.some((m, i) => terms[i].startsWith('=') && m.test(`я${terms[i].slice(1)}я`))) fail(['whole-word matcher leaks'], 'forbidden');
if (control.length) fail([`matcher missed control terms: ${control.length}`], 'forbidden');

const files = repoFiles();
if (files.length === 0) fail(['no files to scan'], 'forbidden');
const errors = [];
for (const f of files) {
  const found = new Set(hits(f));
  if (isText(f)) for (const t of hits(read(f))) found.add(t);
  // Сам термин не печатаем: вывод проверки не должен раскрывать список.
  if (found.size) errors.push(`${f}: ${found.size} forbidden term(s), indexes ${[...found].map((t) => terms.indexOf(t) + 1).join(',')}`);
}
fail(errors, 'forbidden');
console.log(`FORBIDDEN CLEAN (${files.length} files, ${terms.length} terms)`);
