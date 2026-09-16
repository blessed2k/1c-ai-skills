#!/bin/bash
set -e
git init -q .
mkdir -p docs/specs src/cf .claude
cat > .claude/1c-dev.md <<'MD'
---
edit_mode: files
specs_dir: docs/specs
dump_path: src/cf
checks:
  - test -f {dump_path}/Configuration.xml
---
MD
printf '<?xml version="1.0" encoding="UTF-8"?>\n<MetaDataObject/>\n' > src/cf/Configuration.xml
cat > docs/specs/demo.md <<'MD'
# Демо: техническая спека

## Решение
Добавить файл с заметкой.

## Шаги

- [ ] 1. Файл docs/note.txt с текстом «готово» · блок: ничем · агент · проверка: команды из настроек
MD
