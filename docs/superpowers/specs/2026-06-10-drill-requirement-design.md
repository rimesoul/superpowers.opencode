# Drill Requirement — Design Spec

## 1. Overview

`drill-requirement` is a skill that helps clarify what the user really needs before
anyone starts designing or building. It does two things:

1. **When the requirement is vague** — ask questions, restate the problem, trace to
   root cause, uncover the real need behind the user's words.
2. **When the scope is large** — research existing solutions, assess whether the gap
   is real, evaluate whether the effort is justified, and produce a structured
   recommendation.

### Core Principles

1. **Root cause first.** "What problem are you trying to solve?" — not "What should
   we build?"
2. **Objective, not agreeable.** Point out contradictions and weaknesses directly.
   Do not flatter the user's idea.
3. **Outside-in.** Look at existing solutions (web, GitHub) before committing to
   building something new.
4. **Right-size the process.** Not every request needs a full report. Many only need
   a few questions.

## 2. When to Use

The skill is useful in two distinct situations:

### Situation A: Vague Requirement

The user's request is vague, contradictory, or not yet thought through — e.g.,
"I want to build a collaboration platform." The agent cannot confidently restate
what problem the user is trying to solve.

→ Start with **Lightweight Drill** (Phase 1–2).

### Situation B: Large Scope / High Investment

The requirement is reasonably clear, but the scope is large — a new system, a major
module, a greenfield project. Getting the target wrong would waste significant effort.
The user may not have researched whether existing solutions already cover the need.

→ Go directly to **Full Drill** (Phase 1, 3–4+Gate). Phase 1 (Restate) is done
once to confirm alignment before investing in research.

### When NOT to Use

- The user is reporting a bug or broken behavior — drill is not needed for fixes
- The request is clear, specific, and small in scope (e.g., "add rate limiting to
  login endpoint, 5 req/min/IP")
- The user already has a detailed spec or design document ready
- The user explicitly says they don't need clarification

In these cases, the skill offers no value and should not be loaded.

## 3. Two-Layer Model

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
  already done during the lightweight drill.
- When entering full drill directly (Situation B), Phase 1 is always performed.
- During lightweight drill, the agent may realize the scope is large and escalate
  to full drill automatically (without asking for permission).

## 4. Lightweight Drill (Phase 1–2)

Used when the requirement is vague. Maximum 10 questions total.

### Phase 1: Restate & Frame

**Goal:** Confirm the agent correctly understands the problem (not the solution).

1. Agent restates in its own words: "Let me make sure I understand — you're dealing
   with [problem], where [context], and you're currently [current state]."
2. User confirms or corrects.
3. Output: verbal alignment. No file written.

### Phase 2: Drill Questions

**Goal:** Uncover the root problem, context, pain level, and scope.

**Constraints:**
- One question at a time
- Maximum 10 questions total (agent stops when it has enough, can be before 10)

**Question direction (guiding principles, not a checklist):**

- "What problem are you running into?" — trace to root cause, not solution shape
- Who is affected? In what scenario/situation?
- What do you do today? (workaround, tolerate it, nothing exists)
- How painful is this? How often? What's the impact?
- Why isn't the current approach sufficient? (5 Whys when appropriate)

**Behavioral rules:**

1. **Offer alternatives if applicable.** If the agent discovers the root problem can
   be solved with existing tools, configuration, or a process change (no new code
   needed), it MUST present that alternative honestly: "It sounds like your real
   problem can be solved by [X] without building anything new. Want to try that
   direction instead?"

2. **Call out contradictions.** If the user's statements conflict with each other
   or with known facts, the agent MUST point this out directly: "You said A, but
   that conflicts with B because [reason]." Do not silently accept.

3. **Auto-escalate to full drill.** When the agent internally determines this is a
   large feature or from-scratch creation, it enters Phase 3 without asking for
   permission. Phase 1 is skipped in this case.

4. **Don't ask classification questions.** "Is this a bug or a feature?" is not
   a useful question. The agent makes judgments internally based on the user's
   answers about their problem.

### End of Lightweight Drill

When enough information is gathered (or 10 questions reached), the lightweight
drill ends. The agent and user have a shared, verbal understanding of the problem.
No file is produced.

If the agent determined during the drill that full assessment is warranted, it
automatically proceeds to Phase 3.

## 5. Full Drill (Phase 1, 3–4 + Gate)

Used either directly (Situation B) or escalated from lightweight drill.

- **Direct entry (Situation B):** Phase 1 (Restate) is performed to confirm alignment.
- **Escalated from lightweight drill:** Phase 1 is skipped (already done).

### Phase 1: Restate & Frame

(Same as lightweight drill Phase 1 — skipped when escalated.)

### Phase 3: External Research

**Goal:** Determine whether the problem has already been solved, and how well.

The agent executes this phase autonomously (no user interaction needed):

| Action | Tool |
|---|---|
| Search for similar products, concepts, blog posts | `webfetch` |
| Search for open-source implementations | GitHub search via web |
| For each finding, record: name, URL, what it does, gap vs. user's need | — |

Search keywords are derived from the Problem Restatement and drill responses.

### Phase 4: Assess & Report

**Goal:** Produce a structured Drill Report, present to user for approval, then
write to disk.

**Report file location:** `docs/superpowers/drills/YYYY-MM-DD-<topic>.md`

*(The directory prefix may vary by project; `docs/superpowers/drills/` is the
default for Superpowers projects.)*

**Report sections (6):**

| # | Section | Content |
|---|---------|---------|
| 1 | **Problem Restatement** | Agent's own words describing the problem (not the solution). Include a record of questions asked and user's answers. |
| 2 | **Context & Current State** | Who is affected, what scenarios, what they do today, how painful, how frequent |
| 3 | **External Landscape** | Research findings. For each: name, link, what it does, difference from user's need |
| 4 | **Gap & Value Analysis** | Can existing solutions cover the need? Is the gap fundamental or superficial? Is it worth filling? |
| 5 | **Balanced Assessment** | MUST include both strengths (why this is worth doing) AND weaknesses/risks (why it might fail or be unnecessary). Contradictions found during drill must be documented here. |
| 6 | **Recommendation** | Go / No-Go / Need More Info, with rationale |

**Presentation flow:**
1. Agent presents the report summary to the user (not the full file)
2. User confirms or requests changes
3. Agent writes the file to the report location

### Gate

| Outcome | Action |
|---|---|
| **Go** | The requirement is clear, the gap is real, it's worth building. Ready for next steps. |
| **No-Go** | The requirement is not worth pursuing. Document the reason. |
| **Need More Info** | Return to Phase 2 for additional drill questions. |

## 6. File Structure

```
skills/
  drill-requirement/
    SKILL.md              # Main skill document

docs/superpowers/
  drills/                 # Output directory for Drill Reports
    YYYY-MM-DD-<topic>.md
```

## 7. Non-Goals

- drill-requirement does NOT produce implementation plans or code.
- drill-requirement does NOT auto-execute — it's always an interactive dialogue
  with the user (except Phase 3 research, which is autonomous).
- drill-requirement does NOT prescribe what happens after it finishes. The caller
  decides whether to proceed to design, implementation, debugging, or end the
  conversation.
