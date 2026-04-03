# 任务清单：在线笔记编辑器（add-online-editor）

> 状态标记：`[ ]` 未开始 / `[~]` 进行中 / `[x]` 已完成

---

## 阶段 0：基础设施准备

- [ ] **T0-1** 在 GitHub 仓库创建 Fine-grained PAT
  - `Contents: Read & Write`（仅限本仓库）
  - 验收：能用 curl 调用 `GET /repos/{owner}/{repo}/contents/` 返回 200
  - _依赖：无_
  - ⚠️ **需手动操作**：前往 https://github.com/settings/tokens?type=beta 创建

- [x] **T0-2** 确认 GitHub Actions 工作流已配置 push-to-main 自动部署
  - 检查 `.github/workflows/` 下是否存在 deploy 工作流
  - 验收：`.github/workflows/actions.yml` 已存在，监听 `vite-react` 分支 push
  - _注：目标分支为 `vite-react`，已在 `github-api.ts` 中正确配置_

---

## 阶段 1：工具函数层（无 React 依赖）

- [x] **T1-1** 创建 `src/utils/github-api.ts`
  - 实现 `fetchFileContent(token, path): Promise<{content: string, sha: string}>`
  - 实现 `commitFile(token, path, content, message, sha?): Promise<void>`
  - 实现 `commitMultipleFiles(token, files[], message): Promise<void>`（基于 Trees API）
  - 实现 `validateFilename(filename): {valid, error?}` 安全校验
  - 实现 `fetchDirectoryStructure(token)` 读取目录结构

- [x] **T1-2** 创建 `src/utils/github-api.test.ts`
  - 覆盖所有函数；45 个新增测试全部通过

- [x] **T1-3** 目录结构 JSON 内存操作工具（已含在 T1-1 中）
  - `addFileToDirectoryStructure(json, category, filename): DirectoryNode[]`
  - `removeFileFromDirectoryStructure(json, category, filename): DirectoryNode[]`

---

## 阶段 2：Hook 层

- [x] **T2-1** 创建 `src/hooks/useEditorAuth.ts`
- [x] **T2-2** 创建 `src/hooks/useEditorAuth.test.ts`
- [x] **T2-3** 创建 `src/hooks/useGithubApi.ts`

---

## 阶段 3：UI 组件层

- [x] **T3-1** 创建 `src/components/EditorAuth/`（PAT 认证表单）
- [x] **T3-2** 创建 `src/components/MarkdownEditor/`（Markdown 编辑器）
- [x] **T3-3** 创建 `src/components/NoteFilePicker/`（笔记文件选择器）
- [x] **T3-4** 创建 `src/components/EditorPage/`（编辑器主页）

---

## 阶段 4：路由注册

- [x] **T4-1** 在 `src/App.tsx` 手工添加 `/editor` 路由

---

## 阶段 5：国际化

- [x] **T5-1** 更新三个语言包（zh-CN、en、ja）添加 `editor.*` namespace 键值

---

## 阶段 6：安全加固

