#!/bin/bash
set -e
git init -q .
mkdir -p docs/specs
cat > docs/specs/demo.md <<'MD'
# Демо: техническая спека

## Решение
Добавить файл с заметкой.

## Шаги

- [ ] 1. Файл docs/note.txt с текстом «готово» · блок: ничем · агент · проверка: файл существует
MD
