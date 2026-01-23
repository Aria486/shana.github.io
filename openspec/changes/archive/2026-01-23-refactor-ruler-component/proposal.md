# Proposal: Refactor Ruler Component

## 概述

将从其他项目迁移过来的 `react-ruler` 组件重构为符合当前项目代码规范的组件，主要包括：

- 移除 `Tw` 前缀，统一命名风格
- 从 Less 迁移到 SCSS
- 适配项目的代码风格和架构规范
- 组织文件结构符合项目约定

## 动机

当前 `src/node_code/react-ruler` 组件是从外部项目迁移而来，存在以下问题：

1. **命名不一致**：组件使用 `Tw` 前缀（`TwReactRuler`、`TwRulerGuide`），与项目其他组件命名风格不符
2. **样式不一致**：使用 Less 而非项目标准的 SCSS
3. **文件组织不一致**：位于 `src/node_code/` 而非 `src/components/`
4. **Less 特性**：使用了 Less 特有的语法（`@prefix-cls`、`~''` 转义），需要转换为 SCSS
5. **类型定义**：接口命名带有 `Tw` 前缀，需要统一

## 目标

- ✅ 保持组件在 `src/node_code/react-ruler` 目录（笔记相关代码位置）
- ✅ 移除所有 `Tw` 前缀，重命名为 `ReactRuler`、`RulerGuide`
- ✅ 将 `style.less` 转换为 `style.scss`，使用项目 SCSS 规范
- ✅ 更新类型定义文件名：`type.ts` → `types.ts`
- ✅ 确保组件功能不变（动态标尺显示）
- ✅ 添加组件测试（可选，但推荐）

## 范围界定

### 包含

- 重命名组件和类型（移除 Tw 前缀）
- 重命名类型文件：`type.ts` → `types.ts`
- Less 到 SCSS 转换
- 更新 CSS 类名前缀
- 适配项目代码风格（如引号、分号、类型注解）

### 不包含

- 修改组件功能逻辑
- 改变组件 API（props 保持不变）
- 性能优化（除非必要）
- 添加新特性

## 风险评估

### 低风险

- 组件是新迁移的，暂无使用方依赖
- 纯重构工作，不改变功能逻辑
- 文件路径变更清晰明确

### 缓解措施

- 完整的文件对比检查
- 确保 CSS 类名转换正确（Less 变量 → SCSS 变量）
- 验证构建无错误

## 依赖关系

- 无外部依赖，组件内部自包含
- 依赖项目现有的 SCSS 配置和全局样式

## 成功标准

- [x] 所有 `Tw` 前缀已移除
- [x] 组件保持在 `src/node_code/react-ruler/` 目录
- [x] 使用 SCSS 样式，无 Less 文件
- [x] TypeScript 编译无错误
- [x] 样式渲染效果与原组件一致
- [x] CSS 类名前缀统一（无 `tw-` 前缀）

## 备选方案

### 方案 A：保留 Less（不推荐）

保留 Less 文件，添加 Less 支持到构建配置。

**缺点**：违背项目统一使用 SCSS 的原则，增加维护复杂度。

### 方案 B：CSS-in-JS（不推荐）

使用 styled-components 或 emotion。

**缺点**：与项目现有样式方案不一致，引入新依赖。

### 方案 C：完全迁移到 components（已否决）

迁移到 `src/components/Ruler`。

**为何不选**：`node_code` 是专门存放笔记相关代码的位置，迁移会破坏项目组织逻辑。

## 时间估计

- 文件重命名：20 分钟
- Less 到 SCSS 转换：30 分钟
- 代码风格调整：20 分钟
- 测试和验证：20 分钟
- **总计**：约 1.5 小时

## 下一步

1. 创建 `design.md` 明确技术细节
2. 创建 `tasks.md` 分解具体任务
3. 等待审批后开始实施
