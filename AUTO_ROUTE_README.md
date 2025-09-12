# 自动路由更新功能

## 概述

这个功能可以自动监听 `src/note` 目录下的文件变化，并自动更新路由结构文件 `src/utils/note-directory-structure.json`，无需手动执行 `filePathExport.js`。

## 功能特性

- ✅ **自动监听**: 监听 `src/note` 目录下所有文件和文件夹的变化
- ✅ **实时更新**: 文件创建、修改、删除时自动更新路由结构
- ✅ **防抖处理**: 避免频繁更新，500ms 防抖延迟
- ✅ **开发集成**: 在开发模式下自动启动监听
- ✅ **构建集成**: 在生产构建时自动生成最新路由结构
- ✅ **错误处理**: 完善的错误处理和日志输出

## 使用方法

### 1. 开发模式（推荐）

```bash
npm run dev
```

在开发模式下，Vite 会自动启动文件监听器。当你在 `src/note` 目录下：

- 创建新文件或文件夹
- 修改现有文件
- 删除文件或文件夹

系统会自动更新路由结构，你会在控制台看到类似的输出：

```
🚀 Starting file watcher for note directory...
📄 File added: tool/new-article.md
✅ Route structure updated: 2025/9/12 10:05:30
```

### 2. 手动生成路由

如果只想生成一次路由结构：

```bash
npm run generate-routes
```

### 3. 独立监听模式

如果你想在不启动开发服务器的情况下监听文件变化：

```bash
npm run watch-routes
```

### 4. 生产构建

```bash
npm run build
```

构建时会自动生成最新的路由结构。

## 文件结构

```
├── scripts/
│   ├── auto-route-generator.js    # 核心路由生成逻辑
│   └── vite-plugin-auto-route.js  # Vite 插件集成
├── src/
│   ├── note/                      # 监听的目录
│   └── utils/
│       └── note-directory-structure.json  # 生成的路由文件
└── filePathExport.js              # 原始脚本（已废弃）
```

## 配置选项

你可以在 `vite.config.ts` 中配置插件选项：

```typescript
autoRoutePlugin({
  enabled: true, // 是否启用插件
  watchInDev: true, // 开发模式下是否监听
  generateOnBuild: true, // 构建时是否生成
});
```

## 监听的文件操作

- **文件添加**: 新建 `.md` 文件或其他文件
- **文件删除**: 删除现有文件
- **文件修改**: 修改文件内容（会更新 lastModified 时间）
- **目录添加**: 创建新文件夹
- **目录删除**: 删除文件夹

## 日志说明

- 📄 `File added`: 文件被添加
- 🗑️ `File removed`: 文件被删除
- ✏️ `File changed`: 文件被修改
- 📁 `Directory added`: 目录被添加
- 🗂️ `Directory removed`: 目录被删除
- ✅ `Route structure updated`: 路由结构已更新

## 注意事项

1. **防抖延迟**: 系统使用 500ms 的防抖延迟，避免频繁操作时的多次更新
2. **隐藏文件**: 自动忽略以 `.` 开头的隐藏文件
3. **错误处理**: 如果目录不存在或权限不足，会在控制台显示错误信息
4. **性能优化**: 只监听 `src/note` 目录，不会影响其他文件的性能

## 迁移指南

### 从手动更新迁移

如果你之前使用手动执行 `filePathExport.js` 的方式：

1. **无需删除** `filePathExport.js`，它仍然可以作为备用方案
2. **直接使用** 新的自动更新功能，无需额外配置
3. **验证功能** 在 `src/note` 目录下创建一个测试文件，确认路由自动更新

### 回退方案

如果需要回退到手动模式：

1. 在 `vite.config.ts` 中禁用插件：

   ```typescript
   autoRoutePlugin({ enabled: false });
   ```

2. 继续使用原来的手动方式：
   ```bash
   node filePathExport.js
   ```

## 故障排除

### 监听器没有启动

检查控制台是否有错误信息，确认：

- `src/note` 目录存在
- 有足够的文件系统权限
- `chokidar` 依赖已正确安装

### 路由没有更新

1. 检查文件是否在 `src/note` 目录下
2. 确认不是隐藏文件（以 `.` 开头）
3. 等待 500ms 防抖延迟
4. 查看控制台日志确认文件变化被检测到

### 构建时路由过期

确保在 `vite.config.ts` 中启用了 `generateOnBuild: true` 选项。

## 技术实现

- **文件监听**: 使用 `chokidar` 库进行高效的文件系统监听
- **Vite 集成**: 通过自定义 Vite 插件无缝集成到开发和构建流程
- **防抖处理**: 使用 `setTimeout` 实现防抖，避免频繁更新
- **错误处理**: 完善的 try-catch 和错误日志

这个功能大大提升了开发效率，专注于内容创作，而不用担心路由更新的问题！
