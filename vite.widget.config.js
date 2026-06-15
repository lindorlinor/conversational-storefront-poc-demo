import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Bundle unico del widget: modulo ES che esporta <ConversationalStorefront>,
// React preso dall'host (esm.sh nel caso iframe/Liquid, context Hydrogen nello
// store headless) così esiste una sola istanza di React. Montato dall'host con
// createRoot. Sostituisce i vecchi vite.page.config.js e vite.hydrogen.config.js.
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
        entryFileNames: "conversational-storefront.js",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [tailwindcss()],
});
