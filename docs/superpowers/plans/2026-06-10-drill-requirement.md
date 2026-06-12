# drill-requirement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `drill-requirement` skill (SKILL.md) and register it in the superpowers agent.

**Architecture:** A single SKILL.md file in `skills/drill-requirement/` following existing skill patterns. The skill is auto-discovered by the plugin. One line addition to `.opencode/agents/superpowers.md` adds it to the agent's key skills list.

**Tech Stack:** Markdown (SKILL.md), YAML (frontmatter)

---

### Task 1: Create the drill-requirement skill

**Files:**
- Create: `skills/drill-requirement/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p skills/drill-requirement
```

- [ ] **Step 2: Write SKILL.md**

Create `skills/drill-requirement/SKILL.md`:

```markdown
---
name: drill-requirement
description: Use when a request is vague, ambiguous, or involves building something new from scratch — before designing a solution, clarify what the user really needs and whether it's worth building
---

# Drill Requirement

## Overview

Before designing or building anything, clarify what the user really needs. This
skill does two things:

1. **When the requirement is vague** — ask questions, restate the problem, trace to
   root cause, uncover the real need behind the user's words.
2. **When the scope is large** — research existing solutions, assess whether the gap
   is real, evaluate whether the effort is justified, and produce a structured
   recommendation.

**Core principle:** Root cause first. "What problem are you trying to solve?" —
not "What should we build?"

## When to Use

### Situation A: Vague Requirement

The user's request is vague, contradictory, or not yet thought through — e.g.,
"I want to build a collaboration platform." You cannot confidently restate what
problem the user is trying to solve.

→ Start with **Lightweight Drill** (Phase 1–2).

### Situation B: Large Scope / High Investment

The requirement is reasonably clear, but the scope is large — a new system, a major
module, a greenfield project. Getting the target wrong would waste significant effort.

→ Go directly to **Full Drill** (Phase 1, 3–4+Gate). Phase 1 (Restate) is done
once to confirm alignment before investing in research.

### When NOT to Use

- The user is reporting a bug or broken behavior — drill is not needed for fixes
- The request is clear, specific, and small in scope (e.g., "add rate limiting to
  login endpoint, 5 req/min/IP")
- The user already has a detailed spec or design document ready
- The user explicitly says they don't need clarification

## Two-Layer Model

```
Situation A: Vague                    Situation B: Large scope
      │                                      │
      ▼                                      ▼
Lightweight Drill (Phase 1–2)          Full Drill
      │                                (Phase 1, 3–4+Gate)
      │                                      │
      ├─ enough info → done                  │
      │   (verbal alignment, no file)        │
      │                                      │
      └─ scope looks large → escalate        │
              │                              │
              └──────────┬───────────────────┘
                         ▼
                  Full Drill cont.
                (Phase 3–4+Gate, skip Phase 1)
