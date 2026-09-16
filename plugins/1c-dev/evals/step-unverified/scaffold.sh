#!/bin/bash
set -e
mkdir -p docs/specs .claude
cat > .claude/1c-dev.md <<'MD'
---
edit_mode: files
specs_dir: docs/specs
---
MD
cat > docs/specs/demo.md <<'MD'
# Демо: техническая спека

## Решение
Добавить файл с заметкой.

## Шаги

- [ ] 1. Файл docs/note.txt с текстом «готово» · блок: ничем · агент · проверка: по настройкам
MD
