# Centralize Markdown Overrides - README

## 📋 Change Overview

**Change ID**: `centralize-markdown-overrides`  
**Status**: 🟡 Proposed  
**Type**: Refactoring  
**Impact**: Low (Code organization improvement)

## 🎯 Objective

将 Post 组件中 Markdown 的 overrides 配置集中管理到独立的配置文件，提高代码的可维护性和可读性。

## 📦 Deliverables

- ✅ `proposal.md` - 变更提案
- ✅ `design.md` - 架构设计文档
- ✅ `tasks.md` - 任务分解清单
- ✅ `specs/markdown-configuration/spec.md` - 规范增量

## 🔑 Key Changes

1. **新增文件**: `src/utils/markdownConfig.tsx` - 集中管理 Markdown overrides 配置
2. **简化文件**: `src/components/Post/Post.tsx` - 移除自定义组件导入，使用配置函数

## 📊 Metrics

- **导入语句减少**: 7 个 → 1 个
- **代码行数减少**: ~50 行
- **配置复杂度**: 内联对象 → 函数调用

## 🚀 Quick Start

1. 阅读 [proposal.md](proposal.md) 了解变更动机和方案
2. 查看 [design.md](design.md) 了解架构设计决策
3. 参考 [tasks.md](tasks.md) 执行实施步骤
4. 遵循 [specs/markdown-configuration/spec.md](specs/markdown-configuration/spec.md) 中的规范

## 📁 Files Structure

```
centralize-markdown-overrides/
├── README.md                               # 本文件
├── proposal.md                             # 变更提案
├── design.md                               # 架构设计
├── tasks.md                                # 任务清单
└── specs/
    └── markdown-configuration/
        └── spec.md                         # 规范增量
```

## 🔗 Related Changes

- None (独立变更)

## 👥 Stakeholders

- **Reviewer**: TBD
- **Approver**: TBD
- **Implementer**: TBD

## 📅 Timeline

- **Proposed**: 2026-01-23
- **Target Completion**: TBD

## ⚠️ Risks

- **风险等级**: 低
- **主要风险**: 无明显风险
- **缓解措施**: 保持现有逻辑不变，仅重构代码组织

## ✅ Success Criteria

- [ ] Post.tsx 中移除所有自定义组件的直接导入
- [ ] 创建 markdownConfig.tsx 配置文件
- [ ] 所有现有测试通过
- [ ] 无 TypeScript 类型错误
- [ ] 无 ESLint 错误
- [ ] 手动测试验证所有功能正常

## 📝 Notes

- 这是一个纯重构变更，不改变任何用户可见行为
- 配置文件保持简单，避免过度设计
- 未来可以基于此配置扩展插件化机制（如需要）
