/*
 * @Author: your name
 * @Date: 2021-07-13 18:51:21
 * @LastEditTime: 2021-08-02 19:53:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \宏烨找房后台管理系统\project-admin\vite.config.js
 */
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
const path = require("path");
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [reactRefresh()], // 加载react
  // 服务
  server: {
    port: 3000, // 端口
    host: true, // 开启newwork
    hmr: true, // 热更新
    cors: true,
    open: false, //自动打开浏览器
    proxy: {
      // 跨域
      "/api": {
        target: "http://commons.vaiwan.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/val": {
        target: "http://localhost:8009",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/val/, ""),
      },
    },
  },
  base: "./", // 打包路径
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 设置别名
    },
  },
});
