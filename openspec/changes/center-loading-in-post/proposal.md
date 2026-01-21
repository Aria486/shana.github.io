# Change: 在 Post 组件中居中显示 Loading 组件

## Why

当前 Loading 组件在 Post 组件中显示时，没有居中定位，导致用户体验不佳。加载指示器应该在视觉上处于页面中心位置，这样用户可以清楚地知道内容正在加载中。

## What Changes

- 修改 Post 组件中 Loading 组件的容器样式，添加居中布局
- 使用 flexbox 或绝对定位将 Loading 组件在垂直和水平方向上居中显示
- 确保在不同屏幕尺寸下 Loading 都能正确居中

## Impact

- **影响的规范**: `specs/ui-components/spec.md` (新建)
- **影响的代码**:
  - `src/components/Post/Post.tsx` - 添加 Loading 容器包装
  - `src/components/Post/style.scss` - 添加居中样式规则
- **用户体验**: 改善加载状态的视觉反馈，提升用户体验
- **兼容性**: 无破坏性变更，纯视觉改进
