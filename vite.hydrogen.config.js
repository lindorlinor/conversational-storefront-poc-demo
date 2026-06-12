import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Bundle per store Hydrogen: a differenza di vite.page.config.js NON include
// React (lo prende dall'host) e produce un modulo ES che esporta il componente
// <ConversationalStorefront>, montato dal merchant nel suo albero React. Così i
// componenti reali del merchant (ProductCard ecc.) hanno il context Hydrogen.
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
      input: resolve(__dirname, "storefront-ui/hydrogen.tsx"),
      // senza questo Vite (build "app", non-lib) tree-shaka gli export dell'entry
      // e ConversationalStorefront sparisce: lo forziamo a mantenere l'export
      preserveEntrySignatures: "strict",
      // con JSX automatico serve externalizzare anche react/jsx-runtime e
      // react-dom/client: la funzione cattura tutti i subpath di react/react-dom
      // così l'host risolve solo un'istanza react
      external: (id) =>
        id === "react" ||
        id === "react-dom" ||
        id.startsWith("react/") ||
        id.startsWith("react-dom/"),
      output: {
        entryFileNames: "chat-page.hydrogen.js",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [tailwindcss()],
});
