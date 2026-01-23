# Tasks: 增强天气背景真实感

**变更 ID**: `enhance-weather-background-realism`  
**总预估时间**: 3 天

---

## 任务分解

### 阶段 1: 布局重构与颜色优化 (0.5 天)

#### 1.1 调整场景布局为横向设计

- **描述**: 修改 `BeachScene.tsx` 渲染逻辑，将海洋移至左侧 (35% 宽度)，沙滩移至右侧 (65% 宽度)
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **验证**:
  - 海洋占据画布左侧约 35% 区域
  - 沙滩占据画布右侧约 65% 区域
  - 海滩分界线清晰可见
- **预计时间**: 2 小时
- **依赖**: 无
- **优先级**: P0 (必须)
- **状态**: ✅ 已完成

#### 1.2 控制背景高度至视口 30%

- **描述**: 修改 `WeatherBackground.tsx` 容器组件，限制 Canvas 高度为视口 30%，底部对齐
- **文件**: `src/components/WeatherBackground/WeatherBackground.tsx`, `style.scss`
- **验证**:
  - 背景高度 ≤ 视口 30%
  - 内容区域上方有足够留白 (≥ 70% 视口)
  - 响应式调整正常 (窗口缩放时高度比例保持)
- **预计时间**: 1 小时
- **依赖**: 无
- **优先级**: P0 (必须)
- **状态**: ✅ 已完成

#### 1.3 柔和化天空颜色方案

- **描述**: 降低 `sceneConfigs.ts` 中所有天气状态的天空渐变颜色饱和度，使用半透明色
- **文件**: `src/components/WeatherBackground/sceneConfigs.ts`
- **变更**:
  - Clear: `top: 'rgba(135, 206, 235, 0.3)'`, `bottom: 'rgba(255, 248, 220, 0.2)'`
  - Clouds: `top: 'rgba(176, 196, 222, 0.4)'`, `bottom: 'rgba(245, 245, 245, 0.3)'`
  - Rain: `top: 'rgba(105, 105, 105, 0.5)'`, `bottom: 'rgba(169, 169, 169, 0.3)'`
  - 其他天气状态类似调整
- **验证**:
  - 视觉上颜色更柔和，无刺眼感
  - WCAG AA 颜色对比度测试通过 (与白色文字对比度 ≥ 4.5:1)
  - 6 种天气状态截图对比 (改动前后)
- **预计时间**: 1 小时
- **依赖**: 无
- **优先级**: P0 (必须)
- **状态**: ✅ 已完成

#### 1.4 减少太阳光晕强度

- **描述**: 修改 `renderSun()` 函数，降低光晕透明度和范围
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **变更**:
  - 光晕透明度从 `0.3 / i` 改为 `0.15 / i`
  - 光晕半径从 `sunRadius * (1 + i * 0.5)` 改为 `sunRadius * (1 + i * 0.3)`
- **验证**:
  - 太阳周围发光效果明显减弱
  - 不影响太阳本体的可见性
- **预计时间**: 0.5 小时
- **依赖**: 无
- **优先级**: P1 (高)
- **状态**: ✅ 已完成

---

### 阶段 2: 太阳动态轨迹系统 (1 天)

#### 2.1 实现时间基础的太阳位置计算

- **描述**: 创建 `calculateSunPosition()` 函数，根据本地时间 (0-23h) 计算太阳的 x, y 坐标
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **算法**:
  ```typescript
  function calculateSunPosition(
    hour: number,
    canvas: HTMLCanvasElement,
  ): SunPosition {
    // 6am-6pm 为白天，其他为夜间
    const isNight = hour < 6 || hour >= 18;

    // 水平位置: 线性映射 6am(左) -> 18pm(右)
    const dayProgress = (hour - 6) / 12; // 0 to 1
    const x =
      canvas.width * 0.1 +
      canvas.width * 0.8 * Math.max(0, Math.min(1, dayProgress));

    // 垂直位置: 抛物线 (正午最高)
    const noonDistance = Math.abs(hour - 12) / 6; // 0 (noon) to 1 (dawn/dusk)
    const y =
      canvas.height * 0.1 +
      canvas.height * 0.15 * (noonDistance * noonDistance);

    return {
      x,
      y,
      size: isNight ? 30 : 40,
      isNightMode: isNight,
    };
  }
  ```
- **验证**:
  - 单元测试: 6am -> 左侧低位, 12pm -> 中央高位, 18pm -> 右侧低位
  - 边界测试: 0am, 5am, 19pm 等夜间时段
  - 视觉测试: 手动调整时间参数，观察太阳移动
- **预计时间**: 3 小时
- **依赖**: 无
- **优先级**: P0 (必须)

