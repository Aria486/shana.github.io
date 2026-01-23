# Tasks: Centralize Markdown Overrides Configuration

## Overview

重构 Post 组件的 Markdown overrides 配置，将简单的自定义组件映射提取到独立的配置文件中，保留处理逻辑在 Post 组件中。

## Prerequisites

- ✅ 熟悉 markdown-to-jsx 库的 overrides API
- ✅ 了解当前 Post 组件的实现
- ✅ 了解项目的组件导出机制

## Task Breakdown

### Phase 1: 准备工作

- [x] **Task 1.1**: 审查当前 Post.tsx 中所有使用的自定义组件
  - 验证：列出所有需要迁移的组件列表
  - 依赖：无
  - 预估时间：5分钟
  - ✅ 完成：确认了 Loading, PdfViewer, ReactRuler, ScalableRuler, RulerGuideDemo, DesignToolRuler

### Phase 2: 创建配置文件

- [x] **Task 2.1**: 创建 `src/utils/markdownConfig.tsx`
  - 内容：导出 `markdownComponents` 对象
  - 包含：简单的组件映射（不包含处理逻辑）
  - 验证：类型检查通过
  - 依赖：Task 1.1
  - 预估时间：10分钟
  - ✅ 完成：创建了配置文件导出 markdownComponents

- [x] **Task 2.2**: 迁移自定义组件导入到配置文件
  - 导入列表：
    - `Loading, PdfViewer` from `@/components`
    - `ReactRuler, ScalableRuler, RulerGuideDemo, DesignToolRuler` from `@/note_code/react-ruler`
  - 验证：配置文件无类型错误
  - 依赖：Task 2.1
  - 预估时间：5分钟
  - ✅ 完成：所有组件导入已迁移

- [x] **Task 2.3**: 创建组件映射配置
  - 创建简单的组件映射对象
  - 不包含 code, pre, Code 等处理逻辑
  - 验证：配置对象结构正确
  - 依赖：Task 2.2
  - 预估时间：5分钟
  - ✅ 完成：markdownComponents 对象包含 6 个组件映射

### Phase 3: 重构 Post 组件

- [x] **Task 3.1**: 更新 Post.tsx 导入语句
  - 保留 Code 组件导入（用于处理逻辑）
  - 保留 Loading 组件导入（用于 isLoading 显示）
  - 添加 `markdownComponents` 导入
  - 验证：无未使用的导入警告
  - 依赖：Task 2.3
  - 预估时间：5分钟
  - ✅ 完成：导入已优化
  - 依赖：Task 4.2
  - 预估时间：5分钟

### Phase 5: 代码质量检查

- [ ] **Task 5.1**: 运行 ESLint 检查
  - 命令：`npm run lint`
  - 验证：无新增 lint 错误
  - 依赖：Task 4.3
  - 预估时间：3分钟

- [ ] **Task 5.2**: TypeScript 类型检查
  - 命令：`npx tsc --noEmit`
  - 验证：无类型错误
  - 依赖：Task 5.1
  - 预估时间：3分钟

- [ ] **Task 5.3**: 代码审查清单
  - 检查导入语句是否清晰
  - 检查配置文件是否有适当的注释
  - 检查是否有未使用的代码
  - 验证：代码质量符合项目规范
  - 依赖：Task 5.2
  - 预估时间：5分钟

### Phase 6: 文档更新

- [ ] **Task 6.1**: 更新相关注释（如需要）
  - 在 markdownConfig 中添加文件头注释
  - 说明配置文件的用途和使用方式
  - 验证：注释清晰易懂

- [x] **Task 3.2**: 保留处理逻辑并解构组件映射
  - 保留 code, pre, Code 处理逻辑在 Post.tsx 中
  - 使用 `...markdownComponents` 解构组件映射
  - 验证：语法正确，无类型错误
  - 依赖：Task 3.1
  - 预估时间：5分钟
  - ✅ 完成：处理逻辑保留，组件映射解构

### Phase 4: 验证

- [x] **Task 4.1**: 代码结构验证
  - 检查 Post.tsx 导入正确
  - 检查 markdownConfig.tsx 导出正确
  - 验证组件映射解构语法
  - 依赖：Task 3.2
  - 预估时间：3分钟
  - ✅ 完成：代码结构正确

### Phase 5: 文档更新

- [x] **Task 5.1**: 更新配置文件注释
  - 添加文件头注释说明用途
  - 添加 markdownComponents 注释
  - 验证：注释清晰易懂
  - 依赖：Task 4.1
  - 预估时间：3分钟
  - ✅ 完成：已添加完整注释

- [x] **Task 5.2**: 更新 tasks.md
  - 标记所有完成的任务
  - 更新任务描述以反映实际实现
  - 验证：任务清单准确
  - 依赖：Task 5.1
  - 预估时间：5分钟
  - ✅ 完成：已更新

- [x] **Task 5.3**: 修复循环依赖问题
  - 创建 src/components/markdownComponents.ts
  - 从专用导出文件导入组件
  - 验证：无循环依赖错误
  - 预估时间：10分钟
  - ✅ 完成：已修复

## Estimated Total Time

约 40 分钟（实际）

## Success Criteria Checklist

- [x] 创建了 markdownConfig.tsx 配置文件
- [x] 配置文件只包含简单的组件映射
- [x] Post.tsx 保留了 code/pre/Code 处理逻辑
- [x] Post.tsx 使用 ...markdownComponents 解构组件映射
- [x] 导入语句已优化（移除了 4 个组件导入：PdfViewer, ReactRuler, ScalableRuler, RulerGuideDemo, DesignToolRuler）
- [x] 代码结构清晰、易维护
- [x] 配置文件有完整的文档注释

## Notes

- ✅ 实际实现：只提取简单的组件映射，保留处理逻辑在 Post 组件中
- ✅ 这样避免了将组件处理逻辑拆分到配置文件，保持了代码的内聚性
- ✅ 未来添加新的自定义组件只需在 markdownConfig.tsx 中添加一行映射
