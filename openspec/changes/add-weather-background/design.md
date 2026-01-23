# Design: 添加天气动态背景

**变更 ID**: `add-weather-background`  
**架构层级**: 展示层 (Presentation Layer)  
**影响范围**: 全局 UI 组件

---

## 架构概览

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        BlogLayout                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  WeatherBackground                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              BeachScene (Canvas)                │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │  │  │
│  │  │  │  Sky     │ │ Clouds   │ │ Rain/Snow│        │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘        │  │  │
│  │  │  ┌──────────┐ ┌──────────┐                     │  │  │
│  │  │  │  Ocean   │ │  Beach   │                     │  │  │
│  │  │  └──────────┘ └──────────┘                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                       ▲                                │  │
│  │                       │ weather data                   │  │
│  │                       │                                │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            WeatherService                       │  │  │
│  │  │  ┌──────────────┐ ┌──────────────┐             │  │  │
│  │  │  │ Geolocation  │ │ OpenWeather  │             │  │  │
│  │  │  │     API      │ │     API      │             │  │  │
│  │  │  └──────────────┘ └──────────────┘             │  │  │
│  │  │  ┌──────────────┐                              │  │  │
│  │  │  │ localStorage │                              │  │  │
│  │  │  │    Cache     │                              │  │  │
│  │  │  └──────────────┘                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Header                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  [Settings Icon] -> WeatherSettings Modal      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Content                            │  │
│  │               (NoteList / Post)                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Footer                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

        ▲
        │ settings
        │
┌───────┴──────────────────────────────────────────────────────┐
│              GlobalDataProvider (Context)                    │
│  weatherSettings: {                                          │
│    enabled: boolean                                          │
│    location: { type, city, coords }                          │
│    animationQuality: 'high' | 'medium' | 'low'               │
│    updateInterval: number                                    │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 技术决策详解

### 决策 1: Canvas 分层渲染策略

**问题**: Canvas 每帧全屏重绘性能开销大。

**方案对比**:

| 方案              | 优点               | 缺点           | 选择 |
| ----------------- | ------------------ | -------------- | ---- |
| 单 Canvas 全重绘  | 实现简单           | 性能差，FPS 低 | ❌   |
| 多 Canvas 分层    | 静态层缓存，性能好 | 内存占用稍高   | ✅   |
| CSS + 少量 Canvas | 性能最优           | 动画效果有限   | ❌   |

**最终选择**: **多 Canvas 分层**

**实现细节**:

```typescript
// 分层架构
const layers = {
  static: createCanvas(), // 沙滩、天空渐变（初始化后不变）
  clouds: createCanvas(), // 云朵（低频更新，如每 100ms）
  particles: createCanvas(), // 雨/雪粒子（高频更新，每帧）
  ocean: createCanvas(), // 海浪（中频更新，每帧但简化算法）
};

// 渲染流程
function render() {
  // 1. 清空主 Canvas
  mainCtx.clearRect(0, 0, width, height);

  // 2. 合成所有层
  mainCtx.drawImage(layers.static, 0, 0);
  mainCtx.drawImage(layers.clouds, 0, 0);
  mainCtx.drawImage(layers.ocean, 0, 0);
  mainCtx.drawImage(layers.particles, 0, 0);
}

// 更新策略
requestAnimationFrame(() => {
  updateOcean(); // 每帧更新
  updateParticles(); // 每帧更新

  if (frameCount % 3 === 0) {
    updateClouds(); // 每 3 帧更新一次
  }

  render();
});
```

**性能收益**:

- 静态层无需重绘（沙滩、天空背景色）
- 云朵层降频更新（视觉差异不明显）
- 粒子层和海浪层专注高频动画
- 预期 FPS 提升 40-60%

---

### 决策 2: 天气数据缓存策略

**问题**:

- OpenWeatherMap 免费额度有限（60 次/分钟）
- 用户频繁刷新页面会耗尽配额
- 天气数据实时性要求不高（1 小时内变化不大）

**方案对比**:

| 方案                      | 优点                   | 缺点               | 选择 |
| ------------------------- | ---------------------- | ------------------ | ---- |
| 不缓存                    | 数据最新               | API 配额快速耗尽   | ❌   |
| sessionStorage (会话缓存) | 标签页独立             | 新标签页需重新请求 | ❌   |
| localStorage (持久缓存)   | 跨标签页共享，节省配额 | 需手动过期管理     | ✅   |
| IndexedDB                 | 容量大，结构化         | 过度设计           | ❌   |

**最终选择**: **localStorage + 时间戳过期**

**实现细节**:

```typescript
interface CachedWeather {
  data: IWeatherData;
  timestamp: number;
  expiresIn: number; // 毫秒
}

class WeatherService {
  private readonly CACHE_KEY = "weather_cache_v1";
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 小时

  async getCurrentWeather(coords: Coords): Promise<IWeatherData> {
    // 1. 尝试从缓存读取
    const cached = this.getCachedWeather();
    if (cached && this.isCacheValid(cached)) {
      console.log("Using cached weather data");
      return cached.data;
    }

    // 2. 缓存失效，调用 API
    const data = await this.fetchFromAPI(coords);

    // 3. 更新缓存
    this.setCachedWeather({
      data,
      timestamp: Date.now(),
      expiresIn: this.CACHE_DURATION,
    });

    return data;
  }

  private isCacheValid(cached: CachedWeather): boolean {
    const age = Date.now() - cached.timestamp;
    return age < cached.expiresIn;
  }

  // 手动刷新（用户点击刷新按钮）
  async forceRefresh(coords: Coords): Promise<IWeatherData> {
    localStorage.removeItem(this.CACHE_KEY);
    return this.getCurrentWeather(coords);
  }
}
```

**缓存键设计**:

```typescript
// 键结构：weather_cache_v1_{lat}_{lon}
// 这样不同位置的天气数据独立缓存
const cacheKey = `weather_cache_v1_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}`;
```

