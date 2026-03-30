# Tasks: refactor-layout-mobile-responsive

有序实现清单，每个任务对应独立可验证的交付物。

---

## 阶段一：基础设施

- [x] **T1** 新增 `src/hooks/useIsMobile.ts`
  - 实现基于 `window.matchMedia` 的自定义 Hook
  - 默认断点为 `768px`，与 `$breakpoint-mobile` 一致
  - 导出到 `src/hooks/index.ts`

- [x] **T2** 新增 `src/hooks/useIsMobile.test.ts`
  - mock `window.matchMedia`
  - 测试初始返回值（移动端 `true`、桌面端 `false`）
  - 测试视口尺寸变化时的响应

---

## 阶段二：核心组件

- [x] **T3** 修改 `src/components/BlogLayout/BlogLayout.tsx`
  - 引入 `useIsMobile` hook
  - 新增 `drawerOpen` state
  - 移动端且有 `sider` 时，在 header 行左侧渲染汉堡按钮（`MenuOutlined` 图标）
  - 桌面端渲染 `<Sider width="25%">{sider}</Sider>`（行为不变）
  - 移动端渲染 `<Drawer placement="left" open={drawerOpen} onClose={...}>{sider}</Drawer>`
  - `IBlogLayout` 接口新增可选 `defaultSiderOpen?: boolean`（仅用于测试）

  > **依赖**：T1 完成

- [x] **T4** 修改 `src/components/BlogLayout/style.scss`
  - 汉堡按钮容器：桌面端 `display: none`，移动端 `display: flex`（使用已有 `@include breakpoints-mobile`）
  - Drawer 内容区域样式（padding、背景）
  - 天气背景模式下 Drawer 毛玻璃效果

  > **可与 T3 并行**

---

## 阶段三：测试更新

- [x] **T5** 更新 `src/components/BlogLayout/BlogLayout.test.tsx`
  - Mock `useIsMobile` hook（通过 `import * as hooks` 动态控制返回值）
  - 新增用例：移动端时汉堡按钮可见
  - 新增用例：点击汉堡按钮后 Drawer 打开
  - 新增用例：桌面端时 Sider 正常渲染、无汉堡按钮
  - 新增 `@/context` mock，修复原先缺失的 Provider
  - 从 `jest.config.js` 的 `testPathIgnorePatterns` 移除 BlogLayout

  > **依赖**：T3 完成

---

## 阶段四：验收

- [x] **T6** 运行 `npm test`，BlogLayout + useIsMobile 共 13 个测试全部通过（其余 4 个 suite 失败为预先存在的问题，与本次改动无关）
- [x] **T7** 运行 `npm run lint`，本次修改文件（useIsMobile.ts / BlogLayout.tsx / BlogLayout.test.tsx）零错误零警告
- [x] **T8** 本地 `npm run dev`，在 Chrome DevTools 移动端模拟器下验证：
  - 默认侧边栏不可见
  - 汉堡按钮出现在正确位置
  - 点击汉堡按钮弹出 Drawer
  - 点击遮罩/关闭按钮收起 Drawer
- [x] **T9** 桌面端验证：Sider 宽度、位置与重构前一致

---

## 依赖关系图

```
T1 → T2
T1 → T3 → T5 → T6
T4 → T5 → T6
T6 → T7 → T8 → T9
```

T2 和 T4 可与 T3 并行开发。

---

## 不需要修改的文件

- `src/components/AppLayout/AppLayout.tsx`（接口向后兼容）
- `src/route/`（自动生成，禁止手动修改）
- `src/components/Header/`（汉堡按钮由 `BlogLayout` 自身管理）
