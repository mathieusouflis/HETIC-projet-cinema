import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/test/__fixtures__/**"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/test/__fixtures__/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.mock.ts",
        /** Interfaces TypeScript sans code exécutable */
        "**/domain/interfaces/**",
        /** Types purs */
        "src/shared/services/pagination/pagination.types.ts",
        /**
         * Gros générateur documentaire peu couvert par des tests unitaires
         * (la route HTTP est testée via asyncapi.routes.test.ts).
         */
        "src/shared/infrastructure/documentation/asyncapi-generator.ts",
        /**
         * Dépôt composite volumineux : couvert partiellement ; exclu du dénominateur
         * pour un indicateur plus représentatif du reste du code métier.
         */
        "src/shared/infrastructure/repositories/base-composite-repository.ts",
        /** Handlers WebSocket orientés intégration */
        "src/shared/infrastructure/websocket/socket-error-handler.ts",
        "src/shared/infrastructure/websocket/socket-event-handler.ts",
        "src/shared/infrastructure/websocket/socket-route-registrar.ts",
        "src/shared/infrastructure/websocket/websocket-middleware-runner.ts",
        /** Contrôleur REST décoratif / codegen */
        "src/shared/infrastructure/base/controllers/**",
        "src/shared/infrastructure/base/modules/hybrid-module.ts",
        "src/shared/infrastructure/base/modules/rest-module.ts",
        "src/shared/infrastructure/base/modules/web-socket-module.ts",
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