**边界情况处理**:

- localStorage 已满：捕获 QuotaExceededError，降级为内存缓存（sessionStorage）
- 缓存数据损坏：try-catch JSON.parse，失败时清空缓存重新请求
- 用户清空浏览器数据：自动重新请求，透明处理

---

### 决策 3: 粒子系统对象池

**问题**:

- 雨滴/雪花需要 200-500 个粒子对象
- 每帧创建/销毁对象会触发频繁 GC（垃圾回收）
- GC 暂停导致动画卡顿

**方案对比**:

| 方案               | 优点          | 缺点               | 选择 |
| ------------------ | ------------- | ------------------ | ---- |
| 每帧创建新对象     | 代码简单      | GC 频繁，性能差    | ❌   |
| 对象池复用         | GC 少，性能好 | 需管理对象生命周期 | ✅   |
| WebWorker 并行计算 | CPU 利用率高  | 通信开销，过度设计 | ❌   |

**最终选择**: **对象池 (Object Pool)**

**实现细节**:

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];
  private maxSize: number;

  constructor(maxSize: number, ParticleClass: typeof Particle) {
    this.maxSize = maxSize;

    // 预分配对象
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(new ParticleClass());
    }
  }

  acquire(): Particle | null {
    if (this.pool.length === 0) return null;

    const particle = this.pool.pop()!;
    particle.reset(); // 重置状态（位置、速度等）
    this.active.push(particle);
    return particle;
  }

  release(particle: Particle): void {
    const index = this.active.indexOf(particle);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(particle);
    }
  }

  update(): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.update();

      if (p.isDead()) {
        this.release(p);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.active.forEach((p) => p.render(ctx));
  }
}

// 使用
const rainPool = new ParticlePool(500, Raindrop);

