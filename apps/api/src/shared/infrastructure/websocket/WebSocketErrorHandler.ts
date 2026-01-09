import type { Socket } from "socket.io";
import { logger } from "@packages/logger";
import { config } from "@packages/config";
import {
  WebSocketError,
  WebSocketAuthError,
  WebSocketValidationError,
  WebSocketInternalError,
} from "../../errors/WebSocketError.js";
import { ZodError } from "zod";

/**
 * Centralized WebSocket error handler
 * Handles errors in a consistent way across all WebSocket events
 * Similar to REST error middleware but adapted for Socket.IO
 */
export class WebSocketErrorHandler {
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.env.NODE_ENV === "development";
  }

  /**
   * Handle error and emit to client
   * @param error - The error that occurred
   * @param socket - The socket connection
   * @param eventName - The event name where error occurred
   * @param callback - Optional acknowledgment callback
   */
  public handle(
    error: Error,
    socket: Socket,
    eventName?: string,
    callback?: (response: any) => void,
  ): void {
    const wsError = this.normalizeError(error, eventName);

    this.logError(wsError, socket.id, eventName);

    const errorResponse = this.buildErrorResponse(wsError);

    if (callback && typeof callback === "function") {
      callback(errorResponse);
    } else {
      socket.emit("error", errorResponse);
    }
  }

  /**
   * Handle fatal error and disconnect socket
   * Used for authentication failures or critical errors
   */
  public handleFatal(
    error: Error,
    socket: Socket,
    eventName?: string,
  ): void {
    const wsError = this.normalizeError(error, eventName);

    logger.error(
      `Fatal WebSocket error for socket ${socket.id} on event '${eventName || "connection"}': ${wsError.message}`,
    );

    if (this.isDevelopment && wsError.stack) {
      logger.info(wsError.stack);
    }

    const errorResponse = this.buildErrorResponse(wsError);
    socket.emit("error", errorResponse);

    socket.disconnect(true);
  }

  /**
   * Normalize any error to a WebSocketError
   */
  private normalizeError(error: Error, eventName?: string): WebSocketError {
    if (error instanceof WebSocketError) {
      return error;
    }

    if (error instanceof ZodError) {
      const details = error.issues.map((err) => ({
        path: err.path.map(String),
        message: err.message,
      }));
      return new WebSocketValidationError(
        "Validation failed",
        details,
        eventName,
      );
    }

    if (error.name === "JsonWebTokenError") {
      return new WebSocketAuthError("Invalid token", eventName);
    }

    if (error.name === "TokenExpiredError") {
      return new WebSocketAuthError("Token expired", eventName);
    }

    return new WebSocketInternalError(
      this.isDevelopment ? error.message : "Internal server error",
      eventName,
    );
  }

  /**
   * Build error response object for client
   */
  private buildErrorResponse(error: WebSocketError): {
    success: false;
    error: string;
    code: string;
    event?: string;
    details?: any;
    stack?: string;
  } {
    const response: {
      success: false;
      error: string;
      code: string;
      event?: string;
      details?: any;
      stack?: string;
    } = {
      success: false,
      error: error.message,
      code: error.code,
      event: error.event,
    };

    if (error instanceof WebSocketValidationError && error.details) {
      response.details = error.details;
    }

    if (this.isDevelopment && error.stack) {
      response.stack = error.stack;
    }

    return response;
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    error: WebSocketError,
    socketId: string,
    eventName?: string,
  ): void {
    const context = `Socket ${socketId}${eventName ? ` on event '${eventName}'` : ""}`;

    if (error.isOperational) {
      logger.warn(`WebSocket error [${error.code}] ${context}: ${error.message}`);
    } else {
      logger.error(`WebSocket error [${error.code}] ${context}: ${error.message}`);
    }

    if (this.isDevelopment && error.stack) {
      logger.info(error.stack);
    }
  }

  /**
   * Create a singleton instance
   */
  private static instance: WebSocketErrorHandler;

  public static getInstance(): WebSocketErrorHandler {
    if (!WebSocketErrorHandler.instance) {
      WebSocketErrorHandler.instance = new WebSocketErrorHandler();
    }
    return WebSocketErrorHandler.instance;
  }
}

/**
 * Singleton instance for easy import
 */
export const webSocketErrorHandler = WebSocketErrorHandler.getInstance();
