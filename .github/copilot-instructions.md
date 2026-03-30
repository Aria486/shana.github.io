# Copilot 指令文件

## 全局强制规则（最高优先级）

- 所有输出必须使用 **简体中文（Simplified Chinese）**
- 严禁使用英文作为主要输出语言
- 即使默认环境或上下文为英文，也必须强制使用中文输出
- 本规则优先级高于其他所有说明、上下文和默认行为

---

## PR 相关强制规则（最高优先级）

- 所有 Pull Request 标题必须使用中文
- 所有 Pull Request 描述必须使用中文
- 所有生成的说明内容（包括 summary / description / changes）必须为中文
- 不允许输出英文版本，除非明确要求

---

## 适用范围

本规则适用于：

- 代码生成
- 代码注释
- PR 标题与描述生成
- Commit message 生成

> **AI 阅读指引**
> 本文件分为两大独立部分，请根据任务类型选择对应章节：
>
> - **[SECTION: CODE]** — 代码生成规范，适用于编写、修改、审查代码时
> - **[SECTION: PR]** — Pull Request 规范，适用于生成 PR 标题、描述、Commit 信息时

---

<!-- ============================================================ -->
<!-- SECTION: CODE — 代码生成规范                                   -->
<!-- 适用场景：生成代码、重构、代码审查、回答编码问题                  -->
<!-- ============================================================ -->

# [SECTION: CODE] 代码生成规范

## 项目概述

本项目是一个基于 React 19 + TypeScript 5 的纯前端单页面应用（SPA），部署在 GitHub Pages（`/shana.github.io/`）。
具备自动路由生成、Markdown 渲染、PDF 预览、国际化（i18n）、代码高亮、评论系统等功能。

---

## 技术栈

| 类别          | 库 / 工具                                | 版本        |
| ------------- | ---------------------------------------- | ----------- |
| 框架          | React                                    | ^19.1.1     |
| 语言          | TypeScript                               | ^5.9.2      |
| 构建          | Vite                                     | ^7.1.2      |
| 路由          | react-router-dom                         | ^7.8.1      |
| UI 组件库     | Ant Design (antd)                        | ^6.2.1      |
| 国际化        | i18next + react-i18next                  | ^25 / ^15   |
| Markdown 渲染 | react-markdown + markdown-to-jsx         | ^10 / ^7    |
| Markdown 扩展 | remark-gfm, rehype-highlight, rehype-raw | 最新        |
| 代码高亮      | highlight.js + prismjs                   | ^11 / ^1.30 |
| PDF 预览      | react-pdf + pdfjs-dist                   | ^10 / ^5    |
| 评论系统      | @giscus/react                            | ^3.1.0      |
| 样式          | Sass (.scss)                             | ^1.90.0     |
| SVG 引入      | vite-plugin-svgr                         | ^4.3.0      |
| Markdown 引入 | vite-plugin-markdown                     | ^2.2.0      |
| 测试          | Jest ^30 + React Testing Library ^16     | —           |
| Lint          | ESLint ^9 + TypeScript ESLint ^8         | —           |

---

## 项目结构

```
src/
├── __mocks__/        # Jest 手动 mock（CSS、静态资源等）
├── assets/           # 静态资源（图片、SVG、字体）
├── components/       # 可复用 UI 组件
├── context/          # React Context 提供者和消费者
├── hooks/            # 自定义 Hook（命名前缀必须为 use*）
├── i18n/             # i18next 配置和语言包
├── interface/        # 共享 TypeScript 接口和类型定义
├── route/            # 路由配置（自动生成，禁止手动修改）
├── utils/            # 纯工具函数（无副作用，无 React 依赖）
├── App.tsx           # 根组件
└── main.tsx          # 应用入口
```

路径别名：`@` 指向 `/src`，例如 `import Foo from '@/components/Foo'`

---

## 编码规范

### TypeScript

- 严格模式已开启，**禁止使用 `any`**；类型不确定时使用 `unknown` 并做类型收窄
- 所有函数参数和返回值必须有明确类型注解
- 共享类型和接口统一定义在 `/src/interface/`，使用 PascalCase 命名
- 联合类型 / 类型别名使用 `type`，对象结构使用 `interface`
- 导入路径统一使用 `@/` 别名，禁止使用相对路径 `../../`

### React

- **只使用函数式组件**，禁止类组件
- 组件保持单一职责，避免单文件过大
- 可复用逻辑抽取为自定义 Hook，放在 `/src/hooks/`，命名必须以 `use` 开头
- 全局状态使用 React Context（`/src/context/`），避免超过 2 层的 prop drilling
- 样式使用 `.scss` 文件或 Ant Design 组件，禁止内联 `style` 属性

### Ant Design（antd v6）

- 优先使用 antd 提供的组件，避免重复造轮子
- antd v6 已全面支持 CSS-in-JS，不需要单独引入样式文件
- 自定义主题通过 `ConfigProvider` 的 `theme` 属性配置，不直接覆盖 CSS 变量

### 路由

- 路由由 `scripts/auto-route-generator.js` 自动生成，**禁止手动修改** `/src/route/` 下的文件
- 新增页面路由请参考 `AUTO_ROUTE_README.md` 中的文件命名约定
- 路由生成命令：`npm run generate-routes`；开发环境自动监听：`npm run watch-routes`

### Markdown

