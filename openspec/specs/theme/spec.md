# 主题系统规范

本规范定义博客系统中主题切换和样式管理的行为要求。

## Requirements

### Requirement: 明暗主题切换

系统 MUST 支持明亮主题（Light）和暗黑主题（Dark）的切换。

#### Scenario: 默认主题选择

- **WHEN** 用户首次访问系统且未设置过主题偏好
- **THEN** 系统 MUST 使用明亮主题（`light`）作为默认主题
- **AND** 界面样式 MUST 应用明亮主题的配色方案

#### Scenario: 用户切换主题

- **WHEN** 用户点击主题切换按钮
- **THEN** 主题 MUST 在明亮和暗黑之间切换
- **AND** 切换图标 MUST 更新（暗黑主题显示太阳图标 `SunOutlined`，明亮主题显示月亮图标 `MoonOutlined`）
- **AND** 界面所有组件的配色 MUST 立即更新为新主题
- **AND** 主题选择 MUST 持久化到全局上下文（Context）

#### Scenario: 平滑过渡动画

- **WHEN** 主题切换发生
- **THEN** 颜色变化 SHOULD 使用 CSS 过渡动画（建议 0.3s）
- **AND** 过渡 MUST 平滑无闪烁
- **AND** 避免页面内容跳动或重新布局

### Requirement: 主题持久化

用户的主题选择 MUST 在会话间保持。

#### Scenario: 记忆用户主题偏好

- **WHEN** 用户选择特定主题（明亮或暗黑）
- **THEN** 主题选择 MUST 存储到 localStorage 或全局状态
- **AND** 存储的键名 MUST 为 `themeType`

#### Scenario: 恢复主题偏好

- **WHEN** 用户刷新页面或重新访问系统
- **THEN** 系统 MUST 从 localStorage 读取 `themeType`
- **AND** 应用用户上次选择的主题
- **AND** 如果读取失败或值无效，MUST 回退到默认主题（`light`）

### Requirement: 主题样式变量

主题配色 MUST 通过 CSS 变量或 SCSS 变量统一管理。

#### Scenario: 定义主题颜色变量

- **WHEN** 系统初始化样式系统
- **THEN** MUST 为每个主题定义一套完整的颜色变量
- **AND** 变量 MUST 包括：背景色、文本色、边框色、链接色、强调色等
- **AND** 变量命名 MUST 清晰且一致（如 `--bg-primary`、`--text-primary`）

#### Scenario: 应用主题变量

- **WHEN** 主题切换时
- **THEN** 根元素（`:root` 或 `body`）的 CSS 变量 MUST 更新为对应主题的值
- **AND** 所有使用这些变量的组件样式 MUST 自动响应变化

### Requirement: 第三方组件主题适配

Ant Design 等第三方组件 MUST 与系统主题同步。

#### Scenario: Ant Design 主题配置

- **WHEN** 系统主题切换
- **THEN** Ant Design 的 `ConfigProvider` MUST 更新 `theme` 属性
- **AND** 暗黑主题时 MUST 使用 Ant Design 的 `dark` 算法
- **AND** 明亮主题时 MUST 使用 Ant Design 的 `default` 算法
- **AND** 组件内置样式（如按钮、卡片、输入框）MUST 自动适配主题

#### Scenario: 自定义组件主题适配

- **WHEN** 开发者创建自定义组件
- **THEN** 组件样式 MUST 使用主题变量而非硬编码颜色值
- **AND** 组件 MUST 在主题切换时自动更新样式
- **AND** 避免使用与主题无关的固定颜色值

### Requirement: 主题切换按钮样式

主题切换按钮 MUST 具有清晰的视觉反馈。

#### Scenario: 按钮图标切换

- **WHEN** 当前主题为暗黑模式
- **THEN** 按钮 MUST 显示太阳图标（`SunOutlined`）表示可切换到明亮主题

- **WHEN** 当前主题为明亮模式
- **THEN** 按钮 MUST 显示月亮图标（`MoonOutlined`）表示可切换到暗黑主题

#### Scenario: 按钮交互状态

- **WHEN** 用户鼠标悬停在主题切换按钮上
- **THEN** 按钮 MUST 显示 hover 状态样式（如背景色变化）
- **AND** 鼠标指针 MUST 显示为 `pointer`

- **WHEN** 用户点击主题切换按钮
- **THEN** 按钮 SHOULD 显示点击反馈（如短暂的缩放或颜色变化）

### Requirement: 特殊组件主题适配

某些组件（如代码高亮、评论区）MUST 根据主题选择对应的样式。

#### Scenario: 代码块主题切换

- **WHEN** 主题切换到暗黑模式
- **THEN** 代码块（使用 `highlight.js` 或 `prismjs`）MUST 使用暗色主题样式（如 `atom-one-dark`）
- **AND** 代码背景色和文本色 MUST 与暗黑主题协调

- **WHEN** 主题切换到明亮模式
- **THEN** 代码块 MUST 使用亮色主题样式（如 `atom-one-light`）
- **AND** 代码背景色和文本色 MUST 与明亮主题协调

#### Scenario: Giscus 评论区主题同步

- **WHEN** 主题切换时
- **THEN** Giscus 评论组件的 `theme` 属性 MUST 更新为对应值（`light` 或 `dark`）
- **AND** 评论区样式 MUST 与整体主题保持一致

### Requirement: 系统偏好检测（可选增强）

系统 SHOULD 支持检测操作系统的主题偏好。

#### Scenario: 检测系统暗黑模式

- **WHEN** 用户首次访问且未设置主题偏好
- **AND** 操作系统启用了暗黑模式
- **THEN** 系统 SHOULD 自动使用暗黑主题
- **AND** 通过 CSS 媒体查询 `prefers-color-scheme: dark` 检测

#### Scenario: 用户手动设置优先

- **WHEN** 用户手动选择过主题
- **THEN** 系统 MUST 优先使用用户选择，忽略操作系统偏好
- **AND** 用户设置 MUST 覆盖系统检测结果
