import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { plugin as markdown, Mode, PluginOptions } from "vite-plugin-markdown";

export default defineConfig({
  plugins: [
    react(),
    markdown(),
    svgr({
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
  ],
  resolve: {
    alias: { "@": "/src" },
  },
  server: { port: 5173 },
  base: "/shana.github.io/",
  build: {
    outDir: "dist",
  },
  assetsInclude: ["**/*.md"],
});
