# 内容管理规范

本规范定义博客系统中笔记内容的加载、展示和管理要求。

## Requirements

### Requirement: 笔记列表按目录分组

系统 MUST 按照一级目录对所有笔记文件进行分组展示。

#### Scenario: 从目录结构加载笔记列表

- **WHEN** 系统初始化时读取 `note-directory-structure.json`
- **THEN** 所有笔记文件 MUST 按照第一级目录名称进行分组
- **AND** 每个文件 MUST 记录完整路径、最后修改时间和所属目录
- **AND** 目录结构 MUST 支持递归遍历子目录

#### Scenario: 显示笔记元信息

- **WHEN** 笔记在列表中展示
- **THEN** 每个笔记 MUST 显示：文件名（移除扩展名）、最后修改时间（格式：YYYY年MM月DD日 HH:mm:ss）、所属分类标签
- **AND** 分类标签 MUST 根据一级目录名称自动生成
- **AND** 每个分类标签 MUST 有随机生成的背景颜色用于区分

### Requirement: 笔记列表支持分页

笔记列表 MUST 支持分页显示以提高大量内容的浏览性能。

#### Scenario: 默认分页配置

- **WHEN** 用户首次访问笔记列表页面
- **THEN** 默认每页显示 10 条笔记
- **AND** 当前页码 MUST 为第 1 页
- **AND** 分页组件 MUST 显示总条目数和页码控制器

#### Scenario: 切换每页条目数

- **WHEN** 用户通过页面大小选择器更改每页条目数（可选值：10、20、50、100）
- **THEN** 当前页码 MUST 重置为第 1 页
- **AND** 列表内容 MUST 重新渲染以匹配新的页面大小
- **AND** 分页组件 MUST 更新总页数计算

#### Scenario: 翻页导航

- **WHEN** 用户点击页码或上一页/下一页按钮
- **THEN** 列表 MUST 显示对应页码的笔记内容
- **AND** 当前页码状态 MUST 更新
- **AND** URL 参数 SHOULD 包含当前页码以支持直接访问

### Requirement: 支持分类过滤

系统 MUST 允许用户按照笔记的子分类进行过滤。

#### Scenario: 显示可用子分类

- **WHEN** 用户进入笔记列表页面
- **THEN** 系统 MUST 从当前笔记目录结构提取所有子分类
- **AND** 子分类选项 MUST 显示在过滤器组件中
- **AND** 默认 MUST 显示所有分类的笔记（"全部"选项被选中）

#### Scenario: 选择子分类过滤

- **WHEN** 用户选择特定子分类
- **THEN** 列表 MUST 仅显示匹配该子分类的笔记
- **AND** 当前页码 MUST 重置为第 1 页
- **AND** 分页总数 MUST 基于过滤后的结果重新计算

#### Scenario: 清除过滤器

- **WHEN** 用户选择"全部"选项
- **THEN** 列表 MUST 恢复显示所有分类的笔记
- **AND** 分页 MUST 基于完整笔记列表重新计算

### Requirement: 支持多种排序方式

笔记列表 MUST 支持按照不同维度进行排序。

#### Scenario: 按时间排序（默认）

- **WHEN** 用户首次访问列表或选择"按时间排序"
- **THEN** 笔记 MUST 按照最后修改时间降序排列（最新的在前）
- **AND** 使用 ISO 格式的时间戳进行比较

#### Scenario: 按名称排序

- **WHEN** 用户选择"按名称排序"
- **THEN** 笔记 MUST 按照文件名的字母顺序（忽略扩展名）进行升序排列
- **AND** 中文文件名 MUST 按照拼音顺序排列

### Requirement: 笔记详情渲染

系统 MUST 支持完整的 Markdown 格式笔记内容渲染。

#### Scenario: 加载 Markdown 文件

- **WHEN** 用户点击笔记标题进入详情页
- **THEN** 系统 MUST 根据笔记路径动态加载对应的 `.md` 文件
- **AND** 加载期间 MUST 显示 Loading 状态指示器
- **AND** 加载失败时 MUST 显示友好的错误提示信息

#### Scenario: 渲染 Markdown 内容

- **WHEN** Markdown 文件加载成功
- **THEN** 内容 MUST 使用 `react-markdown` 进行解析和渲染
- **AND** MUST 支持 GitHub Flavored Markdown（GFM）语法扩展
- **AND** 代码块 MUST 使用语法高亮（通过 `rehype-highlight` 或 `prismjs`）
- **AND** 标题、列表、表格、链接等元素 MUST 正确渲染
- **AND** 图片路径 MUST 正确解析（支持相对路径和绝对路径）

#### Scenario: 响应式内容布局

- **WHEN** 在不同设备上查看笔记详情
- **THEN** 内容 MUST 自适应屏幕宽度
- **AND** 代码块 MUST 支持水平滚动（当内容超出容器宽度）
- **AND** 图片 MUST 自适应缩放以适应容器宽度

### Requirement: 笔记路径到路由映射

系统 MUST 根据笔记文件路径自动生成对应的访问路由。

#### Scenario: 生成笔记访问路径

- **WHEN** 系统构建路由表时
- **THEN** 每个笔记文件 MUST 生成唯一的 URL 路径
- **AND** 路径格式 MUST 为 `/note/{一级目录}/{子目录}/{文件名}`（不含扩展名）
- **AND** 路径中的特殊字符 MUST 进行 URL 编码

#### Scenario: 点击笔记跳转

- **WHEN** 用户在笔记列表中点击某个笔记标题
- **THEN** 系统 MUST 使用 React Router 导航到对应的笔记详情路由
- **AND** 使用 Hash 路由模式（`#/note/...`）
- **AND** 浏览器历史记录 MUST 正确记录以支持前进/后退
