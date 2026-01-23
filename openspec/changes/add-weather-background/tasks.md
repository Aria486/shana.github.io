# Tasks: 添加天气动态背景

**变更 ID**: `add-weather-background`  
**总预估时间**: 16-24 小时 (2-3 天)  
**并行度**: 部分任务可并行执行

---

## Phase 0: 准备工作 (0.5天)

### Task 0.1: API 申请与配置

- **描述**: 申请 OpenWeatherMap 免费 API Key 并配置到项目
- **输入**: OpenWeatherMap 官网注册账号
- **输出**:
  - API Key 已获取
  - `.env` 文件配置 `VITE_OPENWEATHER_API_KEY=xxx`
  - `.env.example` 添加示例配置
  - `.gitignore` 确保 `.env` 不被提交
- **预估时间**: 30 分钟
- **验收标准**:
  - [ ] API Key 有效（通过 curl 测试成功）
  - [ ] 环境变量在开发环境正确加载
  - [ ] `.env` 已添加到 `.gitignore`

### Task 0.2: 项目依赖审查

- **描述**: 检查现有依赖是否满足需求，确定是否需要新增库
- **输入**: 当前 `package.json`
- **输出**:
  - 依赖清单（无需新增，使用原生 API）
  - 确认 React 19、TypeScript 5、Vite 7 版本兼容
- **预估时间**: 30 分钟
- **验收标准**:
  - [ ] 确认 Canvas 2D API 无需额外依赖
  - [ ] 确认 Geolocation API 浏览器原生支持
  - [ ] 确认 localStorage 可用

### Task 0.3: 规格评审与澄清

- **描述**: 解决 proposal 中的开放问题，明确技术细节
- **输入**: Proposal 开放问题清单
- **输出**:
  - API Key 管理方案确认（环境变量）
  - 默认城市确认（IP 定位 fallback 到北京）
  - 动画质量检测方案（基于设备类型 + FPS 监控）
  - 夜间模式暂不实现（Out of Scope）
  - 天气描述不显示文字（仅视觉）
- **预估时间**: 1 小时
- **验收标准**:
  - [ ] 所有开放问题有明确决策
  - [ ] 技术方案细节已确定

---

## Phase 1: 天气数据服务 (0.5天)

### Task 1.1: 创建 WeatherService 基础类

- **描述**: 实现天气数据服务，包括 API 调用、缓存、错误处理
- **输入**: OpenWeatherMap API 文档
- **输出**:
  - `src/services/WeatherService.ts`
  - TypeScript 接口定义 (`IWeatherData`, `IWeatherConfig`)
- **依赖**: Task 0.1 (API Key 配置)
- **预估时间**: 2 小时
- **关键代码结构**:

  ```typescript
  export interface IWeatherData {
    location: string;
    temperature: number;
    condition: "Clear" | "Clouds" | "Rain" | "Thunderstorm" | "Snow" | "Mist";
    conditionCode: number;
    description: string;
    timestamp: number;
  }

  export class WeatherService {
    private apiKey: string;
    private cacheKey = "weather_cache";

    async getCurrentWeather(coords: {
      lat: number;
      lon: number;
    }): Promise<IWeatherData>;
    async getCurrentWeatherByCity(city: string): Promise<IWeatherData>;
    private getCachedWeather(): IWeatherData | null;
    private setCachedWeather(data: IWeatherData): void;
    private isCacheValid(timestamp: number): boolean;
  }
  ```

- **验收标准**:
  - [ ] API 调用成功返回天气数据
  - [ ] 缓存逻辑正确（1 小时有效期）
  - [ ] 错误处理完善（网络错误、API 错误）
  - [ ] TypeScript 类型安全（无 `any`）

### Task 1.2: 实现地理定位集成

- **描述**: 集成浏览器 Geolocation API，获取用户位置
- **输入**: Geolocation API 文档
- **输出**:
  - `src/utils/geolocation.ts`
  - 权限请求逻辑
  - 错误处理（拒绝、超时等）
