# 安装 Superpowers for OpenCode

## 前置条件

- 已安装 [OpenCode](https://opencode.ai)

## 安装

首先，将仓库克隆到任意目录：

```bash
git clone https://github.com/rimesoul/superpowers.opencode.git /path/to/superpowers.opencode
```

然后选择以下任一方式注册插件。

### 方式 A：opencode.json / opencode.jsonc（推荐）

将插件添加到全局配置（`~/.config/opencode/opencode.json` 或 `opencode.jsonc`）：

```json
{
  "plugin": ["/path/to/superpowers.opencode/.opencode/plugins/superpowers.js"]
}
```

也可添加到项目配置（`<项目>/.opencode/opencode.json` 或 `opencode.jsonc`），路径相同。

### 方式 B：符号链接

```bash
mkdir -p ~/.config/opencode/plugins
ln -s /path/to/superpowers.opencode/.opencode/plugins/superpowers.js ~/.config/opencode/plugins/superpowers.js
```

---

重启 OpenCode。插件会自动注册所有 skills 和 agents。

验证：按 **Tab** 切换到 `superpowers` 主代理，输入 "What skills are available?"。

## 使用

1. 按 **Tab** 切换到 `superpowers` 主代理
2. 描述你想构建的内容 — 代理将遵循 Superpowers 方法论
3. 子代理会根据需要自动派发
4. 日常开发可使用默认的 `build` 代理 — 互不影响

## 更新

```bash
cd /path/to/superpowers.opencode
git pull origin main
```

重启 OpenCode 使更改生效。

## 问题排查

### 插件未加载

1. 检查日志：`opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2. 确认符号链接存在：`ls -la ~/.config/opencode/plugins/superpowers.js`

### Skills 找不到

1. 使用 `skill` 工具列出可用 skills
2. 检查插件是否加载（参见上方）

### Agents 未出现

使用 `skill` 工具列出 skills — `superpowers` 代理应出现在 Tab 切换列表中。

## 获取帮助

- 报告问题：https://github.com/rimesoul/superpowers.opencode/issues
