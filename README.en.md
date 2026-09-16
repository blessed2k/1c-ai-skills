# 1c-ai-skills

[Claude Code](https://claude.com/claude-code) skills for developing on the 1C:Enterprise platform
(BSL, BSP) together with an AI agent. The skills themselves are written in Russian, since that is
the language of the 1C community.

The plugin `1c-dev` turns a task into an agreed decision before any code is written, then does the
work in small verified steps:

| Command | Purpose |
|---|---|
| `/1c-dev:setup` | Interview that writes per-project settings: edit mode, spec folder, check commands |
| `/1c-dev:grill` | Round-by-round interview on the task until you share an understanding; facts are gathered from the configuration dump |
| `/1c-dev:spec` | Turns the discussion into a technical spec: metadata, register movements, extension point, rights, checks |
| `/1c-dev:tickets` | Splits the spec into steps, each leaving the database working, with dependencies and an owner |
| `/1c-dev:step` | Does exactly one unblocked step, verifies it, reports and stops |
| `/1c-dev:vanessa-pitfalls` | Known traps of Vanessa Automation UI tests |

The agent never loads a configuration into a database, updates the database structure, writes
data or touches the configuration repository: it prepares the change and tells you what to run.

## Install

```
/plugin marketplace add blessed2k/1c-ai-skills
/plugin install 1c-dev@1c-ai-skills
```

Then run `/1c-dev:setup` in your project. Settings format: [docs/settings.md](docs/settings.md)
(in Russian).

Other agents that read the open `SKILL.md` format can use the folders under
`plugins/1c-dev/skills/` directly; only Claude Code is tested.

## Credits and license

`grill`, `spec`, `tickets` and `step` are adapted from
[mattpocock/skills](https://github.com/mattpocock/skills) (MIT), see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). This repository is licensed under [MIT](LICENSE).
