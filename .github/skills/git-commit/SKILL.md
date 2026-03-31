---
name: git-commit
description: "提交代码变更。用于：暂存文件、生成规范的 Commit Message、执行 git commit。触发词：commit、提交代码、提交变更、暂存、stage、git commit。会先运行 lint 和测试检查，再生成中文 Commit Message，最后执行提交。"
argument-hint: "可选：指定要暂存的文件路径，或留空暂存全部变更"
---

# Git Commit 技能

单一职责：**将当前变更暂存并提交**，生成符合项目规范的 Commit Message。

## 使用时机

- 完成一个功能或修复，需要提交代码
- 需要生成规范的 Commit Message，而不是手写
- 想在提交前自动运行 lint / 测试检查

## 执行流程

### 第 1 步：查看变更状态

运行以下命令了解当前改动：

```bash
git status
git diff --stat
```

列出所有已修改、已删除、新增的文件，告知用户本次变更范围。

### 第 2 步：确认暂存范围

- 如果用户在参数中指定了文件路径 → 只暂存指定文件：`git add <path>`
- 如果未指定 → 暂存全部变更：`git add -A`

提示用户已暂存的文件列表（`git diff --cached --stat`）。

### 第 3 步：质量前置检查

按顺序执行，任意一步失败则停止提交并报告错误：

1. **Lint 检查**（零警告标准）：
   ```bash
   npm run lint
   ```
2. **单元测试**：
   ```bash
   npm test -- --passWithNoTests
   ```

> 如果用户明确说"跳过检查"，可越过此步骤，但须在提交信息末尾注明 `[skip-check]`。

### 第 4 步：生成 Commit Message

根据暂存的文件差异（`git diff --cached`）自动推断变更类型，生成符合以下规范的 Commit Message：

**格式**：

```
<type>(<scope>): <中文摘要>

<可选正文：详细说明变更原因和内容>
```

**type 对照表**：

| type       | 适用场景                     |
| ---------- | ---------------------------- |
| `feat`     | 新功能、新页面、新组件       |
| `fix`      | Bug 修复                     |
| `refactor` | 代码重构（不影响功能）       |
| `style`    | 样式调整（CSS/SCSS）         |
| `test`     | 测试文件新增或修改           |
| `docs`     | 文档、README、注释           |
| `chore`    | 构建脚本、依赖更新、配置文件 |
| `i18n`     | 国际化文案新增或修改         |
| `perf`     | 性能优化                     |

**scope** 从变更文件路径推断，例如：

- `src/components/Header/` → `Header`
- `src/hooks/` → `hooks`
- `src/i18n/` → `i18n`
- 多个模块 → 省略 scope

**摘要规则**：

- 使用简体中文
- 动词开头（新增、修复、重构、优化、移除、更新…）
- 不超过 50 个汉字

**示例**：

```
feat(Header): 新增暗黑模式切换按钮

修复移动端菜单遮罩层 z-index 问题，正文区域不再被遮挡。
```

生成后先展示给用户确认，用户可直接回复"确认"或修改内容。

### 第 5 步：执行提交

```bash
git commit -m "<生成的 Commit Message>"
```

提交成功后输出 commit hash 和摘要，并提示用户下一步可运行 `/git-push` 推送到远程。

## 注意事项

- **禁止**在 Commit Message 中使用英文摘要（除代码符号外）
- 如果暂存区为空，终止流程并提示用户先修改文件
- 如果 lint 或测试失败，显示具体错误，**不得强制提交**