- **依赖**: 无
- **预估时间**: 1 小时
- **关键函数**:
  ```typescript
  export async function getUserLocation(): Promise<{
    lat: number;
    lon: number;
  }> {
    // 实现 Geolocation API 调用
    // 超时时间 10 秒
    // 错误时返回默认位置（北京: 39.9042, 116.4074）
  }
  ```
- **验收标准**:
  - [ ] 权限请求 UI 友好
  - [ ] 拒绝权限后使用默认位置
  - [ ] 超时处理正确（10 秒）

### Task 1.3: WeatherService 单元测试

- **描述**: 编写 WeatherService 测试，覆盖缓存、错误处理
- **输入**: WeatherService 实现
- **输出**:
  - `src/services/WeatherService.test.ts`
  - Mock OpenWeatherMap API 响应
- **依赖**: Task 1.1
- **预估时间**: 1 小时
- **测试用例**:
  - [ ] 成功调用 API 并解析数据
  - [ ] 缓存未过期时返回缓存数据
  - [ ] 缓存过期后重新请求
  - [ ] API 错误时返回默认数据
  - [ ] 网络错误时降级处理
- **验收标准**:
  - [ ] 测试覆盖率 >= 80%
  - [ ] 所有边界情况已覆盖

---

## Phase 2: Canvas 海滩场景基础 (1天)

### Task 2.1: 创建 BeachScene 组件框架

- **描述**: 搭建 Canvas 渲染基础，实现多层架构
- **输入**: Canvas 2D API 文档、现有 Season/Summer 组件参考
- **输出**:
  - `src/components/WeatherBackground/BeachScene.tsx`
  - Canvas 初始化、resize 监听、分层架构
- **依赖**: 无
- **预估时间**: 2 小时
- **组件结构**:

  ```typescript
  interface IBeachSceneProps {
    weather: IWeatherData;
    quality: "high" | "medium" | "low";
  }

  export const BeachScene: React.FC<IBeachSceneProps> = ({
    weather,
    quality,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // 分层：Sky -> Clouds -> Rain/Snow -> Ocean -> Beach
      const render = () => {
        renderSky(ctx, weather);
        renderClouds(ctx, weather);
        renderPrecipitation(ctx, weather, quality);
        renderOcean(ctx, weather);
        renderBeach(ctx);
      };

      const animate = () => {
        render();
        requestAnimationFrame(animate);
      };
      animate();
    }, [weather, quality]);
  };
  ```

- **验收标准**:
  - [ ] Canvas 正确挂载
  - [ ] 响应窗口 resize
  - [ ] 渲染循环流畅（>= 60fps）
  - [ ] 分层架构清晰

### Task 2.2: 实现天空层渲染

- **描述**: 根据天气状态渲染天空背景色渐变
- **输入**: 天气状态 (Clear, Clouds, Rain, etc.)
- **输出**:
  - 天空渐变色映射（不同天气不同颜色）
  - 太阳/月亮渲染（晴天显示）
- **依赖**: Task 2.1
- **预估时间**: 1.5 小时
- **颜色方案**:
  ```typescript
  const skyColors = {
    Clear: { top: "#87CEEB", bottom: "#E0F6FF" }, // 晴天蓝
    Clouds: { top: "#A9B7C0", bottom: "#D3D3D3" }, // 多云灰蓝
    Rain: { top: "#4A5568", bottom: "#6B7280" }, // 雨天深灰
    Thunderstorm: { top: "#2D3748", bottom: "#4A5568" }, // 雷暴暗灰
    Snow: { top: "#CBD5E0", bottom: "#E2E8F0" }, // 雪天浅灰
    Mist: { top: "#9CA3AF", bottom: "#D1D5DB" }, // 雾天朦胧灰
  };
  ```
- **验收标准**:
  - [ ] 6 种天气状态颜色正确
  - [ ] 渐变平滑自然
  - [ ] 太阳位置合理（右上角）

### Task 2.3: 实现海洋层波浪动画

- **描述**: 使用正弦波函数实现海浪动画
- **输入**: 现有 Season/Summer 波浪逻辑参考
- **输出**:
  - 波浪绘制函数
  - 多层波浪（前景、中景、远景）
  - 根据天气调整振幅/频率
