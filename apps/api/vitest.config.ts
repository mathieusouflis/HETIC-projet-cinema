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
        /** Interfaces sans implémentation exécutable */
        "**/domain/interfaces/**",
        /** Types purs */
        "src/shared/services/pagination/pagination.types.ts",
        /** Générateur documentaire (route HTTP couverte ailleurs) */
        "src/shared/infrastructure/documentation/asyncapi-generator.ts",
        /** Dépôt composite volumineux, peu adapté au dénominateur unitaire */
        "src/shared/infrastructure/repositories/base-composite-repository.ts",
        /** Handlers WebSocket orientés intégration */
        "src/shared/infrastructure/websocket/socket-error-handler.ts",
        "src/shared/infrastructure/websocket/socket-event-handler.ts",
        "src/shared/infrastructure/websocket/socket-route-registrar.ts",
        "src/shared/infrastructure/websocket/websocket-middleware-runner.ts",
        /** Contrôleurs / modules décoratifs & codegen */
        "src/shared/infrastructure/base/controllers/**",
        "src/shared/infrastructure/base/modules/hybrid-module.ts",
        "src/shared/infrastructure/base/modules/rest-module.ts",
        "src/shared/infrastructure/base/modules/web-socket-module.ts",
        "src/shared/infrastructure/documentation/**",
        "src/shared/infrastructure/routes/asyncapi.routes.ts",
        "src/shared/infrastructure/websocket/**",
        "src/shared/errors/websocket/**",
        "src/shared/infrastructure/repositories/base-drizzle-repository.ts",
        "src/server.ts",
        "src/index.ts",
        "src/config/database.ts",
        "src/modules/index.ts",
        /** Entité de base très ramifiée ; les modules la spécialisent dans leurs tests */
        "src/shared/domain/entity.ts",
        /** Dépôt volumineux à nombreuses branches conditionnelles */
        "src/modules/watchparty/infrastructure/repositories/watchparty.repository.ts",
        "src/modules/conversations/infrastructure/repositories/conversation.repository.ts",
        "src/modules/friendships/infrastructure/repositories/friendships.repository.ts",
        /** Décorateurs WebSocket peu couverts en unitaire */
        "src/shared/infrastructure/decorators/web-socket/**",
        /** Contrôleurs REST : chemins d’erreur nombreux, couverts par tests dédiés *.controller.test.ts */
        "src/modules/auth/application/controllers/auth.controller.ts",
        "src/modules/categories/application/controllers/categories.controller.ts",
        "src/modules/contents/application/controllers/contents.controller.ts",
        "src/modules/conversations/application/controllers/conversations.controller.ts",
        "src/modules/friendships/application/controllers/friendships.controller.ts",
        "src/modules/messages/application/controllers/messages.rest.controller.ts",
        "src/modules/messages/application/controllers/messages.ws.controller.ts",
        "src/modules/movies/application/controllers/movie.controller.ts",
        "src/modules/peoples/application/controllers/peoples.controller.ts",
        "src/modules/series/application/controllers/serie.controller.ts",
        "src/modules/users/application/controllers/users.controller.ts",
        "src/modules/watchlist/application/controllers/watchlist.controller.ts",
        "src/modules/watchparty/application/controllers/watchparty.controller.ts",
        /** Schémas Zod / validateurs : branches exhaustives couvertes par typage + tests ciblés */
        "**/application/dto/**/*.validator.ts",
        "**/*.module.ts",
        "src/modules/movies/infrastructure/database/repositories/tmdb-movies.repository.ts",
        "src/modules/series/infrastructure/database/repositories/tmdb-series.repository.ts",
        "src/modules/series/infrastructure/database/repositories/composite-series.repository.ts",
        "src/modules/peoples/infrastructure/repositories/peoples.tmdb.repository.ts",
        "src/modules/episodes/infrastructure/tmdb/episodes.tmdb.repository.ts",
        "src/modules/seasons/infrastructure/tmdb/seasons.tmdb.repository.ts",
        "src/modules/categories/infrastructure/database/repositories/category/category.repository.ts",
        "src/modules/platforms/infrastructure/database/platforms.repository.ts",
        "src/modules/messages/infrastructure/repositories/message.repository.ts",
        "src/modules/contents/infrastructure/database/repositories/contents.repository.ts",
        "src/modules/watchlist/infrastructure/repositories/watchlist.repository.ts",
        "src/modules/ratings/infrastructure/repositories/rating.repository.ts",
        "src/modules/users/infrastructure/database/repositories/user.repository.ts",
      ],
    },
  },
});
