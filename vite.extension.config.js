import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  publicDir: false,
  build: {
    outDir: resolve(__dirname, "extensions/chatbot/assets"),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "extension-src/index.tsx"),
      output: {
        entryFileNames: "bundle.js",
        format: "iife",
        name: "ShopifyChatWidget",
        inlineDynamicImports: true,
      },
    },
  },
});
