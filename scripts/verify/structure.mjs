// Состав репозитория: файлы на месте, манифесты согласованы, скиллы оформлены,
// лицензии и README содержат обязательные части.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, frontmatter, fail, SKILLS, PLUGIN_DIR } from './lib.mjs';

const errors = [];
const must = [
  'README.md',
  'README.en.md',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'CHANGELOG.md',
  '.gitignore',
  '.claude-plugin/marketplace.json',
  `${PLUGIN_DIR}/.claude-plugin/plugin.json`,
  'docs/workflow.md',
  'docs/settings.md',
  'docs/requirements.md',
  'docs/specs/v0.1.md',
  `${PLUGIN_DIR}/skills/setup/settings-format.md`,
];
for (const f of must) if (!existsSync(join(ROOT, f))) errors.push(`missing ${f}`);

function json(f) {
  try {
    return JSON.parse(read(f));
  } catch (e) {
    errors.push(`${f}: ${e.message}`);
    return null;
  }
}

const market = existsSync(join(ROOT, '.claude-plugin/marketplace.json')) && json('.claude-plugin/marketplace.json');
if (market) {
  if (market.name !== '1c-ai-skills') errors.push(`marketplace name is ${market.name}`);
  const entry = (market.plugins || []).find((p) => p.name === '1c-dev');
  if (!entry) errors.push('marketplace has no 1c-dev plugin');
  else if (entry.source !== `./${PLUGIN_DIR}`) errors.push(`1c-dev source is ${entry.source}`);
  if ((market.plugins || []).length !== 1) errors.push('marketplace must list exactly one plugin');
}

const pluginPath = `${PLUGIN_DIR}/.claude-plugin/plugin.json`;
const plugin = existsSync(join(ROOT, pluginPath)) && json(pluginPath);
if (plugin) {
  if (plugin.name !== '1c-dev') errors.push(`plugin name is ${plugin.name}`);
  if (plugin.license !== 'MIT') errors.push('plugin license is not MIT');
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version || '')) errors.push('plugin version is not semver');
}

// Локальная установка копирует каталог плагина целиком: отчётам eval там не место.
if (existsSync(join(ROOT, PLUGIN_DIR, 'evals', 'results'))) errors.push('eval results inside plugin dir (they get copied on local install)');
for (const s of SKILLS) {
  const f = `${PLUGIN_DIR}/skills/${s}/SKILL.md`;
  if (!existsSync(join(ROOT, f))) {
    errors.push(`missing ${f}`);
    continue;
  }
  const fm = frontmatter(read(f));
  if (!fm) errors.push(`${f}: no frontmatter`);
  else {
    if (fm.name !== s) errors.push(`${f}: name is ${fm.name}`);
    if (!fm.description || fm.description.length < 40) errors.push(`${f}: description too short`);
  }
}

if (existsSync(join(ROOT, 'LICENSE'))) {
  const lic = read('LICENSE');
  if (!/^MIT License/.test(lic) || !/Copyright \(c\) 2026/.test(lic)) errors.push('LICENSE is not MIT 2026');
}
if (existsSync(join(ROOT, 'THIRD_PARTY_NOTICES.md'))) {
  const n = read('THIRD_PARTY_NOTICES.md');
  for (const need of ['Copyright (c) 2026 Matt Pocock', 'github.com/mattpocock/skills', 'Permission is hereby granted']) {
    if (!n.includes(need)) errors.push(`THIRD_PARTY_NOTICES.md lacks "${need}"`);
  }
}
if (existsSync(join(ROOT, 'README.md'))) {
  const r = read('README.md');
  for (const h of ['## Установка', '## Цикл работы', '## Настройки', '## Требования', '## Лицензия']) {
    if (!r.includes(h)) errors.push(`README.md lacks section ${h}`);
  }
  if (!r.includes('/plugin marketplace add')) errors.push('README.md lacks install command');
  for (const s of SKILLS) if (!r.includes(`1c-dev:${s}`)) errors.push(`README.md does not mention 1c-dev:${s}`);
}
if (existsSync(join(ROOT, 'README.en.md'))) {
  if (!read('README.en.md').includes('/plugin marketplace add')) errors.push('README.en.md lacks install command');
}
if (existsSync(join(ROOT, '.gitignore'))) {
  const g = read('.gitignore');
  for (const need of ['GATES.md', '.unlazy/', 'evals/results/']) if (!g.includes(need)) errors.push(`.gitignore lacks ${need}`);
}

fail(errors, 'structure');
console.log('STRUCTURE OK');
