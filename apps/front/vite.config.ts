import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from "@tailwindcss/vite"
import path from "path";

export default defineConfig({
  plugins: [tanstackRouter({
    target: 'react',
    autoCodeSplitting: true,
    routesDirectory: "./src/app",
    generatedRouteTree: "./src/routeTree.gen.ts",
    routeFileIgnorePrefix: "-",
    quoteStyle: "single"
  }), react(), tailwindcss(), sentryVitePlugin({
    org: "cinema-0n",
    project: "javascript-react"
  })],

  experimental: {
    bundledDev: true
  },

  resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

  build: {
    sourcemap: true
  }
});
