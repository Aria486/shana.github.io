# Design: Refactor Ruler Component

## 架构概览

将 `react-ruler` 组件从外部项目代码风格重构为当前项目规范，保持在 `src/node_code/` 目录（笔记相关代码位置）。

```
重构前：src/node_code/react-ruler/
├── TwReactRuler.tsx         (主组件)
├── type.ts                   (类型定义)
├── style.less                (Less 样式)
├── index.ts                  (导出)
└── viewparts/
    ├── tw-ruler-guide/
    │   ├── TwRulerGuide.tsx
    │   └── style.less
    ├── type.ts
    └── index.ts

重构后：src/node_code/react-ruler/
├── ReactRuler.tsx           (主组件，移除 Tw 前缀)
├── types.ts                  (统一命名为 types.ts)
├── style.scss                (转换为 SCSS)
├── index.ts                  (更新导出)
├── ReactRuler.test.tsx      (可选：测试文件)
└── viewparts/
    ├── RulerGuide/          (重命名目录)
    │   ├── RulerGuide.tsx   (移除 Tw 前缀)
    │   ├── types.ts          (类型定义)
    │   ├── style.scss        (转换为 SCSS)
    │   └── index.ts          (导出)
    ├── types.ts              (保留，如有需要)
    └── index.ts              (更新导出)
```

## 组件功能说明

### ReactRuler（主组件）

**功能**：在 Canvas 上绘制动态标尺，支持水平和垂直两个方向。

**关键特性**：

- 使用 Canvas 2D API 绘制刻度线和数字标注
- 支持缩放（scale）调整标尺密度
- 自定义起点、终点、高度等参数
- 方向支持：`top`（水平）和 `left`（垂直）

**Props 接口**（保持不变，仅重命名）：

```typescript
export interface ReactRulerProps {
  direction?: "top" | "left";
  start?: number;
  end?: number;
  unit?: number;
  scale?: number;
  height?: number;
  startLen?: number;
}
```

### RulerGuide（子组件）

**功能**：辅助线组件，可拖拽的参考线，用于标注位置。

**关键特性**：

- 支持水平和垂直方向
- 可拖拽调整位置
- 实时显示数值
- 支持删除和边界约束

**Props 接口**（保持不变，仅重命名）：

```typescript
export interface RulerGuideProps {
  direction?: "horizontal" | "vertical";
  top?: number;
  left?: number;
  height?: number;
  width?: number;
  id?: string;
  guideType?: "solid" | "dashed";
  cursor?: string;
  value?: number;
  move?: boolean;
  deleteGuide?: (id: string) => void;
  onGetValue?: (value: number) => void;
  onGuideDragStart?: () => void;
  onGuideDragEnd?: (data: RulerGuideProps) => void;
}
```

## Less 到 SCSS 转换规则

### 1. 变量语法

**Less**:

```less
@prefix-cls: ~"tw-react-ruler";
@demo-cls: ~"@{prefix-cls}-demo";
```

**SCSS**:

```scss
$prefix-cls: "react-ruler";
$demo-cls: "#{$prefix-cls}-demo";
```

### 2. 类名选择器

**Less**:

```less
.tw-react-ruler {
  .@{demo-cls} {
    background: red;
  }

  &-horizontal {
    position: absolute !important;
  }
}
```

**SCSS**:

```scss
.react-ruler {
  .#{$demo-cls} {
    background: red;
  }

  &-horizontal {
    position: absolute !important;
  }
}
```

### 3. 导入路径

**Less**:

```less
@import "../../style/config";
```

**SCSS**:

```scss
@import "@/assets/styles/globals.scss";
```

### 4. 类名前缀更新

所有 CSS 类名从 `tw-react-ruler` 改为 `ruler`，从 `tw-ruler-guide` 改为 `ruler-guide`。

## 命名映射表

| 原名称              | 新名称            | 文件路径                                                        |
| ------------------- | ----------------- | --------------------------------------------------------------- |
| `TwReactRuler`      | `ReactRuler`      | `src/node_code/react-ruler/ReactRuler.tsx`                      |
| `TwReactRulerProps` | `ReactRulerProps` | `src/node_code/react-ruler/types.ts`                            |
| `TwRulerGuide`      | `RulerGuide`      | `src/node_code/react-ruler/viewparts/RulerGuide/RulerGuide.tsx` |
| `TwRulerGuideProps` | `RulerGuideProps` | `src/node_code/react-ruler/viewparts/RulerGuide/types.ts`       |
| `.tw-react-ruler`   | `.react-ruler`    | CSS 类名                                                        |
| `.tw-ruler-guide`   | `.ruler-guide`    | CSS 类名                                                        |
| `type.ts`           | `types.ts`        | 文件命名统一                                                    |
| `tw-ruler-guide/`   | `RulerGuide/`     | 子组件目录                                                      |

