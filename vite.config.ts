import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import AutoImport from "unplugin-auto-import/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    AutoImport({
      dts: "./src/types/auto-import.d.ts",
      eslintrc: {
        enabled: true,
      },
      imports: [
        // presets
        "react",
        // "antd",
      ],
      // resolvers: [ElementPlusResolver()],
      vueTemplate: true,
      dirs: [
        // "./src/axios/*",
        // "./src/plugins/*",
        // "./src/router/*",
        "./src/store/*",
        "./src/utils/*",
      ],
    }),
    visualizer(),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // 打包大小 < 1400 kb
    chunkSizeWarningLimit: 1400,
  },
}));