#### 2.2 修改 renderSun 支持动态位置

- **描述**: 重构 `renderSun()` 函数，接收计算后的 SunPosition 参数，而非硬编码坐标
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **变更**:
  - 移除硬编码的 `sunX = canvas.width * 0.8`, `sunY = canvas.height * 0.2`
  - 从 `calculateSunPosition()` 获取实时位置
  - 根据 `isNightMode` 切换颜色 (太阳黄色 vs 月亮银白色)
- **验证**:
  - 太阳位置随时间变化
  - 夜间正确显示月亮 (颜色: `#E0E0E0`)
  - 过渡平滑 (无跳跃)
- **预计时间**: 2 小时
- **依赖**: 2.1
- **优先级**: P0 (必须)

#### 2.3 添加日/夜模式天空颜色切换

- **描述**: 扩展 `sceneConfigs.ts`，为每种天气添加 `nightSkyColors` 配置
- **文件**: `src/components/WeatherBackground/sceneConfigs.ts`, `BeachScene.tsx`
- **新增配置**:
  ```typescript
  Clear: {
    skyColors: { top: '...', bottom: '...' },
    nightSkyColors: {
      top: 'rgba(25, 25, 112, 0.8)',    // 深蓝夜空
      bottom: 'rgba(72, 61, 139, 0.5)'  // 紫色地平线
    },
    // ...
  }
  ```
- **验证**:
  - 18:00-6:00 时段天空使用夜间配色
  - 颜色过渡自然 (可选: 添加渐变过渡动画)
- **预计时间**: 2 小时
- **依赖**: 2.2
- **优先级**: P1 (高)

#### 2.4 优化太阳更新频率

- **描述**: 太阳位置计算移至每秒更新 (而非每帧)，避免不必要的性能开销
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **实现**:
  ```typescript
  useEffect(() => {
    const updateSunPosition = () => {
      const now = new Date();
      sunPositionRef.current = calculateSunPosition(now.getHours(), canvas);
    };

    updateSunPosition(); // 立即执行
    const interval = setInterval(updateSunPosition, 1000); // 每秒更新

    return () => clearInterval(interval);
  }, []);
  ```
- **验证**:
  - Chrome DevTools Performance 分析: `calculateSunPosition` 调用频率 ≈ 1 次/秒
  - 太阳移动流畅度足够 (1 秒间隔肉眼无法察觉)
- **预计时间**: 1 小时
- **依赖**: 2.2
- **优先级**: P2 (中)

---

### 阶段 3: 场景元素增强 (1 天)

#### 3.1 实现椰子树渲染

- **描述**: 创建 `drawPalmTree()` 函数，绘制简化的椰子树 (树干 + 4 片叶子)
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **实现细节**:
  - 树干: 褐色矩形 (`#8B7355`, 宽度 10px)
  - 叶片: 绿色椭圆 (`#7CB342`, 长 40px, 宽 15px) x 4 (旋转 90° 间隔)
  - 位置: 沙滩区域随机分布 2-3 棵
  - 高度: 60-80px (质量参数可调)
- **验证**:
  - 椰子树显示在沙滩右侧区域
  - 不遮挡海洋或内容区
  - `quality="low"` 时只渲染 1 棵树
- **预计时间**: 2 小时
- **依赖**: 1.1 (布局完成)
- **优先级**: P1 (高)

#### 3.2 实现灌木/草丛渲染

- **描述**: 创建 `drawBush()` 函数，绘制简化的圆形灌木簇
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **实现细节**:
  - 形状: 3-5 个重叠的圆形 (半径 5-10px)
  - 颜色: 深绿色 (`#558B2F`, 不透明度 0.7)
  - 位置: 沙滩区域随机分布 3-5 簇
  - 层次: 绘制在椰子树之后 (避免遮挡)
- **验证**:
  - 灌木与椰子树位置不重叠
  - 视觉上有景深效果 (可选: 远处的灌木略小)
- **预计时间**: 1.5 小时
- **依赖**: 3.1
- **优先级**: P2 (中)

#### 3.3 实现鱼类数据结构与游动逻辑

- **描述**: 创建 `Fish` 接口和 `updateFish()` 函数，管理鱼类位置和动画
- **文件**: `src/components/WeatherBackground/types.ts`, `BeachScene.tsx`
- **数据结构**:
  ```typescript
  interface Fish {
    x: number;
    y: number;
    speed: number; // 0.5-1.5 px/frame
    direction: 1 | -1; // 1: 右游, -1: 左游
    size: number; // 8-15 px
    color: string; // 随机颜色
  }
  ```
