import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repository as a project site:
// https://rajurkudeofficial.github.io/image-quality-analyzer/
export default defineConfig({
  base: "/image-quality-analyzer/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the FastAPI backend during local development.
      "/analyze": "http://localhost:8000",
      "/enhance": "http://localhost:8000",
      "/compare": "http://localhost:8000",
      "/enhanced": "http://localhost:8000",
    },
  },
});
