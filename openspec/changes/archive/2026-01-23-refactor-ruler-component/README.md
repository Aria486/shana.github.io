# Refactor Ruler Component

## 概述

将从外部项目迁移的 `react-ruler` 组件重构为符合项目规范的组件。

## 问题

- 组件使用 `Tw` 前缀，与项目命名规范不符
- 使用 Less 而非项目标准的 SCSS
- 位于 `src/node_code/` 而非标准组件目录
- 代码风格（引号、类型导入等）不一致

## 解决方案

1. **重命名**：`TwReactRuler` → `ReactRuler`，`TwRulerGuide` → `RulerGuide`
2. **保持位置**：组件继续保持在 `src/node_code/react-ruler/`（笔记相关代码目录）
3. **样式转换**：Less → SCSS，更新类名前缀（移除 `tw-`）
4. **代码风格**：统一使用双引号、type 导入、`types.ts` 文件命名等

## 文档

- [proposal.md](./proposal.md) - 详细提案
- [design.md](./design.md) - 技术设计
- [tasks.md](./tasks.md) - 任务清单

## 状态

🟡 **Proposed** - 等待审批

## 影响范围

- 组件位置：`src/node_code/react-ruler/`（不变）
- 无现有代码依赖此组件
- 纯重构，功能不变

## 相关链接

- 原始组件位置：`src/node_code/react-ruler/`