- [x] **T6-1** `validateFilename()` 校验文件名，拒绝路径穿越字符（`..`、`/`、`\`）

---

## 验收结果

- [x] 未输入 PAT 时 `/editor` 路由显示认证表单，不暴露任何编辑功能
- [x] `validateFilename` 拒绝含 `../` 的文件名
- [x] 45 个新增测试全部通过，现有测试无回归
- [x] `npm run lint` 零警告（新增文件全覆盖）
- [ ] PAT 创建和实际端到端流程验证（需手动，需真实 PAT）

> 状态标记：`[ ]` 未开始 / `[~]` 进行中 / `[x]` 已完成

---

## 阶段 0：基础设施准备

- [ ] **T0-1** 在 GitHub 仓库创建 Fine-grained PAT
  - `Contents: Read & Write`（仅限本仓库）
  - 验收：能用 curl 调用 `GET /repos/{owner}/{repo}/contents/` 返回 200
  - _依赖：无_

- [ ] **T0-2** 确认 GitHub Actions 工作流已配置 push-to-main 自动部署
  - 检查 `.github/workflows/` 下是否存在 deploy 工作流
  - 验收：手动 push 一个空提交后 5 分钟内 GitHub Pages 更新
  - _依赖：无_

---

## 阶段 1：工具函数层（无 React 依赖）

- [ ] **T1-1** 创建 `src/utils/github-api.ts`
  - 实现 `fetchFileContent(token, path): Promise<{content: string, sha: string}>`
  - 实现 `commitFile(token, path, content, sha?, message): Promise<void>`（新建/更新）
  - 实现 `deleteFile(token, path, sha, message): Promise<void>`
  - 实现 `commitMultipleFiles(token, files[], message): Promise<void>`（基于 Trees API）
  - 所有 API 调用使用原生 `fetch`，`Authorization: Bearer {token}`
  - 验收：单元测试覆盖各函数，mock `fetch`

- [ ] **T1-2** 创建 `src/utils/github-api.test.ts`
  - 测试 `fetchFileContent` 返回正确解码内容和 SHA
  - 测试 `commitFile` 构造正确的请求体（base64 content、sha）
  - 测试 `commitMultipleFiles` 正确调用 Trees API 三步流程（createTree → createCommit → updateRef）
  - 测试 API 失败时抛出含 HTTP 状态码的错误

- [ ] **T1-3** 更新 `src/utils/note-directory-structure.json` 操作工具（在内存中计算）
  - 在 `src/utils/github-api.ts` 中新增 `addFileToDirectoryStructure(json, category, filename): json`
  - 新增 `removeFileFromDirectoryStructure(json, category, filename): json`
  - 验收：纯函数，不涉及 I/O，单元测试覆盖

---

## 阶段 2：Hook 层

- [ ] **T2-1** 创建 `src/hooks/useEditorAuth.ts`
  - localStorage key: `editor_github_pat`
  - 导出 `{ token, setToken, clearToken, isAuthenticated }`
  - `setToken` 时先调用 GitHub API 验证 Token 有效性（`GET /user`）
  - 验收：hook 测试覆盖 set/clear/验证失败场景

- [ ] **T2-2** 创建 `src/hooks/useEditorAuth.test.ts`
  - 测试 token 存储到 localStorage
  - 测试 token 清除后 isAuthenticated 为 false
  - 测试验证失败时 setToken 抛出错误（mock API 返回 401）

- [ ] **T2-3** 创建 `src/hooks/useGithubApi.ts`
  - 从 `useEditorAuth` 获取 token
  - 封装 `readNote(path)`, `saveNote(path, content, sha?)`, `deleteNote(path, sha)`, `publishNote(category, filename, content)`
  - `publishNote` 内部调用 `commitMultipleFiles`（同时提交笔记文件 + 更新后的 JSON）
  - 导出 `{ readNote, saveNote, deleteNote, publishNote, loading, error }`
  - 验收：hook 测试覆盖各操作的成功和失败路径

---

## 阶段 3：UI 组件层

- [ ] **T3-1** 创建 `src/components/EditorAuth/`（PAT 认证表单）
  - 包含 Token 输入框（密码类型）、验证按钮、帮助文字（含 GitHub PAT 创建链接）
  - 验证中显示 Loading 状态
  - 验证失败显示错误提示
  - 验收：组件测试覆盖提交成功/失败场景

- [ ] **T3-2** 创建 `src/components/MarkdownEditor/`（Markdown 编辑器）
  - 左右分栏：左侧 `<textarea>` 输入，右侧实时渲染（复用现有 Markdown 渲染组件）
  - 工具栏提供常用快捷操作（粗体、斜体、代码块、标题）
  - 组件接受 `value`, `onChange` props
  - 验收：组件测试覆盖输入变化和工具栏操作

- [ ] **T3-3** 创建 `src/components/NoteFilePicker/`（笔记文件选择器）
  - 从 `note-directory-structure.json` 加载目录树
  - 支持按 category 展开/折叠
  - 点击文件项触发 `onSelect(path)` 回调
  - 验收：组件测试覆盖树渲染和选择行为

- [ ] **T3-4** 创建 `src/components/EditorPage/`（编辑器主页）
  - 认证门控：未认证显示 `EditorAuth`，已认证显示编辑器界面
  - 编辑器界面布局：
    - 左侧：`NoteFilePicker` + 新建文件表单
    - 右侧：`MarkdownEditor` + 操作按钮（保存/发布/删除）
  - 操作流程：选择文件 → 加载内容 → 编辑 → 保存/发布
  - 提交成功显示通知（antd `notification`）：提示预计生效时间
  - 验收：集成测试覆盖完整的编辑和保存流程

---

## 阶段 4：路由注册

- [ ] **T4-1** 在 `src/route/index.ts` 手工添加 `/editor` 路由
  - 路由指向 `EditorPage` 组件
  - **不使用**自动路由生成（编辑器不是笔记内容）
  - 验收：访问 `/#/editor` 正确渲染 `EditorPage`

---

## 阶段 5：国际化

- [ ] **T5-1** 在所有语言包文件添加编辑器相关 i18n key
  - 覆盖：认证表单文案、操作按钮、成功/失败提示、帮助文字
  - 需同步更新中文、英文、日文三个语言包
  - 验收：切换语言时编辑器所有文案正确切换

---

## 阶段 6：安全加固

- [ ] **T6-1** 检查编辑器页面中所有用户输入的处理
  - 文件名输入：校验只允许字母、数字、中文、连字符、下划线，防止路径穿越（不允许 `../`）
  - Markdown 内容：渲染时使用现有的净化管道（不引入 XSS 风险）
  - 验收：文件名包含 `../` 时被拒绝

---

## 阶段 7：文档

- [ ] **T7-1** 在项目根目录创建 `EDITOR_USAGE.md`
  - 说明如何创建 GitHub Fine-grained PAT（含截图步骤说明）
  - 说明 Token 权限配置（Contents Read & Write）
  - 说明编辑器使用流程
  - _注：此文件为项目使用文档，不是代码注释_

---

## 关键依赖关系

```
T0-1, T0-2（并行）
  → T1-1 → T1-2（验证）
          → T1-3
  → T2-1 → T2-2（验证）
          → T2-3（依赖 T1-1）
  → T3-1（依赖 T2-1）
  → T3-2（独立）
  → T3-3（独立）
  → T3-4（依赖 T3-1, T3-2, T3-3, T2-3）
  → T4-1（依赖 T3-4）
  → T5-1（依赖 T3-1, T3-4）
  → T6-1（依赖 T3-4）
  → T7-1（可并行于其他阶段）
```

## 可并行执行的工作

- T0-1 和 T0-2 可并行
- T1-1/T1-3 完成后，T2-3、T3-2、T3-3 可并行开发
- T7-1 文档可在任意阶段撰写

## 验收标准（整体）

- [ ] 未输入 PAT 时 `/editor` 路由显示认证表单，不暴露任何编辑功能
- [ ] 使用有效 PAT 可以新建笔记并成功提交到 GitHub
- [ ] 编辑现有笔记并保存后，GitHub 仓库对应文件内容更新
- [ ] 新建笔记后 `note-directory-structure.json` 同步更新
- [ ] GitHub Pages 在 5 分钟内完成重新部署并反映变更
- [ ] 文件名中包含路径穿越字符（`../`）时被前端拒绝
- [ ] `npm run lint` 零警告
- [ ] `npm test` 全部通过
