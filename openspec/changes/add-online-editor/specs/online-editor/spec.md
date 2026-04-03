# 在线编辑器规范（新增能力）

本规范定义博客系统中在线笔记编辑功能的行为要求。

## ADDED Requirements

### Requirement: PAT 认证门控

编辑器入口 MUST 要求用户提供有效的 GitHub Fine-grained Personal Access Token（PAT）方可访问编辑功能。

#### Scenario: 未认证用户访问编辑器路由

- **WHEN** 用户访问 `/#/editor`
- **AND** localStorage 中不存在有效的 `editor_github_pat`
- **THEN** 页面 MUST 显示 PAT 输入表单
- **AND** 不得渲染任何文件管理或编辑控件

#### Scenario: 输入有效 PAT 并通过验证

- **WHEN** 用户输入 PAT 并点击确认
- **AND** 使用该 Token 调用 `GET https://api.github.com/user` 返回 200
- **THEN** Token MUST 被存入 localStorage（key: `editor_github_pat`）
- **AND** 页面 MUST 跳转到编辑器主界面

#### Scenario: 输入无效 PAT（验证失败）

- **WHEN** 用户输入 PAT 并点击确认
- **AND** GitHub API 返回 401 或网络错误
- **THEN** 页面 MUST 显示具体错误信息（401: Token 无效；网络错误: 请检查网络连接）
- **AND** localStorage MUST NOT 存储该无效 Token
- **AND** 用户 MUST 可以重新输入

#### Scenario: 已认证用户访问编辑器路由

- **WHEN** 用户访问 `/#/editor`
- **AND** localStorage 中存在 `editor_github_pat`
- **THEN** 页面 MUST 直接显示编辑器主界面（跳过认证表单）

#### Scenario: 清除认证

- **WHEN** 用户点击编辑器界面的"退出登录"按钮
- **THEN** localStorage 中的 `editor_github_pat` MUST 被删除
- **AND** 页面 MUST 重新显示 PAT 输入表单

---

### Requirement: 连接到正确的 GitHub 仓库

编辑器 MUST 将所有 API 操作指向配置好的 GitHub 仓库，且仓库配置 MUST 来自编译时常量，不得由用户输入。

#### Scenario: API 请求目标仓库

- **WHEN** 编辑器调用 GitHub API 进行任何文件操作
- **THEN** 所有请求 MUST 指向 `owner: Aria486`、`repo: shana.github.io`
- **AND** 目标分支 MUST 为 `main`
- **AND** 仓库配置 MUST 定义在源码常量中（而非运行时用户输入）

---

### Requirement: 读取现有笔记内容

编辑器 MUST 能够从 GitHub 仓库读取指定笔记文件的内容。

#### Scenario: 选择并加载笔记文件

- **WHEN** 用户在文件选择器中点击某个笔记
- **THEN** 编辑器 MUST 调用 `GET /repos/{owner}/{repo}/contents/{path}` 获取文件内容
- **AND** API 返回的 Base64 content MUST 被正确解码为 UTF-8 字符串
- **AND** 文件的当前 SHA MUST 被记录（用于后续更新操作）
- **AND** 解码后的内容 MUST 填充到 Markdown 编辑区域

#### Scenario: 读取文件失败

- **WHEN** GitHub API 返回非 200 响应（如 404、401）
- **THEN** 编辑器 MUST 显示错误通知，说明失败原因
- **AND** 编辑区域 MUST 不显示任何内容（不渲染空白或上一篇文件的内容）

---

### Requirement: 保存（更新）现有笔记

编辑器 MUST 支持将已加载笔记的修改内容保存回 GitHub 仓库。

#### Scenario: 保存修改成功

- **WHEN** 用户修改笔记内容并点击"保存"
- **AND** 本次操作仅修改文件内容（不涉及新建或删除）
- **THEN** 编辑器 MUST 调用 `PUT /repos/{owner}/{repo}/contents/{path}`
- **AND** 请求体包含：Base64 编码的新内容、当前文件 SHA、提交信息（格式：`docs: update {filename}`）
- **AND** 成功后显示通知："保存成功，预计 2–5 分钟后生效"
- **AND** 本地存储的文件 SHA MUST 更新为新的 SHA

#### Scenario: 保存时 SHA 冲突（文件已被其他提交修改）

