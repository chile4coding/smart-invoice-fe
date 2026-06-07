import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom")) return "react-dom";
            if (id.includes("react-router")) return "react-router";
            if (id.includes("react")) return "react";
            return "vendor"; // everything else in node_modules
          }
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