function animate() {
  // 生成新粒子（控制速率）
  if (Math.random() < 0.3) {
    const raindrop = rainPool.acquire();
    if (raindrop) {
      raindrop.x = Math.random() * canvas.width;
      raindrop.y = -10;
    }
  }

  rainPool.update();
  rainPool.render(ctx);
}
```

**性能优化**:

- 预分配对象避免运行时创建
- 重置对象状态而非销毁
- 减少 GC 触发频率（从每帧数百次降至零）
- 内存占用可控（对象数量固定）

---

### 决策 4: 动画质量分级

**问题**:

- 低端设备运行高质量动画卡顿
- 用户网络环境差异（移动流量 vs Wi-Fi）
- 需平衡视觉效果与性能

**方案对比**:

| 方案                  | 优点     | 缺点               | 选择 |
| --------------------- | -------- | ------------------ | ---- |
| 固定高质量            | 视觉最佳 | 低端设备不可用     | ❌   |
| 自动检测降级          | 用户透明 | 检测逻辑复杂       | 🟡   |
| 用户手动选择          | 控制权强 | 需用户理解技术细节 | 🟡   |
| 混合方案（自动+手动） | 兼顾两者 | 实现成本稍高       | ✅   |

**最终选择**: **自动检测 + 手动覆盖**

**质量级别定义**:

| 级别   | 粒子数 | 帧率目标 | 波浪层数 | 云朵数   | 适用场景            |
| ------ | ------ | -------- | -------- | -------- | ------------------- |
| High   | 500    | 60 fps   | 3 层     | 15-20 个 | 桌面端高性能设备    |
| Medium | 300    | 45 fps   | 2 层     | 10-15 个 | 桌面端普通设备/平板 |
| Low    | 150    | 30 fps   | 1 层     | 5-10 个  | 移动端/低端设备     |

**自动检测逻辑**:

```typescript
function detectDeviceQuality(): AnimationQuality {
  // 1. 设备类型检测
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const isTablet = /iPad|Android.*Tablet/i.test(navigator.userAgent);

  // 2. 屏幕尺寸
  const screenWidth = window.innerWidth;

  // 3. 硬件并发（CPU 核心数）
  const cores = navigator.hardwareConcurrency || 2;

  // 4. 用户偏好（系统设置）
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) return "low";
  if (isMobile) return "low";
  if (isTablet) return "medium";
  if (screenWidth < 1024) return "medium";
  if (cores >= 4) return "high";

  return "medium"; // 默认中等
}

// 运行时 FPS 监控降级
class FPSMonitor {
  private samples: number[] = [];
  private lastTime = 0;

  tick(currentTime: number): void {
    if (this.lastTime) {
      const fps = 1000 / (currentTime - this.lastTime);
      this.samples.push(fps);

      if (this.samples.length > 60) {
        this.samples.shift();
      }
    }
    this.lastTime = currentTime;
  }

  getAvgFPS(): number {
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }

  shouldDowngrade(quality: AnimationQuality): boolean {
    const avg = this.getAvgFPS();

    if (quality === "high" && avg < 45) return true;
    if (quality === "medium" && avg < 25) return true;

    return false;
  }
}

// 在动画循环中使用
const monitor = new FPSMonitor();
let currentQuality = detectDeviceQuality();

function animate(time: number) {
  monitor.tick(time);

  // 每 5 秒检测一次
  if (frameCount % 300 === 0 && monitor.shouldDowngrade(currentQuality)) {
    currentQuality = downgrade(currentQuality);
    console.warn(`FPS low, downgrading to ${currentQuality}`);
  }

  renderScene(currentQuality);
  requestAnimationFrame(animate);
}
```

**用户手动覆盖**:

```typescript
// 设置面板允许用户强制选择质量
function handleQualityChange(userChoice: AnimationQuality) {
  // 保存到 localStorage
  localStorage.setItem("weather_quality_override", userChoice);

  // 忽略自动检测，使用用户选择
  currentQuality = userChoice;
}
```

---

### 决策 5: 天气状态映射

**问题**: OpenWeatherMap API 返回数十种天气代码，如何映射到有限的视觉场景？

**OpenWeatherMap 天气代码分类**:

| 代码范围 | 描述                | 映射场景       | 视觉特征                        |
| -------- | ------------------- | -------------- | ------------------------------- |
| 200-232  | 雷暴 (Thunderstorm) | `Thunderstorm` | 深灰天 + 闪电 + 大雨 + 激烈海浪 |
| 300-321  | 毛毛雨 (Drizzle)    | `Rain`         | 灰天 + 小雨 + 中等海浪          |
| 500-531  | 雨 (Rain)           | `Rain`         | 深灰天 + 中大雨 + 激烈海浪      |
| 600-622  | 雪 (Snow)           | `Snow`         | 白灰天 + 雪花 + 平静海面        |
| 701-781  | 雾/霾 (Mist/Fog)    | `Mist`         | 朦胧天 + 低可见度 + 平静海面    |
| 800      | 晴天 (Clear)        | `Clear`        | 蓝天 + 太阳 + 平缓海浪          |
| 801-804  | 多云 (Clouds)       | `Clouds`       | 灰蓝天 + 云朵 + 中等海浪        |

**映射函数实现**:

```typescript
function mapWeatherCondition(code: number): WeatherScene {
  if (code >= 200 && code < 300) return "Thunderstorm";
  if (code >= 300 && code < 600) return "Rain";
  if (code >= 600 && code < 700) return "Snow";
  if (code >= 700 && code < 800) return "Mist";
  if (code === 800) return "Clear";
  if (code > 800) return "Clouds";

  return "Clear"; // 默认晴天
}