- **WHEN** GitHub API 在更新时返回 409 或 422（SHA 不匹配）
- **THEN** 编辑器 MUST 显示警告："文件已在远端被修改，请重新加载后再保存"
- **AND** 编辑区的当前内容 MUST 保持不变（不覆盖用户的修改）

---

### Requirement: 新建笔记并更新目录结构

编辑器 MUST 支持创建新笔记文件，并在同一次 Git 提交中同步更新 `note-directory-structure.json`。

#### Scenario: 新建笔记并发布

- **WHEN** 用户输入文件名、选择分类、填写内容，点击"发布"
- **THEN** 编辑器 MUST 在内存中计算更新后的 `note-directory-structure.json`
- **AND** 使用 Git Trees API 在一次提交中提交两个文件：`.md` 文件和更新后的 JSON
- **AND** 提交信息格式为：`docs: add note {category}/{filename}`
- **AND** 成功后显示通知："发布成功，新笔记预计 2–5 分钟后出现在列表"

#### Scenario: 文件名校验

- **WHEN** 用户输入文件名
- **THEN** 文件名 MUST 仅允许：字母（a-z, A-Z）、数字（0-9）、中文字符、连字符（-）、下划线（\_）
- **AND** 包含 `../`、`./`、`/` 或其他路径控制字符的文件名 MUST 被拒绝并展示错误信息
- **AND** 空文件名 MUST 被拒绝
- **AND** 与已有文件同名的文件名 MUST 给出警告（允许强制覆盖）

#### Scenario: 新建笔记时文件名重复

- **WHEN** 用户输入的文件名与当前分类下已有笔记同名
- **THEN** 编辑器 MUST 显示警告提示："该文件名已存在，继续操作将覆盖现有笔记"
- **AND** 用户 MUST 主动确认后方可继续提交

---

### Requirement: 删除笔记并更新目录结构

编辑器 MUST 支持删除现有笔记文件，并在同一 Git 提交中同步更新 `note-directory-structure.json`。

#### Scenario: 删除笔记

- **WHEN** 用户在文件选择器中选中笔记并点击"删除"
- **THEN** 见两步操作：弹出确认对话框（展示文件名和路径）→ 用户确认后方可执行
- **AND** 使用 Trees API 在一次提交中同时删除 `.md` 文件并更新 JSON
- **AND** 提交信息格式：`docs: delete note {category}/{filename}`
- **AND** 成功后文件选择器 MUST 从列表中移除该文件

#### Scenario: 取消删除

- **WHEN** 确认对话框显示时，用户点击"取消"
- **THEN** 删除操作 MUST 被中止
- **AND** 文件和目录结构 MUST 保持不变

---

### Requirement: Markdown 实时预览

编辑器 MUST 提供 Markdown 编辑与实时预览的分栏布局。

#### Scenario: 编辑内容时实时更新预览

- **WHEN** 用户在编辑区输入或修改 Markdown 内容
- **THEN** 右侧预览区 MUST 实时渲染最新内容
- **AND** 渲染效果 MUST 与博客正文展示效果一致（使用相同的 Markdown 渲染管道）

#### Scenario: 预览区的安全渲染

- **WHEN** 预览区渲染 Markdown 内容
- **THEN** 渲染过程 MUST 使用现有净化管道
- **AND** MUST NOT 直接使用 `dangerouslySetInnerHTML` 渲染未净化的原始 HTML

---

### Requirement: 操作状态反馈

编辑器 MUST 对所有异步操作提供明确的状态反馈。

#### Scenario: 操作进行中

- **WHEN** 任意 API 操作（读取、保存、发布、删除）正在执行
- **THEN** 对应操作按钮 MUST 显示 Loading 状态并禁用
- **AND** 防止用户重复触发同一操作

#### Scenario: 操作成功

- **WHEN** API 操作返回成功响应
- **THEN** 编辑器 MUST 使用 antd `notification.success` 显示成功消息
- **AND** 消息 MUST 包含预计生效时间提示（"预计 2–5 分钟后生效"）

#### Scenario: 操作失败

- **WHEN** API 操作返回错误响应或网络异常
- **THEN** 编辑器 MUST 使用 antd `notification.error` 显示错误消息
- **AND** 错误消息 MUST 包含 HTTP 状态码（若有）和可读的原因说明
- **AND** 编辑区内容 MUST 不被清空或丢失
