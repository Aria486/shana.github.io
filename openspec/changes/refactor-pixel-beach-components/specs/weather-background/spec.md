# Weather Background - Pixel Art Component Architecture

**Capability**: Weather Background  
**Change**: `refactor-pixel-beach-components`  
**Type**: Spec Delta

## ADDED Requirements

### Requirement: 像素艺术组件架构

Weather Background MUST 采用组件化架构，每个视觉元素由独立的渲染组件负责，使用像素艺术风格。

#### Scenario: 组件化渲染流程

- **GIVEN** BeachScene 组件被渲染
- **WHEN** 动画循环执行
- **THEN** 各视觉元素 MUST 由独立组件函数渲染
- **AND** 渲染顺序 MUST 为：天空 → 海洋 → 沙滩 → 云朵
- **AND** 每个组件 MUST 只负责单一视觉元素
- **AND** 组件间 MUST 通过 props 传递共享状态

#### Scenario: 像素渲染配置

- **GIVEN** BeachScene 组件初始化
- **WHEN** canvas 上下文被创建
- **THEN** `imageSmoothingEnabled` MUST 设置为 `false`
- **AND** 所有渲染 MUST 呈现像素化效果
- **AND** 所有坐标 SHOULD 对齐到像素网格（使用整数）

---

### Requirement: PixelSky 组件 - 像素天空

PixelSky 组件 MUST 以纯色渲染天空背景，无渐变效果。

#### Scenario: 渲染纯色天空

- **GIVEN** PixelSky 组件被调用
- **WHEN** 传入 canvas 上下文和颜色配置
- **THEN** 天空 MUST 使用单一纯色填充（默认 #5DA8FF）
- **AND** 天空 MUST 覆盖整个画布
- **AND** 天空 MUST NOT 显示任何渐变

#### Scenario: 可配置天空颜色

- **GIVEN** PixelSky 组件接收 props
- **WHEN** `color` 属性被传入
- **THEN** 组件 MUST 使用指定颜色渲染天空
- **AND** 颜色 MUST 为有效的 CSS 颜色字符串

---

### Requirement: PixelClouds 组件 - 像素云朵

PixelClouds 组件 MUST 使用预定义的像素图案渲染云朵，支持水平移动动画。

#### Scenario: 使用像素图案渲染云朵

- **GIVEN** PixelClouds 组件被调用
- **WHEN** 传入云朵数组和渲染上下文
- **THEN** 每个云朵 MUST 使用 2D 数组定义的像素图案
- **AND** 图案中的 1 MUST 渲染为白色像素块
- **AND** 图案中的 0 MUST 保持透明
- **AND** 像素块大小 SHOULD 为 4x4 像素

#### Scenario: 云朵像素对齐移动

- **GIVEN** 云朵正在移动
- **WHEN** 更新云朵位置
- **THEN** 云朵 X 坐标 MUST 为像素大小的整数倍
- **AND** 云朵移动 MUST 呈现像素跳跃效果，无亚像素平滑
- **AND** 云朵移出画布后 MUST 从另一侧重新进入

#### Scenario: 多种云朵图案

- **GIVEN** 系统初始化云朵
- **WHEN** 创建云朵实例
- **THEN** 系统 MUST 提供至少 3 种不同大小的云朵图案
- **AND** 图案 SHOULD 包括小、中、大三种尺寸
- **AND** 云朵 SHOULD 随机选择图案以增加视觉多样性

---

### Requirement: PixelOcean 组件 - 像素海洋

PixelOcean 组件 MUST 渲染分层的像素化波浪海洋，每层使用不同颜色和速度。

#### Scenario: 渲染分层波浪

- **GIVEN** PixelOcean 组件被调用
- **WHEN** 传入渲染上下文和位置参数
- **THEN** 海洋 MUST 由 3-5 层水平波浪条带组成
- **AND** 每层 MUST 使用纯色（如 #0066CC, #3399FF, #66CCFF）
- **AND** 颜色 MUST 从深蓝渐进到浅蓝（不使用渐变，而是分层）
- **AND** 每层波浪 MUST 填充到海底线

#### Scenario: 像素化波浪动画

