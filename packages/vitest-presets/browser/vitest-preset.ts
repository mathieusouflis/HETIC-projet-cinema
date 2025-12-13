import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/test/__fixtures__/**",
    ],
  },
});
