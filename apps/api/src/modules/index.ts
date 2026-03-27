import fs from "node:fs";
import { logger } from "@packages/logger";
import { Router } from "express";
import type { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { asyncAPIGenerator } from "../shared/infrastructure/documentation/asyncapi-generator";
import { moduleRegistry } from "../shared/infrastructure/openapi/module-registry";
import { OpenAPISpecAggregator } from "../shared/infrastructure/openapi/openapi-spec-aggregator";
import { authModule } from "./auth/auth.module";
import { categoriesModule } from "./categories/categories.module";
import { contentsModule } from "./contents/contents.module";
import { conversationsModule } from "./conversations/conversations.module";
import { friendshipsModule } from "./friendships/friendships.module";
import { messagesModule } from "./messages/messages.module";
import { moviesModule } from "./movies/movie.module";
import { peoplesModule } from "./peoples/peoples.module";
import { seriesModule } from "./series/serie.module";
import { usersModule } from "./users/users.module";
import { watchlistModule } from "./watchlist/watchlist.module";
import { watchpartyModule } from "./watchparty/watchparty.module";

function registerModules(): void {
  moduleRegistry.register("auth", authModule);
  moduleRegistry.register("users", usersModule);
  moduleRegistry.register("categories", categoriesModule);
  moduleRegistry.register("contents", contentsModule);
  moduleRegistry.register("movies", moviesModule);
  moduleRegistry.register("series", seriesModule);
  moduleRegistry.register("watchlist", watchlistModule);
  moduleRegistry.register("peoples", peoplesModule);
  moduleRegistry.register("watchparties", watchpartyModule);
  moduleRegistry.register("friendships", friendshipsModule);
  moduleRegistry.register("conversations", conversationsModule);
  moduleRegistry.register("messages", messagesModule);
}

function generateOpenAPISpec() {
  const aggregator = new OpenAPISpecAggregator();
  return aggregator.generateSpec();
}

export function apiVersion1Router(): Router {
  const router = Router();

  registerModules();

  router.get("/", (_, res) => {
    const moduleNames = moduleRegistry.getModuleNames();

    res.status(200).json({
      message: "API v1 is up and running!",
      version: "1.0.0",
      modules: moduleNames,
      endpoints: {
        auth: "/api/v1/auth",
        users: "/api/v1/users",
        docs: "/api/v1/docs",
        openapi: "/api/v1/openapi.json",
      },
    });
  });

  const modules = moduleRegistry.getAllModules();
  for (const module of modules) {
    router.use(module.getRouter());
  }

  const openApiSpec = generateOpenAPISpec();
  fs.writeFile(
    "./api-documentation.json",
    JSON.stringify(openApiSpec, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing OpenAPI spec:", err);
      }
    }
  );
  router.get("/openapi.json", (_, res) => {
    res.json(openApiSpec);
  });

  router.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Cinema API Documentation",
    })
  );

  return router;
}

export function registerAllWebSocketEvents(io: SocketIOServer): void {
  // TODO: Uncomment when chat module is needed
  // chatModule.registerEvents(io);
  // asyncAPIGenerator.registerController(chatModule.getEventController());

  messagesModule.registerEvents(io);
  asyncAPIGenerator.registerController(messagesModule.getWSController());

  logger.success("All WebSocket events registered");
}
