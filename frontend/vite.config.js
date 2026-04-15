import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8080";
const apiPrefixes = [
  "/auth",
  "/orders",
  "/categories",
  "/products",
  "/users",
  "/notifications",
  "/push",
  "/uploads",
  "/health"
];

const proxy = Object.fromEntries(
  apiPrefixes.map((prefix) => [
    prefix,
    {
      target: backendTarget,
      changeOrigin: true
    }
  ])
);

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy
  }
});
