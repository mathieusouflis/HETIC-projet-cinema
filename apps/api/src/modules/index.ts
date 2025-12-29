import { Router } from "express";
import { usersModule } from "./users/users.module.js";
import { authModule } from "./auth/auth.module.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "../shared/middleware/error.middleware.js";

/**
 * API Version 1 Router
 *
 * @returns Configured Express Router for API v1
 */
export function apiVersion1Router(): Router {
  const router = Router();

  router.get("/", (_, res) => {
    res.status(200).json({
      message: "API v1 is up and running!",
      version: "1.0.0",
      endpoints: {
        auth: "/api/v1/auth",
        users: "/api/v1/users",
      },
    });
  });

  router.use("/auth", authModule.getRouter());
  router.use("/users", usersModule.getRouter());

  router.use(notFoundMiddleware);
  router.use(errorMiddleware);

  return router;
}
