#!/bin/bash
set -e
mkdir -p docs/specs .claude
cat > .claude/1c-dev.md <<'MD'
---
edit_mode: files
specs_dir: docs/specs
---
MD
printf 'один\n' > docs/step1.txt
cat > docs/specs/demo.md <<'MD'
# Демо: техническая спека

## Задача
Две заметки для команды. Доработка без интерфейса: пользователь её не видит.

## Решение
Два текстовых файла в папке docs.

## Шаги

- [x] 1. Файл docs/step1.txt с текстом «один» · блок: ничем · агент · проверка: файл существует (26.11.2026)
- [ ] 2. Файл docs/step2.txt с текстом «два» · блок: 1 · агент · проверка: файл существует
MD
