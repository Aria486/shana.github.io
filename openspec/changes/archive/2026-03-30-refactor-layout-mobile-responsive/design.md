# Design: refactor-layout-mobile-responsive

## 架构决策

### 1. 移动端检测方案

**候选方案：**

| 方案                                               | 描述                        | 优点                           | 缺点                                                                    |
| -------------------------------------------------- | --------------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| A. CSS-only 媒体查询                               | 仅通过 SCSS 控制 Sider 显隐 | 无 JS 开销                     | 无法在 React 层控制 Drawer 的挂载/卸载，Drawer state 仍需 JS            |
| B. `window.matchMedia` + 自定义 Hook `useIsMobile` | 在 React 层检测视口         | 可精确控制组件逻辑，可单元测试 | 需初始化时处理 SSR/hydration（本项目为纯 SPA，无影响）                  |
| C. Ant Design `Grid.useBreakpoint()`               | 使用 antd 内置断点 Hook     | 与 antd 保持一致               | 断点集合与项目已有 `_breakpoints.scss` 不完全对齐，且引入 antd 隐式依赖 |

**决策：选择方案 B**

理由：

- 项目已有 `_breakpoints.scss`（`$breakpoint-mobile: 768px`），保持一致性
- 自定义 Hook 放入 `src/hooks/`，可独立测试
- 纯 SPA，无 SSR 水合问题

### 2. 侧边栏组件选型

| 方案                                         | 描述                               |
| -------------------------------------------- | ---------------------------------- |
| A. 移动端切换为 `Drawer`，桌面端保持 `Sider` | 两种 DOM 结构，语义最清晰          |
| B. 始终使用 `Sider`，通过折叠接口控制        | 复用同一组件，但折叠宽度控制较繁琐 |

**决策：选择方案 A**

- 桌面端渲染 `<Sider width="25%">`，行为与当前一致
- 移动端渲染 `<Drawer placement="left">`，通过 `open` state 控制显隐
- 两者内部内容（`sider` prop）保持相同，零重复

### 3. 汉堡按钮位置

汉堡按钮放置于 `BlogLayout` 内部 Header 行的左侧（通过给 `BlogLayout` 的 header 区域前置一个菜单按钮），**不修改 `Header` 组件本身**。

`BlogLayout` 维护 `drawerOpen: boolean` 状态，仅在移动端且有 `sider` prop 时渲染汉堡按钮。

### 4. `BlogLayout` 接口变更

`IBlogLayout` **不新增必填 prop**，只新增可选控制 prop：

```ts
interface IBlogLayout {
  // 原有 props 保持不变 ...
  defaultSiderOpen?: boolean; // 仅用于测试或 SSR
}
```

### 5. 新 Hook：`useIsMobile`

```ts
// src/hooks/useIsMobile.ts
export const useIsMobile = (breakpoint = 768): boolean
```

- 使用 `window.matchMedia('(max-width: ${breakpoint}px)')` 订阅变化
- Jest 中通过 `Object.defineProperty(window, 'matchMedia', ...)` mock

### 6. 样式策略

- 汉堡按钮容器样式在 `BlogLayout/style.scss` 中通过已有 `@mixin mobile` 控制可见性
- Drawer 宽度固定为 `280px`（约 85% 移动端屏幕）
- 天气背景模式下 Drawer 背景使用 `backdrop-filter: blur(20px)`，与现有 `.ant-modal-content` 规则保持一致

## 组件数据流

```
BlogLayout
  ├── state: isMobile (来自 useIsMobile hook)
  ├── state: drawerOpen (boolean, 默认 false)
  │
  ├── [桌面端] Sider width="25%"  ← 渲染 sider prop
  │
  └── [移动端]
        ├── 汉堡按钮 (仅当 sider 存在时显示)
        └── Drawer placement="left"  ← 渲染 sider prop
              └── 点击遮罩/关闭 → setDrawerOpen(false)
```

## 测试策略

- `useIsMobile.test.ts`：mock `matchMedia`，测试 `true`/`false` 切换
- `BlogLayout.test.tsx`：新增用例
  - 移动端视口下汉堡按钮可见
  - 点击汉堡按钮打开 Drawer
  - 桌面端视口下无汉堡按钮，Sider 渲染正常
