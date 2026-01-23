# 设计更新：横截面视角

## 原设计问题

原设计实现的是**俯视图**左右分割（左侧海洋，右侧沙滩），但用户需求是**横截面视角**（侧视图）。

## 新设计：横截面视角

### 视觉布局

```
┌──────────────────────────────────────────────┐
│              Sky Area (10-15%)               │ ← 天空/云层
├──────────────────────────────────────────────┤
│  🌊≈≈≈≈  Wave Surface (5-10%)  ≈≈≈≈🌊        │ ← 动态波浪表面
├──────────────────────────────────────────────┤
│                                              │
│  Deep Blue                    Light Blue     │
│  Ocean Depth                  Shallow Water  │ ← 海洋深度渐变
│  (60-70%)        ←───────→    (Beach Water)  │
│                   Transition                 │
│                                     ┌────────┤
│                                     │  Sand  │ ← 沙滩（15-20%）
└─────────────────────────────────────┴────────┘
       海底                              沙滩地表
```

### 关键元素

1. **海洋表面波浪**（顶部 5-10%）
   - 水平方向的 Simplex 噪声波浪
   - 2-3 层叠加，模拟真实海浪
   - 颜色：深蓝 → 白色（波峰泡沫）

2. **海洋深度**（中部 60-70%）
   - 垂直渐变：深蓝（深海）→ 浅蓝（浅滩）
   - 可选：添加简单的水波纹理
   - 右侧与沙滩过渡区域

3. **沙滩地形**（底部+右侧 15-20%）
   - 使用噪声生成地形轮廓线
   - 沙粒纹理渲染
   - 颜色渐变（边缘深，中心浅）

4. **天空**（顶部 10-15%）
   - 简单渐变或纯色
   - 可选：云层动画

### 坐标系统

- X 轴：水平方向（0 到 width）
- Y 轴：垂直方向（0=顶部，height=底部）
- 波浪基准线：`waterLine = height * 0.25`（画面 25% 处）
- 海底线：`seaFloor = height * 0.85`（画面 85% 处）
- 沙滩起点：`beachStart = width * 0.7`（画面右侧 30%）

### 渲染顺序

1. 填充海洋背景渐变（深蓝 → 浅蓝，从左到右，从上到下）
2. 绘制沙滩地形填充
3. 绘制海洋表面波浪（多层）
4. 可选：绘制天空和云层

## 技术实现变更

### waveGenerator.ts 修改

```typescript
// 从垂直波浪改为水平波浪
export function generateHorizontalWavePoints(
  width: number,
  waterLine: number, // 水位线 y 坐标
  amplitude: number,
  frequency: number,
  phase: number,
  noise: NoiseFunction2D,
): Point[] {
  const points: Point[] = [];
  const sampleRate = 4; // 每 4 像素采样一次

  for (let x = 0; x <= width; x += sampleRate) {
    const noiseValue = getNoiseValue(noise, x * frequency, phase, 0.01);
    const y = waterLine + noiseValue * amplitude;
    points.push({ x, y });
  }

  return points;
}
```

### BeachScene.tsx 修改

```typescript
// 渲染海洋深度背景
private renderOceanDepth(): void {
  const gradient = ctx.createLinearGradient(0, waterLine, 0, seaFloor);
  gradient.addColorStop(0, 'rgba(10, 30, 80, 1)');    // 深蓝
  gradient.addColorStop(0.7, 'rgba(30, 80, 140, 1)'); // 中蓝
  gradient.addColorStop(1, 'rgba(70, 140, 200, 0.8)'); // 浅蓝

  ctx.fillStyle = gradient;
  ctx.fillRect(0, waterLine, width, seaFloor - waterLine);
}

// 渲染沙滩地形
private renderBeachTerrain(): void {
  const beachStartX = width * 0.7;
  const beachY = seaFloor;

  // 使用噪声生成地形轮廓
  // ...绘制沙滩填充和纹理
}

// 渲染水面波浪（横截面）
private renderWaveSurface(): void {
  waveLayerConfigs.forEach((config, index) => {
    const points = generateHorizontalWavePoints(
      width,
      waterLine,
      config.amplitude,
      config.frequency,
      phase + config.speed * time,
      noiseGenerators[index]
    );

    drawWavePath(ctx, points, config, waterLine, seaFloor);
  });
}
```

## 下一步

1. 更新 `waveGenerator.ts` 改为水平波浪生成
2. 重构 `BeachScene.tsx` 布局和渲染逻辑
3. 调整波浪配置参数
4. 测试视觉效果
