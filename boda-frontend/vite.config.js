import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_STORAGE_URL': JSON.stringify(
      process.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    ),
  },
  server: {
    hmr: { overlay: false },
    watch: { usePolling: true, interval: 1000 },
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/storage": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
