# Superpowers for OpenCode

An OpenCode-native adaptation of [obra/superpowers](https://github.com/obra/superpowers) —
porting the upstream agent-based software development methodology to OpenCode's
native ecosystem.

Upstream superpowers is a skills + subagents methodology targeting multiple
platforms (Claude Code, Codex, Cursor, Gemini, etc.). This fork strips it down
to **OpenCode-only**, re-implementing it on OpenCode's native agent, permission,
and plugin systems. Global hooks injection is replaced by an on-demand
agent-switching architecture.

## Key Differences from Upstream & Rationale

| Change | Upstream | This Fork | Why |
|--------|----------|-----------|-----|
| **Agent Architecture** | Injects global context into every session via hooks | Defines a standalone `superpowers` primary agent — activate by pressing Tab | OpenCode natively supports agent switching; no need for hooks polluting the global environment; leaves default `build`/`plan` agents untouched |
| **Skills Rewrite** | Written for Claude Code tool names (`Agent`, `TodoWrite`, etc.) | Rewritten for OpenCode-native tools (`task`, `todowrite`, `skill`, etc.) | Eliminates the tool-mapping layer; uses OpenCode's tool API directly, reducing translation errors |
| **Subagent Definitions** | Subagents are ephemeral prompt templates embedded in skill text | Each subagent is a standalone `.opencode/agents/*.md` file with configurable permissions, model, and mode | OpenCode's agent system supports independent configuration (permissions, model), improving security and maintainability |
| **Permission System** | No fine-grained permission control | Carefully configured permission rules for the superpowers primary agent (see below) | OpenCode's native permission system allows precise security boundaries per tool |
| **Loading Mechanism** | Relies on platform-specific hooks/plugin mechanisms | Registers skills and agents automatically via the OpenCode plugin system | Uses the official OpenCode plugin API — simpler deployment, no execution hook dependencies |
| **Platform Stripping** | Supports Claude Code, Codex, Cursor, Gemini, and more | **OpenCode only** — all other platform files removed | Reduces maintenance burden; avoids skill text compromises from multi-platform compatibility |

## Superpowers Primary Agent Permissions

This fork uses a carefully designed permission policy that balances security and efficiency:

| Tool | Default | Restrictions |
|------|---------|--------------|
| `bash` | allow | `rm`/`rmdir`/`unlink` (file deletion), `sudo`/`chmod`/`chown` (privilege changes), `git push --force`/`git reset --hard`/`git clean`/`git rebase` (repo destruction) → **ask** |
| `read` | allow | `.env*`/`*.pem`/files containing `secret`/`token`/`password`/`credential`/`private key` → **ask** |
| `edit` | allow | Protected by `external_directory: ask` for out-of-workspace modifications |
| `external_directory` | **ask** | Any file access outside the workspace requires confirmation |
| `task` | allow | Trusts the agent to dispatch subagents autonomously |
| `webfetch` | allow | Allows autonomous fetching of web resources |
| `glob`/`grep`/`lsp`/`todowrite` | allow | Purely read-only / non-destructive operations |

### Subagent Permissions

| Subagent | edit | bash | Notes |
|----------|------|------|-------|
| `superpowers-implement` | allow | allow | Responsible for implementation; needs full edit and execution access |
| `superpowers-review-spec` | deny | allow (no git push) | Reviews spec compliance only; no code modification |
| `superpowers-review-code` | deny | allow (no git push) | Reviews code quality only; no code modification |

## Agent Architecture

```
superpowers (primary agent)
  │  Loads skills: brainstorming, writing-plans, subagent-driven-development,
  │                executing-plans, test-driven-development, systematic-debugging,
  │                using-git-worktrees, finishing-a-development-branch
  │
  ├─ @superpowers-implement    ── TDD implementation per task
  ├─ @superpowers-review-spec  ── Spec compliance verification
  └─ @superpowers-review-code  ── Code quality review
```

## Deployment

### Option 1: Global Install (Recommended)

Works across all projects — install once, activate on demand.

```bash
# Clone the repository
git clone https://github.com/rimesoul/superpowers.opencode.git ~/superpowers.opencode

# Create plugin directory and symlink
mkdir -p ~/.config/opencode/plugins
ln -s ~/superpowers.opencode/.opencode/plugins/superpowers.js ~/.config/opencode/plugins/superpowers.js

# Restart OpenCode
```

### Option 2: Config File Reference

Add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["/Users/you/superpowers.opencode/.opencode/plugins/superpowers.js"]
}
```

### Option 3: Project-Level Deployment

Copy the `.opencode/agents/` directory and `skills/` directory into your project root,
and register skills in the project's `opencode.json`:

```json
{
  "skills": {
    "paths": ["./skills"]
  }
}
```

### Verify Installation

After restarting OpenCode, press **Tab** — you should see the `superpowers` agent
in the rotation. Switch to it and ask: "What skills are available?"

### Updating

```bash
cd ~/superpowers.opencode
git pull origin main
# Restart OpenCode
```

## Skills

All 14 skills from upstream are included and rewritten for OpenCode:

| Skill | Purpose |
|-------|---------|
| brainstorming | Requirements exploration, design refinement, spec writing |
| writing-plans | Break spec into bite-sized task plans |
| subagent-driven-development | Subagent dispatch per task with review cycle |
| executing-plans | Inline plan execution (no subagents) |
| dispatching-parallel-agents | Parallel independent task dispatch |
| test-driven-development | RED-GREEN-REFACTOR TDD cycle |
| systematic-debugging | 4-phase root cause debugging process |
| verification-before-completion | Self-check before declaring done |
| requesting-code-review | Code review dispatch |
| receiving-code-review | Responding to code review feedback |
| using-git-worktrees | Isolated workspace creation |
| finishing-a-development-branch | Merge/PR decision workflow |
| writing-skills | Creating new skills |
| using-superpowers | Skill system introduction and usage guide |

## Usage

1. Press **Tab** to switch to the `superpowers` primary agent
2. Describe what you want to build
3. The agent loads the `brainstorming` skill → design → spec
4. The agent loads `writing-plans` → task plan
5. The agent dispatches `@superpowers-implement` per task
6. After each task: `@superpowers-review-spec` → `@superpowers-review-code`
7. When done: `finishing-a-development-branch`

## License

MIT License — see [LICENSE](LICENSE)

## Credit

Based on [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent and [Prime Radiant](https://primeradiant.com).
