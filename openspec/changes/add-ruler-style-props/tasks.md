# Tasks: Add Ruler Style Props

**Total Estimate**: ~40 minutes

---

## Phase 1: 类型定义（10 min）

### Task 1.1: 更新 ReactRulerProps 接口

**Estimate**: 5 min

- [ ] 打开 `src/note_code/react-ruler/types.ts`
- [ ] 在 ReactRulerProps 接口中添加两个可选属性：
  ```typescript
  strokeStyle?: string;
  font?: string;
  ```
- [ ] 确保 TypeScript 无错误

**验证**：

- 类型定义正确
- 可选属性（带 `?`）

---

### Task 1.2: 添加 JSDoc 注释

**Estimate**: 5 min

- [ ] 为新属性添加文档注释

  ```typescript
  /**
   * 标尺线条和文字的颜色
   * @default "rgb(161, 174, 179)"
   */
  strokeStyle?: string;

  /**
   * 标尺刻度文字的字体样式
   * @default "10px Arial"
   */
  font?: string;
  ```

**验证**：

- 注释清晰准确
- 包含默认值说明

---

## Phase 2: 组件实现（15 min）

### Task 2.1: 解构 props

**Estimate**: 3 min

- [ ] 在 ReactRuler 组件中解构新属性
  ```typescript
  const {
    direction,
    start = 0,
    end = 1000,
    scale = 100,
    startLen = 30,
    height = 24,
    strokeStyle = "rgb(161, 174, 179)",
    font = "10px Arial",
  } = props;
  ```

**验证**：

- 默认值正确
- 解构语法正确

---

### Task 2.2: 传递参数到 drawRuler

**Estimate**: 5 min

- [ ] 更新 drawRuler 函数签名，添加参数
  ```typescript
  const drawRuler = (
    direction: ReactRulerProps["direction"],
    canvas: HTMLCanvasElement,
    scale = 100,
    width: number,
    height = 24,
    startLen = 60,
    strokeStyle = "rgb(161, 174, 179)",
    font = "10px Arial"
  ) => { ... }
  ```
- [ ] 更新 drawRuler 调用，传入新参数
  ```typescript
  drawRuler(
    direction,
    canvasRef.current,
    scale,
    end - start,
    height,
    startLen,
    strokeStyle,
    font,
  );
  ```

**验证**：

- 参数顺序正确
- TypeScript 无错误

---

### Task 2.3: 替换硬编码值

**Estimate**: 7 min

- [ ] 在 drawRuler 函数中，将所有硬编码的 `ctx.strokeStyle = "rgb(161, 174, 179)"` 替换为 `ctx.strokeStyle = strokeStyle`
- [ ] 将所有硬编码的 `ctx.font = "10px Arial"` 替换为 `ctx.font = font`
- [ ] 检查是否有遗漏的地方（水平和垂直标尺都要修改）

**验证**：

- 无硬编码值残留
- 两个方向的标尺都已更新

---

## Phase 3: 测试验证（15 min）

### Task 3.1: 默认值测试

**Estimate**: 5 min

- [ ] 不传递 strokeStyle 和 font 属性
- [ ] 验证标尺显示正常
- [ ] 验证颜色和字体与之前一致

**验证**：

- 向后兼容性良好
- 默认样式正确

---

### Task 3.2: 自定义值测试

**Estimate**: 5 min

- [ ] 传递自定义 strokeStyle（如 `"red"`）
- [ ] 传递自定义 font（如 `"12px Helvetica"`）
- [ ] 验证标尺使用自定义样式

**验证**：

- 自定义颜色生效
- 自定义字体生效

---

### Task 3.3: 边界情况测试

**Estimate**: 5 min

- [ ] 测试无效的 strokeStyle（如 `"invalid-color"`）
- [ ] 测试空字符串
- [ ] 测试特殊值（如 `"transparent"`, `"1px serif"`）

**验证**：

- 处理异常值
- 无 JavaScript 错误

---

## 总结

### 任务统计

- **总任务数**：9 个子任务
- **总时间**：~40 分钟
- **关键里程碑**：
  - Phase 1：类型定义（10 min）
  - Phase 2：组件实现（15 min）
  - Phase 3：测试验证（15 min）

### 依赖关系

无外部依赖。

### 风险提示

1. **Canvas API 兼容性**：strokeStyle 和 font 是标准 Canvas API，所有浏览器支持
2. **类型安全**：string 类型足够宽松，用户需要传入合法的 CSS 颜色和字体值

### 验收标准

- [ ] ReactRulerProps 包含 strokeStyle 和 font 属性
- [ ] 默认值与当前硬编码值一致
- [ ] 可以通过 props 自定义样式
- [ ] 现有代码无需修改即可工作
- [ ] TypeScript 无错误
