import { DirectoryNode } from "@/interface";

export const getRandomRgbColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};

// 三次贝塞尔曲线
export const cubicBezier = (
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
): number => {
  const u = 1 - t;
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  );
};

export const quadraticBezier = (
  t: number,
  p0: number,
  p1: number,
  p2: number,
): number => {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
};

export const linearInterpolation = (
  t: number,
  p0: number,
  p1: number,
): number => {
  return p0 + t * (p1 - p0);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * 去除文件后缀名
 * @param filename 文件名
 * @returns 去除后缀的文件名
 */
export const removeFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return filename;
  }
  return filename.substring(0, lastDotIndex);
};

/**
 * 从笔记目录结构中提取子分类
 * @param categoryName 大分类名称
 * @param directoryData 目录结构数据
 * @returns 子分类名称数组（按字母序排序）
 */
export const extractSubcategories = (
  categoryName: string,
  directoryData: DirectoryNode[],
): string[] => {
  // 查找对应的大分类
  const category = directoryData.find((item) => item.name === categoryName);

  // 如果找不到分类或没有子目录，返回空数组
  if (!category || !category.children) {
    return [];
  }

  // 提取所有子目录的名称
  const subcategories = category.children
    .filter((child) => child.type === "directory")
    .map((child) => child.name);

  // 按字母序排序
  return subcategories.sort((a, b) => a.localeCompare(b, "zh-CN"));
};
