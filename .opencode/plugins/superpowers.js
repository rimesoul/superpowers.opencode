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

function readMarkdownBody(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

function readAgentPrompt(filename) {
  return readMarkdownBody(path.join(agentsDir, filename));
}

function readSkillContent(skillName) {
  return readMarkdownBody(path.join(repoRoot, 'skills', skillName, 'SKILL.md'));
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

      // Register agents. Always build the full superpowers prompt from
      // the agent definition and the using-superpowers skill content.
      // The .opencode/agents/superpowers.md file contains only a stub
      // prompt (pointing to the plugin for content). When opencode is
      // launched inside this repo, it auto-discovers that file and
      // registers the agent with the stub prompt BEFORE this hook runs.
      // We must detect the stub and replace it with the full prompt.
      config.agent = config.agent || {};

      const agentBody = readAgentPrompt("superpowers.md");
      const skillBody = readSkillContent("using-superpowers");
      const fullPrompt = [agentBody, skillBody].filter(Boolean).join("\n\n");

      if (!config.agent["superpowers"]) {
        // Fresh registration: no existing superpowers agent
        if (fullPrompt) {
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
            prompt: fullPrompt
          };
        }
      } else if (fullPrompt) {
        // Agent already exists (likely auto-discovered from
        // .opencode/agents/superpowers.md). If its prompt is the
        // stub (short and mentions "injected by the plugin"),
        // replace it with the full methodology content. If the
        // user defined their own superpowers agent with a custom
        // prompt, respect that and leave it alone.
        const existingPrompt = typeof config.agent["superpowers"].prompt === 'string'
          ? config.agent["superpowers"].prompt
          : '';
        const isStub = existingPrompt.length < 200 &&
          existingPrompt.includes("injected by the plugin");

        if (isStub) {
          config.agent["superpowers"].prompt = fullPrompt;
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