// 场景参数配置
const sceneConfigs: Record<WeatherScene, SceneConfig> = {
  Clear: {
    skyColors: { top: "#87CEEB", bottom: "#E0F6FF" },
    waveAmplitude: 5,
    waveFrequency: 0.02,
    showSun: true,
    showClouds: false,
    particleType: null,
  },
  Clouds: {
    skyColors: { top: "#A9B7C0", bottom: "#D3D3D3" },
    waveAmplitude: 8,
    waveFrequency: 0.025,
    showSun: false,
    showClouds: true,
    cloudDensity: 15,
    particleType: null,
  },
  Rain: {
    skyColors: { top: "#4A5568", bottom: "#6B7280" },
    waveAmplitude: 15,
    waveFrequency: 0.03,
    showSun: false,
    showClouds: true,
    cloudDensity: 20,
    particleType: "rain",
    particleCount: { high: 500, medium: 300, low: 150 },
  },
  Thunderstorm: {
    skyColors: { top: "#2D3748", bottom: "#4A5568" },
    waveAmplitude: 25,
    waveFrequency: 0.04,
    showSun: false,
    showClouds: true,
    cloudDensity: 25,
    particleType: "rain",
    particleCount: { high: 500, medium: 300, low: 150 },
    showLightning: true,
    lightningInterval: [2000, 5000], // 2-5 秒随机
  },
  Snow: {
    skyColors: { top: "#CBD5E0", bottom: "#E2E8F0" },
    waveAmplitude: 3,
    waveFrequency: 0.015,
    showSun: false,
    showClouds: true,
    cloudDensity: 18,
    particleType: "snow",
    particleCount: { high: 400, medium: 250, low: 120 },
  },
  Mist: {
    skyColors: { top: "#9CA3AF", bottom: "#D1D5DB" },
    waveAmplitude: 4,
    waveFrequency: 0.018,
    showSun: false,
    showClouds: false,
    particleType: null,
    fogOpacity: 0.6, // 雾气效果
  },
};
```

---

## 数据流设计

### 天气数据获取流程

```
[用户访问博客]
       ↓
[检查 weatherSettings.enabled]
       ↓ (false)
   [禁用背景，退出]
       ↓ (true)
[检查 localStorage 缓存]
       ↓
   [缓存存在且未过期?]
       ↓ (yes)
   [返回缓存数据] ──────────┐
       ↓ (no)               │
[检查 location.type]        │
       ↓                    │
   [type === 'auto'?]      │
       ↓ (yes)             │
[调用 Geolocation API]     │
       ↓                    │
   [用户允许定位?]          │
       ↓ (yes)             │
   [获取坐标] ──────────────┤
       ↓ (no)               │
   [type === 'manual'?]    │
       ↓ (yes)             │
   [使用 location.city] ───┤
       ↓ (no/fail)         │
   [使用默认城市:北京] ────┤
       ↓                    │
[调用 OpenWeatherMap API] ◄┘
       ↓
   [API 调用成功?]
       ↓ (yes)
   [解析响应数据]
       ↓
   [映射天气状态]
       ↓
   [缓存到 localStorage]
       ↓
   [返回天气数据] ──────────┐
       ↓ (no)               │
   [返回默认晴天数据] ──────┤
       ↓                    │
[更新组件状态] ◄────────────┘
       ↓
[渲染对应天气场景]
```

### 渲染循环流程

```
[requestAnimationFrame(time)]
       ↓
[FPS 监控记录帧时间]
       ↓
[检查是否需要降级]
       ↓ (yes)
   [降低动画质量]
       ↓
[获取当前场景配置]
       ↓
[清空主 Canvas]
       ↓
