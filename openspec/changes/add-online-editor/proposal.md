# 提案：在线笔记编辑器（方案 A — GitHub API 直写）

## 变更 ID

`add-online-editor`

## 背景与动机

目前笔记的撰写流程是：本地创建 `.md` 文件 → `git push` → GitHub Actions 重新构建 → GitHub Pages 更新。整个流程需要本地开发环境，无法在任何设备的浏览器上随手记录想法。

本提案在**不引入后端服务器**的前提下，通过 GitHub REST API 直接将编辑内容提交到仓库，让 CI/CD 自动触发重新部署，从而实现"在线写笔记"的体验。

## 目标

- 在静态页面中嵌入一个受保护的 `/editor` 路由
- 支持**新建**、**编辑**、**删除**笔记（Markdown 文件）
- 提交成功后自动触发 GitHub Pages 重新部署（利用现有 GitHub Actions）
- 接受 2–5 分钟的部署延迟（这是静态托管的固有限制）

## 非目标

- 不实现多用户权限系统（个人博客场景，单一管理员）
- 不实现离线草稿 / 冲突解决（超出当前范围）
- 不修改现有的笔记渲染或路由生成逻辑

## 核心架构

### 调用链

```
浏览器编辑器
  → GitHub REST API v3（读/写 .md 文件 + 更新 note-directory-structure.json）
    → GitHub Actions 检测到 push 事件
      → 重新构建 & 部署 GitHub Pages
```

### 认证方式

使用 **GitHub Fine-grained Personal Access Token (PAT)**，仅授予当前仓库的 `Contents: Read & Write` 权限。

- PAT **存储在浏览器 localStorage** 中，不硬编码到任何源文件
- 首次使用时通过页面内表单输入并保存
- 可随时由用户清除

> 安全说明：PAT 仅限 repo 写权限，个人博客场景风险可接受。生产级应用应使用 OAuth App，但该方案需要后端回调，超出本提案范围。

### 受影响的文件操作

每次创建或删除笔记时，需要**原子性地**提交两个文件：

1. 笔记 `.md` 文件本身（`src/note/{category}/{filename}.md`）
2. `src/utils/note-directory-structure.json`（重新扫描后的完整结构）

GitHub API 的 Contents API 为单文件操作，多文件原子提交需要使用 **Git Trees API**（低级 API）。我们将使用此方式确保目录结构 JSON 和笔记文件同时提交，避免部署中间状态。

### 路由生成策略

- **编辑现有笔记**：无需重新生成路由（文件路径不变，`note-directory-structure.json` 不变）
- **新建 / 删除笔记**：使用 Trees API 同时提交笔记文件 + 更新后的 `note-directory-structure.json`，GitHub Actions 重建后路由自动更新

## 主要新增模块

| 模块             | 位置                             | 职责                                                       |
| ---------------- | -------------------------------- | ---------------------------------------------------------- |
| `useGithubApi`   | `src/hooks/useGithubApi.ts`      | 封装 GitHub REST API 调用（读取文件、提交文件、Trees API） |
| `useEditorAuth`  | `src/hooks/useEditorAuth.ts`     | PAT 的存取 / 验证逻辑（localStorage）                      |
| `EditorPage`     | `src/components/EditorPage/`     | 编辑器主页面（包含认证门控）                               |
| `MarkdownEditor` | `src/components/MarkdownEditor/` | 左右分栏的 Markdown 编辑 + 实时预览                        |
| `NoteFilePicker` | `src/components/NoteFilePicker/` | 从现有目录结构选择要编辑的笔记                             |
| `github-api.ts`  | `src/utils/github-api.ts`        | 纯函数：构造 GitHub API 请求、计算 base64、生成 Trees      |

## 用户体验流程

### 首次使用（设置 PAT）

1. 用户访问 `/#/editor`
2. 看到 PAT 输入表单（含帮助链接）
3. 输入 Token → 点击验证 → 调用 GitHub API 验证有效性
4. 验证通过后 Token 存入 localStorage，跳转到编辑器主界面

### 新建笔记

1. 选择分类（category）→ 输入文件名 → 在编辑器中写内容
2. 点击"发布"→ 前端更新 `note-directory-structure.json`（在内存中计算新的树结构）
3. 调用 Trees API 一次性提交两个文件
4. 显示"提交成功，预计 X 分钟后生效"的提示

### 编辑现有笔记

1. 在文件选择器中选择笔记
2. 调用 GitHub API 读取文件内容（GET `/repos/{owner}/{repo}/contents/{path}`）
3. 在编辑器中修改
4. 点击"保存"→ 调用 GitHub API 更新文件（需要文件当前 SHA）

### 删除笔记

1. 在文件选择器选中笔记
2. 点击"删除"→ 确认弹窗
3. 调用 Trees API 同时删除 `.md` 文件 + 更新 JSON

## 依赖变更

| 包                             | 说明                                             |
| ------------------------------ | ------------------------------------------------ |
| `@octokit/rest` 或原生 `fetch` | GitHub API 调用；优先使用原生 fetch 避免额外依赖 |

> 结论：**不需要新依赖**。GitHub API 是标准 REST，用原生 `fetch` + `Authorization: Bearer {token}` 即可。

## 约束与风险

| 风险                                 | 缓解措施                                                |
| ------------------------------------ | ------------------------------------------------------- |
| PAT 在 localStorage 中暴露           | 仅限本人使用；HTTPS 传输；PAT 仅有 repo 写权限          |
| GitHub API 速率限制（5000 req/h）    | 博客场景极低频次，影响忽略不计                          |
| 部署延迟（2-5 分钟）                 | UI 明确告知用户，提供预计生效时间提示                   |
| `note-directory-structure.json` 冲突 | Trees API 基于 `main` 分支最新 commit，单用户无并发冲突 |
| 编辑器页面被爬虫发现                 | 路由 guard 要求 PAT 验证，无 PAT 无法操作               |

## 与现有架构的关系

- **不修改**路由自动生成脚本（构建时逻辑保持不变）
- **不修改**现有笔记渲染组件
- **新增**的编辑器路由通过现有路由表手工注册（不走自动生成，因为编辑器本身不是笔记）
- GitHub Actions 工作流**无需修改**（已有 push 触发部署）
