import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.ftl"],
  plugins: [react()],
  build: {
    // Set to `false` to check whether imports from `@initiative.dev/schema`
    // (e.g. `NodeSchema`) are omitted from the bundle.
    minify: true,
  },
});
