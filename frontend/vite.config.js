import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the FastAPI backend during development so the
      // frontend can simply call fetch("/analyze") etc. without CORS pain.
      "/analyze": "http://localhost:8000",
      "/enhance": "http://localhost:8000",
      "/compare": "http://localhost:8000",
      "/enhanced": "http://localhost:8000",
    },
  },
});
