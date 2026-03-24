# 国际化规范

本规范定义博客系统中多语言支持的实现和行为要求。

## Requirements

### Requirement: 支持多语言切换

系统 MUST 支持中文、英文和日文三种语言的切换。

#### Scenario: 默认语言选择

- **WHEN** 用户首次访问系统且未设置过语言偏好
- **THEN** 系统 MUST 使用中文（`zh-CN`）作为默认语言
- **AND** 界面所有文本 MUST 以中文显示

#### Scenario: 用户主动切换语言

- **WHEN** 用户通过语言切换器选择不同语言（中文、英文、日文）
- **THEN** 界面所有文本 MUST 立即更新为选定语言
- **AND** 语言选择 MUST 持久化到 localStorage
- **AND** 当前路由页面 MUST 重新渲染以应用新语言

#### Scenario: 语言偏好记忆

- **WHEN** 用户曾经选择过特定语言并再次访问系统
- **THEN** 系统 MUST 从 localStorage 读取语言偏好
- **AND** 自动应用用户上次选择的语言
- **AND** 无需用户重新设置

### Requirement: 翻译资源管理

系统 MUST 使用结构化的翻译资源文件管理多语言内容。

#### Scenario: 翻译文件组织

- **WHEN** 系统初始化 i18next 配置
- **THEN** 翻译资源 MUST 存储在 `src/i18n/locales/` 目录下
- **AND** 每种语言 MUST 有独立的 JSON 文件（如 `zh-CN.json`、`en.json`、`ja.json`）
- **AND** 翻译键值对 MUST 使用命名空间分组（如 `common`、`header`、`footer`）

#### Scenario: 动态加载翻译资源

- **WHEN** 用户切换语言
- **THEN** 系统 MUST 动态加载对应语言的翻译资源
- **AND** 加载完成前 SHOULD 显示加载指示器或保持当前语言
- **AND** 加载失败时 MUST 回退到默认语言（中文）

### Requirement: 翻译键使用规范

组件中的文本 MUST 通过 i18next 的翻译键引用，不得硬编码。

#### Scenario: 组件中使用翻译

- **WHEN** 开发者在 React 组件中需要显示文本
- **THEN** MUST 使用 `useTranslation` hook 获取 `t` 函数
- **AND** 文本内容 MUST 通过 `t('翻译键')` 动态获取
- **AND** 不得直接在 JSX 中硬编码中文、英文或日文文本

#### Scenario: 翻译键命名约定

- **WHEN** 添加新的翻译键
- **THEN** 键名 MUST 使用小写字母和点号分隔（如 `header.menu.home`）
- **AND** 键名 MUST 清晰描述文本的用途和位置
- **AND** 相关翻译键 MUST 归类在同一命名空间下

### Requirement: 日期和时间格式国际化

日期和时间显示 MUST 根据当前语言使用对应的格式。

#### Scenario: 中文环境日期格式

- **WHEN** 当前语言为中文（`zh-CN`）
- **THEN** 日期 MUST 使用格式：`YYYY年MM月DD日 HH:mm:ss`
- **AND** 星期 SHOULD 显示为"星期一"、"星期二"等中文形式

#### Scenario: 英文环境日期格式

- **WHEN** 当前语言为英文（`en`）
- **THEN** 日期 MUST 使用格式：`YYYY-MM-DD HH:mm:ss` 或 `MMM DD, YYYY`
- **AND** 星期 SHOULD 显示为"Monday"、"Tuesday"等英文形式

#### Scenario: 日文环境日期格式

- **WHEN** 当前语言为日文（`ja`）
- **THEN** 日期 MUST 使用格式：`YYYY年MM月DD日 HH:mm:ss`
- **AND** 星期 SHOULD 显示为"月曜日"、"火曜日"等日文形式

### Requirement: 缺失翻译回退机制

系统 MUST 为缺失的翻译提供友好的回退机制。

#### Scenario: 翻译键不存在

- **WHEN** 组件尝试获取不存在的翻译键
- **THEN** 系统 MUST 显示翻译键本身（而非报错）
- **AND** 开发环境 SHOULD 在控制台输出警告信息
- **AND** 生产环境 MUST 回退到默认语言的对应翻译

#### Scenario: 部分语言缺失翻译

- **WHEN** 某个翻译键在特定语言中不存在（如仅有中文，缺少英文）
- **THEN** 系统 MUST 回退到默认语言（中文）的翻译
- **AND** 开发环境 SHOULD 提示翻译缺失

### Requirement: URL 路径不受语言影响

路由路径 MUST 保持语言无关，仅界面文本多语言化。

#### Scenario: 切换语言不改变 URL

- **WHEN** 用户在某个页面切换语言
- **THEN** URL 路径 MUST 保持不变（如 `/#/note/program/react`）
- **AND** 仅页面内容文本 MUST 更新为新语言
- **AND** 笔记文件路径和文件名 MUST 保持原样不翻译

### Requirement: 第三方组件国际化

Ant Design 等第三方组件 MUST 配置为与系统语言一致。

#### Scenario: Ant Design 组件语言配置

- **WHEN** 系统语言切换
- **THEN** Ant Design 的 `ConfigProvider` MUST 更新 `locale` 属性
- **AND** 组件内置文本（如日期选择器、表格分页）MUST 显示对应语言
- **AND** 支持的语言包括：中文（`zh_CN`）、英文（`en_US`）、日文（`ja_JP`）
