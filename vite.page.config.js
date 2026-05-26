import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

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
    outDir: resolve(__dirname, "public"),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "storefront-ui/page.tsx"),
      output: {
        entryFileNames: "chat-page.js",
        format: "iife",
        name: "ShopifyChatPage",
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [tailwindcss()],
});
