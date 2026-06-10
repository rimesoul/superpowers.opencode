# Superpowers for OpenCode (中文)

基于 [obra/superpowers](https://github.com/obra/superpowers) 的 OpenCode 针对性适配版本 —
将上游的 agent-based 软件开发方法论迁移到 OpenCode 原生生态。

上游 superpowers 是一套面向多平台（Claude Code、Codex、Cursor、Gemini 等）的
skills + subagents 方法论。本仓库将其剥离为 **OpenCode-only**，
利用 OpenCode 的原生 agent/permission/plugin 体系重新实现，
去掉全局 hooks 注入，改为按需激活的 agent 架构。

## 与上游的关键差异及改动理由

| 改动 | 上游做法 | 本仓库做法 | 为什么这么改 |
|------|----------|------------|--------------|
| **Agent 架构** | 通过 hooks 向每个 session 注入全局上下文 | 定义独立的 `superpowers` primary agent，按 Tab 切换激活 | OpenCode 原生支持 agent 切换，不需要 hooks 污染全局环境；不影响默认的 `build`/`plan` agent |
| **Skills 重写** | 针对 Claude Code 的工具名（`Agent`、`TodoWrite` 等）编写 | 全部改为 OpenCode 原生工具名（`task`、`todowrite`、`skill` 等） | 消除工具映射层，直接使用 OpenCode tool API，减少转换出错的概率 |
| **Subagents 定义** | 子代理是嵌入在 skill 文本中的临时 prompt 模板 | 每个子代理是独立的 `.opencode/agents/*.md` 文件，支持自定义权限、模型、模式（primary/subagent） | OpenCode 的 agent 系统支持独立配置（权限、模型），安全性和可维护性更好 |
| **权限系统** | 无细粒度权限控制 | 为 superpowers 主代理精心配置了权限规则（见下文） | OpenCode 原生 permission 系统允许精确控制每个工具的安全边界 |
| **加载方式** | 依赖各平台的 hooks/插件机制注入 | 通过 OpenCode plugin 系统自动注册 skills 和 agents | 利用 OpenCode 官方插件 API，部署更简单，无执行钩子依赖 |
| **平台剥离** | 同时支持 Claude Code、Codex、Cursor、Gemini 等多平台 | **仅支持 OpenCode**，删除所有其他平台文件 | 减少维护负担，避免多平台兼容带来的 skill 文本妥协 |

## Superpowers 主代理权限设计

本仓库为 superpowers 主代理精心设计了权限策略，在安全性和效率之间取得平衡：

| 工具 | 默认策略 | 限制规则 |
|------|----------|----------|
| `bash` | allow | `rm`/`rmdir`/`unlink`（删除文件）、`sudo`/`chmod`/`chown`（权限变更）、`git push --force`/`git reset --hard`/`git clean`/`git rebase`（仓库破坏）→ **ask** |
| `read` | allow | `.env*`/`*.pem`/包含 `secret`/`token`/`password`/`credential`/`private key` 的文件 → **ask** |
| `edit` | allow | 由 `external_directory: ask` 保护工作区外文件修改 |
| `external_directory` | **ask** | 任何工作区外的文件访问都需确认 |
| `task` | allow | 信任 agent 自主调度子代理 |
| `webfetch` | allow | 允许自主获取网络资源 |
| `glob`/`grep`/`lsp`/`todowrite` | allow | 纯只读/无破坏性操作 |

### 子代理权限

| 子代理 | edit | bash | 说明 |
|--------|------|------|------|
| `superpowers-implement` | allow | allow | 负责实现，需要完整编辑和执行权限 |
| `superpowers-review-spec` | deny | allow（禁止 git push）| 只审查代码是否符合规格，禁止修改 |
| `superpowers-review-code` | deny | allow（禁止 git push）| 只审查代码质量，禁止修改 |

## Agent 架构

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

## 部署方式

### 方式一：全局安装（推荐）

适用于所有项目，安装一次即可在任何项目中按需激活。

```bash
# 克隆仓库到本地
git clone https://github.com/rimesoul/superpowers.opencode.git ~/superpowers.opencode

# 创建插件目录并建立软链接
mkdir -p ~/.config/opencode/plugins
ln -s ~/superpowers.opencode/.opencode/plugins/superpowers.js ~/.config/opencode/plugins/superpowers.js

# 重启 OpenCode
```

### 方式二：配置文件引用

在 `~/.config/opencode/opencode.json` 中添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["/Users/你的用户名/superpowers.opencode/.opencode/plugins/superpowers.js"]
}
```

### 方式三：项目级部署

将 `.opencode/agents/` 目录和 `skills/` 目录复制到项目根目录，并在项目 `opencode.json` 中注册 skills：

```json
{
  "skills": {
    "paths": ["./skills"]
  }
}
```

### 验证安装

重启 OpenCode 后，按 **Tab** 键应该能看到 `superpowers` 代理出现在切换列表中。切换到 superpowers 代理后输入 `What skills are available?` 确认 skills 已加载。

### 更新

```bash
cd ~/superpowers.opencode
git pull origin main
# 重启 OpenCode
```

## Skills 列表

| Skill | 用途 |
|-------|------|
| brainstorming | 需求探讨、方案设计、spec 编写 |
| writing-plans | 将 spec 拆解为可执行的任务计划 |
| subagent-driven-development | 子代理驱动实现 + review 循环 |
| executing-plans | 内联执行计划（不使用子代理） |
| dispatching-parallel-agents | 并行独立任务分发 |
| test-driven-development | RED-GREEN-REFACTOR TDD 循环 |
| systematic-debugging | 四阶段根因分析调试流程 |
| verification-before-completion | 完成前自检 |
| requesting-code-review | 发起 code review |
| receiving-code-review | 响应 code review 反馈 |
| using-git-worktrees | 隔离工作空间创建 |
| finishing-a-development-branch | 合并/PR 决策流程 |
| writing-skills | 创建新 skill |
| using-superpowers | skill 系统介绍与使用指南 |

## 使用方式

1. 按 **Tab** 切换到 `superpowers` primary agent
2. 描述你想要构建的功能
3. Agent 自动加载 `brainstorming` skill → 设计方案 → 输出 spec
4. Agent 加载 `writing-plans` → 生成任务列表
5. Agent 逐个分发 `@superpowers-implement` 子代理执行任务
6. 每个任务完成后依次经过 `@superpowers-review-spec` → `@superpowers-review-code` 审查
7. 全部完成后进入 `finishing-a-development-branch` 流程

## License

MIT License — 详见 [LICENSE](LICENSE)

## Credit

基于 [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent and [Prime Radiant](https://primeradiant.com).
