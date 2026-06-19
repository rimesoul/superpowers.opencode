/**
 * Superpowers plugin for OpenCode
 *
 * Two responsibilities:
 *  1. Register the skills directory (config.skills.paths)
 *  2. Register agents from .opencode/agents/*.md (config.agent[name])
 *     - mode, description, permission from YAML frontmatter (never hardcoded)
 *     - prompt from markdown body (subagents) or skills/using-superpowers/SKILL.md (primary agent)
 *
 * Installation:
 *   1. Clone this repo anywhere
 *   2. Symlink this file to ~/.config/opencode/plugins/superpowers.js
 *      OR add to ~/.config/opencode/opencode.json:
 *        { "plugin": ["/absolute/path/to/superpowers.opencode/.opencode/plugins/superpowers.js"] }
 *   3. Restart OpenCode
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const agentsDir = path.resolve(__dirname, '../agents');

function readMarkdownFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { body: content.trim() };
  return { frontmatter: match[1].trim(), body: match[2].trim() };
}

function parseYaml(yamlStr) {
  const result = {};
  const lines = yamlStr.split('\n');
  const stack = [result];
  const indentStack = [-1];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    const indent = line.search(/\S/);

    while (indent <= indentStack[indentStack.length - 1] && stack.length > 1) {
      stack.pop();
      indentStack.pop();
    }

    const current = stack[stack.length - 1];
    const kvMatch = trimmed.match(/^"?([^":]+)"?\s*:\s*(.+)$/);
    const keyMatch = trimmed.match(/^"?([^":]+)"?\s*:$/);

    if (kvMatch) {
      let val = kvMatch[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      current[kvMatch[1].trim()] = val;
    } else if (keyMatch) {
      const newObj = {};
      current[keyMatch[1].trim()] = newObj;
      stack.push(newObj);
      indentStack.push(indent);
    }
  }

  return result;
}

export const SuperpowersPlugin = async ({ client, directory }) => {
  const superpowersSkillsDir = path.join(repoRoot, 'skills');
  const agentNames = ['superpowers', 'superpowers-implement', 'superpowers-review-spec', 'superpowers-review-code'];

  return {
    config: async (config) => {
      // 1. Register skills path
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }

      // 2. Register agents from markdown
      config.agent = config.agent || {};

      for (const name of agentNames) {
        const md = readMarkdownFile(path.join(agentsDir, `${name}.md`));
        if (!md || !md.frontmatter) continue;

        const fm = parseYaml(md.frontmatter);

        // Prompt: subagents use their own body; primary agent uses SKILL.md content
        let prompt = md.body;
        if (name === 'superpowers') {
          const skillMd = readMarkdownFile(
            path.join(repoRoot, 'skills', 'using-superpowers', 'SKILL.md')
          );
          if (skillMd) prompt = skillMd.body;
        }

        config.agent[name] = {
          mode: fm.mode || 'all',
          description: fm.description || '',
          prompt
        };

        if (fm.permission) {
          config.agent[name].permission = fm.permission;
        }
      }
    }
  };
};
