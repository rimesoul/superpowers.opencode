/**
 * Superpowers plugin for OpenCode
 *
 * Registers skills directory and agents via config hook. No global context
 * injection — the Superpowers workflow is activated by switching to the
 * "superpowers" primary agent.
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

function readAgentPrompt(filename) {
  const filePath = path.join(agentsDir, filename);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

export const SuperpowersPlugin = async ({ client, directory }) => {
  const superpowersSkillsDir = path.join(repoRoot, 'skills');

  return {
    config: async (config) => {
      // Register skills paths
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }

      // Register agents (don't overwrite user-defined agents)
      config.agent = config.agent || {};

      if (!config.agent["superpowers"]) {
        const prompt = readAgentPrompt("superpowers.md");
        if (prompt) {
          config.agent["superpowers"] = {
            mode: "primary",
            description:
              "Primary agent for the Superpowers development methodology. Use for structured software development with brainstorming, spec-driven planning, subagent-driven TDD implementation, and code review.",
            permission: {
              skill: { "*": "allow" },
              task: {
                "*": "deny",
                "superpowers-*": "allow",
                explore: "allow",
                general: "allow"
              },
              webfetch: "ask"
            },
            prompt
          };
        }
      }

      if (!config.agent["superpowers-implement"]) {
        const prompt = readAgentPrompt("superpowers-implement.md");
        if (prompt) {
          config.agent["superpowers-implement"] = {
            mode: "subagent",
            description:
              "Implement a single task from a plan with test-driven development and self-review. Dispatched by the superpowers primary agent per task.",
            permission: {
              edit: "allow",
              bash: "allow",
              webfetch: "allow"
            },
            prompt
          };
        }
      }

      if (!config.agent["superpowers-review-spec"]) {
        const prompt = readAgentPrompt("superpowers-review-spec.md");
        if (prompt) {
          config.agent["superpowers-review-spec"] = {
            mode: "subagent",
            description:
              "Review whether an implementation matches its specification. Checks for missing requirements, extra work, and misunderstandings.",
            permission: {
              edit: "deny",
              bash: {
                "*": "allow",
                "git push*": "deny"
              }
            },
            prompt
          };
        }
      }

      if (!config.agent["superpowers-review-code"]) {
        const prompt = readAgentPrompt("superpowers-review-code.md");
        if (prompt) {
          config.agent["superpowers-review-code"] = {
            mode: "subagent",
            description:
              "Review code quality, architecture, and testing of an implementation. Dispatched AFTER spec compliance review passes.",
            permission: {
              edit: "deny",
              bash: {
                "*": "allow",
                "git push*": "deny"
              }
            },
            prompt
          };
        }
      }
    }
  };
};
