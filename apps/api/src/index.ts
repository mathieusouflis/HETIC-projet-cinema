import "reflect-metadata";
import "./shared/infrastructure/openapi/zod-openapi.js";
import { logger } from "@packages/logger";
import { createServer } from "./server.js";
import { config } from "@packages/config";
import { generateWebSocketAPIDocumentation, registerAllWebSocketEvents } from "./modules/index.js";

const port = config.env.backend.port || 5001;
const { httpServer, io } = createServer();

registerAllWebSocketEvents(io);
generateWebSocketAPIDocumentation()

httpServer.listen(port, () => {
  logger.info(`🚀 \x1b[35mAPI server\x1b[0m running on http://localhost:${port}`);
  logger.info(`🚀 \x1b[35mWebSocket server\x1b[0m running on ws://localhost:${port}`);
  logger.info(`📚 \x1b[35mREST API docs\x1b[0m: http://localhost:${port}/api/v${config.env.backend.version}/docs`);
  logger.info(`📚 \x1b[35mWebSocket docs\x1b[0m: http://localhost:${port}/docs/asyncapi.json`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} signal received: closing servers gracefully`);

  io.close(() => {
    logger.info("Socket.IO server closed");

    httpServer.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.info("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  shutdown("UNHANDLED_REJECTION");
});
