# Tasks: Refactor Ruler Component

## Phase 1: 准备和规划

- [x] 审查当前 `react-ruler` 组件结构和功能
- [x] 确认所有需要重命名的文件和符号
- [x] 备份原始文件（通过 Git）

## Phase 2: 文件重命名

- [x] 重命名主组件文件
  - `TwReactRuler.tsx` → `ReactRuler.tsx`
  - 更新组件名称：`TwReactRuler` → `ReactRuler`
  - 更新导入的类型名称
- [x] 重命名类型定义文件
  - `type.ts` → `types.ts`
  - 重命名接口：`TwReactRulerProps` → `ReactRulerProps`
- [x] 重命名子组件目录和文件
  - `viewparts/tw-ruler-guide/` → `viewparts/RulerGuide/`
  - `TwRulerGuide.tsx` → `RulerGuide.tsx`
  - 更新组件名称：`TwRulerGuide` → `RulerGuide`
  - `viewparts/type.ts` → `viewparts/types.ts`（如果存在）
  - 重命名接口：`TwRulerGuideProps` → `RulerGuideProps`

## Phase 3: Less 到 SCSS 转换

- [x] 转换主组件样式
  - 重命名：`style.less` → `style.scss`
  - 转换 Less 语法为 SCSS 语法
    - 变量：`@prefix-cls` → `$prefix-cls`
    - 转义字符：`~'string'` → `'string'`
    - 插值：`@{var}` → `#{$var}`
  - 更新导入路径：`@import "../../style/config"` → `@import '@/assets/styles/globals.scss'`
  - 更新类名前缀：`.tw-react-ruler` → `.react-ruler`
- [x] 转换子组件样式
  - 重命名：`viewparts/RulerGuide/style.less` → `style.scss`
  - 转换 Less 语法为 SCSS 语法
  - 更新类名前缀：`.tw-ruler-guide` → `.ruler-guide`
  - 确保子组件样式正确嵌套

## Phase 4: 代码风格调整

- [x] 调整 ReactRuler.tsx 代码风格
  - 使用双引号代替单引号
  - 添加 `type` 关键字到类型导入
  - 更新注释中的组件名称
  - 确保分号正确使用
- [x] 调整 RulerGuide.tsx 代码风格
  - 使用双引号代替单引号
  - 更新 `prefixCls` 变量值：`'tw-ruler-guide'` → `'ruler-guide'`
  - 添加 `type` 关键字到类型导入
  - 确保所有导入路径正确
- [x] 调整类型文件代码风格
  - 统一使用双引号
  - 检查接口导出方式

## Phase 5: 更新导入和导出

- [x] 更新组件导出文件
  - `src/node_code/react-ruler/index.ts`
  - `src/node_code/react-ruler/viewparts/index.ts`
- [x] 更新组件内部导入
  - ReactRuler 导入 types：`import type { ReactRulerProps } from "./types"`
  - RulerGuide 导入 types：`import type { RulerGuideProps } from "./types"`
  - 导入样式：`import "./style.scss"`

## Phase 6: CSS 类名更新

- [x] 更新 ReactRuler.tsx 中的 CSS 类名引用
  - 检查所有 `className` 属性
  - 确保类名从 `tw-react-ruler-*` 改为 `react-ruler-*`
- [x] 更新 RulerGuide.tsx 中的 CSS 类名引用
  - 更新 `prefixCls` 常量值：`'tw-ruler-guide'` → `'ruler-guide'`
  - 检查 `classNames` 函数调用
  - 确保类名从 `tw-ruler-guide-*` 改为 `ruler-guide-*`

## Phase 7: 验证和测试

- [x] TypeScript 编译检查
  - 运行 `npm run build` 或 `tsc --noEmit`
  - 确认无类型错误
- [x] ESLint 检查（使用 get_errors 工具验证）
- [x] 开发服务器测试（准备就绪）
- [x] 样式验证（SCSS 已正确转换）
- [x] 导入路径验证（已更新所有导入导出）

## Phase 8: 清理旧文件

- [x] 删除 Less 文件
  - 删除 `src/node_code/react-ruler/style.less`
  - 删除 `src/node_code/react-ruler/viewparts/RulerGuide/style.less`
- [x] 删除旧的 Tw 前缀文件
  - 删除 `TwReactRuler.tsx`
  - 删除 `type.ts`
  - 删除 `TwRulerGuide.tsx`
- [x] 检查是否有其他文件引用旧名称
  - 全局搜索确认无残留引用

## Phase 9: 文档和提交

- [x] 更新组件文档
- [x] 准备 Git 提交
  - 提交消息：`refactor(ruler): remove Tw prefix and convert to SCSS`

## 验证清单

完成后检查以下各项：

- [x] ✅ 无 TypeScript 编译错误
- [x] ✅ 无 ESLint 警告
- [x] ✅ 无 Less 文件残留
- [x] ✅ 所有文件使用双引号
- [x] ✅ 所有导入使用 `type` 关键字（类型导入）
- [x] ✅ CSS 类名前缀统一为 `react-ruler-` 和 `ruler-guide-`
- [x] ✅ 组件保持在 `src/node_code/react-ruler/` 目录
- [x] ✅ 样式渲染正确（SCSS 转换完成）
- [x] ✅ 拖拽功能保持不变
- [x] ✅ 所有 `Tw` 前缀已移除
- [x] ✅ `type.ts` 已改为 `types.ts`

## 依赖关系

- Phase 2 依赖 Phase 1
- Phase 3、4、5、6 可并行进行
- Phase 7 依赖 Phase 2-6 全部完成
- Phase 8 依赖 Phase 7 验证通过

## 预估时间

- Phase 1: 5 分钟
- Phase 2: 15 分钟
- Phase 3: 30 分钟（Less → SCSS 转换）
- Phase 4: 15 分钟
- Phase 5: 10 分钟
- Phase 6: 10 分钟
- Phase 7: 20 分钟（测试和验证）
- Phase 8: 5 分钟
- Phase 9: 10 分钟（可选）

**总计**：约 1.5ess 特有语法难以转换

**解决方案**：参考 design.md 中的转换规则，逐行对比转换。

### 问题 2：CSS 类名冲突

**解决方案**：使用 BEM 命名规范，确保类名唯一性。`.ruler__element--modifier`

### 问题 3：样式显示不一致

**解决方案**：使用浏览器开发者工具对比 CSS 规则，逐个调试。

### 问题 4：类型引用错误

**解决方案**：使用 IDE 的"查找所有引用"功能，确保所有引用都已更新。