```

**Key rules:**

- Lightweight drill and full drill are two independent entry points.
- When escalated from lightweight drill, Phase 1 (Restate) is skipped — it was
  already done.
- When entering full drill directly (Situation B), Phase 1 is always performed.
- During lightweight drill, if scope looks large, escalate to full drill automatically
  (do not ask for permission).

## Lightweight Drill (Phase 1–2)

Used when the requirement is vague. Maximum 10 questions total.

### Phase 1: Restate & Frame

Confirm you correctly understand the problem (not the solution).

1. Restate in your own words: "Let me make sure I understand — you're dealing with
   [problem], where [context], and you're currently [current state]."
2. User confirms or corrects.
3. Output: verbal alignment. No file written.

### Phase 2: Drill Questions

Uncover the root problem, context, pain level, and scope.

**Constraints:**
- One question at a time
- Maximum 10 questions total (stop when you have enough, can be before 10)

**Question direction (guiding principles, not a checklist):**

- "What problem are you running into?" — trace to root cause, not solution shape
- Who is affected? In what scenario/situation?
- What do you do today? (workaround, tolerate it, nothing exists)
- How painful is this? How often? What's the impact?
- Why isn't the current approach sufficient? (5 Whys when appropriate)

**Behavioral rules:**

1. **Offer alternatives if applicable.** If you discover the root problem can be
   solved with existing tools, configuration, or a process change (no new code
   needed), you MUST present that alternative honestly: "It sounds like your real
   problem can be solved by [X] without building anything new. Want to try that
   direction instead?"

2. **Call out contradictions.** If the user's statements conflict with each other
   or with known facts, you MUST point this out directly: "You said A, but that
   conflicts with B because [reason]." Do not silently accept.

3. **Auto-escalate to full drill.** When you internally determine this is a large
   feature or from-scratch creation, enter Phase 3 without asking for permission.
   Phase 1 is skipped in this case.

4. **Don't ask classification questions.** "Is this a bug or a feature?" is not a
   useful question. Make judgments internally based on the user's answers about
   their problem.

### End of Lightweight Drill

When enough information is gathered (or 10 questions reached), the lightweight
drill ends. You and the user have a shared, verbal understanding of the problem.
No file is produced.

If you determined during the drill that full assessment is warranted, automatically
proceed to Phase 3.

## Full Drill (Phase 1, 3–4 + Gate)

Used either directly (Situation B) or escalated from lightweight drill.

- **Direct entry (Situation B):** Phase 1 (Restate) is performed.
- **Escalated from lightweight drill:** Phase 1 is skipped (already done).

### Phase 1: Restate & Frame

Same as lightweight drill Phase 1 — skipped when escalated.

### Phase 3: External Research

Determine whether the problem has already been solved, and how well.

Execute this phase autonomously (no user interaction needed):

| Action | Tool |
|---|---|
| Search for similar products, concepts, blog posts | `webfetch` |
| Search for open-source implementations | GitHub search via web |
| For each finding, record: name, URL, what it does, gap vs. user's need | — |

Derive search keywords from the Problem Restatement and drill responses.

### Phase 4: Assess & Report

Produce a structured Drill Report. Present the summary to the user for approval
before writing the file.

**Report file location:** `docs/superpowers/drills/YYYY-MM-DD-<topic>.md`

**Report sections:**

| # | Section | Content |
|---|---------|---------|
| 1 | **Problem Restatement** | Your own words describing the problem (not the solution). Include a record of questions asked and user's answers. |
| 2 | **Context & Current State** | Who is affected, what scenarios, what they do today, how painful, how frequent |
| 3 | **External Landscape** | Research findings. For each: name, link, what it does, difference from user's need |
| 4 | **Gap & Value Analysis** | Can existing solutions cover the need? Is the gap fundamental or superficial? Is it worth filling? |
| 5 | **Balanced Assessment** | MUST include both strengths (why this is worth doing) AND weaknesses/risks (why it might fail or be unnecessary). Contradictions found during drill must be documented here. |
| 6 | **Recommendation** | Go / No-Go / Need More Info, with rationale |

**Presentation flow:**
1. Present the report summary to the user (not the full file)
2. User confirms or requests changes
3. Write the file to the report location

### Gate

| Outcome | Action |
|---|---|
| **Go** | The requirement is clear, the gap is real, it's worth building. Ready for next steps. |
| **No-Go** | The requirement is not worth pursuing. Document the reason. |
| **Need More Info** | Return to Phase 2 for additional drill questions. |

## After Drill

drill-requirement does NOT prescribe what happens next. It is the caller's
responsibility to decide whether to proceed to design, implementation, debugging,
or end the conversation. When used within Superpowers, the typical next step is
brainstorming — but this skill makes no assumption about its environment.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Jumping to "what should we build?" before understanding the problem | Always restate the problem first. Phase 1 is mandatory. |
| Asking permission to enter full drill | Auto-escalate. The user will object if they disagree. |
| Presenting only the positive case in the report | Section 5 MUST include both strengths and weaknesses. |
| Asking "is this a bug or a feature?" | Judge internally from the user's problem description. |
| Doing research before confirming alignment | Always restate first (Phase 1) before Phase 3. |
| Writing the report file without user approval | Present summary first, get confirmation, then write. |

## Red Flags — STOP and Re-assess

| Thought | Reality |
|---|---|
| "I already understand what they want" | Have you restated it and gotten confirmation? |
| "This is obviously worth building" | Have you checked if something already exists? |
| "The user seems confident, I'll skip drill" | Confident users can have unexamined assumptions. |
| "I'll just add a quick recommendation" | Section 5 requires balanced assessment. Don't short-circuit. |
| "This doesn't need Phase 1, it's clear" | Restating takes 30 seconds and catches expensive misunderstandings. |
```

- [ ] **Step 3: Verify skill directory exists with correct file**

```bash
ls -la skills/drill-requirement/SKILL.md
```

- [ ] **Step 4: Commit**

```bash
git add skills/drill-requirement/SKILL.md
git commit -m "feat: add drill-requirement skill"
```

---

### Task 2: Register skill in superpowers agent

**Files:**
- Modify: `.opencode/agents/superpowers.md`

- [ ] **Step 1: Add drill-requirement to key skills list**

Edit `.opencode/agents/superpowers.md`, add after `systematic-debugging` line (around line 77):

```markdown
- `superpowers/drill-requirement` — When a request is vague, ambiguous, or involves building something new from scratch
```

Context in file:

```markdown
- `superpowers/systematic-debugging` — When debugging complex issues
- `superpowers/drill-requirement` — When a request is vague, ambiguous, or involves building something new from scratch
- `superpowers/verification-before-completion` — Before declaring work complete
```

- [ ] **Step 2: Verify the file looks correct**

```bash
grep -n "drill-requirement" .opencode/agents/superpowers.md
```

- [ ] **Step 3: Commit**

```bash
git add .opencode/agents/superpowers.md
git commit -m "feat: register drill-requirement in superpowers agent"
```
