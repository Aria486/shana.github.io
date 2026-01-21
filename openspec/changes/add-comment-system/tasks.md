# Tasks: 添加评论系统

## 阶段 0: 准备工作

### Task 0.1: GitHub 仓库配置

**负责**: 开发者手动操作  
**依赖**: 无  
**验证**: GitHub Discussions 页面可访问

**步骤**:

1. 访问 GitHub 仓库 Settings → General → Features
2. 启用 "Discussions" 功能
3. 创建 Discussions 分类 "Comments" (用于存储文章评论)
4. 访问 https://giscus.app/
5. 安装 Giscus 应用到仓库
6. 授权 Giscus 访问 Discussions
7. 生成配置参数(repo ID, category ID 等)
8. 将配置参数记录到文档

**产出**:

- Discussions 功能已启用
- Giscus 配置参数文档

---

## 阶段 1: 核心组件开发

### Task 1.1: 安装依赖 ✅

**依赖**: Task 0.1  
**验证**: package.json 包含新依赖

```bash
npm install @giscus/react
```

**产出**:

- `package.json` 更新
- `package-lock.json` 更新

---

### Task 1.2: 创建 GiscusComments 组件 ✅

**依赖**: Task 1.1  
**验证**: 组件可导入无错误

**文件**: `src/components/GiscusComments/GiscusComments.tsx`

**接口设计**:

```typescript
export interface IGiscusComments extends ICommonComponent {
  /** 文章路径,用于生成唯一标识 */
  articlePath: string;
  /** 主题模式: 'light' | 'dark' */
  theme?: "light" | "dark";
  /** 语言代码: 'zh-CN' | 'en' | 'ja' */
  lang?: string;
  /** 是否启用懒加载 */
  lazy?: boolean;
}
```

**核心功能**:

1. 使用 `@giscus/react` 的 `Giscus` 组件
2. 根据 `articlePath` 生成 `term` (映射到 Discussions)
3. 动态切换主题(`theme` prop)
4. 动态切换语言(`lang` prop)
5. 懒加载支持(使用 IntersectionObserver)

**产出**:

- `GiscusComments.tsx`
- `index.ts` (导出)

---

### Task 1.3: 添加样式文件 ✅

**依赖**: Task 1.2  
**验证**: 样式正确应用

**文件**: `src/components/GiscusComments/style.scss`

**样式需求**:

1. 容器样式(padding, margin)
2. 响应式断点适配
3. 与博客主题风格统一
4. 深色主题变量支持
5. 加载状态样式
6. 错误提示样式

**产出**:

- `style.scss`

---

### Task 1.4: 添加组件测试 ✅

**依赖**: Task 1.2  
**验证**: 测试全部通过

**文件**: `src/components/GiscusComments/GiscusComments.test.tsx`

**测试用例**:

1. ✅ 组件正常渲染
2. ✅ 接收正确的 props
3. ✅ 主题切换时更新配置
4. ✅ 语言切换时更新配置
5. ✅ 懒加载模式下不立即加载
6. ✅ articlePath 正确映射为 term

**产出**:

- `GiscusComments.test.tsx`

---

### Task 1.5: 更新组件导出 ✅

**依赖**: Task 1.2  
**验证**: 可从 `@/components` 导入

**文件**: `src/components/index.ts`

```typescript
export { GiscusComments } from "./GiscusComments";
export type { IGiscusComments } from "./GiscusComments";
```

**产出**:

- 更新 `index.ts`

---

## 阶段 2: 集成到文章页面

### Task 2.1: 修改 Post 组件 ✅

**依赖**: Task 1.5  
**验证**: 评论区在文章底部显示

**文件**: `src/components/Post/Post.tsx`

**修改内容**:

1. 导入 `GiscusComments` 组件
2. 在 Markdown 渲染后添加评论区
3. 传递必要的 props:
   - `articlePath={notePath}`
   - `theme={isDark ? 'dark' : 'light'}`
   - `lang={currentLang}` (从路由或 context 获取)
   - `lazy={true}`

**代码位置**:

```tsx
{!isLoading && postContent && (
  <>
    <Markdown {...}>{postContent}</Markdown>
    <GiscusComments
      articlePath={notePath}
      theme={isDark ? 'dark' : 'light'}
      lang={currentLang}
      lazy={true}
    />
  </>
)}
```

**产出**:

- 更新 `Post.tsx`

---

### Task 2.2: 添加语言参数传递 ✅

**依赖**: Task 2.1  
**验证**: 切换语言时评论区跟随切换

**文件**: `src/components/Post/Post.tsx`

**实现方式**:

1. 从 `useParams()` 获取 `lang`
2. 映射博客语言代码到 Giscus 语言代码:
   - `zh` → `zh-CN`
   - `en` → `en`
   - `ja` → `ja`

