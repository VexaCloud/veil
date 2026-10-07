import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { veilWsPlugin } from "./scripts/veil-ws-plugin.mjs";

// Veil runs on 0.0.0.0:8080 (`npm start`). The WebSocket / leaked-path layer in
// scripts/veil-ws-plugin.mjs hooks the Vite HTTP server, so `npm start` is the
// supported way to run Veil.
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [veilWsPlugin(), tailwindcss(), tanstackStart(), viteReact()],
});
