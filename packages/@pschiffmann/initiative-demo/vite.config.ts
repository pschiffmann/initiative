import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.ftl"],
  plugins: [react()],
  server: {
    hmr: false,
  },
  build: {
    // Set to `false` to check whether imports from `@initiativejs/schema` (e.g.
    // `NodeSchema`) are emitted into the bundle.
    minify: false,
  },
});
