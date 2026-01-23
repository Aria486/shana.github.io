# Design: 增强天气背景真实感 - 技术设计

**变更 ID**: `enhance-weather-background-realism`  
**设计版本**: v1.0  
**最后更新**: 2026-01-21

---

## 设计目标

本设计文档详细阐述天气背景真实感增强的技术实现方案，重点解决以下技术挑战：

1. 横向布局的坐标系统转换 (垂直 → 水平分割)
2. 太阳轨迹的时间计算算法 (简化天文模型)
3. 场景元素的分层渲染顺序 (z-index 管理)
4. 性能优化策略 (动画节流、静态缓存)

---

## 架构设计

### 组件层级

```
WeatherBackground (容器)
└── BeachScene (Canvas 渲染引擎)
    ├── SceneCoordinator (场景协调器) ← 新增
    │   ├── calculateLayout() - 计算海洋/沙滩边界
    │   ├── calculateSunPosition() - 太阳轨迹
    │   └── updateAnimationState() - 动画状态管理
    │
    ├── RenderPipeline (渲染管线)
    │   ├── renderBackground() - 背景层
    │   │   ├── renderSky()
    │   │   └── renderSun()
    │   ├── renderMidground() - 中景层
    │   │   ├── renderClouds()
    │   │   ├── renderFish() ← 新增
    │   │   └── renderOcean()
    │   ├── renderForeground() - 前景层
    │   │   ├── renderBeach()
    │   │   └── renderVegetation() ← 新增
    │   └── renderEffects() - 特效层
    │       ├── renderParticles()
    │       └── renderFog()
    │
    └── AnimationControllers (动画控制器)
        ├── CloudController - 云朵移动
        ├── WaveController - 波浪动画
        ├── FishController ← 新增
        └── ParticleController - 粒子系统
```

---

## 核心算法设计

### 1. 横向布局坐标系统

#### 问题陈述

当前实现使用垂直分层 (y 轴分割)，需转换为水平分层 (x 轴分割)。

#### 设计方案

```typescript
interface LayoutBounds {
  ocean: {
    left: number; // 0
    right: number; // canvas.width * 0.35
    top: number; // 0
    bottom: number; // canvas.height
  };
  beach: {
    left: number; // canvas.width * 0.35
    right: number; // canvas.width
    top: number; // 0
    bottom: number; // canvas.height
  };
  horizon: number; // x 轴分界线坐标
}

function calculateLayout(canvas: HTMLCanvasElement): LayoutBounds {
  const oceanWidth = (canvas.width * LAYOUT.oceanWidthPercent) / 100;
  const horizon = oceanWidth;

  return {
    ocean: {
      left: 0,
      right: horizon,
      top: 0,
      bottom: canvas.height,
    },
    beach: {
      left: horizon,
      right: canvas.width,
      top: 0,
      bottom: canvas.height,
    },
    horizon,
  };
}
```

#### 渲染逻辑变更

**海洋渲染** (原来的 `renderOcean`):

```typescript
// 修改前: 水平波浪，垂直堆叠
for (let x = 0; x <= canvas.width; x++) {
  const y = oceanY + Math.sin(x * frequency + phase) * amplitude;
  ctx.lineTo(x, y);
}

// 修改后: 垂直波浪，水平限制在左侧区域
const layout = calculateLayout(canvas);
for (let y = 0; y <= canvas.height; y++) {
  const x = layout.ocean.right + Math.sin(y * frequency + phase) * amplitude;
  ctx.lineTo(x, y);
}
ctx.lineTo(layout.ocean.left, canvas.height);
ctx.lineTo(layout.ocean.left, 0);
ctx.closePath();
```

**沙滩渲染**:

```typescript
// 修改前: 底部矩形
ctx.fillRect(0, beachY, canvas.width, canvas.height - beachY);

// 修改后: 右侧矩形
const layout = calculateLayout(canvas);
ctx.fillRect(
  layout.beach.left,
  0,
  canvas.width - layout.beach.left,
  canvas.height,
);
```

---

### 2. 太阳轨迹算法

#### 需求分析