- **依赖**: Task 2.1
- **预估时间**: 2 小时
- **波浪算法**:

  ```typescript
  function renderWave(ctx, y, amplitude, frequency, phase, color) {
    ctx.beginPath();
    ctx.moveTo(0, y);

    for (let x = 0; x <= canvas.width; x++) {
      const wave = Math.sin(x * frequency + phase) * amplitude;
      ctx.lineTo(x, y + wave);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // 天气影响：Rain 时振幅 +50%, Thunderstorm 时振幅 +100%
  ```

- **验收标准**:
  - [ ] 波浪动画流畅
  - [ ] 多层波浪视差效果正确
  - [ ] 暴雨时波浪更激烈
  - [ ] 晴天时波浪平缓

### Task 2.4: 实现沙滩层静态渲染

- **描述**: 绘制静态沙滩（简单矩形或纹理）
- **输入**: 沙滩颜色/纹理素材（可选）
- **输出**:
  - 沙滩绘制函数
  - 颜色：`#F4E4C1`（米黄色）
- **依赖**: Task 2.1
- **预估时间**: 30 分钟
- **验收标准**:
  - [ ] 沙滩位于底部
  - [ ] 颜色自然
  - [ ] 与海洋层无缝衔接

---

## Phase 3: 天气动画效果 (1天)

### Task 3.1: 实现云朵漂浮动画

- **描述**: 绘制云朵并实现水平移动动画
- **输入**: 天气状态 (Clouds 时显示)
- **输出**:
  - 云朵粒子系统（10-20 个云朵）
  - 多层视差（远景云慢，近景云快）
  - 云朵形状生成（椭圆组合）
- **依赖**: Task 2.1
- **预估时间**: 2 小时
- **云朵数据结构**:
  ```typescript
  interface Cloud {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number; // 根据 y 值计算（远近视差）
    opacity: number;
  }
  ```
- **验收标准**:
  - [ ] 云朵形状自然（非规则矩形）
  - [ ] 移动速度有差异（视差效果）
  - [ ] 移出屏幕后从左侧重新进入
  - [ ] 多云天气时云朵密度增加

### Task 3.2: 实现雨滴粒子系统

- **描述**: 创建雨滴粒子，实现下落动画
- **输入**: 天气状态 (Rain 或 Thunderstorm)
- **输出**:
  - 雨滴粒子类
  - 粒子池管理（复用粒子对象）
  - 雨滴落到海面产生涟漪（可选）
- **依赖**: Task 2.1
- **预估时间**: 2 小时
- **粒子配置**:

  ```typescript
  const rainConfig = {
    high: { count: 500, speed: 8 - 12, length: 15 - 20 },
    medium: { count: 300, speed: 8 - 12, length: 10 - 15 },
    low: { count: 150, speed: 8 - 12, length: 8 - 12 },
  };

  class Raindrop {
    x: number;
    y: number;
    length: number;
    speed: number;

    update() {
      this.y += this.speed;
      if (this.y > canvas.height) this.reset();
    }

    render(ctx) {
      ctx.strokeStyle = "rgba(174, 194, 224, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y + this.length);
      ctx.stroke();
    }
  }
  ```

- **验收标准**:
  - [ ] 雨滴密度根据质量设置调整
  - [ ] 下落速度自然（8-12 px/frame）
  - [ ] 雨滴角度略微倾斜（模拟风）
  - [ ] 性能良好（移动端 >= 30fps）

### Task 3.3: 实现雪花粒子系统

- **描述**: 创建雪花粒子，实现飘落动画
- **输入**: 天气状态 (Snow)
- **输出**:
  - 雪花粒子类（类似雨滴但速度慢、有摇摆）
  - 雪花形状（六边形或圆点）
- **依赖**: Task 3.2（复用粒子系统架构）
- **预估时间**: 1 小时
- **雪花特性**:
  ```typescript
  class Snowflake extends Raindrop {
    sway: number; // 摇摆幅度
    swaySpeed: number;

    update() {
      this.y += this.speed * 0.3; // 速度比雨滴慢 70%
      this.x += Math.sin(this.sway) * 2; // 左右摇摆
      this.sway += this.swaySpeed;
      if (this.y > canvas.height) this.reset();
    }
  }
  ```
