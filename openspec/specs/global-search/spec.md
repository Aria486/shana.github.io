# 全局搜索规范

本规范定义博客系统中全局搜索功能的交互和搜索行为要求。

## Requirements

### Requirement: 搜索框展开/收起动画

搜索组件 MUST 支持动画展开和收起以优化空间利用和用户体验。

#### Scenario: 点击图标展开搜索框

- **WHEN** 用户点击搜索图标
- **THEN** 搜索输入框 MUST 通过动画从收起状态平滑展开
- **AND** 输入框展开完成后 MUST 自动获得焦点（延迟 100ms 以配合动画）
- **AND** 展开状态 MUST 设置为 `true`

#### Scenario: 失去焦点时自动收起

- **WHEN** 搜索框失去焦点（用户点击页面其他区域）
- **AND** 输入框内容为空（`keyword.trim() === ""`）
- **THEN** 搜索框 MUST 通过动画收起回初始状态
- **AND** 展开状态 MUST 设置为 `false`

#### Scenario: 有内容时保持展开

- **WHEN** 搜索框失去焦点
- **AND** 输入框内包含搜索关键词
- **THEN** 搜索框 MUST 保持展开状态不收起

### Requirement: 实时搜索功能

搜索组件 MUST 支持用户输入时实时触发搜索。

#### Scenario: 输入关键词触发搜索

- **WHEN** 用户在搜索输入框中输入或修改内容
- **THEN** 组件 MUST 立即调用父组件传入的 `onSearch` 回调函数
- **AND** 传递当前输入框的值作为搜索关键词
- **AND** 内部状态 `keyword` MUST 实时更新

#### Scenario: 空关键词搜索

- **WHEN** 用户删除所有输入内容（关键词为空字符串）
- **THEN** `onSearch` 回调 MUST 仍然被调用并传递空字符串
- **AND** 父组件 SHOULD 重置搜索结果并显示所有内容

### Requirement: 清除按钮功能

搜索框 MUST 提供清除按钮以快速重置搜索。

#### Scenario: 显示清除按钮

- **WHEN** 搜索框处于展开状态
- **AND** 输入框内包含内容（`keyword.trim() !== ""`）
- **THEN** 清除按钮（通常为 "×" 图标）MUST 显示在输入框右侧

#### Scenario: 点击清除按钮

- **WHEN** 用户点击清除按钮
- **THEN** 输入框内容 MUST 被清空（`keyword` 设置为 `""`）
- **AND** `onSearch` 回调 MUST 被调用并传递空字符串
- **AND** 输入框 MUST 重新获得焦点
- **AND** 搜索框 MUST 保持展开状态

### Requirement: 搜索结果高亮和过滤

系统 MUST 根据搜索关键词过滤笔记列表并高亮匹配内容。

#### Scenario: 按标题和内容过滤笔记

- **WHEN** 用户输入搜索关键词
- **THEN** 笔记列表 MUST 仅显示标题或文件名包含该关键词的笔记（大小写不敏感）
- **AND** 搜索 SHOULD 支持中文、英文和日文
- **AND** 过滤结果 MUST 实时更新

#### Scenario: 无搜索结果提示

- **WHEN** 搜索关键词无法匹配任何笔记
- **THEN** 列表区域 MUST 显示"无搜索结果"或类似友好提示
- **AND** SHOULD 提示用户尝试其他关键词

#### Scenario: 搜索关键词高亮显示

- **WHEN** 搜索结果在列表中展示
- **THEN** 匹配的关键词部分 SHOULD 使用高亮样式（如背景色或粗体）
- **AND** 高亮样式 MUST 在视觉上明显区别于普通文本

### Requirement: 搜索状态持久化

搜索状态 SHOULD 在用户会话中保持。

#### Scenario: 刷新页面保持搜索状态

- **WHEN** 用户在搜索状态下刷新页面
- **THEN** 搜索关键词 SHOULD 从 URL 参数中恢复
- **AND** 搜索框 MUST 展开并显示之前的关键词
- **AND** 搜索结果 MUST 基于恢复的关键词重新过滤

#### Scenario: 跨页面导航清除搜索

- **WHEN** 用户离开笔记列表页面导航到其他页面
- **THEN** 搜索状态 MUST 被重置
- **AND** 再次返回时 MUST 显示默认的未搜索状态

### Requirement: 国际化支持

搜索组件的占位符和提示文本 MUST 支持多语言。

#### Scenario: 根据当前语言显示占位符

- **WHEN** 系统语言切换到不同语言（中文、英文、日文）
- **THEN** 搜索框占位符文本 MUST 使用对应语言的翻译
- **AND** 提示信息（如"无搜索结果"）MUST 使用对应语言
- **AND** 语言切换 MUST 通过 `react-i18next` 的 `useTranslation` hook 实现
