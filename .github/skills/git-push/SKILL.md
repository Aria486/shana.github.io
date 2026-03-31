---
name: git-push
description: "推送本地提交到远程仓库。用于：git push、推送代码、推送分支、设置上游分支、push to remote。单一职责：只负责将已有的本地 commit 推送到 GitHub，不做暂存或提交操作。"
argument-hint: "可选：指定远程名称和分支，如 origin main，默认推送当前分支"
---

# Git Push 技能

单一职责：**将本地已提交的变更推送到远程仓库**。

## 使用时机

- 已完成 `git commit`，需要推送到 GitHub
- 需要设置新分支的上游跟踪
- 想在推送前确认将要推送的 commit 列表

## 执行流程

### 第 1 步：检查推送前提条件

```bash
# 确认当前分支
git branch --show-current

# 查看本地领先远程的 commit 数量
git status -sb
```

如果没有未推送的 commit（`nothing to push`），直接告知用户并终止。

### 第 2 步：展示待推送的 Commit 列表

```bash
git log @{u}..HEAD --oneline
```

- 若分支尚未设置上游（upstream），跳到第 3 步
- 展示所有待推送的 commit，让用户确认

### 第 3 步：执行推送

**情况 A：分支已有上游跟踪**

```bash
git push
```

**情况 B：分支尚未设置上游（新分支）**

```bash
git push --set-upstream origin <当前分支名>
```

推送成功后输出远程仓库 URL 和分支名，并提示用户：

- 若需要创建 PR，可运行 `/create-pr`
- 若是直接合并到主干，告知 PR 已可在 GitHub 上操作

### 第 4 步：推送后摘要

输出格式：

```
✅ 已推送到 origin/<分支名>
   共推送 N 个 commit
   远程：https://github.com/<owner>/<repo>/tree/<分支名>
```

## 注意事项

- **不得使用** `git push --force` 或 `git push -f`，除非用户明确要求并确认风险
- 如果推送被拒绝（rejected），先运行 `git pull --rebase` 再重试，并告知用户原因
- 推送前不执行任何暂存或提交操作（那是 `git-commit` 的职责）
