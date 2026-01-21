# Spec: 评论系统能力规格

**规格类型**: 功能规格 (Feature Spec)  
**关联变更**: add-comment-system  
**版本**: 1.0.0  
**状态**: Draft

---

## 1. 概述

本规格定义博客文章页面的评论功能,允许读者在文章下方发表评论、回复、点赞等互动操作。评论系统基于 GitHub Discussions 实现,无需额外后端服务。

---

## 2. 用户能力 (User Capabilities)

### 2.1 查看评论

**ID**: `CAP-COMMENT-VIEW-001`  
**优先级**: P0 (必须有)  
**描述**: 用户可以查看文章下方的所有评论

**验收标准**:

- [ ] 评论区位于文章内容底部
- [ ] 评论按时间倒序排列(最新在上)
- [ ] 显示评论作者头像、昵称、发表时间
- [ ] 显示评论内容(支持 Markdown 格式)
- [ ] 显示每条评论的点赞数和回复数
- [ ] 嵌套回复层级最多 3 层
- [ ] 评论区宽度与文章内容宽度一致
- [ ] 移动端评论区可正常滚动查看

**性能要求**:

- 评论区首次可见时间 < 2s
- 懒加载生效时,初始不加载评论脚本

---

### 2.2 发表评论

**ID**: `CAP-COMMENT-POST-002`  
**优先级**: P0 (必须有)  
**描述**: 已登录 GitHub 用户可以发表新评论

**验收标准**:

- [ ] 点击评论框后跳转到 GitHub OAuth 授权(未登录时)
- [ ] 登录后评论框可编辑
- [ ] 支持 Markdown 格式编辑
- [ ] 支持预览功能
- [ ] 发表后评论立即显示在列表中
- [ ] 发表失败时显示友好错误提示

**输入约束**:

- 评论内容长度: 1 - 10000 字符
- 支持的 Markdown 语法: 标题、加粗、斜体、代码块、链接、图片、引用

**错误处理**:

- 网络错误: 显示"网络连接失败,请检查网络后重试"
- 权限错误: 显示"您没有权限发表评论,请确认已授权"
- 内容违规: 显示 GitHub 返回的错误信息

---

### 2.3 回复评论

**ID**: `CAP-COMMENT-REPLY-003`  
**优先级**: P0 (必须有)  
**描述**: 已登录用户可以回复已有评论

**验收标准**:

- [ ] 每条评论下显示"回复"按钮
- [ ] 点击后评论框自动 @ 被回复者
- [ ] 回复内容以嵌套形式显示在原评论下方
- [ ] 支持 @ 多个用户
- [ ] 被 @ 的用户收到 GitHub 通知

---

### 2.4 点赞和反应

**ID**: `CAP-COMMENT-REACT-004`  
**优先级**: P1 (应该有)  
**描述**: 用户可以对评论点赞或添加 emoji 反应

**验收标准**:

- [ ] 每条评论显示点赞按钮
- [ ] 点击后立即更新点赞数
- [ ] 再次点击取消点赞
- [ ] 支持添加 emoji 反应(👍 ❤️ 👀 🎉 🚀 等)
- [ ] 显示每个 emoji 的数量

---

### 2.5 编辑和删除评论

**ID**: `CAP-COMMENT-EDIT-005`  
**优先级**: P1 (应该有)  
**描述**: 用户可以编辑或删除自己的评论

**验收标准**:

- [ ] 用户自己的评论显示"编辑"和"删除"按钮
- [ ] 编辑后显示"已编辑"标记
- [ ] 删除需要二次确认
- [ ] 删除后评论立即从列表移除

---

### 2.6 评论管理

**ID**: `CAP-COMMENT-ADMIN-006`  
**优先级**: P1 (应该有)  
**描述**: 仓库管理员可以管理所有评论

**验收标准**:

- [ ] 管理员可以删除任意评论
- [ ] 管理员可以锁定评论区(禁止新评论)
- [ ] 管理员可以在 GitHub Discussions 页面批量管理
- [ ] 管理员可以将评论标记为垃圾信息

