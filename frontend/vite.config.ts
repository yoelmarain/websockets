import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: Number(loadEnv(mode, process.cwd(), "").VITE_PORT || 5173),
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:3000" },
      "/socket.io": { target: "http://localhost:3000", ws: true },
    },
  },
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts" },
}));