- **逻辑**:
  - 边界检测: 触碰海洋边界时反向
  - 轻微摆动: `y += Math.sin(phase) * 0.5`
  - 初始化: 海洋区域随机生成 5-10 条 (high) / 2-3 条 (low)
- **验证**:
  - 鱼不会游出海洋区域
  - 转向时方向切换正确
  - 多条鱼运动独立 (不同速度)
- **预计时间**: 2 小时
- **依赖**: 1.1 (海洋区域定义)
- **优先级**: P1 (高)

#### 3.4 实现鱼类绘制

- **描述**: 创建 `drawFish()` 函数，绘制简化的鱼形状 (椭圆身体 + 三角尾巴)
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **实现细节**:
  - 身体: 橙色椭圆 (`rgba(255, 165, 0, 0.6)`, 长宽比 1.6:1)
  - 尾巴: 三角形 (颜色稍深)
  - 朝向: 根据 `direction` 翻转尾巴方向
  - 层级: 绘制在海浪之前 (看起来在水下)
- **验证**:
  - 鱼在海洋区域可见
  - 游动时尾巴朝向正确
  - 半透明效果自然 (与海水融合)
- **预计时间**: 2 小时
- **依赖**: 3.3
- **优先级**: P1 (高)

#### 3.5 整合新元素到渲染循环

- **描述**: 在 `animate()` 函数中按正确顺序调用植被和鱼类渲染
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **渲染顺序** (从后到前):
  1. `renderSky()`
  2. `renderSun()`
  3. `renderClouds()`
  4. `renderFish()` ← 新增
  5. `renderOcean()`
  6. `renderBeach()`
  7. `renderVegetation()` ← 新增 (椰子树 + 灌木)
  8. `renderParticles()`
  9. `renderFog()`
- **验证**:
  - 鱼在海浪下方 (水下效果)
  - 植被在沙滩上方 (陆地效果)
  - 无渲染闪烁或 z-index 错误
- **预计时间**: 0.5 小时
- **依赖**: 3.1, 3.2, 3.4
- **优先级**: P0 (必须)

---

### 阶段 4: 优化与测试 (0.5 天)

#### 4.1 响应式布局适配

- **描述**: 移动端 (< 768px) 调整背景高度至 20%，减少元素数量
- **文件**: `src/components/WeatherBackground/WeatherBackground.tsx`, `BeachScene.tsx`
- **变更**:
  - 检测窗口宽度，设置 `isMobile` 标志
  - 移动端: 高度 20%, 鱼类 2 条, 无灌木, 椰子树 1 棵
  - 桌面端: 高度 30%, 完整元素
- **验证**:
  - iPhone 12 Safari: 背景不遮挡内容
  - iPad 横屏: 正常显示
  - 响应式过渡平滑
- **预计时间**: 1 小时
- **依赖**: 全部前置任务
- **优先级**: P1 (高)

#### 4.2 性能优化

- **描述**: 使用 Chrome DevTools Performance 分析，优化高开销操作
- **文件**: `src/components/WeatherBackground/BeachScene.tsx`
- **优化点**:
  - 鱼类更新频率: 每 2 帧更新一次
  - 植被静态缓存: 预渲染到离屏 Canvas
  - 太阳位置: 每秒更新 (已在 2.4 完成)
- **验证**:
  - 桌面端: FPS ≥ 55 (Chrome Performance Monitor)
  - 移动端: FPS ≥ 28 (Lighthouse 模拟)
  - CPU 占用: `quality="low"` 时 < 15%
- **预计时间**: 1.5 小时
- **依赖**: 全部前置任务
- **优先级**: P0 (必须)

#### 4.3 视觉回归测试

- **描述**: 截取 6 种天气状态 + 不同时间段的截图，人工验证
- **文件**: 无 (测试文档)
- **测试用例**:
  - Clear 天气: 6am, 12pm, 18pm, 0am (4 张)
  - Clouds, Rain 各 2 张 (白天 + 夜间)
  - Thunderstorm, Snow, Mist 各 1 张
  - **总计**: 10 张截图
- **验证标准**:
  - 无渲染错误 (元素缺失、位置错误)
  - 颜色符合柔和化要求
  - 布局符合横向设计
- **预计时间**: 1 小时
- **依赖**: 全部前置任务
- **优先级**: P1 (高)

#### 4.4 可访问性验证

- **描述**: 确保背景不影响可访问性，支持 `prefers-reduced-motion`
- **文件**: `src/components/WeatherBackground/WeatherBackground.tsx`
- **变更**:
  - 检测 `window.matchMedia('(prefers-reduced-motion: reduce)')`
  - 如果用户偏好减少动画，传递 `paused={true}` 给 BeachScene
  - 静态渲染: 太阳/月亮固定位置，无鱼类/波浪动画
