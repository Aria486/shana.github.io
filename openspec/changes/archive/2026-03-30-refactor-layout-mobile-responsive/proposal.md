# Proposal: refactor-layout-mobile-responsive

## 概述

重构 `BlogLayout` 及相关布局组件，使其全面支持移动端。核心改变是：在桌面端保持现有侧边栏（Sider）行为，在移动端将侧边栏改为可收起的抽屉（Drawer），并提供汉堡菜单按钮进行切换。

## 背景与动机

当前 `BlogLayout` 中的 `Sider` 使用 Ant Design 的 `<Sider width="25%">` 静态渲染，在移动端（≤ 768px）直接占据 25% 宽度，导致：

1. **内容区域严重压缩**：768px 以下的屏幕内容区宽度不足 75%，阅读体验极差。
2. **无法收起**：侧边栏没有折叠/隐藏机制，移动端无法关闭它。
3. **Header 未适配移动端**：缺少触发侧边栏的入口控件。
4. **断点系统已存在但未使用**：项目已有 `_breakpoints.scss`，但 `BlogLayout` 的样式未使用这些断点。

## 目标

| #   | 目标                                                            |
| --- | --------------------------------------------------------------- |
| 1   | 移动端（≤ 768px）侧边栏默认隐藏，通过汉堡按钮触发 `Drawer` 展开 |
| 2   | 桌面端（> 768px）侧边栏保持现有 25% 固定宽度行为不变            |
| 3   | Drawer 可通过遮罩点击或关闭按钮收起                             |
| 4   | `BlogLayout` 的 `IBlogLayout` 接口向后兼容，不破坏现有调用方    |
| 5   | 响应式断点复用已有 `_breakpoints.scss` 变量/mixin               |
| 6   | 覆盖相关单元测试                                                |

## 不在范围内

- 重构 Header 组件内部的其他功能
- 新增底部导航栏（Tab Bar）等移动端导航范式
- 改变路由或国际化逻辑

## 影响评估

| 文件                             | 改动类型                                |
| -------------------------------- | --------------------------------------- |
| `BlogLayout/BlogLayout.tsx`      | MODIFIED — 增加移动端检测与 Drawer 逻辑 |
| `BlogLayout/style.scss`          | MODIFIED — 增加移动端响应式样式         |
| `BlogLayout/BlogLayout.test.tsx` | MODIFIED — 更新/新增测试用例            |
| `AppLayout/AppLayout.tsx`        | 无需修改（接口向后兼容）                |

## 风险

- Ant Design `Drawer` 在天气背景模式（`useWeatherBackground`）下的毛玻璃效果需要额外验证。
- `useMediaQuery`（或等效实现）在 SSR 场景无影响，但需确保 Jest 环境可 mock `window.matchMedia`。

## 关联规范

- `openspec/specs/ui-components/spec.md` — 需新增移动端响应式布局要求
- `openspec/changes/refactor-layout-mobile-responsive/specs/responsive-layout/spec.md` — 新增 `responsive-layout` 能力规范
