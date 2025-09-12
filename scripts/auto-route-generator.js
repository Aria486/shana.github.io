// auto-route-generator.js
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

function getDirectoryStructure(dirPath) {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const structure = items.map((item) => {
      const fullPath = path.join(dirPath, item.name);
      const stats = fs.statSync(fullPath);
      if (item.isDirectory()) {
        return {
          name: item.name,
          type: "directory",
          children: getDirectoryStructure(path.join(dirPath, item.name)),
        };
      } else {
        return {
          name: item.name,
          type: "file",
          lastModified: stats.mtime.toISOString(),
        };
      }
    });
    return structure;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

function generateRouteStructure() {
  const noteDir = path.resolve("./src/note");
  const outputFile = path.resolve("./src/utils/note-directory-structure.json");
  
  if (!fs.existsSync(noteDir)) {
    console.error("Note directory does not exist:", noteDir);
    return;
  }

  try {
    const directoryStructure = getDirectoryStructure(noteDir);
    fs.writeFileSync(outputFile, JSON.stringify(directoryStructure, null, 2));
    console.log(`✅ Route structure updated: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("Error generating route structure:", error);
  }
}

function startWatcher() {
  const noteDir = path.resolve("./src/note");
  
  if (!fs.existsSync(noteDir)) {
    console.error("Note directory does not exist:", noteDir);
    return;
  }

  console.log("🚀 Starting file watcher for note directory:", noteDir);
  
  try {
    // 监听 note 目录下的所有文件和文件夹变化
    const watcher = chokidar.watch(noteDir, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true, // 忽略初始扫描
  });

  // 防抖处理，避免频繁更新
  let updateTimeout;
  const debounceUpdate = () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      generateRouteStructure();
    }, 500); // 500ms 防抖
  };

  watcher
    .on('add', (filePath) => {
      console.log(`📄 File added: ${path.relative(noteDir, filePath)}`);
      debounceUpdate();
    })
    .on('unlink', (filePath) => {
      console.log(`🗑️  File removed: ${path.relative(noteDir, filePath)}`);
      debounceUpdate();
    })
    .on('addDir', (dirPath) => {
      console.log(`📁 Directory added: ${path.relative(noteDir, dirPath)}`);
      debounceUpdate();
    })
    .on('unlinkDir', (dirPath) => {
      console.log(`🗂️  Directory removed: ${path.relative(noteDir, dirPath)}`);
      debounceUpdate();
    })
    .on('change', (filePath) => {
      console.log(`✏️  File changed: ${path.relative(noteDir, filePath)}`);
      debounceUpdate();
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    });

    // 初始生成一次
    generateRouteStructure();

    return watcher;
  } catch (error) {
    console.error('❌ Failed to start file watcher:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'watch') {
    startWatcher();
  } else if (command === 'generate') {
    generateRouteStructure();
  } else {
    console.log('Usage:');
    console.log('  node auto-route-generator.js generate  # 生成一次路由结构');
    console.log('  node auto-route-generator.js watch     # 监听并自动更新路由结构');
  }
}

module.exports = {
  generateRouteStructure,
  startWatcher,
};