import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "**/node_modules/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.mock.ts",
      ],
    },
  },
});
