# React 实现标尺组件

## 组件介绍

标尺（Ruler）组件是一个基于 Canvas 的可视化测量工具，支持水平和垂直两个方向，常用于设计工具、图片编辑器等场景。

### 主要功能

- 📏 支持水平（top）和垂直（left）两个方向
- 🔢 可自定义起点、终点、刻度单位
- 🔍 支持缩放比例调整
- 🎨 使用 Canvas 2D API 绘制，性能优良
- 📐 辅助线组件支持拖拽定位

## 组件结构

```
react-ruler/
├── ReactRuler.tsx         # 主标尺组件
├── types.ts               # TypeScript 类型定义
├── style.scss             # 样式文件
├── index.ts               # 导出文件
└── viewparts/
    ├── types.ts           # 辅助线类型定义
    ├── index.ts           # 导出文件
    └── RulerGuide/
        ├── RulerGuide.tsx # 辅助线组件
        └── style.scss     # 辅助线样式
```

## 完整事例

<DesignToolRuler />

## Props API

### ReactRuler Props

| 属性      | 类型              | 默认值 | 说明                              |
| --------- | ----------------- | ------ | --------------------------------- |
| direction | `"top" \| "left"` | -      | 标尺方向，top 为水平，left 为垂直 |
| start     | `number`          | `0`    | 起始刻度值                        |
| end       | `number`          | `1000` | 结束刻度值                        |
| scale     | `number`          | `100`  | 缩放比例（百分比）                |
| height    | `number`          | `24`   | 标尺高度（或宽度，对于垂直标尺）  |
| startLen  | `number`          | `30`   | 起始偏移长度                      |

### RulerGuide Props

| 属性             | 类型                              | 默认值     | 说明             |
| ---------------- | --------------------------------- | ---------- | ---------------- |
| direction        | `"horizontal" \| "vertical"`      | -          | 辅助线方向       |
| id               | `string`                          | -          | 辅助线唯一标识   |
| top              | `number`                          | `0`        | 顶部位置（像素） |
| left             | `number`                          | `0`        | 左侧位置（像素） |
| width            | `number \| string`                | -          | 宽度             |
| height           | `number \| string`                | -          | 高度             |
| guideType        | `"dashed" \| "solid"`             | `"dashed"` | 线条样式         |
| move             | `boolean`                         | `false`    | 是否可拖拽       |
| value            | `number`                          | -          | 显示的数值       |
| cursor           | `string`                          | -          | 鼠标样式         |
| deleteGuide      | `(id: string) => void`            | -          | 删除回调         |
| onGetValue       | `(v: number) => number`           | -          | 获取数值回调     |
| onGuideDragStart | `() => void`                      | -          | 开始拖拽回调     |
| onGuideDragEnd   | `(data: RulerGuideProps) => void` | -          | 结束拖拽回调     |

## 实现原理

### Canvas 绘制标尺

标尺使用 Canvas 2D API 绘制，核心逻辑如下：

```typescript
const drawRuler = (
  direction: "top" | "left",
  canvas: HTMLCanvasElement,
  scale: number,
  width: number,
  height: number,
  startLen: number,
) => {
  const ctx = canvas.getContext("2d")!;
  const percent = scale * 0.01;
  const unit = 10; // 基础单位

  // 计算需要绘制的刻度数量
  const scaleCount =
    percent <= 1
      ? Math.ceil((width + startLen) / percent / 10)
      : Math.ceil(((width + startLen) * percent) / 10);

  // 绘制刻度线
  for (let i = 1; i <= scaleCount; i++) {
    const step = startLen + Math.round(i * unit * percent);

    if (i % 10 === 0) {
      // 大刻度（每10个单位）
      ctx.moveTo(step, 0);
      ctx.lineTo(step, height);
      ctx.fillText(`${unit * i}`, step + 2, height);
    } else {
      // 小刻度
      ctx.moveTo(step, 0);
      ctx.lineTo(step, 4);
    }
  }

  ctx.stroke();
};
```

### 辅助线拖拽实现

辅助线的拖拽使用原生 DOM 事件实现：

```typescript
const handleMousedown = (e: MouseEvent<HTMLDivElement>) => {
  e.preventDefault();
  const startPosition = { x: e.clientX, y: e.clientY };

  document.onmousemove = (event) => {
    const moveDistance =
      direction === "horizontal"
        ? event.clientY - startPosition.y
        : event.clientX - startPosition.x;

    // 更新辅助线位置
    if (direction === "horizontal") {
      guideRef.current.style.top = `${positionDistance}px`;
    } else {
      guideRef.current.style.left = `${positionDistance}px`;
    }
  };

  document.onmouseup = () => {
    // 清理事件监听
    document.onmousemove = null;
    document.onmouseup = null;

    // 触发回调
    onGuideDragEnd?.({ ...props, [boundaryKey]: boundary });
  };
};
```

## 技术要点

### 1. Canvas 性能优化

- ✅ 使用 `useEffect` 依赖项精确控制重绘时机
- ✅ 避免不必要的 Canvas 清空和重绘
- ✅ 合理设置 Canvas 尺寸避免模糊

### 2. 拖拽边界处理

- ✅ 限制辅助线在父容器范围内
- ✅ 鼠标抬起时自动吸附到边界
- ✅ 提供实时位置反馈

### 3. TypeScript 类型安全

- ✅ 完整的 Props 类型定义
- ✅ 事件处理类型约束
- ✅ 组件 Ref 类型正确转发

## 参考资源

- [Canvas API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [React forwardRef - React 文档](https://react.dev/reference/react/forwardRef)
- [拖拽事件处理 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API)