---

## 3. 系统能力 (System Capabilities)

### 3.1 主题同步

**ID**: `CAP-COMMENT-THEME-001`  
**优先级**: P0 (必须有)  
**描述**: 评论区主题自动跟随博客主题切换

**验收标准**:

- [ ] 博客切换到深色主题时,评论区同步切换
- [ ] 博客切换到浅色主题时,评论区同步切换
- [ ] 主题切换过程无闪烁
- [ ] 主题颜色与博客风格协调

**技术实现**:

- 监听博客主题状态(从 RootContext 或 localStorage 读取)
- 动态设置 Giscus `theme` 属性
- 支持的主题值: `light`, `dark`, `preferred_color_scheme`

---

### 3.2 多语言支持

**ID**: `CAP-COMMENT-I18N-002`  
**优先级**: P0 (必须有)  
**描述**: 评论区界面语言跟随博客语言切换

**验收标准**:

- [ ] 博客切换到中文时,评论区显示中文界面
- [ ] 博客切换到英文时,评论区显示英文界面
- [ ] 博客切换到日文时,评论区显示日文界面
- [ ] 语言切换后评论内容不变(仅 UI 文案改变)

**语言映射**:
| 博客语言 | Giscus 语言代码 |
|---------|----------------|
| zh | zh-CN |
| en | en |
| ja | ja |

---

### 3.3 评论标识映射

**ID**: `CAP-COMMENT-MAPPING-003`  
**优先级**: P0 (必须有)  
**描述**: 文章路径与 GitHub Discussion 唯一映射

**验收标准**:

- [ ] 每篇文章的评论独立存储
- [ ] 文章路径变化后评论不丢失(使用 pathname 映射)
- [ ] 同一文章在不同语言版本共享评论
- [ ] 映射关系持久化(存储在 Discussion metadata)

**映射规则**:

```
文章路径: /lang/note/category/article
Giscus term: pathname (相对路径)
Discussion title: 文章标题 (从 markdown frontmatter 提取,可选)
```

---

### 3.4 懒加载

**ID**: `CAP-COMMENT-LAZY-004`  
**优先级**: P1 (应该有)  
**描述**: 评论区采用懒加载,提升页面性能

**验收标准**:

- [ ] 页面首次加载时不加载评论脚本
- [ ] 用户滚动到评论区可见区域时才加载
- [ ] 使用 IntersectionObserver API 实现
- [ ] 加载过程显示骨架屏或 loading 提示
- [ ] 加载失败可重试

**性能指标**:

- 首次内容绘制 (FCP) 不受影响
- 最大内容绘制 (LCP) < 2.5s
- 累积布局偏移 (CLS) < 0.1

---

### 3.5 错误恢复

**ID**: `CAP-COMMENT-ERROR-005`  
**优先级**: P1 (应该有)  
**描述**: 评论加载失败时的降级处理

**验收标准**:

- [ ] 脚本加载失败时显示友好提示
- [ ] 提供"重试"按钮
- [ ] 提供"去 GitHub 查看讨论"链接
- [ ] 错误不影响文章正文阅读
- [ ] 错误信息记录到控制台(便于调试)

**错误类型**:

1. 网络错误: CDN 不可达
2. 权限错误: 仓库未启用 Discussions
3. 配置错误: repo/category 参数错误
4. 限流错误: GitHub API 达到速率限制

---

### 3.6 响应式适配

**ID**: `CAP-COMMENT-RESPONSIVE-006`  
**优先级**: P0 (必须有)  
**描述**: 评论区在不同设备上正确显示

**验收标准**:

- [ ] 桌面端(>1200px): 评论区宽度 800px,居中显示
- [ ] 平板端(768-1200px): 评论区宽度 100%,左右 padding 32px
- [ ] 手机端(<768px): 评论区宽度 100%,左右 padding 16px
- [ ] 触摸设备支持滑动操作
- [ ] 输入框在移动端自动调整大小

---

## 4. 数据规格

### 4.1 评论数据结构