[绘制静态层] ──────────> [从缓存 Canvas 复制]
       ↓
[更新云朵位置] (每 3 帧)
       ↓
[绘制云朵层]
       ↓
[更新海浪相位]
       ↓
[绘制海浪层]
       ↓
[更新粒子位置] (雨/雪)
       ↓
[绘制粒子层]
       ↓
[闪电触发检测] (雷暴天气)
       ↓ (触发)
   [绘制闪电效果]
       ↓
[合成所有层到主 Canvas]
       ↓
[requestAnimationFrame(下一帧)]
```

---

## 组件 API 设计

### WeatherBackground Props

```typescript
interface IWeatherBackground {
  /** 是否启用背景动画，默认从 GlobalDataProvider 读取 */
  enabled?: boolean;

  /** 动画质量等级，默认自动检测 */
  quality?: "high" | "medium" | "low" | "auto";

  /** 背景不透明度，0-1，默认 0.6 */
  opacity?: number;

  /** 天气数据更新间隔（毫秒），默认 1 小时 */
  updateInterval?: number;

  /** 错误回调 */
  onError?: (error: Error) => void;

  /** 天气数据加载完成回调 */
  onWeatherLoaded?: (weather: IWeatherData) => void;
}
```

### BeachScene Props

```typescript
interface IBeachScene {
  /** 天气数据 */
  weather: IWeatherData;

  /** 动画质量 */
  quality: "high" | "medium" | "low";

  /** Canvas 尺寸（可选，默认全屏） */
  width?: number;
  height?: number;

  /** 是否暂停动画 */
  paused?: boolean;

  /** 帧率限制（用于测试） */
  maxFPS?: number;
}
```

### WeatherService API

```typescript
class WeatherService {
  constructor(apiKey: string);

  /** 根据坐标获取天气 */
  async getCurrentWeather(coords: {
    lat: number;
    lon: number;
  }): Promise<IWeatherData>;

  /** 根据城市名获取天气 */
  async getCurrentWeatherByCity(city: string): Promise<IWeatherData>;

  /** 强制刷新（清除缓存） */
  async forceRefresh(location: Coords | string): Promise<IWeatherData>;

  /** 清除缓存 */
  clearCache(): void;

  /** 检查缓存是否有效 */
  isCacheValid(): boolean;
}
```

---

## 样式设计

### CSS 类名规范

遵循项目现有 BEM 规范：

```scss
// WeatherBackground
.shana-weather-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  opacity: 0.6;
  pointer-events: none; // 不阻止点击事件

  &__canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.5);
  }

  &--disabled {
    display: none;
  }
}

// WeatherSettings Modal
.shana-weather-settings {
  &__form-item {
    margin-bottom: 16px;
  }

  &__quality-option {
    display: flex;
    align-items: center;

    .icon {
      margin-right: 8px;
    }
  }

  &__refresh-btn {
    width: 100%;
  }
}
```

### 主题适配

**明暗主题背景不透明度差异**:

```scss
@use "@/assets/styles/globals.scss" as *;

