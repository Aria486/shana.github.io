# Design: Beach-Ocean Background

## Architecture Overview

本设计将现有的天气背景组件重构为沙滩海洋背景，采用左右布局结构。核心架构保持 React 组件模式，但引入新的波浪渲染引擎。

```
┌─────────────────────────────────────────┐
│       WeatherBackground Component       │
│  (现有组件，保持接口不变)                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         BeachScene Component            │
│  ┌──────────────┬─────────────────────┐ │
│  │   Ocean      │      Beach          │ │
│  │   (35%)      │      (65%)          │ │
│  │ ┌──────────┐ │  ┌───────────────┐  │ │
│  │ │ WaveLayer│ │  │ Sand Texture  │  │ │
│  │ │ (多层)   │ │  │ (静态渲染)    │  │ │
│  │ └──────────┘ │  └───────────────┘  │ │
│  └──────────────┴─────────────────────┘ │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Simplex Noise Generator            │
│  (用于生成自然波浪曲线)                   │
└─────────────────────────────────────────┘
```

## Component Structure

### 1. WeatherBackground (现有组件)

**职责**：

- 管理组件生命周期
- 处理设备性能检测
- 提供质量设置
- 传递天气数据到场景

**修改**：最小化修改，仅调整 BeachScene 的调用方式

### 2. BeachScene (重构)

**职责**：

- Canvas 渲染管理
- 布局划分（左右结构）
- 协调海洋和沙滩的渲染

**关键方法**：

```typescript
renderOcean(): void       // 渲染左侧海洋区域
renderBeach(): void       // 渲染右侧沙滩区域
renderWaveLayers(): void  // 渲染多层波浪
updateAnimation(): void   // 更新动画帧
```

### 3. WaveLayer (新增)

**职责**：

- 生成单层波浪
- 使用 Simplex 噪声创建波浪曲线
- 管理波浪的动画状态

**关键属性**：

```typescript
interface WaveLayerConfig {
  color: string; // 波浪颜色
  opacity: number; // 透明度
  amplitude: number; // 波浪振幅
  frequency: number; // 波浪频率
  speed: number; // 波动速度
  basePosition: number; // 基准位置（距左侧的距离）
}
```

## Layout Design

### 画布划分

```
0                        35%                         100%
├────────────────────────┼──────────────────────────────┤
│                        │                              │
│    Ocean Region        │      Beach Region            │
│                        │                              │
│  ╱╲    Wave Layer 1    │   ░░░░░░░░░░░░░░░░░░░░░     │
│ ╱  ╲                   │   ░ Sand Texture ░░░░░░     │
│╱    ╲  Wave Layer 2    │   ░░░░░░░░░░░░░░░░░░░░░     │
│      ╲                 │                              │
│       ╲ Wave Layer 3   │                              │
│                        │                              │
└────────────────────────┴──────────────────────────────┘
```

### 坐标系统

- **X 轴**：0 (左) → canvas.width (右)
- **Y 轴**：0 (上) → canvas.height (下)
- **海洋边界**：x = canvas.width \* 0.35
- **沙滩起点**：x = canvas.width \* 0.35

## Wave Generation Algorithm

### Simplex 噪声应用

beachx 项目使用 Simplex 噪声在**水平方向**生成波浪曲线（X 固定，Y 变化）。我们需要调整为**垂直方向**（Y 固定，X 变化）。

**原 beachx 方法（水平波浪）**：

```typescript
for (let x = 0; x <= canvas.width; x += 5) {
  const y = noise2D(xoff, yoff);
  points.push({ x, y: y * 100 + delta });
  xoff += 0.005;
}
```

**调整后的方法（垂直波浪）**：

```typescript
for (let y = 0; y <= canvas.height; y += 5) {
  const x = noise2D(yoff, xoff);
  points.push({
    x: baseX + x * amplitude,
    y,
  });
  yoff += 0.005;
}
xoff += 0.006; // 时间维度更新
```

### 多层波浪配置

**质量级别对应的层数**：

- `high`: 4 层
- `medium`: 3 层
- `low`: 2 层

**每层配置示例**：

```typescript
const waveLayers = [
  { color: "#1e3a5f", opacity: 0.9, amplitude: 10, basePosition: 0.05 },
  { color: "#2c5f8d", opacity: 0.8, amplitude: 8, basePosition: 0.12 },
  { color: "#4a7ba7", opacity: 0.7, amplitude: 6, basePosition: 0.2 },
  { color: "#6ca5a0", opacity: 0.6, amplitude: 4, basePosition: 0.28 },
];
```

## Rendering Pipeline

### 渲染顺序

