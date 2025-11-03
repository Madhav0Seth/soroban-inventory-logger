import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@stellar/freighter-api"],
  },
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom"))
              return "react";
            if (id.includes("@stellar/freighter-api")) return "wallet";
            if (id.includes("@stellar/stellar-sdk") || id.includes("stellar"))
              return "stellar";
            return "vendor";
          }
        },
      },
    },
  },
});
