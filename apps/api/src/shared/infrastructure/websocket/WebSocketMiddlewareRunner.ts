import type { Socket } from "socket.io";
import { WebSocketMiddlewareError } from "../../errors/WebSocketError.js";
import { logger } from "@packages/logger";

/**
 * Type definition for WebSocket event middleware
 * Middleware can return false to reject the request or true/void to continue
 */
export type WebSocketEventMiddleware = (
  socket: Socket,
  data: any,
) => Promise<boolean | void> | boolean | void;

/**
 * Service for running WebSocket middlewares
 * Handles middleware execution with proper error handling
 */
export class WebSocketMiddlewareRunner {
  /**
   * Run all middlewares in sequence
   * Stops at first middleware that returns false
   *
   * @param middlewares - Array of middleware functions to execute
   * @param socket - Socket connection
   * @param data - Event data
   * @param eventName - Event name for error context
   * @throws WebSocketMiddlewareError if a middleware rejects the request
   */
  public async run(
    middlewares: WebSocketEventMiddleware[],
    socket: Socket,
    data: any,
    eventName: string,
  ): Promise<void> {
    if (!middlewares || middlewares.length === 0) {
      return;
    }

    for (const middleware of middlewares) {
      try {
        const result = await middleware(socket, data);

        if (result === false) {
          throw new WebSocketMiddlewareError(
            "Middleware rejected the request",
            eventName,
          );
        }
      } catch (error) {
        if (error instanceof WebSocketMiddlewareError) {
          throw error;
        }

        logger.error(
          `Middleware error for event '${eventName}':`,
          error instanceof Error ? error.message : String(error),
        );

        throw new WebSocketMiddlewareError(
          error instanceof Error
            ? error.message
            : "Middleware execution failed",
          eventName,
        );
      }
    }
  }

  /**
   * Create a singleton instance
   */
  private static instance: WebSocketMiddlewareRunner;

  public static getInstance(): WebSocketMiddlewareRunner {
    if (!WebSocketMiddlewareRunner.instance) {
      WebSocketMiddlewareRunner.instance = new WebSocketMiddlewareRunner();
    }
    return WebSocketMiddlewareRunner.instance;
  }
}

export const webSocketMiddlewareRunner = WebSocketMiddlewareRunner.getInstance();