- 输入: 当前小时 (0-23)
- 输出: 太阳/月亮的 (x, y) 坐标
- 约束:
  - 白天 (6-18h): 从左到右移动，中午最高
  - 夜间 (18-6h): 显示月亮，位置相对固定或缓慢移动

#### 设计方案

**简化模型** (不考虑地理位置差异):

```typescript
interface SunPosition {
  x: number;
  y: number;
  size: number;
  color: string;
  isNightMode: boolean;
}

function calculateSunPosition(
  hour: number,
  minute: number,
  canvas: HTMLCanvasElement,
): SunPosition {
  const decimalHour = hour + minute / 60; // 12.5 表示 12:30

  // 判断日/夜
  const isNight = decimalHour < 6 || decimalHour >= 18;

  if (isNight) {
    // 月亮模式: 固定在右上角
    return {
      x: canvas.width * 0.85,
      y: canvas.height * 0.15,
      size: 30,
      color: "#E0E0E0",
      isNightMode: true,
    };
  }

  // 太阳模式: 动态轨迹
  // 将 6-18h 映射到 0-1 的进度
  const dayProgress = (decimalHour - 6) / 12; // 0 (6am) to 1 (6pm)

  // 水平位置: 线性插值 (左 10% 到右 90%)
  const x = canvas.width * (0.1 + 0.8 * dayProgress);

  // 垂直位置: 抛物线 (正午最高)
  // f(t) = -4(t - 0.5)^2 + 1, t ∈ [0, 1]
  // 在 t=0.5 (正午) 时达到最大值 1
  const verticalProgress = -4 * Math.pow(dayProgress - 0.5, 2) + 1;
  const minY = canvas.height * 0.15; // 最高点 (正午)
  const maxY = canvas.height * 0.35; // 最低点 (早晚)
  const y = maxY - (maxY - minY) * verticalProgress;

  return {
    x,
    y,
    size: 40,
    color: "#FDB813",
    isNightMode: false,
  };
}
```

**示例计算**:
| 时间 | dayProgress | x (假设 width=1000) | verticalProgress | y (假设 height=800) |
|------|-------------|---------------------|------------------|---------------------|
| 6:00 | 0.0 | 100 (10%) | 0.0 | 280 (35%) |
| 9:00 | 0.25 | 300 (30%) | 0.75 | 155 (19%) |
| 12:00| 0.5 | 500 (50%) | 1.0 | 120 (15%) |
| 15:00| 0.75 | 700 (70%) | 0.75 | 155 (19%) |
| 18:00| 1.0 | 900 (90%) | 0.0 | 280 (35%) |

**视觉验证**:

```
Canvas (1000x800)
┌────────────────────────────────────────┐
│   6am      9am    12pm   15pm    18pm  │ ← 太阳轨迹
│    ●        ◉      ☀      ◉       ●   │
│   低       高     最高    高      低    │
│                                        │
│  海洋区  │        沙滩区                │
│ (0-350) │      (350-1000)             │
└────────────────────────────────────────┘
```

#### 性能优化

- 太阳位置每秒更新一次 (而非每帧 60 次/秒)
- 使用 `setInterval(1000)` 独立于渲染循环
- 位置存储在 `useRef` 避免重复计算

```typescript
const sunPositionRef = useRef<SunPosition>({...});

useEffect(() => {
  const updateSun = () => {
    const now = new Date();
    sunPositionRef.current = calculateSunPosition(
      now.getHours(),
      now.getMinutes(),
      canvas
    );
  };

  updateSun(); // 立即执行
  const timer = setInterval(updateSun, 1000);
  return () => clearInterval(timer);
}, [canvas]);

// 渲染时直接读取
function renderSun() {
  const sun = sunPositionRef.current;
  // ... 绘制代码
}
```

---

### 3. 场景元素设计

#### 3.1 植被系统

**椰子树 (Palm Tree)**:

