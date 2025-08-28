import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      // 字符串简写写法
      // '/foo': 'http://localhost:4567',

      // 带选项写法
      "/api": {
        target: "http://127.0.0.1:8835", // 你的后端服务地址
        changeOrigin: true, // 改变源
      },
      "/auth": {
        target: "http://127.0.0.1:8835",
        changeOrigin: true,
      },
      "/demo.wav": {
        target: "http://127.0.0.1:8835", // 您的 Rust 后端地址
        changeOrigin: true,
      },
    },
  },
});
