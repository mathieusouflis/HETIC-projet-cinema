// import { asyncAPIGenerator } from "../shared/infrastructure/documentation/asyncapi-generator.js"; // TODO: Uncomment when chat module is needed
// import { chatModule } from "./chat/chat.module.js"; // TODO: Uncomment when chat module is needed
import fs from "node:fs";
import { logger } from "@packages/logger";
import { Router } from "express";
import type { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { moduleRegistry } from "../shared/infrastructure/openapi/module-registry.js";
import { OpenAPISpecAggregator } from "../shared/infrastructure/openapi/openapi-spec-aggregator.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "../shared/middleware/error.middleware.js";
import { authModule } from "./auth/auth.module.js";
import { contentsModule } from "./contents/contents.module.js";
import { moviesModule } from "./movies/movie.module.js";
import { peoplesModule } from "./peoples/peoples.module.js";
import { seriesModule } from "./series/serie.module.js";
import { usersModule } from "./users/users.module.js";
import { watchlistModule } from "./watchlist/watchlist.module.js";
import { watchpartyModule } from "./watchparty/watchparty.module.js";

function registerModules(): void {
  moduleRegistry.register("auth", authModule);
  moduleRegistry.register("users", usersModule);
  moduleRegistry.register("contents", contentsModule);
  moduleRegistry.register("movies", moviesModule);
  moduleRegistry.register("series", seriesModule);
  moduleRegistry.register("watchlist", watchlistModule);
  moduleRegistry.register("peoples", peoplesModule);
  moduleRegistry.register("watchparties", watchpartyModule);
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

  router.use(notFoundMiddleware);
  router.use(errorMiddleware);

  return router;
}

export function registerAllWebSocketEvents(_io: SocketIOServer): void {
  // TODO: Uncomment when chat module is needed
  // chatModule.registerEvents(io);
  // asyncAPIGenerator.registerController(chatModule.getEventController());

  logger.success("All WebSocket events registered");
}
