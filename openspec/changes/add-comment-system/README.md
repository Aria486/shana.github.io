# 评论系统 OpenSpec 提案总结

## 📋 变更概述

**变更 ID**: `add-comment-system`  
**类型**: Feature (新功能)  
**状态**: Draft (待审批)

为静态博客添加基于 GitHub Discussions 的评论系统,允许读者发表评论、回复、点赞等互动操作,无需额外后端服务。

---

## 📁 文档结构

```
openspec/changes/add-comment-system/
├── proposal.md              # 提案文档(动机、方案对比、架构设计)
├── tasks.md                 # 任务分解(18个任务,5个阶段)
└── specs/
    └── comment-capabilities.md  # 能力规格(14个能力,6个领域)
```

---

## 🎯 核心目标

1. **用户互动**: 读者可在文章下发表评论、回复、点赞
2. **零运维**: 基于 GitHub Discussions,无需数据库和后端
3. **无缝集成**: 主题/语言自动同步,懒加载优化性能
4. **移动友好**: 响应式设计,全设备支持

---

## 🔧 技术方案

**选择**: Giscus (GitHub Discussions)  
**依赖**: `@giscus/react`  
**集成点**: `src/components/Post/Post.tsx`

**关键组件**:

- `GiscusComments.tsx`: 评论组件(主题/语言/懒加载)
- 配置文件: `src/utils/constants.ts` (存储 repo/category ID)

---

## ✅ 关键能力

### 用户能力 (6个)

- `CAP-COMMENT-VIEW-001`: 查看评论
- `CAP-COMMENT-POST-002`: 发表评论
- `CAP-COMMENT-REPLY-003`: 回复评论
- `CAP-COMMENT-REACT-004`: 点赞和反应
- `CAP-COMMENT-EDIT-005`: 编辑/删除评论
- `CAP-COMMENT-ADMIN-006`: 评论管理(仅管理员)

### 系统能力 (6个)

- `CAP-COMMENT-THEME-001`: 主题同步
- `CAP-COMMENT-I18N-002`: 多语言支持
- `CAP-COMMENT-MAPPING-003`: 路径映射
- `CAP-COMMENT-LAZY-004`: 懒加载
- `CAP-COMMENT-ERROR-005`: 错误恢复
- `CAP-COMMENT-RESPONSIVE-006`: 响应式适配

---

## 📊 实施计划

**总任务数**: 18 个  
**预估工时**: 7-11 小时

### 阶段划分

| 阶段        | 任务数 | 关键产出                    |
| ----------- | ------ | --------------------------- |
| 0. 准备工作 | 1      | 启用 Discussions,获取配置   |
| 1. 核心组件 | 5      | GiscusComments 组件 + 测试  |
| 2. 集成文章 | 3      | 修改 Post.tsx,添加评论区    |
| 3. 配置优化 | 3      | 环境变量、错误处理、懒加载  |
| 4. 测试文档 | 3      | E2E测试、用户文档、开发文档 |
| 5. 部署验证 | 3      | 构建、部署、性能监控        |

**关键路径**:  
`Task 0.1 → 1.1 → 1.2 → 1.5 → 2.1 → 4.1 → 5.2`

---

## ⚠️ 风险与缓解

| 风险            | 严重性 | 缓解措施                              |
| --------------- | ------ | ------------------------------------- |
| GitHub API 限流 | 中     | 缓存策略,降级提示                     |
| 垃圾评论        | 中     | 依赖 GitHub 反垃圾机制,管理员手动管理 |
| 主题切换闪烁    | 低     | 使用 CSS 变量,同步更新                |
| 移动端布局问题  | 低     | 响应式测试,媒体查询                   |

---

## 🚀 下一步行动

### 立即行动

1. **审批提案**: 团队评审 proposal.md
2. **启用 Discussions**: 在 GitHub 仓库设置中开启
3. **获取配置**: 访问 https://giscus.app/ 生成参数

### 开发流程

1. 执行 Task 0.1-1.1: 安装依赖
2. 执行 Task 1.2-1.5: 开发组件
3. 执行 Task 2.1-2.3: 集成到文章页
4. 执行 Task 3.1-3.3: 优化配置
5. 执行 Task 4.1-4.3: 测试和文档
6. 执行 Task 5.1-5.3: 部署验证

---

## 📖 参考文档

- **提案**: [openspec/changes/add-comment-system/proposal.md](./proposal.md)
- **任务**: [openspec/changes/add-comment-system/tasks.md](./tasks.md)
- **规格**: [openspec/changes/add-comment-system/specs/comment-capabilities.md](./specs/comment-capabilities.md)

---

## 📞 联系方式

**提案负责人**: GitHub Copilot  
**创建日期**: 2025  
**预计完成**: 审批后 2-3 个开发日

---

**状态**: ✅ 提案文档已完成,等待审批
