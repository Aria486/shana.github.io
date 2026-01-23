# Design: Centralize Markdown Overrides Configuration

## Context

Post 组件当前使用 markdown-to-jsx 库渲染 Markdown 内容，并通过 overrides 选项注入自定义组件。随着自定义组件数量增加（当前已有 8+ 个），Post.tsx 的导入语句和配置代码变得冗长，降低了代码的可读性和可维护性。

## Goals

1. **简化 Post 组件**：减少导入语句，让组件更专注于笔记渲染逻辑
2. **集中管理配置**：统一管理所有 Markdown 自定义组件映射
3. **便于扩展**：新增自定义组件时只需修改配置文件
4. **保持灵活性**：支持动态参数（如 isDark 主题）

## Non-Goals

- 不改变现有的 Markdown 渲染行为
- 不创建额外的抽象层（如 MarkdownRenderer 组件）
- 不增加运行时开销

## Design Decisions

### 决策 1：配置文件位置

**选择**：`src/utils/markdownConfig.ts` (或 `.tsx` 如需 JSX)

**理由**：

- `src/utils/` 已经存在，用于存放工具函数和配置
- 配置本质是工具性质的，不是业务组件
- 与 `constants.ts`、`helper.ts` 等文件同级，便于查找

**替代方案**：

- `src/config/markdown.ts`：需要新建目录，项目当前没有 config 目录
- `src/components/Post/markdownConfig.ts`：耦合到 Post 组件，不利于复用

### 决策 2：API 设计

**选择**：导出函数 `getMarkdownOverrides(isDark: boolean)`

**理由**：

- 支持动态参数（主题切换）
- 返回纯对象，符合 markdown-to-jsx API
- 函数形式便于未来扩展（如支持更多参数）

**类型定义**：

```typescript
import React from "react";

export interface MarkdownOverrides {
  [key: string]: {
    component: React.ComponentType<any>;
  };
}

export const getMarkdownOverrides = (isDark: boolean): MarkdownOverrides => {
  // ...
};
```

**替代方案**：

- 导出对象常量：无法支持动态参数
- 导出类：过度设计，配置不需要实例化

### 决策 3：组件分类

将 overrides 分为三类：

1. **内置处理器**（code, pre）：处理标准 Markdown 语法

   ```typescript
   code: {
     component: ({ className, children, ...props }) => {
       // 处理代码块和行内代码的逻辑
     };
   }
   ```

2. **增强处理器**（Code）：处理自定义标签

   ```typescript
   Code: {
     component: ({ language, children, ...props }) => {
       // 处理 <Code> 标签
     };
   }
   ```

3. **自定义组件映射**：直接映射到组件
   ```typescript
   Loading: { component: Loading },
   PdfViewer: { component: PdfViewer },
   ReactRuler: { component: ReactRuler },
   // ...
   ```

### 决策 4：依赖管理

**选择**：配置文件集中导入所有依赖组件

**导入清单**：

```typescript
// 基础组件
import React from "react";

// 自定义组件
import { Code, Loading, PdfViewer } from "@/components";

// 笔记代码演示组件
import {
  ReactRuler,
  ScalableRuler,
  RulerGuideDemo,
  DesignToolRuler,
} from "@/note_code/react-ruler";
```

**理由**：

- Post.tsx 只需导入配置函数，不需要知道具体有哪些组件
- 所有组件依赖在一个文件中管理
- 便于追踪哪些组件被 Markdown 使用

### 决策 5：文件扩展名

**选择**：`.tsx` 或 `.ts`

**分析**：

- 配置对象中包含 JSX（code/pre 处理器的返回值）
- 需要 TypeScript 支持
- 建议使用 `.tsx` 以支持 JSX 语法

## Architecture

### 当前架构（重构前）

```
Post.tsx
├── import Markdown from "markdown-to-jsx"
├── import { Code, Loading, PdfViewer } from "@/components"
├── import { ReactRuler, ... } from "@/note_code/react-ruler"
└── <Markdown options={{ overrides: { ... } }} />
```

### 目标架构（重构后）

```
markdownConfig.tsx
├── import { Code, Loading, PdfViewer } from "@/components"
├── import { ReactRuler, ... } from "@/note_code/react-ruler"
└── export getMarkdownOverrides(isDark)

Post.tsx
├── import Markdown from "markdown-to-jsx"
├── import { getMarkdownOverrides } from "@/utils/markdownConfig"
└── <Markdown options={{ overrides: getMarkdownOverrides(isDark) }} />
```

### 数据流

```
User opens note
    ↓
Post component renders
    ↓
Get theme state (isDark)
    ↓
Call getMarkdownOverrides(isDark)
    ↓
Returns overrides config object
    ↓
Markdown component uses overrides
    ↓
Custom components rendered in content
```

## Implementation Details

### 文件结构

```
src/
├── utils/
│   ├── markdownConfig.tsx  # 新增
│   ├── constants.ts
│   └── helper.ts
└── components/
    └── Post/
        └── Post.tsx        # 简化导入
```

### 配置文件模板

