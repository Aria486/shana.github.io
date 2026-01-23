# Tasks: Add Beach-Ocean Background

## Phase 1: 准备工作 (Setup)

- [x] 安装 `simplex-noise` 依赖包
  - 运行 `npm install simplex-noise`
  - 验证安装成功
- [x] 创建新的工具文件结构
  - 创建 `src/components/WeatherBackground/utils/` 目录
  - 创建 `waveGenerator.ts` 文件
  - 创建 `noiseUtils.ts` 文件
- [x] 更新类型定义
  - 在 `types.ts` 中添加 `WaveLayerConfig` 接口
  - 添加 `Point` 接口（x, y 坐标）
  - 添加波浪相关的类型定义

## Phase 2: 核心功能实现 (Core Implementation)

- [x] 实现噪声工具 (`noiseUtils.ts`)
  - 封装 `createNoise2D` 函数
  - 实现 `getNoiseValue` 辅助函数
  - 添加单元测试
- [x] 实现波浪生成器 (`waveGenerator.ts`)
  - 实现 `generateWavePoints` 函数（垂直方向噪声）
  - 实现 `drawWavePath` 函数（绘制波浪路径）
  - 实现 `createWaveLayerConfig` 函数（生成层配置）
  - 添加单元测试
- [x] 重构 `BeachScene.tsx`
  - 调整布局为左右结构（左 35% 海洋，右 65% 沙滩）
  - 移除现有的简单波浪渲染逻辑
  - 集成新的波浪生成器
  - 实现 `renderOcean` 方法（多层波浪）
  - 实现 `renderBeach` 方法（沙滩纹理）
  - 更新动画循环逻辑

## Phase 3: 视觉优化 (Visual Refinement)

- [x] 调整波浪视觉参数
  - 调整每层波浪的颜色（深蓝到浅蓝渐变）
  - 调整振幅、频率参数以获得自然效果
  - 调整透明度确保层次感
- [x] 优化沙滩渲染
  - 实现细腻的沙粒纹理
  - 添加颜色变化（边缘深，中心浅）
- [x] 更新天气场景配置 (`sceneConfigs.ts`)
  - 为每种天气条件配置波浪参数
  - 调整海洋颜色方案
  - 配置沙滩颜色方案

## Phase 4: 性能优化 (Performance Optimization)

- [x] 实现质量级别适配
  - 根据 `quality` 参数调整波浪层数
  - 根据 `quality` 调整采样点密度
  - 实现帧率自适应（低端设备降频）
- [x] 优化内存使用
  - 复用点数组，避免频繁分配
  - 使用 `Float32Array` 存储大量数值
- [x] 优化渲染性能
  - 缓存静态沙滩纹理（离屏 canvas）
  - 减少不必要的 Canvas API 调用
  - 使用 `will-change` CSS 属性优化合成

## Phase 5: 集成与兼容 (Integration & Compatibility)

- [x] 更新 `WeatherBackground.tsx`
  - 确保接口保持向后兼容
  - 传递正确的参数到 `BeachScene`
  - 验证质量检测逻辑
- [x] 浏览器兼容性处理
  - 添加 Canvas 2D 支持检测
  - 实现降级方案（不支持 Canvas 时的静态背景）
  - 测试主流浏览器（Chrome, Firefox, Safari, Edge）
- [x] 响应式适配
  - 验证不同屏幕尺寸下的显示效果
  - 优化移动端性能
  - 处理窗口大小调整

## Phase 6: 测试验证 (Testing & Validation)

- [ ] 单元测试
  - 测试 `noiseUtils.ts` 工具函数
  - 测试 `waveGenerator.ts` 波浪生成逻辑
  - 测试配置映射函数
- [ ] 组件测试
  - 测试 `BeachScene` 渲染逻辑
  - 测试天气条件切换
  - 测试质量级别切换
- [ ] 性能测试
  - 在高/中/低端设备上测试帧率
  - 测试内存使用情况
  - 验证启动时间影响
- [ ] 视觉测试
  - 截图对比（确保视觉一致性）
  - 动画流畅度人工检查
  - 跨浏览器视觉验证

## Phase 7: 文档与清理 (Documentation & Cleanup)

- [ ] 更新代码注释
  - 为新函数添加 JSDoc 注释
  - 解释关键算法（噪声生成、波浪绘制）
  - 添加使用示例
- [ ] 更新 README/文档
  - 记录新的依赖项
  - 说明性能特性
  - 提供配置指南
- [ ] 代码审查与清理
  - 移除调试代码和 console.log
  - 确保代码符合项目规范
  - 运行 ESLint 检查
  - 格式化代码

## Phase 8: 验收与发布 (Acceptance & Release)

- [ ] 验收测试
  - 在开发环境验证所有功能
  - 在预生产环境测试
  - 进行用户验收测试（UAT）
- [ ] 准备发布
  - 更新 CHANGELOG
  - 创建发布说明
  - 打包构建
- [ ] 部署与监控
  - 部署到生产环境
  - 监控性能指标
  - 收集用户反馈

## 依赖关系

- Phase 1 → Phase 2 （准备工作完成后才能实现）
- Phase 2 → Phase 3 （核心功能完成后才能优化视觉）
- Phase 3 → Phase 4 （视觉确定后再优化性能）
- Phase 4 → Phase 5 （性能优化后再集成）
- Phase 5 → Phase 6 （集成完成后进行测试）
- Phase 6 → Phase 7 （测试通过后编写文档）
- Phase 7 → Phase 8 （文档完成后准备发布）

## 并行工作机会

以下任务可以并行进行：

- Phase 2: `noiseUtils.ts` 和 `waveGenerator.ts` 可以由不同开发者同时实现
- Phase 6: 单元测试、组件测试和性能测试可以并行进行
- Phase 7: 代码注释和文档更新可以并行进行

## 预估时间

- Phase 1: 0.5 小时
- Phase 2: 6 小时
- Phase 3: 4 小时
- Phase 4: 6 小时
- Phase 5: 3 小时
- Phase 6: 8 小时
- Phase 7: 2 小时
- Phase 8: 2 小时

**总计**: 约 31.5 小时 (约 4 个工作日)

## 验收标准

✅ 所有功能正常工作
✅ 所有测试通过（覆盖率 > 80%）
✅ 性能达标（中等设备保持 60 FPS）
✅ 视觉效果满足设计要求
✅ 代码符合项目规范
✅ 文档完整清晰
✅ 无阻塞性 bug
