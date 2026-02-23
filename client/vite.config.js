import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the Express server during development
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  // ─── Vitest Configuration ──────────────────────────────────
  // Runs client-side unit tests via `npm test` in the client workspace
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.js"],
    include: ["src/__tests__/**/*.test.{js,jsx}"],
  },
});