.shana-weather-background {
  // 亮主题：高不透明度（背景不干扰深色文字）
  [data-theme="light"] & {
    opacity: 0.5;
  }

  // 暗主题：低不透明度（避免背景过亮）
  [data-theme="dark"] & {
    opacity: 0.4;
  }

  // 高对比模式：完全禁用（确保可读性）
  @media (prefers-contrast: high) {
    display: none;
  }
}
```

---

## 测试策略

### 单元测试

**WeatherService 测试**:

```typescript
describe("WeatherService", () => {
  let service: WeatherService;

  beforeEach(() => {
    service = new WeatherService("test-api-key");
    localStorage.clear();
  });

  it("should fetch weather data from API", async () => {
    const weather = await service.getCurrentWeather({ lat: 39.9, lon: 116.4 });
    expect(weather).toHaveProperty("temperature");
    expect(weather).toHaveProperty("condition");
  });

  it("should cache weather data for 1 hour", async () => {
    const spy = jest.spyOn(global, "fetch");

    await service.getCurrentWeather({ lat: 39.9, lon: 116.4 });
    await service.getCurrentWeather({ lat: 39.9, lon: 116.4 });

    expect(spy).toHaveBeenCalledTimes(1); // 第二次使用缓存
  });

  it("should return default weather on API error", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const weather = await service.getCurrentWeather({ lat: 39.9, lon: 116.4 });
    expect(weather.condition).toBe("Clear"); // 默认晴天
  });
});
```

**BeachScene 测试**:

```typescript
describe('BeachScene', () => {
  it('should render canvas element', () => {
    const { container } = render(
      <BeachScene weather={mockWeather} quality="high" />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should adjust particle count based on quality', () => {
    const { rerender } = render(
      <BeachScene weather={rainWeather} quality="high" />
    );
    // 检查粒子池大小
    expect(particlePool.maxSize).toBe(500);

    rerender(<BeachScene weather={rainWeather} quality="low" />);
    expect(particlePool.maxSize).toBe(150);
  });
});
```

### 集成测试

**端到端场景**:

```typescript
describe('Weather Background Integration', () => {
  it('should load weather and render scene', async () => {
    render(<AppLayout><Home /></AppLayout>);

    // 等待天气数据加载
    await waitFor(() => {
      expect(screen.getByRole('canvas')).toBeInTheDocument();
    });

    // 检查缓存
    const cached = localStorage.getItem('weather_cache_v1');
    expect(cached).toBeDefined();
  });

  it('should respect prefers-reduced-motion', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    render(<WeatherBackground />);
    expect(screen.queryByRole('canvas')).not.toBeInTheDocument();
  });
});
```

### 性能测试

**FPS 基准测试**:

```typescript
describe("Performance", () => {
  it("should maintain >= 60 FPS on desktop (high quality)", async () => {
    const monitor = new FPSMonitor();

    // 运行 5 秒动画
    await runAnimation(5000, (time) => {
      monitor.tick(time);
      renderScene("high");
    });

    expect(monitor.getAvgFPS()).toBeGreaterThanOrEqual(60);
  });

  it("should maintain >= 30 FPS on mobile (low quality)", async () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      writable: true,
    });

    const monitor = new FPSMonitor();
    await runAnimation(5000, (time) => {
      monitor.tick(time);
      renderScene("low");
    });

    expect(monitor.getAvgFPS()).toBeGreaterThanOrEqual(30);
  });
});
```

---

## 安全性考虑

### API Key 保护

**问题**: API Key 硬编码在前端代码中可能被滥用。

**缓解措施**:

1. **环境变量隔离**:

   ```bash
   # .env (不提交到 Git)
   VITE_OPENWEATHER_API_KEY=your_api_key_here

   # .env.example (提交到 Git)
   VITE_OPENWEATHER_API_KEY=your_api_key_here_from_openweathermap.org
   ```

2. **域名限制** (OpenWeatherMap 控制台配置):
   - 限制 API Key 只能从 `*.github.io` 域名调用
   - 本地开发使用单独的开发 Key

3. **请求频率限制** (客户端):

   ```typescript
   class RateLimiter {
     private lastRequest = 0;
     private minInterval = 10000; // 最少 10 秒间隔

     async throttle<T>(fn: () => Promise<T>): Promise<T> {
       const now = Date.now();
       const elapsed = now - this.lastRequest;

       if (elapsed < this.minInterval) {
         throw new Error("请求过于频繁，请稍后再试");
       }

       this.lastRequest = now;
       return fn();
     }
   }
   ```

4. **错误隐藏** (不暴露 API Key 在错误消息中):
   ```typescript
   try {
     const res = await fetch(url);
   } catch (err) {
     console.error("天气数据加载失败"); // 不打印完整 URL
     return defaultWeather;
   }
   ```

### XSS 防护

**Canvas 渲染不涉及 HTML 注入，风险低。**

但需注意：

- 天气描述文字（如来自 API 的 `description` 字段）不直接渲染到 DOM
- 城市名输入需验证（防止恶意脚本）

```typescript
function sanitizeCityName(input: string): string {
  // 只允许字母、数字、空格、连字符
  return input.replace(/[^a-zA-Z0-9\s\-\u4e00-\u9fa5]/g, "");
}
```

---

## 可维护性设计

### 扩展点

**新增天气状态**:

```typescript
// 1. 在 SceneConfig 添加新场景
const sceneConfigs = {
  ...existingConfigs,
  Tornado: {
    // 新增龙卷风场景
    skyColors: { top: "#1A202C", bottom: "#2D3748" },
    // ...
  },
};

