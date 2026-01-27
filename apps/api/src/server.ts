import "reflect-metadata";
import { createServer as createHttpServer } from "node:http";
import bodyParser from "body-parser";
import cors from "cors";
import express, { type Express } from "express";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";
import "./shared/infrastructure/openapi/zod-openapi.js";
import { config } from "@packages/config";
import { logger } from "@packages/logger";
import cookieParser from "cookie-parser";
import { apiVersion1Router } from "./modules";
import { createAsyncAPIRouter } from "./shared/infrastructure/routes/asyncapi.routes.js";

const { json, urlencoded } = bodyParser;

export interface AppServer {
  app: Express;
  httpServer: ReturnType<typeof createHttpServer>;
  io: SocketIOServer;
}

export const createServer = (): AppServer => {
  const app = express();

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      })
    )
    .use(cookieParser())
    .use("/api/v1", apiVersion1Router())
    .use("/docs", createAsyncAPIRouter())
    .get("/status", (_, res) => {
      return res.json({
        ok: true,
        documentation: {
          rest: `/api/v${config.env.backend.version}/docs`,
          asyncapi: "/docs/asyncapi.json",
        },
      });
    });

  const httpServer = createHttpServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    logger.info("🔌 Socket connecting:", socket.id);
    next();
  });

  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", err);
  });

  return { app, httpServer, io };
};