- **验收标准**:
  - [ ] 雪花飘落速度慢于雨滴
  - [ ] 左右摇摆效果自然
  - [ ] 雪花形状可识别

### Task 3.4: 实现雷电闪烁效果

- **描述**: 雷暴天气时随机闪电效果
- **输入**: 天气状态 (Thunderstorm)
- **输出**:
  - 闪电绘制（锯齿线）
  - 随机触发（2-5 秒间隔）
  - 天空闪光（白色闪烁）
- **依赖**: Task 2.2 (天空层)
- **预估时间**: 1 小时
- **闪电逻辑**:
  ```typescript
  class Lightning {
    active: boolean;
    segments: { x: number; y: number }[];
    duration: number;

    trigger() {
      this.active = true;
      this.generatePath(); // 生成锯齿路径
      setTimeout(() => (this.active = false), 200); // 持续 200ms
    }

    render(ctx) {
      if (!this.active) return;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 3;
      // 绘制锯齿线 + 天空闪光
    }
  }
  ```
- **验收标准**:
  - [ ] 闪电路径随机生成
  - [ ] 闪光效果不刺眼
  - [ ] 触发频率合理（不过于频繁）

---

## Phase 4: 组件集成与设置 (0.5天)

### Task 4.1: 创建 WeatherBackground 容器组件

- **描述**: 整合 WeatherService 和 BeachScene，管理状态
- **输入**: WeatherService、BeachScene
- **输出**:
  - `src/components/WeatherBackground/WeatherBackground.tsx`
  - 组件状态管理（天气数据、加载状态、错误）
  - 懒加载逻辑
- **依赖**: Task 1.1, Task 2.1
- **预估时间**: 1.5 小时
- **组件结构**:
  ```typescript
  export const WeatherBackground: React.FC = () => {
    const [weather, setWeather] = useState<IWeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { weatherSettings } = useGlobalData();

    useEffect(() => {
      if (!weatherSettings.enabled) return;

      const loadWeather = async () => {
        try {
          const coords = await getUserLocation();
          const data = await weatherService.getCurrentWeather(coords);
          setWeather(data);
        } catch (err) {
          // 降级：使用默认晴天数据
          setWeather(defaultWeather);
        } finally {
          setLoading(false);
        }
      };
      loadWeather();
    }, [weatherSettings]);

    if (!weatherSettings.enabled || loading) return null;

    return (
      <div className="weather-background">
        <BeachScene weather={weather} quality={weatherSettings.animationQuality} />
      </div>
    );
  };
  ```
- **验收标准**:
  - [ ] 组件正确加载天气数据
  - [ ] 错误时显示默认场景
  - [ ] 懒加载生效（代码分割）
  - [ ] 设置变更时重新加载

### Task 4.2: 集成到 BlogLayout

- **描述**: 将 WeatherBackground 添加到 BlogLayout 作为背景层
- **输入**: BlogLayout 组件
- **输出**:
  - 修改 `src/components/BlogLayout/BlogLayout.tsx`
  - 调整 z-index 层级（背景在最底层）
  - 调整不透明度（确保前景可读）
- **依赖**: Task 4.1
- **预估时间**: 30 分钟
- **集成代码**:
  ```tsx
  export const BlogLayout: React.FC<IBlogLayout> = ({
    header,
    content,
    footer,
  }) => {
    return (
      <Layout className={prefixCls}>
        <WeatherBackground /> {/* 新增 */}
        <Header className={`${prefixCls}-header`}>{header}</Header>
        <Content className={`${prefixCls}-content`}>{content}</Content>
        <Footer className={`${prefixCls}-footer`}>{footer}</Footer>
      </Layout>
    );
  };
  ```
- **样式调整**:
  ```scss
  .weather-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    opacity: 0.6; // 确保前景可读
  }
  ```
- **验收标准**:
  - [ ] 背景不遮挡前景内容
  - [ ] 层级正确（z-index: -1）
  - [ ] 不透明度合适（对比度足够）

### Task 4.3: 创建天气设置面板

