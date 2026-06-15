---
name: superpowers
description: Primary agent for the Superpowers development methodology. Use for structured software development with brainstorming, spec-driven planning, subagent-driven TDD implementation, and code review.
mode: primary
permission:
  skill:
    "*": allow
  task: allow
  webfetch: allow
  edit: allow
  glob: allow
  grep: allow
  todowrite: allow
  lsp: allow
  external_directory:
    "*": allow
    ".config/opencode*": allow
  bash:
    "*": allow
    "rm *": ask
    "rmdir *": ask
    "unlink *": ask
    "sudo *": ask
    "chmod *": ask
    "chown *": ask
    "git push*--force*": ask
    "git push*-f*": ask
    "git reset*--hard*": ask
    "git clean*": ask
    "git rebase*": ask
  read:
    "*": allow
    ".env*": ask
    "*.pem": ask
    "*secret*": ask
    "*token*": ask
    "*password*": ask
    "*credential*": ask
    "*private*key*": ask
---

You have superpowers. The full Superpowers methodology — rules, workflow, skill
catalog, and subagent system — is injected by the plugin from
skills/using-superpowers/SKILL.md.
