# Proposal: Add Ruler Style Props

**Change ID**: `add-ruler-style-props`  
**Status**: Draft  
**Created**: 2026-01-23  
**Author**: AI Assistant

## Problem Statement

当前 ReactRuler 组件的标尺样式（颜色和字体）是硬编码的：

- `strokeStyle`: 固定为 `"rgb(161, 174, 179)"`
- `font`: 固定为 `"10px Arial"`

这导致无法根据不同的主题或设计需求自定义标尺外观，限制了组件的灵活性和可复用性。

**用户影响**：

- 无法适配暗色主题（标尺颜色不可改）
- 无法调整字体大小和字体族
- 组件缺乏定制化能力

## Proposed Solution

在 `ReactRulerProps` 接口中添加两个可选属性，允许外部自定义标尺样式：

1. **strokeStyle**: 标尺线条和文字的颜色（默认：`"rgb(161, 174, 179)"`）
2. **font**: 标尺刻度文字的字体样式（默认：`"10px Arial"`）

这些属性作为可选参数，保持向后兼容性。

## Goals

1. ✅ 允许自定义标尺颜色
2. ✅ 允许自定义标尺字体
3. ✅ 保持向后兼容（现有代码无需修改）
4. ✅ 使用合理的默认值

## Non-Goals

- 不添加其他样式属性（如 lineWidth, backgroundColor 等）
- 不改变组件的核心功能和行为
- 不涉及标尺的绘制逻辑改动

## Dependencies

无依赖其他变更。

## Risks and Mitigations

**风险 1**: 破坏现有使用  
**缓解**: 属性为可选，使用默认值，完全向后兼容

**风险 2**: 无效的 CSS 值导致渲染问题  
**缓解**: 使用 TypeScript 类型约束，在文档中说明合法值

## Success Criteria

- [x] ReactRulerProps 接口包含 strokeStyle 和 font 属性
- [x] 默认值与当前硬编码值一致
- [x] 可以通过 props 传入自定义值
- [x] 现有代码无需修改即可正常工作
- [x] TypeScript 类型检查通过

## Alternatives Considered

**方案 A**: 添加完整的样式对象

- ❌ 过于复杂，超出当前需求

**方案 B**: 使用 CSS 变量

- ❌ Canvas 绘制不支持 CSS 变量

**方案 C**: 仅添加 strokeStyle 和 font 属性 ✅

- ✅ 简单、直接、满足需求
- ✅ 与 Canvas API 一致

## Timeline Estimate

- 设计和规范：15 分钟
- 实现：15 分钟
- 测试：10 分钟
- **总计**: ~40 分钟
