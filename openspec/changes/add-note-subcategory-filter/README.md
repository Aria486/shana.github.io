# Change: Add Note Subcategory Filter

> **Status**: 📝 Draft  
> **Created**: 2026-01-23  
> **Change ID**: `add-note-subcategory-filter`

## Quick Summary

为笔记列表添加基于子分类的过滤功能，允许用户通过点击标签快速筛选特定子分类的笔记。

## What's Changing

- 在 NoteList 组件上方添加子分类标签栏（使用 Ant Design Tag 组件）
- 从笔记目录结构自动提取子分类（二级目录）
- 实现子分类过滤逻辑，与现有搜索、排序、分页功能兼容
- 添加相关工具函数和单元测试

## User Impact

**优点**:

- 快速定位特定技术领域或主题的笔记
- 直观的标签式交互，无需额外学习
- 自动适配现有目录结构，无需手动配置

**变化**:

- NoteList 上方会显示一行标签（仅当存在子分类时）
- 默认显示所有笔记，点击标签后过滤显示

## Documents

- [📄 Proposal](proposal.md) - 详细的提案说明
- [🏗️ Design](design.md) - 架构和技术设计
- [✅ Tasks](tasks.md) - 实施任务清单
- [📋 Spec](specs/note-subcategory-filter/spec.md) - 功能规范

## Implementation Checklist

- [ ] 创建子分类提取工具函数
- [ ] 添加工具函数单元测试
- [ ] 在 NoteList 中添加子分类过滤状态
- [ ] 实现子分类过滤逻辑
- [ ] 创建 CategoryFilter 标签栏
- [ ] 添加样式（SCSS）
- [ ] 更新 NoteList 组件测试
- [ ] 添加国际化支持
- [ ] 手动测试和验证
- [ ] 代码审查和优化
- [ ] 更新文档（可选）

## Next Steps

1. **Review**: 审核提案和设计文档
2. **Approve**: 确认需求和技术方案
3. **Implement**: 按照 [tasks.md](tasks.md) 执行实施
4. **Test**: 运行自动化测试和手动测试
5. **Deploy**: 部署到生产环境

## Related Changes

无

## References

- [NoteList 组件](../../src/components/NoteList/NoteList.tsx)
- [笔记目录结构数据](../../src/utils/note-directory-structure.json)
- [Ant Design Tag 组件文档](https://ant.design/components/tag-cn)
