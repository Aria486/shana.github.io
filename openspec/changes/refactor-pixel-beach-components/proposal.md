# Proposal: Refactor Beach Scene to Pixel Art Components

**Change ID**: `refactor-pixel-beach-components`  
**Status**: Draft  
**Created**: 2026-02-05  
**Author**: AI Assistant

## Problem Statement

当前 BeachScene 组件存在以下问题：

1. **渲染风格混乱**：使用复杂的渐变、噪声生成等真实感渲染技术
2. **代码臃肿**：单个文件 346 行，包含多个未使用的函数（renderOceanDepth、renderBeach、renderOceanWaves 已注释）
3. **职责不清**：一个组件负责所有渲染逻辑（天空、太阳、云朵、海洋、沙滩、粒子）
4. **难以维护**：所有渲染逻辑耦合在一起，修改困难

**用户需求**：

- 将所有元素改为像素艺术风格
- 每个元素拆分成独立组件（沙滩、海洋、天空等）
- 代码清晰、易于维护

## Proposed Solution

**完全重构 BeachScene 组件**，采用像素艺术风格和组件化架构：

### 1. 像素化所有元素

将所有视觉元素替换为简单的像素艺术风格：

**天空 (PixelSky)**

- 纯色背景 #5DA8FF
- 移除渐变

**云朵 (PixelClouds)**

- 白色像素块组合
- 使用 2D 数组定义图案
- 整数坐标移动

**海洋 (PixelOcean)**

- 3-5 层纯色条带（#0066CC → #3399FF → #66CCFF）
- 离散化正弦波浪线
- 像素对齐动画

**沙滩 (PixelBeach)**

- 纯色填充 #F4A460
- 移除渐变和粒子

**太阳 (PixelSun)** (可选)

- 像素化圆形或方形
- 纯色填充 #FDB813

### 2. 组件化拆分

创建独立的渲染组件：

```
WeatherBackground/
├── BeachScene.tsx (主容器)
├── PixelSky.tsx
├── PixelClouds.tsx
├── PixelOcean.tsx
├── PixelBeach.tsx
├── PixelSun.tsx (可选)
└── types.ts
```

每个组件：

- 接收 canvas context 和配置 props
- 负责单一视觉元素的渲染
- 独立的更新逻辑（如需要）

### 3. 主组件简化

BeachScene.tsx 作为容器组件：

- 管理 canvas 和动画循环
- 协调各子组件的渲染顺序
- 传递共享状态（画布尺寸、相位等）

## Architecture

### 组件接口设计

```typescript
// 共享类型
interface PixelRenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  phase: number;
  pixelSize: number;
}

// 天空组件
interface PixelSkyProps extends PixelRenderContext {
  color: string;
}

// 云朵组件
interface PixelCloudsProps extends PixelRenderContext {
  clouds: Cloud[];
  showClouds: boolean;
}

// 海洋组件
interface PixelOceanProps extends PixelRenderContext {
  waterLine: number;
  seaFloor: number;
}

// 沙滩组件
interface PixelBeachProps extends PixelRenderContext {
  beachTop: number;
  beachLeft: number;
  color: string;
}
```

### 渲染流程

```typescript
// BeachScene.tsx
const animate = () => {
  // 配置像素渲染
  ctx.imageSmoothingEnabled = false;

  // 按顺序渲染各层
  renderPixelSky({ ctx, canvas, phase, pixelSize, color: "#5DA8FF" });
  renderPixelOcean({ ctx, canvas, phase, pixelSize, waterLine, seaFloor });
  renderPixelBeach({
    ctx,
    canvas,
    phase,
    pixelSize,
    beachTop,
    beachLeft,
    color: "#F4A460",
  });
  renderPixelClouds({ ctx, canvas, phase, pixelSize, clouds, showClouds });

  phase += 0.01;
  requestAnimationFrame(animate);
};
```

## Implementation Strategy

### 阶段 1：创建像素渲染组件

1. 创建 `PixelSky.tsx` - 纯色天空
2. 创建 `PixelClouds.tsx` - 像素云朵（包含图案数据）
3. 创建 `PixelOcean.tsx` - 分层波浪海洋
4. 创建 `PixelBeach.tsx` - 纯色沙滩

### 阶段 2：重构主组件

1. 删除所有旧的渲染函数
2. 导入新的像素组件
3. 简化动画循环，调用组件渲染函数
4. 清理未使用的代码（噪声生成器、粒子等）

### 阶段 3：优化和测试

1. 测试各组件独立工作
2. 测试集成后的完整场景
3. 性能验证
4. 代码清理

## Benefits

**代码质量**：

- 单一职责原则：每个组件只负责一个元素
- 代码量减少：移除复杂的渐变、噪声、粒子逻辑
- 易于理解：每个文件 50-100 行，清晰明了

**可维护性**：

- 独立组件易于修改
- 可单独测试每个元素
- 易于添加新元素或替换现有元素

**性能**：

- 像素艺术渲染更简单高效
- 无需复杂计算（噪声、渐变）
- 帧率提升

**扩展性**：

- 易于添加新的像素化元素
- 可复用组件（其他场景也能用）
- 支持主题或配色切换

## Impact Analysis

### Breaking Changes

无。BeachScene 的 props 接口保持不变。

### Affected Files

**删除/大幅修改**：

- `BeachScene.tsx` - 从 346 行减少到约 100 行

**新增**：

- `PixelSky.tsx` (~50 行)
- `PixelClouds.tsx` (~100 行，包含图案数据)
- `PixelOcean.tsx` (~100 行)
- `PixelBeach.tsx` (~30 行)

**可能不再需要**：

- `utils/noiseUtils.ts` (如果其他地方不用)
- `utils/waveGenerator.ts` (如果其他地方不用)

### Dependencies

无新增外部依赖。移除对 simplex-noise 的部分使用。

## Migration Path

用户无需任何操作。视觉效果会自动更新为像素艺术风格。

## Success Criteria

1. **功能完整**：
   - 所有元素以像素风格渲染
   - 动画流畅运行
   - 云朵移动正常
   - 海洋波浪动画正常

2. **代码质量**：
   - BeachScene.tsx ≤ 150 行
   - 每个组件文件 ≤ 100 行
   - 无 TypeScript 错误
   - 无 lint 警告

3. **性能**：
   - 帧率 ≥ 60 FPS
   - 无明显卡顿

4. **可维护性**：
   - 每个组件职责单一
   - 代码清晰易读
   - 易于测试

## Open Questions

1. **粒子系统（雨/雪）是否保留？**
   - 建议：暂时移除，后续可以像素化方式重新实现

2. **太阳是否需要像素化？**
   - 建议：暂时移除，专注于沙滩场景的核心元素

3. **组件是作为函数还是 React 组件？**
   - 建议：使用纯函数（渲染函数），不需要 React 组件生命周期

4. **是否需要响应式像素大小？**
   - 建议：使用固定像素大小 4，简化实现
