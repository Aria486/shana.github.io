# 路由系统规范

本规范定义博客系统中路由管理、导航和自动路由生成的行为要求。

## Requirements

### Requirement: 使用 Hash 路由模式

系统 MUST 使用 React Router 的 Hash 模式进行路由管理。

#### Scenario: 路由初始化

- **WHEN** 应用启动时
- **THEN** 路由器 MUST 配置为 `HashRouter` 模式
- **AND** 所有路由路径 MUST 以 `#/` 开头（如 `https://example.com/#/note/program`）
- **AND** Hash 模式 MUST 确保静态托管环境（如 GitHub Pages）正常工作

#### Scenario: 路由跳转

- **WHEN** 用户点击链接或通过代码导航
- **THEN** URL 的 hash 部分 MUST 更新（如 `#/note/program/react`）
- **AND** 页面 MUST 不刷新（SPA 单页应用行为）
- **AND** 浏览器历史记录 MUST 正确记录导航

### Requirement: 自动路由生成

系统 MUST 根据笔记目录结构自动生成路由配置。

#### Scenario: 从目录结构生成路由

- **WHEN** 构建系统执行自动路由生成脚本
- **THEN** 脚本 MUST 读取 `note-directory-structure.json`
- **AND** 为每个笔记文件生成一个唯一的路由路径
- **AND** 路由路径格式 MUST 为 `/note/{一级目录}/{子目录}/.../{文件名}`（不含 `.md` 扩展名）
- **AND** 生成的路由配置 MUST 写入 `src/route/note_route.ts` 或类似文件

#### Scenario: 路由配置格式

- **WHEN** 自动生成路由配置时
- **THEN** 配置 MUST 包含：路由路径（`path`）、笔记文件路径（`filePath`）、元信息（分类、标签、修改时间）
- **AND** 配置 MUST 以 TypeScript/JavaScript 对象或数组形式导出
- **AND** 配置 MUST 包含类型定义以支持 TypeScript 类型检查

#### Scenario: 路由更新触发

- **WHEN** 笔记文件增加、删除或移动
- **THEN** 开发者 MUST 重新运行路由生成脚本
- **AND** 路由配置 MUST 更新以反映最新的目录结构
- **AND** 应用 MUST 重新加载以应用新路由

### Requirement: 笔记路径到路由映射

系统 MUST 提供笔记文件路径与路由路径之间的双向映射。

#### Scenario: 文件路径转路由路径

- **WHEN** 系统需要为笔记文件生成访问链接
- **THEN** MUST 将文件路径（如 `note/program/react/hooks.md`）转换为路由路径（`/note/program/react/hooks`）
- **AND** 转换规则 MUST 一致且可预测
- **AND** 特殊字符（如空格、中文）MUST 进行 URL 编码

#### Scenario: 路由路径解析文件路径

- **WHEN** 用户访问笔记详情页面（如 `#/note/program/react/hooks`）
- **THEN** 系统 MUST 根据路由参数解析出文件路径（`note/program/react/hooks.md`）
- **AND** 使用解析后的路径加载对应的 Markdown 文件
- **AND** 如果路径不存在，MUST 显示 404 错误页面

### Requirement: 路由守卫和错误处理

系统 MUST 处理无效路由和访问错误。

#### Scenario: 404 页面

- **WHEN** 用户访问不存在的路由路径
- **THEN** 系统 MUST 显示友好的 404 错误页面
- **AND** 页面 SHOULD 提供返回首页或笔记列表的链接
- **AND** URL MUST 保持不变（显示用户访问的路径）

#### Scenario: 路由参数验证

- **WHEN** 路由包含动态参数（如 `:category/:subcategory/:filename`）
- **THEN** 系统 MUST 验证参数的有效性（如格式、存在性）
- **AND** 无效参数 MUST 触发 404 或错误提示
- **AND** 避免因无效参数导致的应用崩溃

### Requirement: 路由懒加载

路由组件 SHOULD 支持懒加载以优化首屏加载性能。

#### Scenario: 笔记详情页懒加载

- **WHEN** 用户首次访问应用
- **THEN** 笔记详情页组件 SHOULD 仅在用户导航到笔记路由时加载
- **AND** 使用 React 的 `React.lazy()` 和 `Suspense` 实现懒加载
- **AND** 懒加载期间 MUST 显示加载指示器（如 Loading 组件）

#### Scenario: 代码分割

- **WHEN** 构建生产版本
- **THEN** 不同路由的组件 SHOULD 打包到独立的代码块（chunk）
- **AND** 减少主包体积以加快首屏渲染速度

### Requirement: 导航菜单与路由联动

导航菜单 MUST 根据当前路由高亮对应菜单项。

#### Scenario: 高亮当前页面

- **WHEN** 用户在某个笔记分类页面（如 `#/note/program`）
- **THEN** 导航菜单中对应的菜单项 MUST 显示高亮状态（如背景色、文本色变化）
- **AND** 使用 `useLocation` hook 获取当前路由路径
- **AND** 根据路径匹配规则确定高亮项

#### Scenario: 面包屑导航

- **WHEN** 用户在笔记详情页
- **THEN** 页面 SHOULD 显示面包屑导航（如 "首页 > 编程笔记 > React > Hooks"）
- **AND** 面包屑的每一级 MUST 可点击并导航到对应路由
- **AND** 面包屑 MUST 根据当前路由路径动态生成

### Requirement: 路由参数和查询字符串

系统 MUST 支持通过 URL 参数传递和获取状态。

#### Scenario: 分页参数在 URL 中

- **WHEN** 用户切换笔记列表的分页
- **THEN** URL SHOULD 包含当前页码（如 `#/note?page=2`）
- **AND** 用户刷新页面时 MUST 保持在当前页码
- **AND** 使用 `useSearchParams` hook 管理查询参数

#### Scenario: 搜索关键词在 URL 中

- **WHEN** 用户在搜索框输入关键词
- **THEN** URL SHOULD 包含搜索关键词（如 `#/note?q=react`）
- **AND** 用户刷新页面或分享链接时 MUST 保留搜索状态

### Requirement: 路由过渡动画（可选增强）

路由切换 SHOULD 支持平滑的过渡动画。

#### Scenario: 页面切换动画

- **WHEN** 用户从列表页导航到详情页
- **THEN** 页面内容 SHOULD 通过淡入淡出或滑动动画切换
- **AND** 动画 MUST 流畅且不影响性能
- **AND** 使用 CSS 过渡或动画库（如 `react-transition-group`）实现
