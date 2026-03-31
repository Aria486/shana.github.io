---
name: create-pr
description: "生成并自动创建 Pull Request。用于：创建 PR、自动提交 PR、写 PR 描述、生成 PR 摘要、pull request、合并请求、自动开 PR。优先使用 GitHub CLI (gh) 直接创建 PR；未安装时生成中文标题和描述模板供手动粘贴，所有内容必须为简体中文。"
argument-hint: "可选：指定目标基础分支，默认为 main"
---

# Create PR 技能

单一职责：**根据当前分支与基础分支的差异，自动生成 PR 内容并尽可能直接用 GitHub CLI 创建 PR**。

## 使用时机

- 推送分支后，需要在 GitHub 创建 Pull Request
- 需要快速生成规范的 PR 标题和描述，而不是手写
- 想基于 commit 记录自动整理变更内容

## 执行流程

### 第 1 步：收集分支信息

```bash
# 当前分支
git branch --show-current

# 确认基础分支（默认 main，用户参数可覆盖）
BASE_BRANCH=${arg:-main}

# 该分支相对基础分支的 commit 列表
git log origin/$BASE_BRANCH..HEAD --oneline

# 变更文件统计
git diff origin/$BASE_BRANCH...HEAD --stat

# 详细 diff（用于推断变更内容，不展示给用户）
git diff origin/$BASE_BRANCH...HEAD --name-only
```

### 第 2 步：生成 PR 标题

规则：

- 必须使用**简体中文**
- 格式：`[type] 简明描述本次变更`（动词开头，不超过 30 字）
- type 与 git-commit 相同（feat / fix / refactor / style / docs / chore / i18n / perf）

示例：

```
[feat] 新增全局搜索功能及高亮展示
[fix] 修复移动端导航栏重叠问题
[refactor] 重构 WeatherBackground 组件为函数式写法
```

### 第 3 步：生成 PR 描述

严格按照以下模板输出，所有内容必须为中文：

```markdown
## 变更概述

<!-- 用 1-3 句话说明本 PR 的目标和背景 -->

## 变更内容

<!-- 基于 commit 列表和 diff 整理，每条对应一个逻辑单元 -->

-
-

## 动机 / 原因

<!-- 说明为什么需要这个改动，解决了什么问题 -->

## 测试说明

<!-- 描述如何验证改动，包括手动测试步骤或自动化测试 -->

- [ ] 已运行 `npm test`，全部通过
- [ ] 已运行 `npm run lint`，无警告
- [ ] 已在本地构建并手动验证

## Breaking Changes

<!-- 如无，填写"无" -->

## 关联 Issue

<!-- Closes #<issue_number> 或 "无" -->
```

根据 diff 内容自动填入「变更概述」、「变更内容」、「动机 / 原因」，测试说明和 Breaking Changes 由用户确认补充。

### 第 4 步：额外检查提示

根据 diff 文件列表，自动检测以下情况并给出提示：

| 检测条件                           | 提示内容                                           |
| ---------------------------------- | -------------------------------------------------- |
| 修改了 `src/i18n/`                 | ⚠️ 请确认所有语言包文件已同步更新                  |
| 新增了页面组件                     | ⚠️ 是否已运行 `npm run generate-routes` 更新路由？ |
| 修改了 `src/interface/`            | ⚠️ 请确认相关组件已适配新类型                      |
| 变更涉及 `dangerouslySetInnerHTML` | 🔴 请确认内容已经过安全净化（XSS 防护）            |

### 第 5 步：自动创建或输出内容

**检测 GitHub CLI 是否可用**：

```bash
which gh && gh auth status
```

#### 情况 A：`gh` 已安装且已登录 → 直接创建 PR

将第 2、3 步生成的标题和描述写入临时文件，然后执行：

```bash
gh pr create \
  --base <BASE_BRANCH> \
  --title "<生成的 PR 标题>" \
  --body-file /tmp/pr-body.md
```

创建成功后输出：

```
✅ PR 已创建：https://github.com/Aria486/shana.github.io/pull/<number>
```

#### 情况 B：`gh` 未安装或未登录 → 输出内容 + 安装引导

将生成的标题和描述以 Markdown 代码块格式展示，同时输出快捷链接：

```
🔗 手动创建 PR：
https://github.com/Aria486/shana.github.io/compare/<BASE_BRANCH>...<当前分支>
```

并提示安装方法：

```
💡 安装 GitHub CLI 后可一键自动创建 PR：
   brew install gh && gh auth login
```

## 注意事项

- **所有输出内容禁止使用英文**（代码符号、命令、文件路径除外）
- 如果当前分支与基础分支没有差异，告知用户无法生成 PR
- 不执行任何 `git push` 操作（那是 `git-push` 的职责）
- 使用 `gh pr create` 时，临时文件用完后立即删除（`rm /tmp/pr-body.md`）
- 若 `gh auth status` 显示未登录，提示用户先运行 `gh auth login`，然后重新运行 `/create-pr`
