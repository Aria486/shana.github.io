# Refactor Beach Scene to Pixel Art Components

将 BeachScene 完全重构为像素艺术风格，并拆分成独立的组件。

## 快速概览

- **Change ID**: `refactor-pixel-beach-components`
- **状态**: 草稿 (Draft)
- **影响范围**: Weather Background 组件（完全重构）
- **破坏性变更**: 无（仅视觉效果和内部实现变化）
- **新增依赖**: 无

## 目标

1. **像素化所有元素** - 天空、云朵、海洋、沙滩全部改为像素艺术风格
2. **组件化拆分** - 每个元素抽取为独立组件
3. **简化代码** - 移除复杂的渐变、噪声、粒子系统

## 主要变更

### 新增组件

1. **PixelSky.tsx** - 纯色天空（#5DA8FF）
2. **PixelClouds.tsx** - 像素云朵（白色方块组合）
3. **PixelOcean.tsx** - 分层波浪海洋（3-5 层）
4. **PixelBeach.tsx** - 纯色沙滩（#F4A460）

### 删除功能

- ❌ 渐变效果（天空、海洋、沙滩）
- ❌ 噪声生成器（波浪）
- ❌ 粒子系统（雨/雪）
- ❌ 太阳渲染（含光晕）
- ❌ 200 个沙粒纹理

### 重构主组件

- BeachScene.tsx 从 346 行减少到约 100-150 行
- 作为容器组件，协调子组件渲染
- 简化动画循环

## 架构设计

### 组件结构

```
WeatherBackground/
├── BeachScene.tsx          (主容器，~100 行)
├── PixelSky.tsx           (天空，~50 行)
├── PixelClouds.tsx        (云朵，~100 行)
├── PixelOcean.tsx         (海洋，~100 行)
├── PixelBeach.tsx         (沙滩，~30 行)
└── types.ts               (类型定义)
```

### 渲染流程

```typescript
// BeachScene.tsx - 容器组件
const animate = () => {
  ctx.imageSmoothingEnabled = false; // 禁用抗锯齿

  // 按顺序调用各组件
  renderPixelSky({ ctx, canvas, color: "#5DA8FF" });
  renderPixelOcean({ ctx, canvas, phase, waterLine, seaFloor });
  renderPixelBeach({ ctx, canvas, beachTop, beachLeft });
  renderPixelClouds({ ctx, canvas, phase, clouds });

  phase += 0.01;
  requestAnimationFrame(animate);
};
```

### 像素云朵图案示例

```typescript
const CLOUD_PATTERNS = [
  // 小云朵
  [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  // ... 更多图案
];
```

## 实现计划

11 个任务，分 3 个阶段：

### 阶段 1：创建像素组件（任务 1-4）

- PixelBeach - 纯色沙滩
- PixelSky - 纯色天空
- PixelClouds - 像素云朵 + 图案数据
- PixelOcean - 分层波浪

### 阶段 2：重构主组件（任务 5-6）

- 清理旧代码（删除 ~200 行）
- 集成新组件（重写渲染逻辑）

### 阶段 3：优化完善（任务 7-11）

- 云朵初始化优化
- 代码清理
- 性能测试
- 单元测试
- 更新任务清单

详细任务见 [tasks.md](./tasks.md)。

## 成功标准

✅ 所有元素以像素风格渲染  
✅ 每个元素独立组件封装  
✅ BeachScene.tsx ≤ 150 行  
✅ 各组件文件 ≤ 100 行  
✅ 删除所有未使用代码  
✅ 通过 TypeScript 编译，无 lint 警告  
✅ 帧率 ≥ 60 FPS  
✅ 动画流畅，云朵移动正常

## 视觉效果对比

### 之前（真实感）

- 渐变天空
- 椭圆云朵 + 透明度
- 噪声波浪
- 渐变沙滩 + 粒子纹理

### 之后（像素艺术）

- 纯色天空 #5DA8FF
- 白色像素块云朵
- 分层纯色波浪（#0066CC → #3399FF → #66CCFF）
- 纯色沙滩 #F4A460

## 代码量对比

| 文件            | 之前       | 之后        | 变化       |
| --------------- | ---------- | ----------- | ---------- |
| BeachScene.tsx  | 346 行     | ~120 行     | -226 行    |
| PixelSky.tsx    | -          | ~50 行      | +50 行     |
| PixelClouds.tsx | -          | ~100 行     | +100 行    |
| PixelOcean.tsx  | -          | ~100 行     | +100 行    |
| PixelBeach.tsx  | -          | ~30 行      | +30 行     |
| **总计**        | **346 行** | **~400 行** | **+54 行** |

虽然总代码量略增，但：

- 可维护性大幅提升（组件化）
- 单个文件更简洁易懂
- 易于测试和扩展

## 后续扩展

基于新架构，后续可轻松添加：

- PixelSun - 像素化太阳
- PixelRain/PixelSnow - 像素化粒子
- PixelBird - 像素化飞鸟
- PixelPalmTree - 像素化棕榈树

每个新元素只需创建一个新组件文件。

## 相关资源

- [完整提案](./proposal.md)
- [任务清单](./tasks.md)
- [规范增量](./specs/weather-background/spec.md)
- [项目上下文](../../project.md)

---

**准备好开始实施了吗？** 🚀