```
1. 清除画布
2. 渲染天空背景（渐变）
3. 渲染太阳/月亮（可选）
4. 渲染云朵（可选）
5. 渲染海洋波浪（从深到浅，从左到右）
   ├─ Layer 1 (最左侧，最深色)
   ├─ Layer 2
   ├─ Layer 3
   └─ Layer 4 (最右侧，最浅色)
6. 渲染沙滩背景
7. 渲染粒子效果（雨/雪，可选）
8. 渲染雾气效果（可选）
```

### 波浪路径构建

每层波浪的封闭路径：

```
起点: (0, 0)
     ↓
边线: (0, canvas.height)
     ↓
波浪底部边界: (baseX, canvas.height)
     ↓
波浪曲线: noise2D 生成的点序列（从下到上）
     ↓
波浪顶部边界: (baseX, 0)
     ↓
闭合回到起点
```

## Performance Considerations

### 优化策略

1. **质量自适应**：
   - 检测设备性能（CPU 核心数、屏幕宽度）
   - 根据性能调整波浪层数和采样点密度

2. **帧率控制**：
   - 使用 `requestAnimationFrame`
   - 低端设备降低更新频率（每 2-3 帧更新一次）

3. **内存优化**：
   - 复用点数组，避免频繁创建新数组
   - 使用 `Float32Array` 存储大量数值

4. **渲染优化**：
   - 沙滩纹理只渲染一次，缓存结果
   - 静态元素（太阳、云朵）使用离屏 canvas

### 降级方案

| 性能级别 | 波浪层数 | 采样密度 | 更新频率 |
| -------- | -------- | -------- | -------- |
| High     | 4        | 每 5px   | 60 FPS   |
| Medium   | 3        | 每 8px   | 60 FPS   |
| Low      | 2        | 每 10px  | 30 FPS   |

## Integration with Weather System

### 天气条件映射

不同天气条件下的波浪参数调整：

**晴天 (Clear)**：

- 波浪颜色：蓝绿色调
- 振幅：较小（平静）
- 频率：较低

**雨天 (Rain)**：

- 波浪颜色：深蓝灰色
- 振幅：较大（波涛汹涌）
- 频率：较高
- 额外效果：雨滴粒子

**暴风雨 (Thunderstorm)**：

- 波浪颜色：深灰色
- 振幅：最大
- 频率：最高
- 额外效果：闪电效果

## Code Organization

### 文件结构

```
src/components/WeatherBackground/
├── index.ts                    (导出)
├── WeatherBackground.tsx       (主组件，轻微修改)
├── BeachScene.tsx             (重构，新增波浪逻辑)
├── types.ts                   (类型定义，新增 WaveLayer 相关)
├── sceneConfigs.ts           (场景配置，调整参数)
├── style.scss                (样式)
├── utils/
│   ├── waveGenerator.ts      (新增：波浪生成工具)
│   └── noiseUtils.ts         (新增：噪声工具封装)
└── __tests__/                (测试)
```

### 新增工具函数

**waveGenerator.ts**：

```typescript
export function generateWavePoints(
  canvas: HTMLCanvasElement,
  config: WaveLayerConfig,
  phase: number,
): Point[];

export function drawWavePath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  config: WaveLayerConfig,
): void;
```

**noiseUtils.ts**：

```typescript
export function createNoiseGenerator(seed?: number): Noise2D;

export function getNoiseValue(
  noise: Noise2D,
  x: number,
  y: number,
  scale: number,
): number;
```

## Migration Path

从现有实现迁移到新设计的步骤：

1. ✅ **保留现有 API**：WeatherBackground 接口不变
2. 📦 **添加依赖**：安装 `simplex-noise`
3. 🔧 **重构 BeachScene**：
   - 移除现有的简单波浪渲染
   - 添加多层波浪系统
   - 调整渲染布局为左右结构
4. 🎨 **调整视觉参数**：根据测试调整颜色、振幅等
5. ⚡ **性能优化**：确保达到目标帧率
6. ✅ **测试验证**：不同设备、不同天气条件

## Testing Strategy

### 单元测试

- 波浪点生成算法
- 噪声工具函数
- 配置映射逻辑

### 集成测试

- 不同质量设置下的渲染
- 不同天气条件的切换
- 性能基准测试

### 视觉测试

- 截图对比（回归测试）
- 动画流畅度评估
- 跨浏览器兼容性

## Open Questions

1. **波浪速度**：每层波浪是否应有不同的速度？
2. **交互性**：是否需要响应鼠标移动（如波浪跟随）？
3. **可配置性**：是否需要暴露用户可调整的参数（如波浪强度）？
4. **泡沫效果**：是否实现 beachx 中的泡沫粒子效果？

## References

- [beachx GitHub](https://github.com/ildarnm/beachx) - 原始实现参考
- [simplex-noise](https://www.npmjs.com/package/simplex-noise) - 噪声库文档
- [Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) - 渲染 API