// 2. 在映射函数添加代码范围
function mapWeatherCondition(code: number): WeatherScene {
  if (code >= 900 && code < 910) return "Tornado";
  // ...
}

// 3. 实现对应渲染函数
function renderTornado(ctx: CanvasRenderingContext2D) {
  // 龙卷风动画逻辑
}
```

**新增动画效果**:

```typescript
// 在 BeachScene 添加新层
const renderLayers = [
  renderSky,
  renderClouds,
  renderOcean,
  renderBeach,
  renderBirds, // 新增：海鸥飞翔
];
```

### 配置化

**将硬编码值提取到配置文件**:

```typescript
// config/weather-animation.config.ts
export const ANIMATION_CONFIG = {
  CACHE_DURATION: 60 * 60 * 1000,
  API_TIMEOUT: 10000,
  FPS_CHECK_INTERVAL: 300, // 每 300 帧检测一次
  MIN_FPS_THRESHOLD: {
    high: 45,
    medium: 25,
  },
  PARTICLE_COUNTS: {
    rain: { high: 500, medium: 300, low: 150 },
    snow: { high: 400, medium: 250, low: 120 },
  },
  WAVE_CONFIGS: {
    Clear: { amplitude: 5, frequency: 0.02 },
    Rain: { amplitude: 15, frequency: 0.03 },
    // ...
  },
};
```

---

## 部署考虑

### 环境变量配置

**开发环境** (`.env.development`):

```bash
VITE_OPENWEATHER_API_KEY=dev_api_key_here
VITE_WEATHER_CACHE_DURATION=300000  # 5 分钟（方便测试）
```

**生产环境** (`.env.production`):

```bash
VITE_OPENWEATHER_API_KEY=prod_api_key_here
VITE_WEATHER_CACHE_DURATION=3600000  # 1 小时
```

### GitHub Pages 部署

**构建配置** (`vite.config.ts`):

```typescript
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/shana.github.io/" : "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          weather: [
            "./src/components/WeatherBackground",
            "./src/services/WeatherService",
          ],
        },
      },
    },
  },
});
```

**代码分割验证**:

- WeatherBackground 组件应打包为独立 chunk (`weather.*.js`)
- 首屏加载不包含天气相关代码
- 懒加载生效（Network 面板验证）

---

## 监控与调试

### 开发工具

**Canvas 调试面板**:

```typescript
if (process.env.NODE_ENV === "development") {
  window.__WEATHER_DEBUG__ = {
    scene: beachSceneInstance,
    fpsMonitor: fpsMonitorInstance,
    particlePool: particlePoolInstance,

    // 暴露控制函数
    setQuality(q: AnimationQuality) {
      /* ... */
    },
    togglePause() {
      /* ... */
    },
    dumpStats() {
      console.table({
        fps: fpsMonitor.getAvgFPS(),
        particles: particlePool.active.length,
        quality: currentQuality,
      });
    },
  };
}
```

**性能日志**:

```typescript
class PerformanceLogger {
  log(metric: string, value: number) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Perf] ${metric}: ${value.toFixed(2)}`);
    }

    // 生产环境可选：发送到分析服务
    if (process.env.NODE_ENV === "production" && value < threshold) {
      sendToAnalytics({ metric, value });
    }
  }
}
```

---

## 总结

本设计文档覆盖了天气动态背景功能的：

1. **架构设计**: 分层组件、数据流、API 设计
2. **技术决策**: Canvas 分层、缓存策略、粒子池、动画分级
3. **实现细节**: 天气映射、渲染循环、性能优化
4. **质量保证**: 测试策略、安全性、可维护性
5. **部署运维**: 环境配置、监控调试

**关键取舍**:

- ✅ 选择 Canvas（性能）而非 SVG（可缩放性）
- ✅ 选择客户端缓存（简单）而非服务端代理（隐私保护）
- ✅ 选择分级质量（兼容性）而非固定高质量（视觉效果）
- ✅ 选择 6 种天气场景（实现成本）而非完整覆盖（丰富度）

**未来扩展方向**:

- 时间段切换（白天/黑夜）
- 多主题背景（山脉、森林、城市等）
- 用户上传自定义背景图片
- WebGL 3D 效果（高端设备）
