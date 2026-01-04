import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { log } from "@packages/logger";

interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>[];
  stack?: string;
}

const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development";
};

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  log(`❌ Error: ${err.message}`);

  if (isDevelopment() && err.stack) {
    log(err.stack);
  }

  const response: ErrorResponse = {
    success: false,
    error: err.message || "Internal server error",
  };

  if (err instanceof ValidationError && err.details) {
    response.details = err.details;
  }

  if (isDevelopment() && err.stack) {
    response.stack = err.stack;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(response);
    return;
  }

  if (err.name === "JsonWebTokenError") {
    response.error = "Invalid token";
    res.status(401).json(response);
    return;
  }

  if (err.name === "TokenExpiredError") {
    response.error = "Token expired";
    res.status(401).json(response);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    response.error = "Invalid request body";
    res.status(400).json(response);
    return;
  }

  if (!isDevelopment()) {
    response.error = "Internal server error";
    delete response.stack;
  }

  res.status(500).json(response);
};

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};
