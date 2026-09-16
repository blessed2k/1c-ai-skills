// vanessa-pitfalls сохранил ключевые знания и не несёт машинных путей и портов.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, fail, PLUGIN_DIR } from './lib.mjs';

const f = `${PLUGIN_DIR}/skills/vanessa-pitfalls/SKILL.md`;
if (!existsSync(join(ROOT, f))) fail([`missing ${f}`], 'vanessa');
const text = read(f);
const errors = [];

const knowledge = [
  ['BOM у feature-файлов', /BOM/],
  ['$schema в VBParams', /\$schema/],
  ['интервал шага', /ИнтервалВыполненияШага/],
  ['пароль тест-клиента', /\/P\b/],
  ['таймаут запуска', /ТаймаутЗапуска1С/],
  ['кириллица из env', /переменн\S* сред/i],
  ['диалект VA и ADD', /ADD/],
  ['выбор по версии платформы', /8\.5/],
  ['идемпотентные фикстуры', /идемпотент/i],
  ['поиск шагов вместо угадывания', /search_for_steps_by_keywords/],
];
for (const [name, re] of knowledge) if (!re.test(text)) errors.push(`lost: ${name}`);

const machine = [
  ['путь Windows', /[A-Za-z]:\\|\$HOME\\/],
  ['путь домашнего каталога', /\/Users\/|\/home\//],
  ['конкретный порт', /\b(9874|48010)\b/],
  ['Credential Manager', /Credential Manager|CredMan/i],
  ['скрипты запуска', /\.ps1\b/],
];
for (const [name, re] of machine) if (re.test(text)) errors.push(`machine-specific: ${name}`);

fail(errors, 'vanessa');
console.log('VANESSA CONTENT OK');
