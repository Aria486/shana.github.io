# Tasks: Refactor Beach Scene to Pixel Art Components

**Change ID**: `refactor-pixel-beach-components`

## Implementation Tasks

### 阶段 1：创建像素渲染组件

#### 1. 创建 PixelBeach 组件

- [ ] 创建 `PixelBeach.tsx` 文件
- [ ] 定义 `PixelBeachProps` 接口
- [ ] 实现 `renderPixelBeach()` 函数
  - 纯色填充 #F4A460
  - 接收位置参数（beachTop, beachLeft）
- [ ] 导出渲染函数

**验证**：独立测试沙滩渲染

---

#### 2. 创建 PixelSky 组件

- [ ] 创建 `PixelSky.tsx` 文件
- [ ] 定义 `PixelSkyProps` 接口
- [ ] 实现 `renderPixelSky()` 函数
  - 纯色填充 #5DA8FF
  - 覆盖整个画布
- [ ] 导出渲染函数

**验证**：独立测试天空渲染

---

#### 3. 创建 PixelClouds 组件

- [ ] 创建 `PixelClouds.tsx` 文件
- [ ] 定义像素云朵图案（2D 数组）
  - 至少 3 种不同大小的云朵图案
- [ ] 定义 `PixelCloudsProps` 接口
- [ ] 实现 `renderPixelClouds()` 函数
  - 遍历云朵数组
  - 根据图案绘制像素块
  - 使用整数坐标
- [ ] 实现 `updatePixelClouds()` 函数
  - 水平移动
  - 像素对齐

**验证**：云朵以像素风格显示并移动

---

#### 4. 创建 PixelOcean 组件

- [ ] 创建 `PixelOcean.tsx` 文件
- [ ] 定义波浪层配置（颜色、振幅、波长、速度）
- [ ] 定义 `PixelOceanProps` 接口
- [ ] 实现 `generatePixelWave()` 辅助函数
  - 正弦波离散化
  - 返回像素对齐的点数组
- [ ] 实现 `renderPixelOcean()` 函数
  - 渲染 3-5 层波浪
  - 每层不同颜色和速度
  - 填充到海底线
- [ ] 导出渲染函数

**验证**：海洋呈现分层像素波浪效果

---

### 阶段 2：重构主组件

#### 5. 清理 BeachScene.tsx

- [ ] 删除未使用的函数
  - `renderOceanDepth()`
  - `renderBeach()`
  - `renderOceanWaves()`
  - `renderSun()`
  - `renderParticles()`
  - `updateParticles()`
  - `renderFog()`
- [ ] 删除未使用的状态和 ref
  - `particlesRef`
  - `noiseGeneratorsRef`
  - `waveLayerConfigsRef`
- [ ] 删除未使用的初始化函数
  - `initParticles()`
  - `initWaveGenerators()`
- [ ] 删除未使用的导入

**验证**：代码通过 TypeScript 编译

---

#### 6. 集成像素组件到 BeachScene

- [ ] 导入所有像素渲染组件
- [ ] 在 useEffect 开始配置 `ctx.imageSmoothingEnabled = false`
- [ ] 定义位置常量
  - `waterLine` = canvas.height \* 0.25
  - `seaFloor` = canvas.height \* 0.85
  - `beachTop` = canvas.height \* 0.7
  - `beachLeft` = canvas.width \* 0.7
- [ ] 修改 `animate()` 函数调用顺序：
  1. renderPixelSky()
  2. renderPixelOcean()
  3. renderPixelBeach()
  4. renderPixelClouds()
- [ ] 保留云朵更新逻辑，修改为像素对齐

**验证**：完整场景以像素风格渲染

---

### 阶段 3：优化和完善

#### 7. 更新云朵初始化

- [ ] 修改 `initClouds()` 为像素云朵分配图案索引
- [ ] 添加 `patternIndex` 属性到 Cloud 接口
- [ ] 确保云朵数量适中（quality: high=5, medium=3, low=2）

**验证**：云朵正确初始化并显示不同图案

---

#### 8. 代码清理和优化

- [ ] 移除未使用的类型定义（Particle 接口）
- [ ] 清理未使用的配置（config.particleType 等）
- [ ] 简化 SceneConfig（移除不需要的字段）
- [ ] 添加代码注释
- [ ] 格式化代码

**验证**：无 lint 警告，代码整洁

---

#### 9. 性能测试

- [ ] 测试动画帧率（目标 ≥ 60 FPS）
- [ ] 测试不同 quality 设置
- [ ] 测试不同屏幕尺寸
- [ ] 验证内存使用稳定

**验证**：性能符合预期

---

#### 10. 测试

- [ ] 创建或更新 BeachScene.test.tsx
- [ ] 测试组件渲染
- [ ] 测试像素模式配置
- [ ] 测试各元素正确显示
- [ ] 为每个像素组件创建单元测试（可选）

**验证**：所有测试通过

---

#### 11. 更新任务清单

- [ ] 标记所有任务为已完成 `- [x]`
- [ ] 验证所有验收标准达成

**验证**：提案完整实施

---

## 依赖关系

### 顺序依赖

- 任务 5 必须在任务 6 之前（先清理再集成）
- 任务 1-4 必须在任务 6 之前（先创建组件再集成）
- 任务 7-9 依赖任务 6（先集成再优化）
- 任务 10-11 最后执行（测试和收尾）

### 可并行任务

- 任务 1-4 可以并行创建（各组件独立）

## 交付顺序

1. **阶段 1（组件创建）**：任务 1-4
2. **阶段 2（重构集成）**：任务 5-6
3. **阶段 3（优化完善）**：任务 7-11

每个阶段完成后提交代码并验证。

## 预估工作量

- 阶段 1：4 个组件文件，约 300 行新代码
- 阶段 2：清理 ~150 行，重构 ~50 行
- 阶段 3：优化和测试 ~100 行

总计：净减少约 100-150 行代码，提升可维护性。
