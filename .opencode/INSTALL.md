# Installing Superpowers for OpenCode

## Prerequisites

- [OpenCode](https://opencode.ai) installed

## Installation

First, clone the repository:

```bash
git clone https://github.com/rimesoul/superpowers.opencode.git ~/superpowers.opencode
```

Then choose one of the following methods to register the plugin.

### Method A: opencode.json / opencode.jsonc (recommended)

Add the plugin to your global config (`~/.config/opencode/opencode.json` or `opencode.jsonc`):

```json
{
  "plugin": ["~/superpowers.opencode/.opencode/plugins/superpowers.js"]
}
```

Or to your project config (`<project>/.opencode/opencode.json` or `opencode.jsonc`):

```json
{
  "plugin": ["/absolute/path/to/superpowers.opencode/.opencode/plugins/superpowers.js"]
}
```

### Method B: Symlink

```bash
mkdir -p ~/.config/opencode/plugins
ln -s ~/superpowers.opencode/.opencode/plugins/superpowers.js ~/.config/opencode/plugins/superpowers.js
```

---

Restart OpenCode. The plugin registers all skills and agents automatically.

Verify by switching to the `superpowers` primary agent (Tab) and asking: "What skills are available?"

## Usage

1. Press **Tab** to switch to the `superpowers` primary agent
2. Describe what you want to build — the agent follows the Superpowers methodology
3. Subagents are dispatched automatically as needed
4. Use the default `build` agent for normal development — it's untouched

## Updating

```bash
cd ~/superpowers.opencode
git pull origin main
```

Restart OpenCode to pick up changes.

## Troubleshooting

### Plugin not loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2. Make sure the symlink exists: `ls -la ~/.config/opencode/plugins/superpowers.js`

### Skills not found

1. Use `skill` tool to list available skills
2. Check that the plugin is loading (see above)

### Agents not appearing

Use `skill` tool to list skills — the `superpowers` agent should appear in the Tab rotation.

## Getting Help

- Report issues: https://github.com/rimesoul/superpowers.opencode/issues
