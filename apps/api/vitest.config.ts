import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/test/__fixtures__/**"],
    coverage: {
      provider: "v8",
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "src/shared/infrastructure/documentation/**",
        "src/shared/infrastructure/routes/asyncapi.routes.ts",
      ],
    },
  },
});
