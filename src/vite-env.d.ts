/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 在这里添加更多环境变量类型...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob(pattern: string, options?: { eager?: boolean }): Record<string, any>;
}
