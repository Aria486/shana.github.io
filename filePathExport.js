// 已废弃 自动生成文件路由已转至 vite-plugin-auto-route.js
const fs = require("fs");
const path = require("path");

function getDirectoryStructure(dirPath) {
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
}

const directoryStructure = getDirectoryStructure("./src/note"); // 你要读取的目录
fs.writeFileSync(
  "./src/utils/note-directory-structure.json",
  JSON.stringify(directoryStructure, null, 2),
);
