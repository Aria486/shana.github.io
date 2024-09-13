import dayjs from "dayjs";
import noteDirectoryStructure from "utils/note-directory-structure.json";
import { getRandomRgbColor } from "utils/helper";

interface FileSystemNode {
  name: string;
  type: "directory" | "file";
  children?: FileSystemNode[];
  lastModified?: string; // ISO date string for last modified time
}

interface FileEntry {
  name: string;
  lastModified: string;
  path: string; // Full path of the file
  bgColor?: string;
}

interface DirectoryEntry {
  [key: string]: FileEntry[];
}

const groupByFirstLevelDirectory = (data: FileSystemNode[]): DirectoryEntry => {
  const result: DirectoryEntry = {};

  const traverse = (nodes: FileSystemNode[], currentPath = ""): void => {
    for (const node of nodes) {
      const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;

      if (node.type === "directory") {
        // Initialize the directory entry in the result if it's at the first level
        if (currentPath === "") {
          if (!result[node.name]) {
            result[node.name] = [];
          }
        }
        // Recurse into the directory
        traverse(node.children || [], fullPath);
      } else if (node.type === "file") {
        // Format the lastModified date using dayjs
        const formattedDate = node.lastModified
          ? dayjs(node.lastModified).format("YYYY年MM月DD日 HH:mm:ss")
          : "";

        // Store file details under the appropriate first level directory
        const parentDir = currentPath.split("/")[0]; // Use the first level directory name

        if (currentPath === "") {
          // If the path is empty, it means this is a file at the first level
          result[node.name] = [
            {
              name: node.name,
              lastModified: formattedDate,
              path: fullPath,
              bgColor: getRandomRgbColor(),
            },
          ];
        } else {
          if (result[parentDir]) {
            result[parentDir].push({
              name: node.name,
              lastModified: formattedDate,
              path: fullPath,
              bgColor: getRandomRgbColor(),
            });
          }
        }
      }
    }
  };

  traverse(data);
  return result;
};

export const allPaths = groupByFirstLevelDirectory(
  // eslint-disable-next-line prettier/prettier
  noteDirectoryStructure as any
);