```typescript
/**
 * Markdown rendering configuration
 *
 * Provides custom component overrides for markdown-to-jsx library.
 * Used by Post component to render custom components in Markdown content.
 */
import React from "react";
import { Code, Loading, PdfViewer } from "@/components";
import {
  ReactRuler,
  ScalableRuler,
  RulerGuideDemo,
  DesignToolRuler
} from "@/note_code/react-ruler";

export interface MarkdownOverrides {
  [key: string]: {
    component: React.ComponentType<any>;
  };
}

/**
 * Get Markdown overrides configuration
 *
 * @param isDark - Whether dark theme is enabled
 * @returns Markdown overrides object for markdown-to-jsx
 */
export const getMarkdownOverrides = (isDark: boolean): MarkdownOverrides => {
  return {
    // Standard code block handler
    code: {
      component: ({ className, children, ...props }) => {
        if (className && className.startsWith('lang-')) {
          const language = className.replace('lang-', '');
          return (
            <Code language={language} isDark={isDark} {...props}>
              {children}
            </Code>
          );
        }
        return <code className={className} {...props}>{children}</code>;
      }
    },

    // Pre element handler
    pre: {
      component: ({ children, ...props }) => {
        if (React.isValidElement(children) && children.type === Code) {
          return children;
        }
        return <pre {...props}>{children}</pre>;
      }
    },

    // Custom Code tag handler
    Code: {
      component: ({ language, children, ...props }) => {
        const codeContent = React.isValidElement(children)
          ? (children.props as any).children
          : Array.isArray(children)
            ? children.join('')
            : String(children || '');

        return (
          <Code language={language} isDark={isDark} {...props}>
            {codeContent}
          </Code>
        );
      }
    },

    // Custom component mappings
    Loading: { component: Loading },
    PdfViewer: { component: PdfViewer },
    ReactRuler: { component: ReactRuler },
    ScalableRuler: { component: ScalableRuler },
    RulerGuideDemo: { component: RulerGuideDemo },
    DesignToolRuler: { component: DesignToolRuler }
  };
};
```

### Post.tsx 变更

**Before**:

```typescript
import { Code, Loading, PdfViewer, GiscusComments } from "@/components";
import { ReactRuler, ScalableRuler, RulerGuideDemo, DesignToolRuler } from "@/note_code/react-ruler";

// ... in render
<Markdown
  options={{
    overrides: {
      code: { component: ({ ... }) => { ... } },
      pre: { component: ({ ... }) => { ... } },
      Code: { component: ({ ... }) => { ... } },
      Loading: { component: Loading },
      PdfViewer: { component: PdfViewer },
      ReactRuler: { component: ReactRuler },
      ScalableRuler: { component: ScalableRuler },
      RulerGuideDemo: { component: RulerGuideDemo },
      DesignToolRuler: { component: DesignToolRuler }
    }
  }}
>
```

**After**:

```typescript
import { GiscusComments } from "@/components";
import { getMarkdownOverrides } from "@/utils/markdownConfig";

// ... in render
<Markdown options={{ overrides: getMarkdownOverrides(isDark) }}>
```

## Trade-offs

### 优点 ✅

- **代码更清晰**：Post.tsx 减少 ~50 行代码和 7 个导入
- **维护性强**：新增组件只需修改一个文件
- **职责分离**：配置逻辑与渲染逻辑分离
- **可复用**：如果未来有其他组件需要渲染 Markdown，可以复用配置

### 缺点 ❌

- **多一层间接**：需要跳转到配置文件查看具体组件映射
- **文件增加**：新增一个配置文件

### 权衡分析

利大于弊。多一层间接性是合理的抽象，而文件增加带来的是更好的组织性。

## Testing Strategy

### 单元测试

- Post.test.tsx 现有测试应该全部通过
- 不需要为配置文件单独写测试（配置本身很简单）

### 手动测试

需验证的场景：

1. 代码块高亮（\`\`\`language）
2. 行内代码（\`code\`）
3. 自定义 Code 组件（`<Code language="js">`）
4. Loading 组件
5. PdfViewer 组件
6. ReactRuler 系列组件
7. 主题切换（明暗主题下的代码高亮）

## Migration Path

### Step 1: 创建配置文件

- 创建 `src/utils/markdownConfig.tsx`
- 复制现有逻辑，保持完全一致

### Step 2: 更新 Post.tsx

- 删除自定义组件导入
- 导入 `getMarkdownOverrides`
- 替换 overrides 配置

### Step 3: 测试验证

- 运行测试套件
- 手动测试所有功能
- 确认无回归

### Step 4: 清理

- 检查是否有未使用的导入
- 运行 lint 检查
- 提交代码

## Future Enhancements

（暂不实施，记录为潜在改进方向）

1. **插件化机制**：允许外部注册自定义组件

   ```typescript
   export const registerMarkdownComponent = (
     name: string,
     component: React.ComponentType,
   ) => {
     // ...
   };
   ```

2. **配置合并**：支持多个配置源

   ```typescript
   export const mergeOverrides = (
     ...configs: MarkdownOverrides[]
   ): MarkdownOverrides => {
     // ...
   };
   ```

3. **性能优化**：缓存 overrides 对象
   ```typescript
   const overridesCache = new Map<boolean, MarkdownOverrides>();
   ```

## References

- [markdown-to-jsx Documentation](https://github.com/probablyup/markdown-to-jsx)
- [React Component Composition Patterns](https://react.dev/learn/composition-vs-inheritance)
- [TypeScript Module Patterns](https://www.typescriptlang.org/docs/handbook/modules.html)

## Decision Log

| Date       | Decision                               | Reason                                  |
| ---------- | -------------------------------------- | --------------------------------------- |
| 2026-01-23 | Use `src/utils/markdownConfig.tsx`     | Aligns with existing project structure  |
| 2026-01-23 | Export function `getMarkdownOverrides` | Supports dynamic parameters             |
| 2026-01-23 | Keep configuration simple              | Avoid over-engineering, YAGNI principle |
