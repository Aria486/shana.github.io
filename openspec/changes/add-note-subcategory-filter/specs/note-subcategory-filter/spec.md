# Spec: Note Subcategory Filter

## Overview

为笔记列表提供基于子分类的过滤功能，允许用户快速筛选特定子分类的笔记。

## ADDED Requirements

### Requirement: 笔记子分类过滤

系统 MUST 提供笔记子分类过滤功能，允许用户在笔记列表中按子分类筛选内容。

#### Scenario: 显示子分类标签列表

**Given** 用户在查看某个大分类的笔记列表（如 "program"）  
**And** 该大分类包含子分类（如 "css", "javascript", "react"）  
**When** 页面加载完成  
**Then** 在笔记列表上方应显示子分类过滤栏  
**And** 过滤栏包含一个"全部"标签  
**And** 过滤栏包含所有子分类的标签（按字母序排列）  
**And** "全部"标签默认处于选中状态

#### Scenario: 无子分类时不显示过滤栏

**Given** 用户在查看某个大分类的笔记列表（如 "history"）  
**And** 该大分类不包含子分类（所有笔记都在根目录下）  
**When** 页面加载完成  
**Then** 不应显示子分类过滤栏  
**And** 笔记列表正常显示

#### Scenario: 点击子分类标签进行过滤

**Given** 用户在笔记列表页面  
**And** 子分类过滤栏已显示  
**And** "全部"标签处于选中状态  
**When** 用户点击某个子分类标签（如 "javascript"）  
**Then** 该子分类标签变为选中状态  
**And** "全部"标签变为未选中状态  
**And** 笔记列表仅显示该子分类下的笔记  
**And** 分页重置到第1页  
**And** 分页总数更新为过滤后的笔记数量

#### Scenario: 点击"全部"标签取消过滤

**Given** 用户已选中某个子分类标签  
**And** 笔记列表显示过滤后的内容  
**When** 用户点击"全部"标签  
**Then** "全部"标签变为选中状态  
**And** 所有子分类标签变为未选中状态  
**And** 笔记列表显示该大分类下的所有笔记  
**And** 分页重置到第1页

#### Scenario: 再次点击已选中的子分类标签

**Given** 用户已选中某个子分类标签（如 "react"）  
**When** 用户再次点击该标签  
**Then** 该标签变为未选中状态  
**And** "全部"标签自动变为选中状态  
**And** 笔记列表显示所有笔记  
**And** 分页重置到第1页

#### Scenario: 子分类过滤与全局搜索结合

**Given** 用户在全局搜索框中输入了关键词（如 "react"）  
**And** 搜索结果已显示  
**When** 用户点击某个子分类标签（如 "javascript"）  
**Then** 笔记列表应同时应用搜索过滤和子分类过滤  
**And** 仅显示搜索关键词匹配且属于该子分类的笔记  
**And** 如果没有匹配结果，显示空状态提示

#### Scenario: 切换大分类时重置过滤状态

**Given** 用户在 "program" 分类下选中了 "javascript" 子分类  
**When** 用户切换到另一个大分类（如 "study_note"）  
**Then** 子分类过滤状态应重置  
**And** 新的子分类标签列表应显示（如果有）  
**And** "全部"标签处于选中状态  
**And** 显示新大分类下的所有笔记

#### Scenario: 子分类过滤与排序结合

**Given** 用户选中了某个子分类标签  
**And** 笔记列表显示过滤后的内容  
**When** 用户更改排序方式（如从"时间"改为"名称"）  
**Then** 应在过滤后的笔记上应用新的排序  
**And** 子分类过滤状态保持不变  
**And** 分页重置到第1页

### Requirement: 子分类标签 UI 样式

子分类过滤栏 MUST 使用 Ant Design Tag 组件，提供清晰的视觉反馈。

#### Scenario: 标签的视觉样式

**Given** 子分类过滤栏已显示  
**When** 用户查看过滤栏  
**Then** 所有标签应使用 Ant Design 的 CheckableTag 组件  
**And** 未选中的标签显示默认样式（浅色边框）  
**And** 选中的标签显示主题色背景  
**And** 标签之间应有适当的间距（水平 8px，垂直 4px）  
**And** 标签应支持自动换行

#### Scenario: 标签的交互反馈

