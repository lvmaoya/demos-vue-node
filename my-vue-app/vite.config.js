// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import removeConsole from "vite-plugin-remove-console";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    vue(),
    removeConsole(),
    visualizer({
      open: true,
      filename: "stats.html",
      template: "flamegraph",
    }),
  ],
  server: {
    port: 8080,
    proxy: {
      // 代理所有以 /api 开头的请求
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        defaults: true,
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 开启代码分割
    // rollupOptions: {
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes("node_modules")) {
    //         return (
    //           id.toString().split("node_modules/")[1].split("/")[0].toString()
    //         );
    //       }
    //     },
    //   },
    // },
    // rollupOptions: {
    //   experimentalLogSideEffects: true,
    //   output: {
    //     experimentalMinChunkSize: 20 * 1024,
    //     manualChunks: (id) => {
    //       if (id.includes("html2canvas")) {
    //         return "html2canvas";
    //       }
    //       if (id.includes("jspdf")) {
    //         return "jspdf";
    //       }
    //       if (id.includes("xlsx")) {
    //         return "xlsx";
    //       }
    //     },
    //   },
    // },
  },
});
