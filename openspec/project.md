# 项目上下文

## 项目目的

这是一个基于 React 的个人博客和笔记系统，主要用于：

- 展示和管理个人技术笔记、学习笔记
- 支持多语言切换（中文、英文、日文）
- 提供笔记列表、详情展示、全局搜索等功能
- 支持 Markdown 格式的笔记内容渲染
- 支持 PDF 文件在线预览
- 提供主题切换功能（明暗主题）

## 技术栈

### 核心框架

- **React 19.1.1** - 前端框架
- **TypeScript 5.9.2** - 类型安全的 JavaScript 超集
- **Vite 7.1.2** - 快速的构建工具和开发服务器
- **React Router 7.8.1** - 路由管理（使用 Hash 路由）

### UI 与样式

- **Ant Design 5.27.0** - UI 组件库
- **SCSS/Sass 1.90.0** - CSS 预处理器
- **classnames** - CSS 类名管理工具

### 国际化

- **i18next 25.3.6** - 国际化框架
- **react-i18next 15.6.1** - React i18n 集成

### Markdown 与代码高亮

- **react-markdown 10.1.0** - Markdown 渲染
- **markdown-to-jsx 7.7.13** - Markdown 转 JSX
- **remark-gfm 4.0.1** - GitHub Flavored Markdown 支持
- **rehype-highlight 7.0.2** - 代码高亮
- **highlight.js 11.11.1** - 语法高亮库
- **prismjs 1.30.0** - 代码语法高亮

### PDF 支持

- **react-pdf 10.1.0** - PDF 查看器组件
- **pdfjs-dist 5.4.54** - PDF.js 库

### 开发工具

- **ESLint 9.33.0** - 代码检查工具
- **Jest 30.1.3** - 测试框架
- **Testing Library** - React 组件测试
- **Chokidar 4.0.3** - 文件监听工具（用于自动路由生成）

## 项目规范

### 代码风格

- **语言**: TypeScript 优先，严格模式开启
- **组件**: 函数式组件，使用 React Hooks
- **模块系统**: ESNext 模块
- **路径别名**: 使用 `@/*` 指向 `src/*`
- **分号**: 必须使用分号结尾
- **引号**: 优先使用双引号
- **命名规范**:
  - 组件文件：PascalCase (如 `NoteList.tsx`)
  - 工具函数文件：camelCase (如 `helper.ts`)
  - 样式文件：小写 + kebab-case (如 `style.scss`)
  - 常量：UPPER_SNAKE_CASE
- **文件组织**: 每个组件有独立文件夹，包含组件文件、样式文件、测试文件和 index.ts 导出

### 架构模式

- **组件架构**:
  - 使用 Context API 进行全局状态管理（`GlobalDataProvider`）
  - 组件目录结构：每个组件独立文件夹，包含组件、样式、测试、导出文件
- **路由架构**:
  - Hash 路由模式
  - 自动路由生成：监听 `src/note` 目录变化，自动生成路由结构
- **样式架构**:
  - SCSS 模块化
  - 全局样式变量和 mixins（响应式断点等）
  - 主题切换支持
- **多语言架构**:
  - 基于 i18next
  - 语言文件位于 `src/i18n/locales/`
  - 路由集成语言参数 (`/:lang`)

### 测试策略

- **测试框架**: Jest + Testing Library
- **测试环境**: jsdom
- **测试覆盖**:
  - 组件测试（`.test.tsx`）
  - 工具函数测试（`.test.ts`）
- **测试命令**:
  - `npm run test` - 运行测试
  - `npm run test:watch` - 监听模式
  - `npm run test:coverage` - 生成覆盖率报告
- **Mock 策略**:
  - SVG 文件 mock
  - react-pdf 库 mock
  - 样式文件使用 identity-obj-proxy

### Git 工作流

- **仓库**: GitHub - `https://github.com/Aria486/shana.github.io`
- **分支策略**:
  - 主分支：`main` / `master`
  - 功能分支：按功能创建
- **提交规范**: 建议使用语义化提交信息

## 领域知识

### 笔记分类

项目中的笔记按以下类别组织（位于 `src/note/`）：

- `game/` - 游戏相关（如 Blood borne）
- `history/` - 历史笔记
- `novel/` - 小说相关
- `program/` - 编程技术
- `religion/` - 宗教研究
- `study_note/` - 学习笔记
- `tool/` - 工具使用

### 自动路由机制

- 系统会监听 `src/note` 目录
- 文件变化时自动生成 `note-directory-structure.json`
- 支持开发时实时更新和构建时生成
- 使用 Vite 插件集成（`vite-plugin-auto-route.js`）

## 重要约束

- **路由模式**: 必须使用 Hash 路由（GitHub Pages 部署需求）
- **浏览器兼容性**: 现代浏览器（ESNext 目标）
- **构建产物**: 静态文件，部署到 GitHub Pages
- **国际化**: 默认语言为中文，支持中英日三语
- **PDF 渲染**: 依赖 PDF.js worker，需正确配置路径

## 外部依赖

- **GitHub Pages** - 静态网站托管
- **PDF.js** - PDF 渲染引擎
- **Ant Design** - UI 组件库
- **highlight.js / Prism.js** - 代码语法高亮

## 开发命令

- `npm run dev` - 启动开发服务器（包含自动路由监听）
- `npm run build` - 生产构建
- `npm run preview` - 预览构建产物
- `npm run lint` - 代码检查
- `npm run lint:fix` - 自动修复代码问题
- `npm run test` - 运行测试
- `npm run generate-routes` - 手动生成路由
- `npm run watch-routes` - 独立监听路由变化
