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
        "src/shared/infrastructure/websocket/**",
        "src/shared/errors/websocket/**",
        "src/shared/infrastructure/base/controllers/web-socket-controller.ts",
        "src/shared/infrastructure/base/controllers/**",
        "src/shared/infrastructure/base/modules/**",
        "src/shared/infrastructure/repositories/base-composite-repository.ts",
        "src/shared/infrastructure/repositories/base-drizzle-repository.ts",
        "src/server.ts",
        "src/config/database.ts",
        "src/modules/index.ts",
      ],
    },
  },
});