- **验证**:
  - macOS 系统设置开启"减少动画" -> 背景静止
  - WCAG 2.1 AAA 级别动画标准通过
- **预计时间**: 0.5 小时
- **依赖**: 无
- **优先级**: P2 (中)

#### 4.5 更新文档

- **描述**: 更新 `add-weather-background` 变更的文档，记录新增配置项
- **文件**: `openspec/changes/add-weather-background/proposal.md` (追加章节)
- **内容**:
  - 新增配置: `nightSkyColors`, `vegetation`, `marine`
  - 布局变更说明: 横向设计原理
  - 性能指标: 实测数据
- **预计时间**: 0.5 小时
- **依赖**: 全部前置任务
- **优先级**: P2 (中)

---

## 任务依赖图

```
阶段 1 (布局与颜色)
├── 1.1 横向布局 ────────────┐
├── 1.2 高度控制             │
├── 1.3 颜色柔和化           │
└── 1.4 光晕减弱             │
                             │
阶段 2 (太阳系统)            │
├── 2.1 位置计算             │
├── 2.2 动态渲染 ← 2.1       │
├── 2.3 日夜切换 ← 2.2       │
└── 2.4 更新优化 ← 2.2       │
                             │
阶段 3 (场景元素)            │
├── 3.1 椰子树 ← 1.1 ────────┤
├── 3.2 灌木 ← 3.1           │
├── 3.3 鱼逻辑 ← 1.1 ────────┤
├── 3.4 鱼绘制 ← 3.3         │
└── 3.5 整合 ← 3.1,3.2,3.4   │
                             ↓
阶段 4 (优化测试) ← 所有前置任务
├── 4.1 响应式
├── 4.2 性能优化
├── 4.3 视觉测试
├── 4.4 可访问性
└── 4.5 文档更新
```

---

## 验收标准总览

| 类别         | 标准                          | 验证方式                   |
| ------------ | ----------------------------- | -------------------------- |
| **功能**     | 横向布局 (左海右滩)           | 视觉检查 + 代码审查        |
| **功能**     | 背景高度 ≤ 30%                | 浏览器 DevTools 测量       |
| **功能**     | 太阳轨迹 6am-6pm              | 截图对比 (每 2 小时)       |
| **功能**     | 夜间显示月亮                  | 18:00-6:00 时段测试        |
| **功能**     | 植被 (2-3 树 + 3-5 灌木)      | 元素计数 + 位置检查        |
| **功能**     | 鱼类 (5-10 条桌面 / 2-3 移动) | 动态元素追踪               |
| **性能**     | 桌面 ≥ 55 FPS                 | Chrome Performance Monitor |
| **性能**     | 移动 ≥ 28 FPS                 | Lighthouse 模拟            |
| **性能**     | CPU < 15% (low 模式)          | Chrome Task Manager        |
| **视觉**     | 颜色饱和度降低                | WCAG 对比度工具            |
| **视觉**     | 光晕透明度 < 0.2              | 代码审查 + 视觉检查        |
| **可访问性** | 支持 reduced-motion           | 系统设置测试               |
| **兼容性**   | 主题切换正常                  | 功能测试                   |

---

## 风险项跟踪

| 任务 ID  | 风险             | 缓解措施                           | 负责人 | 状态 |
| -------- | ---------------- | ---------------------------------- | ------ | ---- |
| 3.3, 3.4 | 鱼类动画性能开销 | quality 参数分级，低端设备减少数量 | -      | ⏳   |
| 2.1      | 太阳轨迹算法错误 | 单元测试 + 边界测试                | -      | ⏳   |
| 1.1      | 横向布局窄屏适配 | 响应式策略 (移动端调整)            | -      | ⏳   |
| 4.2      | 性能目标未达成   | 预留优化时间，可降级功能           | -      | ⏳   |

---

## 可选增强 (Future Enhancements)

以下功能不在本次变更范围内，但可作为未来迭代考虑:

1. **星空效果**: 夜间添加闪烁星星 (性能开销待评估)
2. **鱼类交互**: 鼠标悬停时鱼群避让 (可能干扰内容操作)
3. **天气动态植被**: 雨天增加水滴打在叶片上的效果
4. **太阳光照模拟**: 根据太阳位置调整阴影和光线角度 (复杂度高)
5. **海鸟动画**: 偶尔飞过的海鸟 (增加趣味性)
6. **用户自定义**: 允许用户调整元素数量和颜色方案

---

**状态**: ⏳ 待开始  
**最后更新**: 2026-01-21