**Given** 用户将鼠标悬停在标签上  
**When** 鼠标进入标签区域  
**Then** 标签应显示悬停状态（轻微高亮）  
**And** 鼠标指针应变为手型（cursor: pointer）  
**When** 用户点击标签  
**Then** 应有视觉反馈（选中状态变化）  
**And** 标签状态切换应流畅无延迟

#### Scenario: 响应式布局

**Given** 子分类标签较多  
**When** 在不同屏幕尺寸下查看  
**Then** 标签应自动换行以适应容器宽度  
**And** 在移动设备上标签间距应适当调整  
**And** 过滤栏高度应自适应标签行数

### Requirement: 子分类数据提取

系统 MUST 从现有的笔记目录结构中自动提取子分类信息。

#### Scenario: 从目录结构提取子分类

**Given** 系统加载了 `note-directory-structure.json`  
**And** 用户选择了某个大分类（如 "program"）  
**When** 组件需要显示子分类列表  
**Then** 应从该大分类的 children 中提取所有 type 为 "directory" 的项  
**And** 返回这些子目录的名称列表  
**And** 列表应按字母序排序  
**And** 应排除 type 为 "file" 的项

#### Scenario: 处理无子分类的情况

**Given** 某个大分类（如 "novel"）只包含文件，没有子目录  
**When** 组件提取子分类列表  
**Then** 应返回空数组  
**And** 不显示子分类过滤栏

#### Scenario: 子分类列表缓存

**Given** 用户在某个大分类下  
**When** 子分类列表首次提取后  
**Then** 应使用 `useMemo` 缓存结果  
**And** 仅在大分类（menu）变化时重新提取  
**And** 避免不必要的重复计算

### Requirement: 过滤逻辑实现

系统 MUST 正确实现子分类过滤逻辑，与现有功能兼容。

#### Scenario: 子分类路径匹配

**Given** 笔记的路径格式为 "category/subcategory/filename.md"  
**And** 用户选中了子分类 "javascript"  
**When** 系统进行过滤  
**Then** 应检查路径的第二部分（pathParts[1]）  
**And** 仅保留第二部分匹配 "javascript" 的笔记  
**And** 排除路径格式为 "category/filename.md" 的笔记（直接在大分类下的文件）

#### Scenario: 处理根目录文件

**Given** 某些笔记直接位于大分类根目录（路径为 "category/filename.md"）  
**And** 用户选中了某个子分类  
**When** 系统进行过滤  
**Then** 这些根目录文件不应显示在过滤结果中  
**When** 用户选中"全部"  
**Then** 根目录文件应正常显示

#### Scenario: 过滤优先级

**Given** 用户同时使用了多个过滤条件  
**When** 系统计算最终显示的笔记列表  
**Then** 应按以下顺序应用过滤：

1. 全局搜索过滤
2. 子分类过滤
3. 排序
4. 分页  
   **And** 每个步骤都基于前一步的结果

### Requirement: 状态管理

系统 MUST 正确管理子分类过滤的状态及其与其他状态的交互。

#### Scenario: 初始化过滤状态

**Given** 用户首次访问笔记列表页面  
**When** 组件挂载  
**Then** `selectedSubcategory` 状态应初始化为 `null`  
**And** 表示"全部"状态

#### Scenario: 过滤状态变化时的副作用

**Given** 用户选中了某个子分类  
**When** `selectedSubcategory` 状态改变  
**Then** 应触发 `filteredAndSortedData` 的重新计算  
**And** 应重置 `currentPage` 为 1  
**And** 列表应滚动到顶部（如果适用）

#### Scenario: 多状态协同变化

**Given** 用户执行了某个操作（如切换大分类或全局搜索）  
**When** 触发状态重置的 `useEffect`  
**Then** `selectedSubcategory` 应重置为 `null`  
**And** `currentPage` 应重置为 1  
**And** 应保持状态更新的原子性

## MODIFIED Requirements

无

## REMOVED Requirements

无

## Dependencies

- 依赖 `note-directory-structure.json` 的数据结构
- 与 NoteList 组件的现有过滤、排序、分页功能集成
- 使用 Ant Design 的 Tag 和 CheckableTag 组件

## Notes

- 此功能设计为渐进增强，不影响无子分类的大分类
- 过滤逻辑优先级确保了与现有功能的兼容性
- 未来可扩展为支持多级分类或更复杂的过滤条件
