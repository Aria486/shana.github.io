# Design: Note Subcategory Filter

## Architecture Overview

此功能在现有的 NoteList 组件基础上增加子分类过滤能力，通过利用已有的目录结构数据，提供一种轻量级的过滤机制。

## Component Design

### 组件层次结构

```
NoteList (修改)
├── CategoryFilter (新增 - 内联或独立子组件)
│   ├── Tag (全部)
│   └── Tag[] (子分类标签)
├── List (现有)
└── Pagination (现有)
```

### 状态管理

在 NoteList 组件中新增状态：

```typescript
const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
  null,
);
```

- `null` 表示选中"全部"
- 字符串值表示选中的子分类名称

### 数据流

```
note-directory-structure.json
        ↓
extractSubcategories(menu)
        ↓
subcategories: string[]
        ↓
CategoryFilter 渲染
        ↓
用户点击 Tag
        ↓
setSelectedSubcategory
        ↓
filteredData 重新计算
        ↓
List 更新显示
```

## Data Processing

### 子分类提取逻辑

从 `note-directory-structure.json` 中提取子分类：

```typescript
interface DirectoryNode {
  name: string;
  type: "directory" | "file";
  children?: DirectoryNode[];
}

function extractSubcategories(categoryName: string): string[] {
  // 1. 从 note-directory-structure.json 找到对应大分类
  // 2. 获取其 children 中 type === 'directory' 的项
  // 3. 返回这些子目录的 name 列表
  // 4. 按字母序排序
}
```

### 过滤逻辑增强

修改现有的 `filteredAndSortedData` 计算：

```typescript
const filteredAndSortedData = useMemo(() => {
  let result = [...rawData];

  // 1. 全局搜索过滤 (现有)
  if (globalSearchKeyword.trim()) {
    // ... 现有逻辑
  }

  // 2. 子分类过滤 (新增)
  if (selectedSubcategory) {
    result = result.filter((item) => {
      const pathParts = item.path.split("/");
      // 笔记路径格式: category/subcategory/filename.md
      // 或: category/filename.md
      return pathParts[1] && pathParts[1] === selectedSubcategory;
    });
  }

  // 3. 排序 (现有)
  result.sort((a, b) => {
    // ... 现有逻辑
  });

  return result;
}, [rawData, globalSearchKeyword, selectedSubcategory, sortType]);
```

## UI/UX Design

### 布局设计

```
┌─────────────────────────────────────────┐
│  [全部] [css] [javascript] [react] ...  │ ← CategoryFilter
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  笔记列表项                      │   │
│  │  笔记列表项                      │   │ ← List (可滚动)
│  │  ...                            │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  分页器                                 │ ← Pagination (固定底部)
└─────────────────────────────────────────┘
```

### 标签样式

使用 Ant Design Tag.CheckableTag 组件：

- **未选中状态**: 默认样式
- **选中状态**: 主题色背景
- **鼠标悬停**: 轻微高亮
- **间距**: 8px 水平间距，4px 垂直间距
- **响应式**: 自动换行

### 交互行为

1. **默认状态**: "全部" 标签选中，显示所有笔记
2. **选择子分类**:
   - 点击子分类标签
   - "全部" 取消选中
   - 列表过滤显示
   - 分页重置到第1页
3. **取消选择**:
   - 再次点击已选中的标签
   - 或点击"全部"标签
   - 回到默认状态
4. **切换大分类**:
   - 重置为"全部"状态
   - 重新提取子分类列表

## Performance Considerations

### 优化策略

1. **数据缓存**
   - 使用 `useMemo` 缓存子分类列表
   - 仅在 menu 变化时重新提取

2. **过滤性能**
   - 路径匹配使用简单的字符串分割和比较
   - 避免正则表达式

3. **渲染优化**
   - Tag 列表使用 key 优化
   - 避免不必要的重渲染

### 边界处理

1. **无子分类情况**
   - 不显示 CategoryFilter
   - 或仅显示"全部"标签（可选）

2. **单个子分类**
   - 仍然显示过滤栏
   - 保持功能一致性

3. **大量子分类**
   - 当前方案支持自动换行
   - 未来可考虑分页或搜索功能

## Integration Points

### 与现有功能的协同

1. **全局搜索**
   - 优先级高于子分类过滤
   - 先搜索后过滤
   - 搜索结果中也应用子分类过滤

2. **排序功能**
   - 在过滤后的数据上排序
   - 不影响过滤逻辑

3. **分页功能**
   - 基于过滤后的数据分页
   - 切换子分类时重置页码

4. **路由导航**
   - 切换大分类时重置过滤状态
   - 不在 URL 中保存子分类状态（简化实现）

### 状态重置时机

```typescript
useEffect(() => {
  setCurrentPage(1);
  setSelectedSubcategory(null); // 新增
}, [menu, globalSearchKeyword, sortType]);
```

## Testing Strategy

### 单元测试

1. **子分类提取函数**
   - 测试正常情况
   - 测试无子分类情况
   - 测试空数据情况

2. **过滤逻辑**
   - 测试选中"全部"
   - 测试选中具体子分类
   - 测试与搜索的组合

### 集成测试

1. **UI 交互**
   - 点击标签切换
   - 验证列表更新
   - 验证分页重置

2. **边界场景**
   - 无子分类时的显示
   - 大量子分类的渲染
   - 快速切换大分类

## Future Enhancements

1. **URL 状态持久化**
   - 在 URL 中保存选中的子分类
   - 支持直接链接分享

2. **子分类搜索**
   - 当子分类过多时提供搜索框

3. **多级分类支持**
   - 支持 3 级及以上的目录结构
   - 使用级联菜单或树形结构

4. **笔记数量统计**
   - 在标签上显示徽章
   - 显示每个子分类的笔记数量

5. **自定义排序**
   - 支持子分类的自定义排序
   - 持久化用户偏好

## Dependencies

- **无新增外部依赖**
- 使用现有的 Ant Design Tag 组件
- 利用现有的 note-directory-structure.json 数据

## Risk Mitigation

1. **性能风险**
   - 监控大量子分类时的渲染性能
   - 必要时引入虚拟滚动或分页

2. **兼容性风险**
   - 确保与所有现有过滤功能兼容
   - 充分测试边界情况

3. **用户体验风险**
   - 避免标签栏占用过多空间
   - 提供清晰的视觉反馈
