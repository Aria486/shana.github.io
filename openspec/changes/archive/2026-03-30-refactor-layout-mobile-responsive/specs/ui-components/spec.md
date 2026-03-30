# UI Components — Spec Delta

# change: refactor-layout-mobile-responsive

## MODIFIED Requirements

### Requirement: BlogLayout 移动端侧边栏响应式行为

`BlogLayout` 组件 MUST 根据视口宽度自适应侧边栏的渲染方式，确保移动端用户能够通过可收起面板访问侧边栏内容，同时不破坏桌面端行为。

#### Scenario: 桌面端侧边栏静态展示

- **GIVEN** 视口宽度 > 768px
- **AND** `sider` prop 存在
- **WHEN** 页面渲染完成
- **THEN** `Sider` 组件 MUST 以 25% 宽度固定展示在内容区左侧
- **AND** 汉堡菜单按钮 MUST NOT 出现在页面上

#### Scenario: 移动端侧边栏默认隐藏

- **GIVEN** 视口宽度 ≤ 768px
- **AND** `sider` prop 存在
- **WHEN** 页面初始化渲染
- **THEN** 侧边栏内容 MUST NOT 可见（Drawer 默认关闭）
- **AND** 汉堡菜单按钮 MUST 显示在 Header 区域左侧
- **AND** 内容区 MUST 占据全部可用宽度

#### Scenario: 移动端打开侧边栏 Drawer

- **GIVEN** 视口宽度 ≤ 768px
- **AND** `sider` prop 存在
- **WHEN** 用户点击汉堡菜单按钮
- **THEN** Drawer MUST 从左侧滑入并展示 `sider` 内容
- **AND** Drawer 遮罩 MUST 覆盖内容区域

#### Scenario: 移动端关闭侧边栏 Drawer

- **GIVEN** Drawer 当前为开启状态（移动端）
- **WHEN** 用户点击遮罩区域
- **OR WHEN** 用户点击 Drawer 关闭按钮
- **THEN** Drawer MUST 收起并完全隐藏
- **AND** 内容区域 MUST 恢复可交互状态

#### Scenario: 无 sider prop 时不渲染相关控件

- **GIVEN** `sider` prop 未传入或为 `undefined`
- **WHEN** 任意视口宽度下渲染 `BlogLayout`
- **THEN** 汉堡按钮 MUST NOT 渲染
- **AND** Sider / Drawer MUST NOT 渲染

#### Scenario: 天气背景模式下 Drawer 毛玻璃效果

- **GIVEN** `useWeatherBackground === true`
- **AND** 移动端 Drawer 显示
- **WHEN** Drawer 展开
- **THEN** Drawer 面板 MUST 应用 `backdrop-filter: blur` 毛玻璃效果，与其他组件（Modal、Card）风格一致
