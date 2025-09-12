import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { plugin as markdown } from "vite-plugin-markdown";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const autoRoutePlugin = require("./scripts/vite-plugin-auto-route.js");

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
    autoRoutePlugin({
      enabled: true,
      watchInDev: true,
      generateOnBuild: true,
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