- **描述**: 提供用户控制界面（开关、城市选择、质量）
- **输入**: Ant Design Modal/Drawer 组件
- **输出**:
  - `src/components/WeatherSettings/WeatherSettings.tsx`
  - 设置表单（开关、城市输入、质量选择）
  - 保存到 GlobalDataProvider
- **依赖**: Task 4.1
- **预估时间**: 1.5 小时
- **设置面板 UI**:
  ```tsx
  <Modal title="天气背景设置" visible={visible} onOk={handleSave}>
    <Form>
      <Form.Item label="启用背景动画">
        <Switch checked={enabled} onChange={setEnabled} />
      </Form.Item>
      <Form.Item label="动画质量">
        <Radio.Group value={quality} onChange={setQuality}>
          <Radio value="high">高</Radio>
          <Radio value="medium">中</Radio>
          <Radio value="low">低</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="城市">
        <Input placeholder="自动定位或手动输入" value={city} />
      </Form.Item>
      <Button onClick={refreshWeather}>刷新天气</Button>
    </Form>
  </Modal>
  ```
- **验收标准**:
  - [ ] 设置保存到 localStorage
  - [ ] 变更后立即生效
  - [ ] UI 符合 Ant Design 风格

### Task 4.4: 添加设置入口到 Header

- **描述**: 在 Header 添加设置图标，打开天气设置面板
- **输入**: Header 组件
- **输出**:
  - 修改 `src/components/Header/Header.tsx`
  - 添加设置图标按钮（SettingOutlined）
- **依赖**: Task 4.3
- **预估时间**: 30 分钟
- **验收标准**:
  - [ ] 图标位置合理（右上角）
  - [ ] 点击打开设置面板
  - [ ] 移动端适配

---

## Phase 5: 性能优化 (0.5天)

### Task 5.1: 实现 Canvas 分层缓存

- **描述**: 将静态层（沙滩、远景）缓存到离屏 Canvas
- **输入**: BeachScene 实现
- **输出**:
  - 离屏 Canvas 缓存逻辑
  - 仅动态层每帧重绘
- **依赖**: Task 2.1
- **预估时间**: 1 小时
- **优化策略**:

  ```typescript
  const staticCanvas = document.createElement("canvas");
  const staticCtx = staticCanvas.getContext("2d");

  // 初始化时渲染静态层
  renderBeach(staticCtx);
  renderSky(staticCtx);

  // 动画循环只渲染动态层
  const animate = () => {
    ctx.drawImage(staticCanvas, 0, 0); // 复制静态层
    renderClouds(ctx); // 动态云朵
    renderWaves(ctx); // 动态波浪
  };
  ```

- **验收标准**:
  - [ ] FPS 提升（桌面端 >= 60fps）
  - [ ] 静态层只渲染一次
  - [ ] 动态层流畅

### Task 5.2: 移动端动画降级

- **描述**: 检测设备类型，移动端自动降低动画质量
- **输入**: User-Agent 或设备宽度
- **输出**:
  - 设备检测逻辑
  - 移动端默认 `quality='low'`
  - 粒子数减少 70%
- **依赖**: Task 4.1
- **预估时间**: 1 小时
- **检测逻辑**:

  ```typescript
  function isMobileDevice() {
    return (
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );
  }

  const defaultQuality = isMobileDevice() ? "low" : "high";
  ```

- **验收标准**:
  - [ ] 移动端粒子数 <= 150
  - [ ] 移动端 FPS >= 30
  - [ ] 可手动切换质量

### Task 5.3: 实现 prefers-reduced-motion 支持

- **描述**: 检测用户系统动画偏好，自动禁用动画
- **输入**: `window.matchMedia('(prefers-reduced-motion: reduce)')`
- **输出**:
  - 偏好检测逻辑
  - 检测到 reduce 时禁用背景
- **依赖**: Task 4.1
- **预估时间**: 30 分钟
- **实现**:
  ```typescript
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setEnabled(false);
    }

    const listener = (e) => {
      if (e.matches) setEnabled(false);
    };
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);
  ```
- **验收标准**:
  - [ ] 系统设置 reduce 时自动禁用
  - [ ] 动态监听系统设置变化

