# PDF 查看器规范

本规范定义博客系统中 PDF 文件在线预览功能的行为要求。

## Requirements

### Requirement: PDF 文件加载

系统 MUST 支持从本地资源加载和渲染 PDF 文件。

#### Scenario: 根据文件名加载 PDF

- **WHEN** 用户访问 PDF 查看器页面并传入文件名（如 `example.pdf`）
- **THEN** 系统 MUST 从 `/src/assets/docs/pdf/` 目录加载对应的 PDF 文件
- **AND** 使用动态导入（`import.meta.glob` 或类似机制）获取文件内容
- **AND** 加载期间 MUST 显示 Loading 指示器

#### Scenario: PDF 加载失败处理

- **WHEN** 指定的 PDF 文件不存在或加载失败
- **THEN** 系统 MUST 显示友好的错误提示信息（如"文件不存在"）
- **AND** 错误信息 MUST 使用当前语言显示
- **AND** SHOULD 提供返回链接或重试选项

#### Scenario: PDF 文档解析成功

- **WHEN** PDF 文件加载并解析成功
- **THEN** 系统 MUST 调用 `onDocumentLoadSuccess` 回调
- **AND** 获取 PDF 的总页数（`numPages`）
- **AND** 将总页数存储到组件状态
- **AND** 默认显示第 1 页

### Requirement: PDF 渲染和显示

系统 MUST 使用 `react-pdf` 库正确渲染 PDF 内容。

#### Scenario: 渲染 PDF 页面

- **WHEN** PDF 文档加载成功
- **THEN** 当前页面的 PDF 内容 MUST 在 `<Page>` 组件中渲染
- **AND** 渲染 MUST 包含文本层（`TextLayer`）以支持文本选择和复制
- **AND** 渲染 MUST 包含注释层（`AnnotationLayer`）以显示链接和表单

#### Scenario: 响应式 PDF 显示

- **WHEN** 在不同设备或窗口尺寸下查看 PDF
- **THEN** PDF 页面 MUST 自适应容器宽度
- **AND** 可以通过 `width` 属性设置固定宽度或通过 CSS 自适应
- **AND** 保持 PDF 页面的原始宽高比

#### Scenario: PDF Worker 配置

- **WHEN** 应用初始化时
- **THEN** MUST 配置 `pdfjs.GlobalWorkerOptions.workerSrc`
- **AND** Worker 脚本 MUST 指向正确的 CDN 或本地路径（如 `unpkg.com/pdfjs-dist@{version}/legacy/build/pdf.worker.min.mjs`）
- **AND** 确保 Worker 版本与 `pdfjs-dist` 库版本一致

### Requirement: PDF 分页导航

系统 MUST 提供分页控件以浏览 PDF 的不同页面。

#### Scenario: 显示分页控件

- **WHEN** PDF 加载成功且总页数大于 1
- **THEN** 页面底部 MUST 显示分页组件（Ant Design 的 `Pagination`）
- **AND** 分页组件 MUST 显示当前页码、总页数
- **AND** 提供上一页、下一页、跳转到指定页的功能

#### Scenario: 切换页码

- **WHEN** 用户点击页码或上一页/下一页按钮
- **THEN** 当前页码状态 MUST 更新（`setPageNumber`）
- **AND** PDF 渲染区域 MUST 显示新页码对应的页面内容
- **AND** 页面切换 MUST 平滑无闪烁

#### Scenario: 跳转到指定页

- **WHEN** 用户通过快速跳转输入框输入页码并确认
- **THEN** 系统 MUST 验证输入的页码在有效范围内（1 到 `numPages`）
- **AND** 如果有效，MUST 跳转到指定页
- **AND** 如果无效，SHOULD 显示错误提示或保持当前页

### Requirement: PDF 缩放控制（可选增强）

系统 SHOULD 支持用户调整 PDF 的缩放级别。

#### Scenario: 缩放按钮

- **WHEN** 用户点击放大或缩小按钮
- **THEN** PDF 页面的渲染宽度 MUST 相应增加或减少
- **AND** 缩放级别 SHOULD 以百分比显示（如 100%、150%）
- **AND** 缩放后内容 MUST 保持居中或可滚动查看

#### Scenario: 适应窗口宽度

- **WHEN** 用户点击"适应宽度"按钮
- **THEN** PDF 页面 MUST 自动调整宽度以填满容器
- **AND** 保持宽高比不变

### Requirement: PDF 文本选择和复制

系统 MUST 允许用户选择和复制 PDF 中的文本。

#### Scenario: 选择 PDF 文本

- **WHEN** 用户在 PDF 页面上拖动鼠标
- **THEN** 文本层（`TextLayer`）MUST 启用
- **AND** 用户 MUST 能够选中 PDF 中的文本内容
- **AND** 选中的文本 MUST 高亮显示

#### Scenario: 复制 PDF 文本

- **WHEN** 用户选中文本并执行复制操作（Ctrl+C 或右键菜单）
- **THEN** 选中的文本 MUST 复制到剪贴板
- **AND** 复制的文本 MUST 保持原始格式（段落、换行）

### Requirement: PDF 加载性能优化

系统 SHOULD 优化 PDF 加载和渲染性能。

#### Scenario: 按需加载页面

- **WHEN** PDF 包含大量页面（如超过 50 页）
- **THEN** 系统 SHOULD 仅渲染当前可见的页面
- **AND** 其他页面 SHOULD 延迟加载（虚拟滚动或分页加载）
- **AND** 减少内存占用和渲染时间

#### Scenario: PDF 缓存

- **WHEN** 用户多次查看同一个 PDF 文件
- **THEN** 系统 SHOULD 缓存已加载的 PDF 数据
- **AND** 避免重复下载和解析
- **AND** 使用浏览器缓存或内存缓存机制

### Requirement: PDF 容器样式

PDF 查看器 MUST 使用卡片（Card）容器包裹以提供一致的视觉样式。

#### Scenario: 卡片标题显示文件名

- **WHEN** PDF 加载时
- **THEN** 卡片的标题 MUST 显示 PDF 文件名（传入的 `name` 属性）
- **AND** 文件名 MUST 清晰可读

#### Scenario: 卡片边框和样式

- **WHEN** PDF 查看器渲染时
- **THEN** 卡片 MUST 使用无边框样式（`bordered={false}`）或根据主题决定
- **AND** 卡片样式 MUST 与整体主题（明暗）协调
- **AND** 卡片内间距 MUST 适当以确保内容可读性
