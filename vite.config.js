import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://185.200.244.215:4445",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: "http://185.200.244.215:4445",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