- **GIVEN** 海洋波浪层已渲染
- **WHEN** 动画循环更新相位
- **THEN** 波浪 MUST 基于正弦曲线生成
- **AND** 波浪点 MUST 离散化到像素网格（使用 Math.floor）
- **AND** 不同层 MUST 具有不同的波长和速度
- **AND** 波浪 MUST 水平滚动产生动态效果

#### Scenario: 波浪层配置

- **GIVEN** PixelOcean 组件定义波浪层
- **WHEN** 配置波浪参数
- **THEN** 每层 MUST 包含：颜色、Y 位置、振幅、波长、速度
- **AND** 顶层波浪 SHOULD 速度最快，底层最慢
- **AND** 波浪振幅 SHOULD 为 4-8 像素

---

### Requirement: PixelBeach 组件 - 像素沙滩

PixelBeach 组件 MUST 以纯色渲染沙滩区域，无渐变或纹理。

#### Scenario: 渲染纯色沙滩

- **GIVEN** PixelBeach 组件被调用
- **WHEN** 传入位置和颜色配置
- **THEN** 沙滩 MUST 使用单一纯色填充（默认 #F4A460）
- **AND** 沙滩 MUST NOT 显示渐变
- **AND** 沙滩 MUST NOT 显示粒子纹理
- **AND** 沙滩位置 MUST 可配置（beachTop, beachLeft）

#### Scenario: 沙滩位置和尺寸

- **GIVEN** PixelBeach 组件接收位置参数
- **WHEN** 默认配置下渲染
- **THEN** 沙滩顶部 SHOULD 位于画布高度 70% 处
- **AND** 沙滩左侧 SHOULD 位于画布宽度 70% 处
- **AND** 沙滩 MUST 延伸到画布底部和右侧边缘

---

## MODIFIED Requirements

### Requirement: BeachScene 主组件职责

（修改现有 BeachScene 组件的职责定义）

BeachScene 组件 MUST 作为容器组件，协调各像素渲染组件，不直接包含具体渲染逻辑。

#### Scenario: 容器组件职责

- **GIVEN** BeachScene 组件被渲染
- **WHEN** 组件初始化和动画循环
- **THEN** BeachScene MUST 管理 canvas 和动画循环
- **AND** BeachScene MUST 调用各子组件的渲染函数
- **AND** BeachScene MUST 传递共享状态（canvas, ctx, phase, pixelSize）
- **AND** BeachScene MUST NOT 包含具体的绘制逻辑（fillRect, arc 等）

#### Scenario: 简化代码

- **GIVEN** BeachScene 组件重构完成
- **WHEN** 检查代码行数
- **THEN** BeachScene.tsx SHOULD ≤ 150 行
- **AND** 各像素组件文件 SHOULD ≤ 100 行
- **AND** 总代码量 SHOULD 减少或持平，但可维护性提升

---

## REMOVED Requirements

### Requirement: 渐变天空渲染（已移除）

~~天空 MUST 使用垂直渐变从顶部到底部过渡颜色。~~

**移除原因**：像素艺术风格使用纯色，不需要渐变。

---

### Requirement: 椭圆云朵渲染（已移除）

~~云朵 MUST 使用多个椭圆组合绘制，具有透明度渐变。~~

**移除原因**：替换为像素图案渲染。

---

### Requirement: 噪声波浪生成（已移除）

~~海洋波浪 MUST 使用 simplex 噪声生成自然的波浪形状。~~

**移除原因**：替换为简单的离散化正弦波。

---

### Requirement: 沙滩渐变和纹理（已移除）

~~沙滩 MUST 使用渐变填充和 200 个随机粒子纹理。~~

**移除原因**：像素艺术风格使用纯色。

---

### Requirement: 粒子系统（雨/雪）（已移除）

~~组件 MUST 支持雨滴和雪花粒子系统。~~

**移除原因**：简化实现，专注于核心沙滩场景元素。后续可重新实现像素化粒子。

---

### Requirement: 太阳渲染（已移除）

~~组件 MUST 渲染太阳，包含光晕效果。~~

**移除原因**：简化实现，专注于沙滩场景的主要元素。后续可添加像素化太阳。

---

## Notes

- 本规范增量代表完全重构，从真实感渲染转向像素艺术风格
- 采用组件化架构，每个视觉元素独立封装
- 移除了复杂的渐变、噪声生成、粒子系统等
- 代码可维护性和清晰度显著提升
- 后续可基于此架构轻松添加新的像素化元素
