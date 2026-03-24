# 评论系统规范

本规范定义博客系统中基于 Giscus 的评论功能的集成和行为要求。

## Requirements

### Requirement: Giscus 评论组件集成

系统 MUST 使用 Giscus 作为评论系统，集成到笔记详情页面。

#### Scenario: 评论区初始化

- **WHEN** 笔记详情页面加载完成
- **THEN** 页面底部 MUST 渲染 Giscus 评论组件
- **AND** 组件 MUST 传入文章路径（`articlePath`）作为唯一标识
- **AND** Giscus MUST 根据文章路径加载对应的评论数据

#### Scenario: Giscus 配置参数

- **WHEN** 初始化 Giscus 组件时
- **THEN** MUST 配置以下参数：
  - `repo`：GitHub 仓库（格式：`owner/repo`）
  - `repoId`：仓库 ID
  - `category`：讨论分类
  - `categoryId`：分类 ID
  - `mapping`：映射方式（如 `pathname`）
  - `reactionsEnabled`：启用表情反应（可选）
  - `emitMetadata`：发送元数据（可选）
- **AND** 配置 MUST 存储在环境变量或配置文件中，不得硬编码敏感信息

### Requirement: 评论区主题同步

评论组件的主题 MUST 与系统主题保持一致。

#### Scenario: 明亮主题

- **WHEN** 系统主题为明亮模式（`light`）
- **THEN** Giscus 组件的 `theme` 属性 MUST 设置为 `'light'`
- **AND** 评论区背景色和文本色 MUST 与明亮主题协调

#### Scenario: 暗黑主题

- **WHEN** 系统主题为暗黑模式（`dark`）
- **THEN** Giscus 组件的 `theme` 属性 MUST 设置为 `'dark'`
- **AND** 评论区背景色和文本色 MUST 与暗黑主题协调

#### Scenario: 主题切换时更新

- **WHEN** 用户切换系统主题
- **THEN** Giscus 组件 MUST 重新渲染以应用新主题
- **AND** 主题切换 MUST 平滑无闪烁

### Requirement: 评论区语言设置

评论组件的语言 MUST 与系统当前语言一致。

#### Scenario: 中文环境

- **WHEN** 系统语言为中文（`zh-CN`）
- **THEN** Giscus 组件的 `lang` 属性 MUST 设置为 `'zh-CN'`
- **AND** 评论区界面文本（如"发表评论"、"加载中"）MUST 显示为中文

#### Scenario: 英文环境

- **WHEN** 系统语言为英文（`en`）
- **THEN** Giscus 组件的 `lang` 属性 MUST 设置为 `'en'`
- **AND** 评论区界面文本 MUST 显示为英文

#### Scenario: 日文环境

- **WHEN** 系统语言为日文（`ja`）
- **THEN** Giscus 组件的 `lang` 属性 MUST 设置为 `'ja'`
- **AND** 评论区界面文本 MUST 显示为日文

### Requirement: 评论区懒加载

评论组件 SHOULD 支持懒加载以优化页面加载性能。

#### Scenario: 懒加载启用

- **WHEN** 组件的 `lazy` 属性设置为 `true`（默认）
- **THEN** Giscus 评论区 MUST 仅在用户滚动到评论区附近时加载
- **AND** 使用 `IntersectionObserver` 监听评论容器是否进入视口
- **AND** 触发阈值 SHOULD 设置为提前 100px（`rootMargin: '100px'`）

#### Scenario: 懒加载禁用

- **WHEN** 组件的 `lazy` 属性设置为 `false`
- **THEN** Giscus 评论区 MUST 在页面加载时立即渲染
- **AND** 不使用 `IntersectionObserver`

#### Scenario: 懒加载触发

- **WHEN** 用户滚动到评论区附近（距离视口 100px 内）
- **THEN** `IntersectionObserver` MUST 触发回调
- **AND** 评论组件状态 `isVisible` MUST 设置为 `true`
- **AND** Giscus 组件 MUST 开始加载和渲染
- **AND** Observer MUST 断开连接以避免重复触发

### Requirement: 评论区容器样式

评论区容器 MUST 具有清晰的样式和布局。

#### Scenario: 容器样式类名

- **WHEN** 评论组件渲染时
- **THEN** 容器 MUST 使用带前缀的 CSS 类名（通过 `useClsAddPrefix` 生成）
- **AND** 支持传入自定义 `className` 进行样式扩展
- **AND** 使用 `classnames` 库合并多个类名

#### Scenario: 容器间距和边距

- **WHEN** 评论区在笔记详情页显示
- **THEN** 容器 MUST 有适当的上边距以与笔记内容分隔
- **AND** 容器宽度 MUST 与笔记内容宽度一致
- **AND** 在移动设备上 MUST 自适应屏幕宽度

### Requirement: 评论区错误处理

系统 MUST 处理评论加载失败的情况。

#### Scenario: Giscus 加载失败

- **WHEN** Giscus 脚本加载失败或 GitHub API 不可用
- **THEN** 评论区 SHOULD 显示友好的错误提示（如"评论加载失败，请稍后重试"）
- **AND** 错误信息 MUST 使用当前语言显示
- **AND** SHOULD 提供重试按钮或链接到 GitHub 讨论页面

#### Scenario: 网络离线

- **WHEN** 用户网络连接中断
- **THEN** 评论区 SHOULD 显示"网络不可用"提示
- **AND** 网络恢复后 SHOULD 自动重新加载评论

### Requirement: 评论数据隔离

每篇笔记的评论 MUST 独立存储，不得混淆。

#### Scenario: 根据文章路径隔离

- **WHEN** 不同笔记传入不同的 `articlePath`
- **THEN** Giscus MUST 为每个路径创建独立的 GitHub Discussion
- **AND** 评论 MUST 正确映射到对应的笔记
- **AND** 同一篇笔记在不同设备或浏览器上 MUST 显示相同的评论

#### Scenario: 路径变更处理

- **WHEN** 笔记文件路径发生变更（如重命名或移动）
- **THEN** 开发者 MUST 手动更新 GitHub Discussion 的映射或迁移评论
- **AND** 系统 SHOULD 提供文档说明如何处理路径变更