### Task 5.4: 代码分割与懒加载

- **描述**: 使用 React.lazy 懒加载 WeatherBackground 组件
- **输入**: WeatherBackground 组件
- **输出**:
  - 使用 `React.lazy(() => import('./WeatherBackground'))`
  - 配置 Vite 代码分割
- **依赖**: Task 4.1
- **预估时间**: 30 分钟
- **实现**:

  ```typescript
  const WeatherBackground = React.lazy(() =>
    import('@/components/WeatherBackground')
  );

  // BlogLayout 中使用 Suspense
  <Suspense fallback={null}>
    <WeatherBackground />
  </Suspense>
  ```

- **验收标准**:
  - [ ] 组件代码分割成独立 chunk
  - [ ] 首屏加载时间增加 < 500ms
  - [ ] 组件异步加载成功

---

## Phase 6: 测试与文档 (0.75天)

### Task 6.1: 组件单元测试

- **描述**: 编写 WeatherBackground、BeachScene 测试
- **输入**: 组件实现
- **输出**:
  - `WeatherBackground.test.tsx`
  - `BeachScene.test.tsx`
  - Mock Canvas API
- **依赖**: Task 4.1
- **预估时间**: 1.5 小时
- **测试用例**:
  - [ ] 组件正确挂载
  - [ ] 天气数据加载成功
  - [ ] 错误时显示默认场景
  - [ ] 设置变更时重新渲染
  - [ ] Canvas 渲染函数被调用
- **验收标准**:
  - [ ] 测试覆盖率 >= 70%
  - [ ] 所有测试通过

### Task 6.2: 跨浏览器测试

- **描述**: 在多个浏览器/设备测试动画效果
- **输入**: 已完成的功能
- **输出**:
  - 浏览器兼容性报告
  - 已修复的兼容性问题
- **依赖**: 所有开发任务完成
- **预估时间**: 2 小时
- **测试矩阵**:
  - [ ] Chrome 90+ (桌面 + Android)
  - [ ] Firefox 88+ (桌面)
  - [ ] Safari 14+ (桌面 + iOS)
  - [ ] Edge 90+ (桌面)
- **验收标准**:
  - [ ] 所有浏览器动画流畅
  - [ ] 移动端无卡顿
  - [ ] 触摸交互正常

### Task 6.3: 性能基准测试

- **描述**: 测量 FPS、内存占用、首屏加载时间
- **输入**: 完整功能
- **输出**:
  - 性能报告（Chrome DevTools Performance）
  - 优化建议（如有性能问题）
- **依赖**: Task 5.4
- **预估时间**: 1 小时
- **测试指标**:
  - [ ] 桌面端 FPS >= 60
  - [ ] 移动端 FPS >= 30
  - [ ] 首屏加载时间增加 < 500ms
  - [ ] 内存占用 < 50MB
- **验收标准**:
  - [ ] 所有性能指标达标
  - [ ] 无内存泄漏

### Task 6.4: 编写用户文档

- **描述**: 创建用户指南，说明如何使用天气背景功能
- **输入**: 功能实现
- **输出**:
  - `docs/weather-background-guide.md`
  - 设置说明、常见问题
- **依赖**: Task 4.3
- **预估时间**: 1 小时
- **文档内容**:
  - [ ] 功能介绍
  - [ ] 如何启用/禁用
  - [ ] 如何设置城市
  - [ ] 动画质量说明
  - [ ] 故障排查
- **验收标准**:
  - [ ] 文档清晰易懂
  - [ ] 截图/GIF 演示

### Task 6.5: 编写开发者文档

- **描述**: 创建 API 文档，说明如何扩展/修改天气背景
- **输入**: 代码实现
- **输出**:
  - `docs/weather-background-api.md`
  - 组件 API、扩展指南
- **依赖**: 所有开发任务完成
- **预估时间**: 1 小时
- **文档内容**:
  - [ ] 架构概览
  - [ ] 组件 API 说明
  - [ ] 如何添加新天气状态
  - [ ] 如何调整动画参数
  - [ ] API Key 配置说明
