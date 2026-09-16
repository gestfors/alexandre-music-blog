import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Isolate vendor chunks by scope.
          if (id.includes("node_modules")) {
            if (id.includes("supabase")) return "vendor-supabase";
            if (id.includes("react")) return "vendor-react";
          }

          // Isolate admin pages and related utilities (heavy, rarely accessed).
          if (id.includes("src/pages/Admin")) return "admin";
          if (id.includes("src/components/RichTextEditor")) return "rich-text-editor";

          // Isolate large service pages for lazy loading.
          if (id.includes("src/pages/Servicos")) return "services";

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1024,
  },
});
