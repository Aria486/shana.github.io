# Responsive Layout Specification

# change: refactor-layout-mobile-responsive

## ADDED Requirements

### Requirement: 移动端断点检测 Hook

系统 MUST 提供 `useIsMobile` Hook，封装基于 `window.matchMedia` 的视口检测逻辑，供组件层使用，以避免在组件内部分散使用媒体查询逻辑。

#### Scenario: 移动端视口下返回 true

- **GIVEN** 应用运行在视口宽度 ≤ 768px 的环境（例如手机浏览器）
- **WHEN** 组件调用 `useIsMobile()`
- **THEN** Hook 返回值 MUST 为 `true`

#### Scenario: 桌面端视口下返回 false

- **GIVEN** 应用运行在视口宽度 > 768px 的环境
- **WHEN** 组件调用 `useIsMobile()`
- **THEN** Hook 返回值 MUST 为 `false`

#### Scenario: 视口尺寸动态变化时响应更新

- **GIVEN** 用户调整浏览器窗口大小，从桌面端宽度缩小至移动端宽度（≤ 768px）
- **WHEN** 视口宽度穿越 768px 断点
- **THEN** `useIsMobile()` 返回值 MUST 从 `false` 变为 `true`
- **AND** 依赖此 Hook 的组件 MUST 相应重新渲染并切换至移动端布局

---

### Requirement: 响应式布局断点规范

项目 MUST 统一使用 `src/assets/styles/_breakpoints.scss` 中定义的断点变量和 mixin，不得在组件样式中硬编码宽度值。

#### Scenario: 使用 mixin 编写移动端条件样式

- **GIVEN** 需要为某组件编写移动端（≤ 768px）特有样式
- **WHEN** 开发者在 `.scss` 文件中编写条件样式
- **THEN** 样式 MUST 使用 `@include mobile { ... }` mixin
- **AND NOT** 直接硬编码 `@media (max-width: 768px)` 字面值

#### Scenario: JS 层断点值与 SCSS 断点值一致

- **GIVEN** `useIsMobile` Hook 使用的断点默认值
- **WHEN** 与 `_breakpoints.scss` 中的 `$breakpoint-mobile` 对比
- **THEN** 两者 MUST 均为 `768px`，保持一致
