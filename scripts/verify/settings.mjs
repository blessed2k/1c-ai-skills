// Настройки плагина согласованы: формат описан в settings-format.md скилла setup, setup спрашивает
// каждое поле, скиллы читают свои поля. С аргументами проверяет указанные файлы настроек.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, fail, PLUGIN_DIR } from './lib.mjs';

export const KEYS = ['edit_mode', 'author_marker', 'specs_dir', 'checks', 'dump_path', 'mcp', 'executors'];
const EDIT_MODES = ['listing', 'files'];
const USES = {
  grill: ['dump_path', 'mcp'],
  spec: ['specs_dir', 'dump_path', 'mcp'],
  tickets: ['specs_dir', 'executors'],
  step: ['edit_mode', 'author_marker', 'checks', 'executors', 'specs_dir', 'dump_path', '{dump_path}'],
  setup: KEYS,
};

// Разбор фронтматтера файла настроек: плоские ключи и списки "  - значение".
export function parseSettings(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { errors: ['no frontmatter'] };
  const data = {};
  const errors = [];
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(item[1].trim());
      continue;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) {
      errors.push(`unparsed line: ${line}`);
      continue;
    }
    const [, key, value] = kv;
    if (!KEYS.includes(key)) errors.push(`unknown key ${key}`);
    if (value === '') {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
      listKey = null;
    }
  }
  if ('edit_mode' in data && !EDIT_MODES.includes(data.edit_mode)) errors.push(`edit_mode ${data.edit_mode} not in ${EDIT_MODES}`);
  if ('checks' in data && !Array.isArray(data.checks)) errors.push('checks must be a list');
  return { data, errors };
}

const errors = [];
const files = process.argv.slice(2);

if (files.length) {
  // Контроль: заведомо плохой файл обязан не пройти.
  if (parseSettings('---\nedit_mode: magic\nfoo: 1\n---\n').errors.length < 2) errors.push('control: bad settings accepted');
  for (const f of files) {
    if (!existsSync(f)) {
      errors.push(`${f}: not found`);
      continue;
    }
    const r = parseSettings(readFileSync(f, 'utf8'));
    for (const e of r.errors) errors.push(`${f}: ${e}`);
  }
  fail(errors, 'settings file');
  console.log(`SETTINGS FILE OK (${files.length})`);
  process.exit(0);
}

// Формат живёт внутри плагина, чтобы скиллы видели его после установки.
const FORMAT = `${PLUGIN_DIR}/skills/setup/settings-format.md`;
const doc = existsSync(join(ROOT, FORMAT)) ? read(FORMAT) : '';
if (!doc) errors.push(`${FORMAT} missing`);
const human = existsSync(join(ROOT, 'docs/settings.md')) ? read('docs/settings.md') : '';
if (!human.includes('plugins/1c-dev/skills/setup/settings-format.md')) errors.push('docs/settings.md does not link the format file');
for (const k of KEYS) if (!doc.includes(`\`${k}\``)) errors.push(`format does not document ${k}`);
for (const v of EDIT_MODES) if (!doc.includes(`\`${v}\``)) errors.push(`format does not document edit_mode ${v}`);
for (const p of ['.claude/1c-dev.md', '~/.claude/1c-dev.md', '{dump_path}', '{project_root}', 'Корень проекта']) {
  if (!doc.includes(p)) errors.push(`format lacks ${p}`);
}
const example = doc.match(/```markdown\r?\n(---[\s\S]*?---)[\s\S]*?```/);
if (!example) errors.push('format has no ```markdown example with frontmatter');
else {
  const r = parseSettings(example[1]);
  for (const e of r.errors) errors.push(`example: ${e}`);
  for (const k of KEYS) if (!(k in (r.data || {}))) errors.push(`example lacks ${k}`);
}

for (const [skill, keys] of Object.entries(USES)) {
  const f = `${PLUGIN_DIR}/skills/${skill}/SKILL.md`;
  if (!existsSync(join(ROOT, f))) {
    errors.push(`missing ${f}`);
    continue;
  }
  const text = read(f);
  if (!text.includes('1c-dev.md')) errors.push(`${skill}: does not reference 1c-dev.md`);
  if (skill !== 'setup' && !text.includes('/1c-dev:setup')) errors.push(`${skill}: does not point to /1c-dev:setup`);
  if (skill === 'setup' && !text.includes('settings-format.md')) errors.push('setup: does not load settings-format.md');
  if (skill !== 'setup' && !text.includes('Корень проекта')) errors.push(`${skill}: does not define project root`);
  if (text.includes('docs/settings')) errors.push(`${skill}: references docs outside the plugin`);
  for (const k of keys) if (!text.includes(`\`${k}\``)) errors.push(`${skill}: does not use ${k}`);
}

fail(errors, 'settings');
console.log('SETTINGS CONSISTENT');
