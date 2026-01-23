# Proposal: Centralize Markdown Overrides Configuration

## Change ID

`centralize-markdown-overrides`

## Status

✅ **Implemented** - 2026-01-23

## Summary

将 Post 组件中 Markdown 的 overrides 配置集中管理到一个独立的配置文件中，避免在 Post.tsx 中导入过多自定义组件，提高代码的可维护性和可读性。

## Motivation

### 当前问题

1. **导入语句过长**：Post.tsx 需要导入多个自定义组件用于 Markdown overrides

   ```tsx
   import { Code, Loading, PdfViewer, GiscusComments } from "@/components";
   import {
     ReactRuler,
     ScalableRuler,
     RulerGuideDemo,
     DesignToolRuler,
   } from "@/note_code/react-ruler";
   ```

2. **维护成本高**：每次添加新的自定义 Markdown 组件都需要：
   - 在 Post.tsx 中添加导入语句
   - 在 Markdown overrides 中添加组件映射
   - 修改多个地方，容易遗漏或出错

3. **职责不清晰**：Post 组件既负责笔记内容渲染，又要管理 Markdown 配置细节

### 解决方案价值

- 简化 Post.tsx 的导入和配置
- 统一管理所有 Markdown 自定义组件
- 便于扩展和维护
- 提高代码可读性和组织性

## Proposal

### 方案设计

创建 `src/utils/markdownConfig.ts` 或 `src/config/markdown.ts` 文件，集中管理 Markdown overrides 配置：

```typescript
// src/utils/markdownConfig.ts
import { Code, Loading, PdfViewer } from "@/components";
import { ReactRuler, ScalableRuler, RulerGuideDemo, DesignToolRuler } from "@/note_code/react-ruler";

export const getMarkdownOverrides = (isDark: boolean) => ({
  code: {
    component: ({ className, children, ...props }) => {
      if (className && className.startsWith('lang-')) {
        const language = className.replace('lang-', '');
        return <Code language={language} isDark={isDark} {...props}>{children}</Code>;
      }
      return <code className={className} {...props}>{children}</code>;
    }
  },
  pre: {
    component: ({ children, ...props }) => {
      if (React.isValidElement(children) && children.type === Code) {
        return children;
      }
      return <pre {...props}>{children}</pre>;
    }
  },
  Code: {
    component: ({ language, children, ...props }) => {
      const codeContent = React.isValidElement(children)
        ? (children.props as any).children
        : Array.isArray(children) ? children.join('') : String(children || '');
      return <Code language={language} isDark={isDark} {...props}>{codeContent}</Code>;
    }
  },
  Loading: { component: Loading },
  PdfViewer: { component: PdfViewer },
  ReactRuler: { component: ReactRuler },
  ScalableRuler: { component: ScalableRuler },
  RulerGuideDemo: { component: RulerGuideDemo },
  DesignToolRuler: { component: DesignToolRuler }
});
```

### 使用方式

在 Post.tsx 中简化为：

```tsx
import { getMarkdownOverrides } from "@/utils/markdownConfig";

// 在组件中使用
<Markdown options={{ overrides: getMarkdownOverrides(isDark) }}>
  {postContent}
</Markdown>;
```

## Impact Analysis

### 变更范围

- **新增文件**：`src/utils/markdownConfig.ts` (或 `src/config/markdown.ts`)
- **修改文件**：`src/components/Post/Post.tsx`

### 兼容性影响

- ✅ 无破坏性变更
- ✅ 不影响现有功能
- ✅ 不影响用户体验

### 风险评估

- **风险等级**：低
- **潜在风险**：无明显风险
- **缓解措施**：保持原有逻辑不变，仅重构代码组织

## Alternatives Considered

### 方案 A：保持现状

- **优点**：无需改动
- **缺点**：随着自定义组件增加，代码会越来越臃肿

### 方案 B：将配置放在 components 目录

- **优点**：与组件相关的配置放在一起
- **缺点**：配置文件不是组件，放在 components 目录语义不清晰
- **结论**：不采纳，配置应该放在 utils 或 config 目录

### 方案 C：创建 MarkdownRenderer 组件

- **优点**：完全封装 Markdown 渲染逻辑
- **缺点**：过度封装，Post 组件的复杂度不高，不需要额外的抽象层
- **结论**：暂不采纳，可作为未来优化方向

## Open Questions

1. **配置文件位置**：`src/utils/markdownConfig.ts` vs `src/config/markdown.ts`
   - 建议：使用 `src/utils/markdownConfig.ts`，因为项目已有 utils 目录，且配置较小
2. **是否需要支持动态扩展**：未来是否需要允许外部注册自定义组件？
   - 建议：当前不需要，保持简单

## Success Criteria

- ✅ Post.tsx 中移除所有自定义组件的直接导入
- ✅ Post.tsx 只需导入 `getMarkdownOverrides` 函数
- ✅ 所有现有功能正常工作（Markdown 渲染、代码高亮、PDF 预览等）
- ✅ 通过现有的 Post 组件测试
- ✅ 代码审查通过

## References

- [Post.tsx 当前实现](file:///Users/r_wang/Documents/study/shana.github.io/src/components/Post/Post.tsx)
- [markdown-to-jsx 文档](https://github.com/probablyup/markdown-to-jsx)

## Approval

- [ ] Reviewed by: **\_**
- [ ] Approved by: **\_**
- [ ] Implementation started: **\_**
