# Spec Delta: Markdown Configuration Management

## Capability

`markdown-configuration` - 统一管理 Markdown 渲染的自定义组件配置

## ADDED Requirements

### Requirement: MC-001 - Centralized Markdown Overrides Configuration

系统 MUST 集中管理所有 Markdown 自定义组件的 overrides 配置，避免在使用组件中分散定义。

#### Scenario: 导出 Markdown overrides 配置函数

**Given** 系统需要渲染包含自定义组件的 Markdown 内容  
**When** 调用 `getMarkdownOverrides(isDark: boolean)` 函数  
**Then** 系统 SHALL 返回包含所有自定义组件映射的 overrides 配置对象  
**And** 配置对象 SHALL 符合 markdown-to-jsx 的 API 规范  
**And** 系统 SHALL 支持根据主题参数（isDark）动态配置组件

#### Scenario: 处理标准 Markdown 代码块

**Given** Markdown 内容包含标准代码块语法 \`\`\`language  
**When** 通过 overrides 配置渲染  
**Then** 系统 SHALL 使用自定义 Code 组件渲染  
**And** 系统 SHALL 传递正确的 language 和 isDark 参数  
**And** 系统 SHALL 保持代码内容不变

#### Scenario: 处理行内代码

**Given** Markdown 内容包含行内代码 \`code\`  
**When** 通过 overrides 配置渲染  
**Then** 系统 SHALL 使用默认的 `<code>` 元素渲染  
**And** 系统 SHALL NOT 应用自定义 Code 组件

#### Scenario: 映射自定义组件

**Given** Markdown 内容包含自定义组件标签（如 `<Loading />`, `<PdfViewer />`, `<ReactRuler />`）  
**When** 通过 overrides 配置渲染  
**Then** 系统 SHALL 正确映射到对应的 React 组件  
**And** 所有已注册的自定义组件 MUST 能正常渲染

### Requirement: MC-002 - Configuration File Structure

配置文件 MUST 有清晰的结构和文档，便于理解和维护。

#### Scenario: 配置文件位置

**Given** 项目需要存放 Markdown 配置  
**When** 创建配置文件  
**Then** 文件 MUST 放置在 `src/utils/markdownConfig.tsx` 路径  
**And** 文件 SHALL 包含文件头注释说明用途

#### Scenario: 类型安全

**Given** 配置文件使用 TypeScript  
**When** 定义配置函数和返回类型  
**Then** 系统 MUST 导出 `MarkdownOverrides` 接口定义  
**And** `getMarkdownOverrides` 函数 MUST 有明确的类型签名  
**And** 所有组件映射 SHALL 通过类型检查

#### Scenario: 组件分类

**Given** 配置包含多种类型的 overrides  
**When** 组织配置对象  
**Then** 配置 SHALL 按功能分类（内置处理器、增强处理器、自定义组件映射）  
**And** 每个分类 SHOULD 有注释说明

### Requirement: MC-003 - Post Component Integration

Post 组件 MUST 使用集中化的配置，而不是内联定义 overrides。

#### Scenario: 简化 Post 组件导入

**Given** Post 组件需要渲染 Markdown  
**When** 导入依赖  
**Then** 组件 SHALL 只导入 `getMarkdownOverrides` 函数  
**And** 组件 SHALL NOT 直接导入 Loading, PdfViewer, ReactRuler 等自定义组件  
**And** 组件 SHALL 保留 GiscusComments 导入（用于评论功能，不在 Markdown 中）

#### Scenario: 使用配置函数

**Given** Post 组件获取到主题状态 `isDark`  
**When** 渲染 Markdown 组件  
**Then** 组件 MUST 通过 `options={{ overrides: getMarkdownOverrides(isDark) }}` 配置  
**And** 组件 SHALL NOT 内联定义 overrides 对象  
**And** 配置 SHALL 响应主题变化

## MODIFIED Requirements

### Requirement: MC-004 - Component Export Pattern

系统 MUST 修改组件导出模式，明确哪些组件用于 Markdown 渲染配置。

#### Scenario: 标识 Markdown 可用组件

**Given** 自定义组件可以在 Markdown 中使用  
**When** 新增可用于 Markdown 的组件  
**Then** 开发者 MUST 在 markdownConfig.tsx 中添加组件导入  
**And** 开发者 MUST 在 overrides 配置中添加组件映射  
**And** 开发者 SHOULD 更新配置文件注释（如有需要）

## Testing Requirements

### Requirement: MC-005 - Configuration Testing

系统 MUST 验证配置的正确性和完整性。

#### Scenario: 现有测试通过

**Given** Post 组件有现有的单元测试  
**When** 应用新的配置机制  
**Then** 所有现有测试 MUST 继续通过  
**And** 系统 SHALL NOT 有新的测试失败

#### Scenario: 代码块渲染测试

**Given** Markdown 内容包含代码块  
**When** 使用配置渲染  
**Then** 代码块 MUST 正确高亮显示  
**And** 系统 SHALL 支持明暗主题切换  
**And** 行内代码 SHALL 使用默认样式

#### Scenario: 自定义组件渲染测试

**Given** Markdown 内容包含自定义组件标签  
**When** 使用配置渲染  
**Then** 所有自定义组件 MUST 正常显示  
**And** 组件功能 MUST 正常工作（如 Loading 动画、PDF 预览、Ruler 交互）

## Performance Requirements

### Requirement: MC-006 - Configuration Performance

配置 MUST NOT 引入性能问题。

#### Scenario: 无额外运行时开销

**Given** 使用配置函数生成 overrides  
**When** 组件渲染  
**Then** 系统 SHALL NOT 有明显的性能下降  
**And** 配置生成时间 MUST 可忽略不计（< 1ms）

#### Scenario: 主题切换响应

**Given** 用户切换主题  
**When** 重新渲染 Markdown 内容  
**Then** 系统 SHALL 立即应用新的主题配置  
**And** 代码高亮 MUST 使用正确的主题

## Maintainability Requirements

### Requirement: MC-007 - Code Maintainability

重构 MUST 提高代码的可维护性和可读性。

#### Scenario: 减少 Post 组件复杂度

**Given** 重构前的 Post 组件  
**When** 应用配置集中化  
**Then** Post.tsx 导入语句 MUST 减少至少 5 个  
**And** Markdown options 配置 SHALL 简化为 1 行  
**And** 组件代码行数 SHALL 减少至少 40 行

#### Scenario: 新增自定义组件

**Given** 需要在 Markdown 中支持新的自定义组件  
**When** 开发者添加组件  
**Then** 开发者 SHALL 只需要在 markdownConfig.tsx 中修改 2 处（import + mapping）  
**And** 开发者 SHALL NOT 需要修改 Post.tsx  
**And** 配置变更 SHOULD 在 10 行以内

## Documentation Requirements

### Requirement: MC-008 - Configuration Documentation

配置文件 MUST 有充分的文档说明。

#### Scenario: 文件头注释

**Given** markdownConfig.tsx 文件  
**When** 开发者打开文件  
**Then** 开发者 SHALL 在顶部看到文件用途说明  
**And** 说明 SHALL 包括用途和使用场景

#### Scenario: 函数文档

**Given** getMarkdownOverrides 函数  
**When** 开发者查看函数定义  
**Then** 函数 SHALL 有 JSDoc 注释说明  
**And** 注释 SHALL 包括参数说明和返回值说明  
**And** 注释 SHOULD 包括使用示例（如需要）

#### Scenario: 组件分类注释

**Given** overrides 配置对象  
**When** 开发者查看配置  
**Then** 每个组件分类 SHOULD 有注释标识  
**And** 注释 SHOULD 说明该分类的用途

## References

- Related to: Post Component specification
- Depends on: markdown-to-jsx library API
- Impacts: Markdown rendering behavior across the application