- **验收标准**:
  - [ ] 文档完整
  - [ ] 代码示例可运行

---

## 依赖关系图

```
Phase 0 (准备)
    ├─ Task 0.1 (API 配置) ────┬─> Task 1.1 (WeatherService)
    ├─ Task 0.2 (依赖审查)     │
    └─ Task 0.3 (规格澄清)     │
                               │
Phase 1 (数据服务)             │
    ├─ Task 1.1 ──────────────┤
    ├─ Task 1.2 (地理定位) ────┤
    └─ Task 1.3 (测试) <───────┘
                               │
Phase 2 (Canvas 基础)          │
    ├─ Task 2.1 (框架) ────────┼─> Task 3.x (动画)
    ├─ Task 2.2 (天空) <───────┤   Task 4.1 (容器)
    ├─ Task 2.3 (海洋) <───────┤
    └─ Task 2.4 (沙滩) <───────┤
                               │
Phase 3 (动画效果)             │
    ├─ Task 3.1 (云) <─────────┤
    ├─ Task 3.2 (雨) <─────────┤
    ├─ Task 3.3 (雪) <─────────┤
    └─ Task 3.4 (雷电) <───────┤
                               │
Phase 4 (集成)                 │
    ├─ Task 4.1 (容器) <───────┼─> Task 4.2 (BlogLayout)
    ├─ Task 4.2 <──────────────┤   Task 6.x (测试)
    ├─ Task 4.3 (设置) ─────────┤
    └─ Task 4.4 (入口) <────────┘
                               │
Phase 5 (优化)                 │
    ├─ Task 5.1 (缓存) <───────┤
    ├─ Task 5.2 (移动端) <─────┤
    ├─ Task 5.3 (无障碍) <─────┤
    └─ Task 5.4 (懒加载) <─────┘
                               │
Phase 6 (测试文档)             │
    ├─ Task 6.1 (单元测试) <───┤
    ├─ Task 6.2 (跨浏览器) <───┤
    ├─ Task 6.3 (性能) <───────┤
    ├─ Task 6.4 (用户文档)
    └─ Task 6.5 (开发文档)
```

---

## 并行执行建议

### 可并行任务组

**组 1 (Phase 1 开始后)**:

- Task 1.2 (地理定位) || Task 2.1 (Canvas 框架)
- 这两个任务无依赖，可并行开发

**组 2 (Phase 2 完成后)**:

- Task 3.1 (云) || Task 3.2 (雨) || Task 3.3 (雪)
- 这些动画效果独立，可并行实现

**组 3 (Phase 4)**:

- Task 4.3 (设置面板) || Task 5.1 (性能优化)
- 设置面板与性能优化可并行

**组 4 (Phase 6)**:

- Task 6.4 (用户文档) || Task 6.5 (开发文档)
- 文档编写可并行

---

## 风险缓解检查清单

每个任务完成后检查：

- [ ] **性能**: FPS 是否符合预期？
- [ ] **兼容性**: 是否在目标浏览器测试？
- [ ] **错误处理**: API/网络错误是否优雅降级？
- [ ] **类型安全**: 是否有 TypeScript 类型错误？
- [ ] **样式**: 是否与现有主题冲突？
- [ ] **移动端**: 是否在移动设备测试？
- [ ] **无障碍**: 是否支持 prefers-reduced-motion？
- [ ] **测试**: 是否有单元测试覆盖？

---

## 完成标准

所有任务完成后，验证：

1. **功能完整性**:
   - [ ] 6 种天气状态全部实现
   - [ ] 天气数据正确获取和缓存
   - [ ] 用户设置完整可用
   - [ ] 动画流畅自然

2. **性能达标**:
   - [ ] 桌面端 >= 60fps
   - [ ] 移动端 >= 30fps
   - [ ] 首屏加载 < 500ms

3. **质量保证**:
   - [ ] 所有测试通过
   - [ ] 代码审查完成
   - [ ] 跨浏览器兼容
   - [ ] 文档齐全

4. **用户体验**:
   - [ ] 视觉效果美观
   - [ ] 不影响内容可读性
   - [ ] 设置简单易用
   - [ ] 降级策略生效
