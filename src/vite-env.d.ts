/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 在这里添加更多环境变量类型...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob(pattern: string, options?: { eager?: boolean }): Record<string, any>;
}

// src/types/markdown.d.ts
declare module "*.md" {
  const attributes: Record<string, any>;
  const html: string;
  const raw: string;
  export { attributes, html, raw };
}
