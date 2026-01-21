export const mdModules = import.meta.glob("/src/note/**/*.md", {
  as: "raw",
});

export const pdfModules = import.meta.glob("/src/assets/**/*.pdf", {
  as: "url",
});

export const NOTE_MENU = [
  "program",
  "study_note",
  "history",
  "game",
  "novel",
  "religion",
];

// export const ROOT_PATH = "/shana.github.io";
export const ROOT_PATH = "";

// Giscus 评论系统配置
export const GISCUS_CONFIG = {
  repo: "Aria486/shana.github.io" as const,
  repoId: "R_kgDONfF3dA", // 从 https://giscus.app/ 获取
  category: "Comments",
  categoryId: "DIC_kwDONfF3dM4ClPwn", // 从 https://giscus.app/ 获取
  mapping: "pathname" as const,
  strict: "0" as const,
  reactionsEnabled: "1" as const,
  emitMetadata: "0" as const,
  inputPosition: "bottom" as const,
  loading: "lazy" as const,
};
