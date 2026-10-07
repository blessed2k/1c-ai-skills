#!/bin/bash
set -e
git init -q .
mkdir -p .claude
cat > .claude/1c-dev.md <<'MD'
---
storage: threadline
---
MD
