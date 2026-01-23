# Beach-Ocean Background

> 将天气背景改造为沙滩海洋场景，采用左右布局（左侧海洋，右侧沙滩）

## 📋 文档索引

- **[proposal.md](./proposal.md)** - 提案概述、动机和目标
- **[design.md](./design.md)** - 技术设计文档和架构说明
- **[tasks.md](./tasks.md)** - 详细的实施任务清单
- **[specs/weather-background/spec.md](./specs/weather-background/spec.md)** - 规范变更增量

## 🎯 目标

将现有的 `WeatherBackground` 组件从简单的天空+海洋布局重构为更真实的沙滩海洋场景：

- **左侧 35%**：多层波浪动画（使用 Simplex 噪声生成）
- **右侧 65%**：静态沙滩纹理

## 🚀 关键特性

1. **多层波浪渲染**：3-4 层海浪，创造深度感
2. **自然动画**：基于 Simplex 噪声的流畅波动
3. **性能优化**：根据设备性能自动调整质量
4. **天气响应**：不同天气条件下的波浪强度变化
5. **向后兼容**：保持现有 API 不变

## 📊 参考项目

- [beachx](https://github.com/ildarnm/beachx) - 沙滩波浪动画生成器
- 采用其核心技术（Simplex 噪声、多层渲染）但调整为左右布局

## 🔧 技术栈

- **React 19** - 组件框架
- **TypeScript** - 类型安全
- **Canvas 2D API** - 图形渲染
- **simplex-noise@^4.0.0** - 噪声生成（新增依赖）

## 📈 性能目标

| 设备性能 | 波浪层数 | 目标帧率 |
| -------- | -------- | -------- |
| High     | 4        | 60 FPS   |
| Medium   | 3        | 60 FPS   |
| Low      | 2        | ≥30 FPS  |

## 🗂️ 文件结构

```
src/components/WeatherBackground/
├── WeatherBackground.tsx       (轻微修改)
├── BeachScene.tsx             (重构)
├── types.ts                   (新增类型)
├── sceneConfigs.ts           (更新配置)
├── utils/
│   ├── waveGenerator.ts      (新增)
│   └── noiseUtils.ts         (新增)
└── __tests__/                (测试)
```

## ⏱️ 预估工期

- **总计**：约 4 个工作日（31.5 小时）
- **关键路径**：准备 → 核心实现 → 视觉优化 → 性能优化 → 测试

## ✅ 验收标准

- [ ] 所有功能正常工作
- [ ] 测试覆盖率 > 80%
- [ ] 中等设备保持 60 FPS
- [ ] 视觉效果自然流畅
- [ ] 代码符合项目规范
- [ ] 文档完整

## 🔗 相关变更

- `enhance-weather-background-realism` - 增强天气背景真实感
  - **建议合并**：两个提案都涉及左右布局改造
  - **本提案专注**：波浪动画的真实感（Simplex 噪声、多层渲染）
  - **另一提案专注**：整体视觉柔和化、太阳轨迹、场景元素（植被、鱼类）

## ⚠️ 重要说明

本提案与现有的 `enhance-weather-background-realism` 有部分重叠（都涉及左右布局改造）。**建议在审批时考虑以下选项**：

1. **合并方案**：将本提案的波浪动画部分并入 `enhance-weather-background-realism`
2. **拆分实施**：先完成 `enhance-weather-background-realism` 的布局改造，再叠加本提案的波浪增强
3. **独立实施**：调整本提案的范围，仅聚焦波浪动画，不涉及布局改造

## 📝 状态

- **提案日期**：2026-01-22
- **状态**：待审批
- **下一步**：等待审批后开始实施
