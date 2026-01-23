# UI Components Specification Delta

## ADDED Requirements

### Requirement: Post 组件 Loading 状态居中显示

Post 组件在内容加载期间 MUST 将 Loading 指示器显示在视觉中心位置，以提供清晰的加载反馈。

#### Scenario: 内容加载时显示居中的 Loading

- **WHEN** Post 组件开始加载 Markdown 内容（`isLoading === true`）
- **THEN** Loading 组件 MUST 显示在 Post 容器的水平和垂直中心
- **AND** Loading 容器 MUST 占据足够的空间（最小高度建议 200px）以确保可见性
- **AND** Loading 动画 MUST 在视觉中心清晰可见

#### Scenario: 响应式布局下的居中显示

- **WHEN** 用户在不同设备上查看加载状态（桌面、平板、手机）
- **THEN** Loading 组件 MUST 在所有视口尺寸下保持居中对齐
- **AND** 居中效果 MUST 不受 Post 组件内边距影响

#### Scenario: 加载完成后的状态切换

- **WHEN** 内容加载完成（`isLoading === false` 且 `!error`）
- **THEN** Loading 容器 MUST 被移除
- **AND** Markdown 内容 MUST 正常显示，不受之前 Loading 样式影响
- **AND** 页面布局 MUST 平滑过渡，无闪烁或跳动