- `.md` 文件通过 `vite-plugin-markdown` 作为模块引入
- 渲染优先使用 `react-markdown`，配合 `remark-gfm`、`rehype-highlight`、`rehype-raw` 插件
- 代码块高亮使用 `highlight.js`（已通过 `rehype-highlight` 集成）

### SVG

- SVG 文件通过 `vite-plugin-svgr` 作为 React 组件引入
- 引入方式：`import Icon from '@/assets/icon.svg'`，使用时：`<Icon />`

### 国际化（i18n）

- 所有用户可见的文本字符串**禁止硬编码**
- 使用 `react-i18next` 的 `useTranslation` hook 获取翻译函数
- 翻译 key 和语言包文件统一维护在 `/src/i18n/`
- 新增文案时，必须同步更新所有语言的语言包文件

### PDF 预览

- 使用 `react-pdf` + `pdfjs-dist` 处理 PDF 渲染
- Worker 配置遵循 `pdfjs-dist` 官方要求，不得随意更改

### 工具函数

- `/src/utils/` 中只放纯函数，不允许有副作用，禁止引入 React 相关依赖
- 每个工具函数必须可独立测试

---

## 测试要求

- 使用 **Jest ^30** + **React Testing Library ^16** 编写所有测试
- 测试文件与源文件同级存放，或放在 `__tests__/` 子目录中
- 命名规范：`*.test.ts` 或 `*.test.tsx`
- 测试行为和输出，而不是内部实现细节
- CSS / 静态资源通过 `identity-obj-proxy` 和 `jest-transform-stub` mock
- 提交 PR 前所有测试必须通过

### 常用测试命令

```bash
npm test                # 单次运行
npm run test:watch      # 监听模式
npm run test:coverage   # 覆盖率报告
```

### 测试重点

- `utils/` 和 `hooks/` 中的核心业务逻辑（追求高覆盖率）
- 组件渲染结果和用户交互（点击、输入、表单提交）
- Context 状态变化和副作用

---

## 代码质量

```bash
npm run lint            # 检查（0 warnings 标准）
npm run lint:fix        # 自动修复
```

- 提交前必须通过 ESLint 检查，`--max-warnings 0`，零容忍警告
- 禁止在源码中硬编码密钥、Token 或任何凭据
- 所有用户输入在处理前必须校验和清理
- 避免使用 `dangerouslySetInnerHTML`；如不可避免，必须先净化内容

---

## 代码风格

- 默认使用 `const`，只有需要重新赋值时才用 `let`
- 优先使用提前返回（early return），避免深层嵌套条件
- 函数保持简短，超过约 40 行时考虑拆分
- 变量、函数、组件命名清晰，能体现意图
- 导出函数和复杂逻辑添加 JSDoc 注释

---

## 部署说明

- 部署目标：GitHub Pages
- `vite.config.ts` 中 `base` 已设置为 `/shana.github.io/`
- **所有内部链接和资源路径必须兼容此 base 路径**，不得使用绝对路径 `/`

---

## [CODE] Copilot 禁止事项（代码层面）

- 不得建议使用类组件
- 不得硬编码用户可见文本，必须使用 i18n
- 不得使用 `any` 类型
- 不得手动修改 `/src/route/` 下自动生成的路由文件
- 不得使用相对路径 `../../`，统一使用 `@/` 别名
- 未经明确要求，不得引入新的全局状态管理库（如 Redux、Zustand 等）
- 不得使用内联 `style` 属性，使用 `.scss` 或 antd 主题配置
- 不得使用硬编码的绝对路径 `/`，需考虑 GitHub Pages base 路径
- **不得使用汉语以外的语言回复**，所有解释、建议、注释均须使用简体中文

---

<!-- ============================================================ -->
<!-- SECTION: PR — Pull Request 规范                               -->
<!-- 适用场景：生成 PR 标题、PR 描述                                  -->
<!-- ============================================================ -->

# [SECTION: PR] Pull Request 规范

## PR 标题

- 简明扼要，能独立说明该 PR 做了什么
- 禁止使用 "WIP"、"temp"、"fix stuff" 等模糊标题

---

## PR 描述模板

AI 生成 PR 描述时，**必须**使用以下结构：

```markdown
## 变更概述

<!-- 用 1-3 句话说明本 PR 的目标和背景 -->

## 变更内容

<!-- 列出主要改动，每条对应一个逻辑单元 -->

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

---

## PR 提交前检查清单

AI 在协助准备 PR 时，应确认以下各项均已满足：

### 代码质量

- [ ] `npm run lint` 通过（`--max-warnings 0`）
- [ ] `npm test` 全部通过
- [ ] 无 `any` 类型、无硬编码文本、无内联 `style`

### 功能完整性

- [ ] 新增 i18n key 已同步到所有语言包
- [ ] 如有新路由，已运行 `npm run generate-routes`
- [ ] 如有新公共类型，已更新 `/src/interface/`

### 代码规模

- [ ] 单个 PR 聚焦一个功能或修复，避免大杂烩
- [ ] 单文件改动超过 300 行时，考虑拆分 PR

### 安全

- [ ] 无硬编码密钥、Token 或凭据
- [ ] 使用了 `dangerouslySetInnerHTML` 的地方已净化内容

---

## [PR] Copilot 禁止事项（PR 层面）

- 不得生成包含 "WIP" 或无意义描述的 PR 标题
- 不得省略 PR 描述模板中的任何必填区块
- 不得将多个不相关功能的变更合并描述到同一个 PR 描述中
- **不得使用汉语以外的语言撰写 PR 标题、描述及回复**，所有内容均须使用简体中文
