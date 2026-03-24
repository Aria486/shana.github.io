# 分页组件规范

本规范定义博客系统中分页组件的交互和显示要求。

## Requirements

### Requirement: 基本分页功能

分页组件 MUST 提供页码切换、显示当前页和总页数的基本功能。

#### Scenario: 初始化分页

- **WHEN** 分页组件接收 `current`、`total`、`pageSize` 属性
- **THEN** 组件 MUST 计算总页数（`totalPages = Math.ceil(total / pageSize)`）
- **AND** 显示当前页码和总页数
- **AND** 渲染页码按钮（如 1、2、3...）

#### Scenario: 点击页码跳转

- **WHEN** 用户点击某个页码按钮（如第 3 页）
- **THEN** 组件 MUST 调用 `onChange(page, pageSize)` 回调函数
- **AND** 传递新的页码（3）和当前的 `pageSize`
- **AND** 父组件 MUST 更新 `current` 状态以触发重新渲染

#### Scenario: 上一页和下一页

- **WHEN** 用户点击"上一页"按钮
- **THEN** 当前页码 MUST 减 1（如从第 3 页跳转到第 2 页）
- **AND** 如果已在第 1 页，"上一页"按钮 MUST 禁用

- **WHEN** 用户点击"下一页"按钮
- **THEN** 当前页码 MUST 加 1（如从第 2 页跳转到第 3 页）
- **AND** 如果已在最后一页，"下一页"按钮 MUST 禁用

### Requirement: 页码显示策略

分页组件 MUST 智能显示页码以适应不同的总页数。

#### Scenario: 总页数不超过最大显示数

- **WHEN** 总页数 ≤ 7（`maxVisible = 7`）
- **THEN** 所有页码 MUST 完整显示（如 1、2、3、4、5、6、7）
- **AND** 不显示省略号

#### Scenario: 总页数超过最大显示数

- **WHEN** 总页数 > 7
- **THEN** 页码 MUST 简化显示，使用省略号（`...`）
- **AND** 始终显示第 1 页和最后一页
- **AND** 当前页附近的页码 MUST 显示（如当前在第 10 页，显示 1...8、9、10、11、12...50）

#### Scenario: 当前页在开头

- **WHEN** 当前页在前 4 页（如第 1、2、3、4 页）
- **THEN** 显示格式 MUST 为：1、2、3、4、5...最后一页

#### Scenario: 当前页在末尾

- **WHEN** 当前页在最后 4 页
- **THEN** 显示格式 MUST 为：1...倒数第5页、倒数第4页、...、最后一页

#### Scenario: 当前页在中间

- **WHEN** 当前页在中间位置
- **THEN** 显示格式 MUST 为：1...当前页-1、当前页、当前页+1...最后一页

### Requirement: 每页条目数切换

分页组件 SHOULD 支持用户调整每页显示的条目数。

#### Scenario: 显示页面大小选择器

- **WHEN** `showSizeChanger` 属性为 `true`
- **THEN** 组件 MUST 显示页面大小选择器（下拉菜单）
- **AND** 选择器选项 MUST 使用 `pageSizeOptions` 属性提供的值（默认：["10", "20", "50", "100"]）
- **AND** 当前选中的值 MUST 为 `pageSize`

#### Scenario: 切换页面大小

- **WHEN** 用户从下拉菜单选择新的页面大小（如从 10 改为 20）
- **THEN** 组件 MUST 调用 `onChange(1, newPageSize)` 回调
- **AND** 当前页码 MUST 重置为第 1 页
- **AND** 总页数 MUST 根据新的 `pageSize` 重新计算
- **AND** 父组件 MUST 更新 `pageSize` 和 `current` 状态

### Requirement: 快速跳转功能

分页组件 SHOULD 支持用户输入页码快速跳转。

#### Scenario: 显示快速跳转器

- **WHEN** `showQuickJumper` 属性为 `true`
- **THEN** 组件 MUST 显示快速跳转输入框和"跳转"按钮
- **AND** 输入框 MUST 支持数字输入