评论数据存储在 GitHub Discussions,结构由 GitHub 定义,本项目通过 Giscus 间接访问:

```typescript
interface Comment {
  id: string; // Discussion ID
  author: {
    login: string; // GitHub 用户名
    avatarUrl: string; // 头像 URL
  };
  body: string; // 评论内容(Markdown)
  createdAt: string; // 创建时间(ISO 8601)
  updatedAt: string; // 更新时间
  reactions: {
    totalCount: number;
    [emoji: string]: number; // 各种 emoji 的数量
  };
  replies: Comment[]; // 回复列表(嵌套)
}
```

### 4.2 配置数据

Giscus 配置参数存储在前端代码中:

```typescript
interface GiscusConfig {
  repo: string; // GitHub 仓库: "owner/repo"
  repoId: string; // 仓库 ID (从 giscus.app 获取)
  category: string; // Discussion 分类名称
  categoryId: string; // 分类 ID (从 giscus.app 获取)
  mapping: "pathname"; // 映射方式: 使用文章路径
  strict: "0" | "1"; // 严格匹配
  reactionsEnabled: "1"; // 启用反应
  emitMetadata: "0" | "1"; // 是否发送元数据
  inputPosition: "top" | "bottom"; // 输入框位置
  theme: string; // 主题名称
  lang: string; // 语言代码
  loading: "lazy" | "eager"; // 加载策略
}
```

---

## 5. 非功能需求

### 5.1 性能

- 评论脚本大小: < 50KB (gzip)
- 首次可交互时间: < 3s
- 评论列表渲染: 100 条评论 < 1s
- 主题切换响应: < 200ms

### 5.2 可访问性

- 键盘导航支持
- 屏幕阅读器兼容
- ARIA 标签完整
- 颜色对比度 >= 4.5:1

### 5.3 安全性

- 评论内容由 GitHub 过滤(防 XSS)
- OAuth 授权流程安全
- 不存储用户敏感信息
- 依赖 GitHub 的反垃圾机制

### 5.4 兼容性

**浏览器支持**:

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

**移动设备**:

- iOS Safari >= 14
- Android Chrome >= 90

---

## 6. 未来扩展

以下能力在本次变更中**不实现**,列为未来迭代:

1. **评论搜索** (`CAP-COMMENT-SEARCH-xxx`)
   - 按关键词搜索评论
   - 按作者筛选评论
   - 按时间范围筛选

2. **评论统计** (`CAP-COMMENT-STATS-xxx`)
   - 显示文章评论总数
   - 显示文章热度排行
   - 显示活跃评论者

3. **通知提醒** (`CAP-COMMENT-NOTIFY-xxx`)
   - 新评论邮件提醒
   - 新回复浏览器通知
   - RSS 订阅评论

4. **评论导出** (`CAP-COMMENT-EXPORT-xxx`)
   - 导出评论为 JSON
   - 导出评论为 Markdown
   - 备份评论到本地

5. **匿名评论** (`CAP-COMMENT-ANON-xxx`)
   - 无需登录发表评论
   - 临时邮箱验证
   - 需要额外后端服务(不符合当前约束)

---

## 7. 验收检查表

完整功能验收需通过以下测试:

### 基础功能

- [ ] 评论区正常显示
- [ ] 发表评论成功
- [ ] 回复评论成功
- [ ] 点赞和反应成功
- [ ] 编辑和删除成功

### 集成功能

- [ ] 主题切换同步
- [ ] 语言切换同步
- [ ] 路径映射正确
- [ ] 懒加载生效

### 异常处理

- [ ] 网络错误提示
- [ ] 权限错误提示
- [ ] 加载失败可重试

### 性能指标

- [ ] Lighthouse 性能评分 >= 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

### 兼容性

- [ ] Chrome/Edge 测试通过
- [ ] Firefox 测试通过
- [ ] Safari 测试通过
- [ ] 移动端测试通过

---

## 8. 参考资料

- [Giscus 官方文档](https://giscus.app/)
- [GitHub Discussions API](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
- [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React 19.1 文档](https://react.dev/)
