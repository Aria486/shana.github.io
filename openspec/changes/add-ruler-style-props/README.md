# Add Ruler Style Props

**Status**: ✅ Proposal Complete  
**Change ID**: `add-ruler-style-props`  
**Created**: 2026-01-23

## Quick Summary

为 ReactRuler 组件添加两个可选的样式属性 `strokeStyle` 和 `font`，允许外部自定义标尺的颜色和字体。

## What's Included

### 📄 Documents

- ✅ [proposal.md](proposal.md) - 问题陈述、解决方案、目标
- ✅ [tasks.md](tasks.md) - 9 个任务，估计 40 分钟

### 🎯 Key Features

- 添加 `strokeStyle` 属性（标尺颜色）
- 添加 `font` 属性（标尺字体）
- 保持向后兼容（可选属性 + 默认值）
- 类型安全（TypeScript 支持）

## API Changes

### Before

```typescript
<ReactRuler
  direction="top"
  start={0}
  end={2000}
  scale={100}
/>
// 颜色和字体固定为 "rgb(161, 174, 179)" 和 "10px Arial"
```

### After

```typescript
<ReactRuler
  direction="top"
  start={0}
  end={2000}
  scale={100}
  strokeStyle="red"           // 可选：自定义颜色
  font="12px Helvetica"       // 可选：自定义字体
/>
```

## Dependencies

无依赖其他变更。

## Next Steps

1. 审查提案：确认需求和 API 设计符合预期
2. 开始实施：按照 tasks.md 逐步实现
3. 测试验证：验证默认值和自定义值

## Timeline

- **类型定义**: 10 分钟
- **组件实现**: 15 分钟
- **测试验证**: 15 分钟
- **总计**: ~40 分钟

---

_Created by AI Assistant following OpenSpec workflow_