#### Scenario: 输入页码跳转

- **WHEN** 用户在输入框中输入页码（如 15）并点击"跳转"按钮或按 Enter 键
- **THEN** 组件 MUST 验证输入的页码在有效范围内（1 ≤ 页码 ≤ 总页数）
- **AND** 如果有效，MUST 调用 `onChange(inputPage, pageSize)` 回调
- **AND** 如果无效（如输入 0、负数、超出范围），SHOULD 显示错误提示或忽略输入

#### Scenario: 清空输入框

- **WHEN** 跳转成功后
- **THEN** 输入框 SHOULD 清空或保持当前页码

### Requirement: 总条目数显示

分页组件 SHOULD 显示当前页的条目范围和总条目数。

#### Scenario: 显示范围信息

- **WHEN** `showTotal` 属性提供回调函数
- **THEN** 组件 MUST 调用 `showTotal(total, [startIndex, endIndex])`
- **AND** `startIndex = (current - 1) * pageSize + 1`
- **AND** `endIndex = Math.min(current * pageSize, total)`
- **AND** 显示格式 SHOULD 为"显示第 1-10 条，共 100 条"或类似文案

#### Scenario: 默认显示格式

- **WHEN** `showTotal` 未提供
- **THEN** 组件 SHOULD 使用默认格式显示（如"共 100 条"）
- **AND** 支持国际化（根据当前语言显示对应文本）

### Requirement: 简洁模式

分页组件 SHOULD 支持简洁模式以适应移动端或空间受限的场景。

#### Scenario: 启用简洁模式

- **WHEN** `simple` 属性为 `true`
- **THEN** 组件 MUST 仅显示"上一页"、"下一页"按钮和当前页/总页数（如"3 / 10"）
- **AND** 不显示页码按钮、页面大小选择器和快速跳转器

#### Scenario: 简洁模式导航

- **WHEN** 用户在简洁模式下点击"上一页"或"下一页"
- **THEN** 功能 MUST 与普通模式一致
- **AND** 页码更新和回调调用 MUST 正常工作

### Requirement: 响应式布局

分页组件 MUST 在不同屏幕尺寸下自适应显示。

#### Scenario: 桌面端显示

- **WHEN** 在桌面设备上查看
- **THEN** 组件 MUST 显示完整功能（页码、页面大小选择器、快速跳转器）
- **AND** 布局 MUST 水平排列且间距适当

#### Scenario: 移动端显示

- **WHEN** 在移动设备上查看（屏幕宽度 < 768px）
- **THEN** 组件 SHOULD 自动切换到简洁模式或减少显示的页码数量
- **AND** 页面大小选择器和快速跳转器 SHOULD 隐藏或折叠
- **AND** 确保按钮大小适合触摸操作（最小 44x44px）

### Requirement: 禁用状态

分页组件 MUST 正确处理边界情况的禁用状态。

#### Scenario: 第一页禁用上一页

- **WHEN** 当前页为第 1 页
- **THEN** "上一页"按钮 MUST 禁用（灰色且不可点击）
- **AND** 点击禁用按钮 MUST 无反应

#### Scenario: 最后一页禁用下一页

- **WHEN** 当前页为最后一页
- **THEN** "下一页"按钮 MUST 禁用
- **AND** 点击禁用按钮 MUST 无反应

#### Scenario: 总条目为 0

- **WHEN** `total` 为 0（无数据）
- **THEN** 所有页码按钮和导航按钮 MUST 禁用
- **AND** 显示"共 0 条"或"暂无数据"

### Requirement: 国际化支持

分页组件的文本 MUST 支持多语言。

#### Scenario: 按钮和提示文本翻译

- **WHEN** 系统语言切换
- **THEN** 分页组件的文本（如"上一页"、"下一页"、"跳转"、"条/页"）MUST 使用对应语言
- **AND** 使用 `useTranslation` hook 获取翻译
- **AND** 支持中文、英文、日文