## 代码风格调整

### 1. 引号规范

项目优先使用**双引号**：

```typescript
// ❌ 原代码
import { TwReactRulerProps } from "./type";

// ✅ 调整后
import { ReactRulerProps } from "./types";
```

### 2. 类型导入

使用 `type` 关键字导入类型：

```typescript
// ✅ 推荐
import type { ReactRulerProps } from "./types";
import type { ReactNode } from "react";
```

### 3. 文件命名

- 类型文件：`types.ts`（复数形式，项目约定）
- 组件文件：`ReactRuler.tsx`（PascalCase）
- 样式文件：`style.scss`（小写）

### 4. 导出方式

```typescript
// src/node_code/react-ruler/index.ts
export * from "./ReactRuler";
export * from "./types";
export * from "./viewparts";
```

```typescript
// src/node_code/react-ruler/viewparts/index.ts
export * from "./RulerGuide";
export * from "./types";
```

## CSS 类名重构策略

### 主组件类名

| 原类名                       | 新类名                    | 用途     |
| ---------------------------- | ------------------------- | -------- |
| `.tw-react-ruler`            | `.react-ruler`            | 根容器   |
| `.tw-react-ruler-horizontal` | `.react-ruler-horizontal` | 水平标尺 |
| `.tw-react-ruler-vertical`   | `.react-ruler-vertical`   | 垂直标尺 |
| `.tw-react-ruler-viewer`     | `.react-ruler-viewer`     | 查看区域 |
| `.tw-react-ruler-viewport`   | `.react-ruler-viewport`   | 视口     |

### 辅助线组件类名

| 原类名                       | 新类名                    | 用途       |
| ---------------------------- | ------------------------- | ---------- |
| `.tw-ruler-guide`            | `.ruler-guide`            | 根容器     |
| `.tw-ruler-guide-horizontal` | `.ruler-guide-horizontal` | 水平辅助线 |
| `.tw-ruler-guide-vertical`   | `.ruler-guide-vertical`   | 垂直辅助线 |
| `.tw-ruler-guide-value`      | `.ruler-guide-value`      | 数值显示   |
| `.tw-ruler-guide-delete`     | `.ruler-guide-delete`     | 删除按钮   |

## 技术细节

### Canvas 绘制逻辑（保持不变）

Canvas 绘制代码逻辑无需修改，仅更新：

- 函数签名中的类型引用
- 注释中的说明文字

### 拖拽逻辑（保持不变）

RulerGuide 的拖拽功能使用原生 DOM 事件，逻辑保持不变，仅更新：

- Props 类型引用
- CSS 类名引用（通过 `classNames` 库）

### 响应式处理

检查是否需要集成项目的响应式断点：

```scss
@import "@/assets/styles/breakpoints";

.ruler {
  @include mobile {
    // 移动端适配（如果需要）
  }
}
```

## 测试策略（可选）

如果添加测试，应包括：

1. **ReactRuler 测试**
   - Canvas 元素正确渲染
   - Props 正确传递
   - 方向切换正常

2. **RulerGuide 测试**
   - 拖拽事件正确触发
   - 边界约束有效
   - 回调函数正确执行

## 兼容性检查

- ✅ TypeScript 类型检查通过
- ✅ SCSS 编译无错误
- ✅ 无 Less 依赖残留
- ✅ 导入路径正确解析
- ✅ CSS 类名无冲突

## 性能考虑

- Canvas 绘制性能保持不变
- CSS 样式复杂度未增加
- 无新增运行时依赖
- 保持原有的优化策略（如按需重绘）

## 重构后验证清单

- [ ] TypeScript 编译 `npm run build` 无错误
- [ ] ESLint 检查 `npm run lint` 通过
- [ ] 开发服务器 `npm run dev` 正常启动
- [ ] 样式显示与原组件一致
- [ ] 可从 `import { ReactRuler } from "@/node_code/react-ruler"` 正常导入
- [ ] 无 Less 文件残留
- [ ] 所有 `Tw` 前缀已移除