**产出**:

- 更新 `Post.tsx` 语言逻辑

---

### Task 2.3: 更新 Post 样式 ✅

**依赖**: Task 2.1  
**验证**: 评论区样式协调

**文件**: `src/components/Post/style.scss`

**样式调整**:

1. 评论区上方分隔线
2. 评论区 margin/padding
3. 响应式适配

**产出**:

- 更新 `style.scss`

---

## 阶段 3: 配置和优化

### Task 3.1: 添加环境变量配置 ✅

**依赖**: Task 0.1  
**验证**: 配置参数不硬编码

**文件**: `src/utils/constants.ts`

**配置项**:

```typescript
export const GISCUS_CONFIG = {
  repo: "Aria486/shana.github.io",
  repoId: "xxx", // 从 giscus.app 获取
  category: "Comments",
  categoryId: "xxx", // 从 giscus.app 获取
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "bottom",
  loading: "lazy",
};
```

**产出**:

- 更新 `constants.ts`

---

### Task 3.2: 添加错误边界 ✅

**依赖**: Task 2.1  
**验证**: 评论加载失败不影响文章阅读

**实现方式**:
在 `GiscusComments` 组件中添加 try-catch 和降级 UI:

```tsx
{
  error && (
    <div className="giscus-error">
      <p>评论加载失败,请刷新页面重试</p>
    </div>
  );
}
```

**产出**:

- 更新 `GiscusComments.tsx` 错误处理

---

### Task 3.3: 性能优化 - 懒加载 ✅

**依赖**: Task 2.1  
**验证**: 评论区仅在可见时加载

**实现方式**:
使用 IntersectionObserver API:

```typescript
const [isVisible, setIsVisible] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!lazy) {
    setIsVisible(true);
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setIsVisible(true);
      observer.disconnect();
    }
  });

  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, [lazy]);
```

**产出**:

- 更新 `GiscusComments.tsx` 懒加载逻辑

---

## 阶段 4: 测试和文档

### Task 4.1: 端到端测试

**依赖**: Task 2.3  
**验证**: 所有功能正常

**测试清单**:

- [ ] 评论区在文章页面正确显示
- [ ] 切换明暗主题,评论区同步切换
- [ ] 切换语言,评论区界面跟随切换
- [ ] 发表评论,内容正确保存到 Discussions
- [ ] 回复评论,嵌套层级正确
- [ ] 点赞和 emoji 反应正常
- [ ] 移动端显示正常,无布局问题
- [ ] 懒加载生效,首次不加载脚本
- [ ] 错误处理正常,有友好提示

**产出**:

- 测试报告

---

### Task 4.2: 更新用户文档

**依赖**: Task 4.1  
**验证**: README 包含评论功能说明

**文件**: `README.md`

**文档内容**:

1. 评论功能介绍
2. 如何发表评论(需要 GitHub 账号)
3. 评论数据存储位置(GitHub Discussions)
4. 如何管理评论(作为仓库管理员)

**产出**:

- 更新 `README.md`

---

### Task 4.3: 添加开发者文档

**依赖**: Task 4.1  
**验证**: 文档完整清晰

**文件**: `docs/COMMENT_SYSTEM.md` (新建)

**文档内容**:

1. Giscus 配置说明
2. 组件使用指南
3. 自定义样式方法
4. 故障排查指南
5. 未来扩展方向

**产出**:

- 新建 `docs/COMMENT_SYSTEM.md`

---

## 阶段 5: 部署和验证

### Task 5.1: 构建生产版本

**依赖**: Task 4.1  
**验证**: 构建无错误

```bash
npm run build
npm run preview
```

**检查项**:

- 无 TypeScript 错误
- 无 ESLint 警告
- 无构建警告
- bundle 大小合理

**产出**:

- 构建产物

---

### Task 5.2: 部署到 GitHub Pages

**依赖**: Task 5.1  
**验证**: 线上评论功能正常

**步骤**:

1. 提交代码到 main 分支
2. 触发 GitHub Actions 部署
3. 访问线上地址验证功能

**产出**:

- 部署到生产环境

---

### Task 5.3: 监控和调优

**依赖**: Task 5.2  
**验证**: 性能指标正常

**监控项**:

- Lighthouse 性能评分
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- 评论加载时间

**产出**:

- 性能报告
- 优化建议

---

## 总结

**总任务数**: 18 个  
**可并行任务**:

- Task 1.2, 1.3, 1.4 可并行(组件开发、样式、测试)

**关键路径**:
Task 0.1 → Task 1.1 → Task 1.2 → Task 1.5 → Task 2.1 → Task 4.1 → Task 5.2

**预估工时**: 7-11 小时