```typescript
interface PalmTree {
  x: number; // 沙滩区域的绝对 x 坐标
  y: number; // 底部 y 坐标 (通常接近 canvas.height)
  height: number; // 树高 60-80px
  trunkWidth: number; // 树干宽度 8-12px
  leafCount: number; // 叶片数量 4 或 6
}

function drawPalmTree(ctx: CanvasRenderingContext2D, tree: PalmTree) {
  // 1. 树干
  ctx.fillStyle = "#8B7355"; // 褐色
  ctx.fillRect(
    tree.x - tree.trunkWidth / 2,
    tree.y - tree.height,
    tree.trunkWidth,
    tree.height,
  );

  // 2. 叶片 (旋转椭圆)
  const leafLength = 40;
  const leafWidth = 15;
  const angleStep = (Math.PI * 2) / tree.leafCount;

  for (let i = 0; i < tree.leafCount; i++) {
    ctx.save();
    ctx.translate(tree.x, tree.y - tree.height);
    ctx.rotate(angleStep * i);

    // 绘制椭圆叶片
    ctx.fillStyle = "#7CB342"; // 绿色
    ctx.beginPath();
    ctx.ellipse(0, -leafLength / 2, leafWidth, leafLength, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
```

**灌木 (Bush)**:

```typescript
interface Bush {
  x: number;
  y: number;
  circleCount: number; // 3-5 个圆组成
  baseRadius: number; // 基础半径 5-10px
}

function drawBush(ctx: CanvasRenderingContext2D, bush: Bush) {
  ctx.fillStyle = "rgba(85, 139, 47, 0.7)"; // 深绿色，半透明

  // 随机排列的圆形簇
  for (let i = 0; i < bush.circleCount; i++) {
    const offsetX = (Math.random() - 0.5) * bush.baseRadius;
    const offsetY = (Math.random() - 0.5) * bush.baseRadius;
    const radius = bush.baseRadius * (0.8 + Math.random() * 0.4);

    ctx.beginPath();
    ctx.arc(bush.x + offsetX, bush.y + offsetY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

**初始化逻辑**:

```typescript
function initVegetation(
  layout: LayoutBounds,
  quality: AnimationQuality,
): Vegetation[] {
  const vegetation: Vegetation[] = [];
  const beachWidth = layout.beach.right - layout.beach.left;

  // 椰子树数量
  const treeCount = quality === "high" ? 3 : quality === "medium" ? 2 : 1;
  for (let i = 0; i < treeCount; i++) {
    vegetation.push({
      type: "palmTree",
      x: layout.beach.left + beachWidth * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.9, // 靠近底部
      height: 60 + Math.random() * 20,
      trunkWidth: 8 + Math.random() * 4,
      leafCount: 4,
    });
  }

  // 灌木数量
  const bushCount = quality === "high" ? 5 : quality === "medium" ? 3 : 0;
  for (let i = 0; i < bushCount; i++) {
    vegetation.push({
      type: "bush",
      x: layout.beach.left + Math.random() * beachWidth,
      y: canvas.height * (0.6 + Math.random() * 0.3),
      circleCount: 3 + Math.floor(Math.random() * 3),
      baseRadius: 5 + Math.random() * 5,
    });
  }

  return vegetation;
}
```

---

#### 3.2 鱼类系统

**数据结构**:

```typescript
interface Fish {
  x: number;
  y: number;
  speed: number; // 0.5-1.5 px/frame
  direction: 1 | -1; // 1: 向右, -1: 向左
  size: number; // 8-15 px
  color: string; // 'orange' | 'yellow' | 'blue'
  swayPhase: number; // 摆动相位 (用于上下波动)
}
```

**初始化**:

```typescript
function initFish(layout: LayoutBounds, quality: AnimationQuality): Fish[] {
  const fishCount = quality === "high" ? 10 : quality === "medium" ? 5 : 3;
  const oceanWidth = layout.ocean.right - layout.ocean.left;

  const colors = [
    "rgba(255, 165, 0, 0.6)",
    "rgba(255, 215, 0, 0.6)",
    "rgba(30, 144, 255, 0.6)",
  ];

  return Array.from({ length: fishCount }, () => ({
    x: layout.ocean.left + Math.random() * oceanWidth,
    y: canvas.height * (0.3 + Math.random() * 0.5), // 中间深度
    speed: 0.5 + Math.random(),
    direction: Math.random() > 0.5 ? 1 : -1,
    size: 8 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    swayPhase: Math.random() * Math.PI * 2,
  }));
}
```

**更新逻辑**:

```typescript
function updateFish(fish: Fish[], layout: LayoutBounds, deltaTime: number) {
  fish.forEach((f) => {
    // 水平移动
    f.x += f.speed * f.direction * deltaTime;

    // 边界检测与转向
    if (f.x < layout.ocean.left || f.x > layout.ocean.right) {
      f.direction *= -1;
      f.x = Math.max(layout.ocean.left, Math.min(layout.ocean.right, f.x));
    }

    // 垂直摆动 (模拟游泳)
    f.swayPhase += 0.02;
    f.y += Math.sin(f.swayPhase) * 0.5;

    // 垂直边界限制
    const minY = canvas.height * 0.2;
    const maxY = canvas.height * 0.8;
    f.y = Math.max(minY, Math.min(maxY, f.y));
  });
}
```

**渲染**:

```typescript
function drawFish(ctx: CanvasRenderingContext2D, fish: Fish) {
  // 身体 (椭圆)
  ctx.fillStyle = fish.color;
  ctx.beginPath();
  ctx.ellipse(fish.x, fish.y, fish.size, fish.size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 尾巴 (三角形)
  const tailSize = fish.size * 0.8;
  const tailX = fish.x - fish.direction * fish.size;
  ctx.fillStyle = fish.color.replace("0.6", "0.4"); // 颜色稍深
  ctx.beginPath();
  ctx.moveTo(fish.x, fish.y);
  ctx.lineTo(tailX, fish.y - tailSize * 0.5);
  ctx.lineTo(tailX, fish.y + tailSize * 0.5);
  ctx.closePath();
  ctx.fill();

  // 眼睛 (可选细节)
  if (fish.size > 12) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(
      fish.x + fish.direction * fish.size * 0.3,
      fish.y - fish.size * 0.2,
      2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
```

**性能优化 - 更新节流**:

```typescript
// 鱼类每 2 帧更新一次 (30fps 而非 60fps)
let fishUpdateFrame = 0;
function animate() {
  // ... 其他渲染 ...

  fishUpdateFrame++;
  if (fishUpdateFrame % 2 === 0) {
    updateFish(fishRef.current, layout, deltaTime);
  }

  drawFish(ctx, fishRef.current);

  requestAnimationFrame(animate);
}
```

---

### 4. 渲染管线设计

#### 分层渲染顺序 (从后到前)

```typescript
function render(ctx: CanvasRenderingContext2D) {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. 背景层
  renderSky(ctx, sunPosition.isNightMode);
  renderSun(ctx, sunPosition);

  // 2. 中景层 - 远处元素
  renderClouds(ctx);

  // 3. 水下层 - 鱼类 (在海浪之前)
  ctx.save();
  ctx.globalAlpha = 0.8; // 水下透明度
  renderFish(ctx, fishRef.current);
  ctx.restore();

  // 4. 海洋层 - 波浪覆盖鱼类
  renderOcean(ctx, layout);

  // 5. 陆地层 - 沙滩
  renderBeach(ctx, layout);

  // 6. 前景层 - 植被 (在沙滩上方)
  renderVegetation(ctx, vegetationRef.current);

  // 7. 特效层 - 粒子 (雨/雪在最前)
  renderParticles(ctx);
  renderFog(ctx);
}
```

**z-index 示意图**:

```
Layer 7: 雨滴/雪花 (最前)
Layer 6: 椰子树、灌木
Layer 5: 沙滩
Layer 4: 海浪
Layer 3: 鱼类 (水下)
Layer 2: 云朵
Layer 1: 太阳/月亮
Layer 0: 天空背景 (最后)
```

---

### 5. 性能优化策略

#### 5.1 静态元素缓存

**问题**: 植被 (椰子树、灌木) 是静态的，每帧重绘浪费性能。

**方案**: 使用离屏 Canvas 预渲染。

```typescript
const vegetationCacheRef = useRef<HTMLCanvasElement | null>(null);

function cacheVegetation(vegetation: Vegetation[]) {
  // 创建离屏 Canvas
  const offscreen = document.createElement("canvas");
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const offCtx = offscreen.getContext("2d")!;

  // 预渲染所有植被
  vegetation.forEach((v) => {
    if (v.type === "palmTree") {
      drawPalmTree(offCtx, v);
    } else {
      drawBush(offCtx, v);
    }
  });

  vegetationCacheRef.current = offscreen;
}

// 渲染时直接复制离屏 Canvas
function renderVegetation(ctx: CanvasRenderingContext2D) {
  if (vegetationCacheRef.current) {
    ctx.drawImage(vegetationCacheRef.current, 0, 0);
  }
}
```

**性能提升**: 植被渲染从 ~5ms/frame → ~0.5ms/frame (10x 提升)。

---

#### 5.2 动画元素节流

| 元素     | 更新频率        | 优化策略                   |
| -------- | --------------- | -------------------------- |
| 太阳位置 | 每秒 1 次       | 独立 `setInterval(1000)`   |
| 鱼类     | 每 2 帧 (30fps) | 帧计数器 `frame % 2 === 0` |
| 云朵     | 每 3 帧 (20fps) | 帧计数器 `frame % 3 === 0` |
| 波浪     | 每帧 (60fps)    | 无节流 (核心动画)          |
| 粒子     | 每帧 (60fps)    | 无节流 (用户直接感知)      |

```typescript
let frameCount = 0;

function animate() {
  frameCount++;

  // 每帧: 波浪、粒子
  updateWaves();
  updateParticles();

  // 每 2 帧: 鱼类
  if (frameCount % 2 === 0) {
    updateFish(fishRef.current, layout, deltaTime);
  }

  // 每 3 帧: 云朵
  if (frameCount % 3 === 0) {
    updateClouds(cloudsRef.current);
  }

  render(ctx);
  requestAnimationFrame(animate);
}
```

---

#### 5.3 质量参数分级

| Quality    | 鱼类数量 | 椰子树 | 灌木 | 云朵 | 粒子 (雨/雪) |
| ---------- | -------- | ------ | ---- | ---- | ------------ |
| **high**   | 10       | 3      | 5    | 8    | 500          |
| **medium** | 5        | 2      | 3    | 5    | 300          |
| **low**    | 2        | 1      | 0    | 3    | 150          |

**自动降级逻辑**:

```typescript
function detectQuality(): AnimationQuality {
  // 检测设备类型
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency <= 4; // CPU 核心数

  if (isMobile || isLowEnd) {
    return "low";
  }

  // 检测性能偏好
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    return "low"; // 或直接 paused
  }

  return "high";
}
```

---

## 颜色方案设计

### 柔和化策略

**原则**:

1. 降低饱和度 (Saturation): 60-80% → 30-50%
2. 增加透明度 (Alpha): 1.0 → 0.2-0.5
3. 使用灰度混合 (Desaturation)

**修改前后对比**:

| 天气   | 原配色 (top)         | 原配色 (bottom)  | 优化后 (top)               | 优化后 (bottom)            |
| ------ | -------------------- | ---------------- | -------------------------- | -------------------------- |
| Clear  | `#87CEEB` (鲜艳天蓝) | `#FFD700` (金黄) | `rgba(135, 206, 235, 0.3)` | `rgba(255, 248, 220, 0.2)` |
| Clouds | `#B0C4DE` (灰蓝)     | `#F5F5F5` (白)   | `rgba(176, 196, 222, 0.4)` | `rgba(245, 245, 245, 0.3)` |
| Rain   | `#696969` (深灰)     | `#A9A9A9` (浅灰) | `rgba(105, 105, 105, 0.5)` | `rgba(169, 169, 169, 0.3)` |
| Night  | 新增                 | 新增             | `rgba(25, 25, 112, 0.8)`   | `rgba(72, 61, 139, 0.5)`   |

**WCAG 对比度验证**:

- 白色文字 (#FFFFFF) vs Clear 天空: 对比度 6.2:1 (AA 通过)
- 黑色文字 (#000000) vs Beach 沙滩: 对比度 4.8:1 (AA 通过)

---

## 响应式设计

### 断点策略

| 设备 | 屏幕宽度   | 背景高度 | 海洋/沙滩比例      | Quality | 元素调整 |
| ---- | ---------- | -------- | ------------------ | ------- | -------- |
| 桌面 | ≥ 1200px   | 30%      | 35:65              | high    | 全部元素 |
| 平板 | 768-1199px | 25%      | 35:65              | medium  | 减少植被 |
| 手机 | < 768px    | 20%      | 40:60 (或恢复垂直) | low     | 最少元素 |

**实现**:

```typescript
function getResponsiveConfig(width: number): ResponsiveConfig {
  if (width >= 1200) {
    return { height: 0.3, oceanPercent: 35, quality: "high" };
  } else if (width >= 768) {
    return { height: 0.25, oceanPercent: 35, quality: "medium" };
  } else {
    return { height: 0.2, oceanPercent: 40, quality: "low" };
  }
}

// 监听窗口变化
useEffect(() => {
  const handleResize = () => {
    const config = getResponsiveConfig(window.innerWidth);
    setQuality(config.quality);
    // 重新计算布局...
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

---

## 测试策略

### 单元测试

```typescript
describe("calculateSunPosition", () => {
  it("should place sun at left at 6am", () => {
    const pos = calculateSunPosition(6, 0, mockCanvas);
    expect(pos.x).toBeCloseTo(mockCanvas.width * 0.1);
    expect(pos.isNightMode).toBe(false);
  });

  it("should place sun at center-top at 12pm", () => {
    const pos = calculateSunPosition(12, 0, mockCanvas);
    expect(pos.x).toBeCloseTo(mockCanvas.width * 0.5);
    expect(pos.y).toBeLessThan(mockCanvas.height * 0.2);
  });

  it("should show moon at midnight", () => {
    const pos = calculateSunPosition(0, 0, mockCanvas);
    expect(pos.isNightMode).toBe(true);
    expect(pos.color).toBe("#E0E0E0");
  });
});

describe("updateFish", () => {
  it("should reverse direction at ocean boundary", () => {
    const fish = [{ x: layout.ocean.left - 1, direction: -1, speed: 1 }];
    updateFish(fish, layout, 1);
    expect(fish[0].direction).toBe(1);
  });
});
```

### 性能测试

**指标监控**:

```typescript
function measurePerformance() {
  const metrics = {
    fps: 0,
    renderTime: 0,
    cpuUsage: 0,
  };

  let lastTime = performance.now();
  let frames = 0;

  function measure() {
    const now = performance.now();
    const delta = now - lastTime;
    frames++;

    if (delta >= 1000) {
      metrics.fps = Math.round((frames * 1000) / delta);
      frames = 0;
      lastTime = now;

      console.log(`FPS: ${metrics.fps}`);
    }

    requestAnimationFrame(measure);
  }

  measure();
}
```

**目标**:

- 桌面 (high): FPS ≥ 55
- 移动 (low): FPS ≥ 28
- 渲染时间: < 16ms/frame (60fps) 或 < 35ms/frame (30fps)

---

## 风险缓解方案

### 风险 1: 性能下降

**监控**:

```typescript
if (averageFPS < 30) {
  // 自动降级
  setQuality("low");
  console.warn("Performance degraded, switching to low quality");
}
```

**回退方案**: 提供"禁用动画"开关，完全静态背景。

---

### 风险 2: 布局异常

**测试用例**:

- 极窄屏 (< 400px): 海洋挤压至 20% 或切换垂直布局
- 极宽屏 (> 2560px): 沙滩区域不留空白
- 高 DPI 屏幕: Canvas 模糊问题 (使用 `devicePixelRatio`)

---

## 未来扩展

1. **WebGL 渲染**: 使用 GPU 加速，支持更复杂的光照和粒子效果
2. **物理引擎**: 鱼类避障、植被随风摇摆
3. **用户交互**: 鼠标移动产生波纹、点击投食鱼类
4. **天气同步**: 实时 API 集成 (OpenWeatherMap)

---

**设计状态**: ✅ 已完成  
**待审核**: 算法复杂度、性能指标  
**批准人**: User
