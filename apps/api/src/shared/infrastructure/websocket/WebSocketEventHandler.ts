import type { Socket } from "socket.io";
import type { EventListenerMetadata } from "../decorators/web-socket/websocket.metadata.js";
import { WebSocketMetadataStorage } from "../decorators/web-socket/websocket.metadata.js";
import { webSocketValidationService } from "./WebSocketValidationService.js";
import { webSocketMiddlewareRunner } from "./WebSocketMiddlewareRunner.js";
import { webSocketErrorHandler } from "./WebSocketErrorHandler.js";

import { logger } from "@packages/logger";
import { globalAuthEventMiddleware } from "./WebSocketAuthMiddleware.js";
import { WebSocketHandlerNotFoundError } from "../../errors/websocket/websocket-handler-error.js";
import { WebSocketAckValidationError } from "../../errors/websocket/websocket-ack-validator-error.js";

/**
 * Acknowledgment callback type
 */
type AcknowledgmentCallback = (response: any) => void;

/**
 * Service responsible for handling WebSocket event execution
 * Orchestrates validation, middleware execution, and handler invocation
 */
export class WebSocketEventHandler {
  /**
   * Handle a WebSocket event with full lifecycle:
   * 2. Parse incoming data
   * 3. Validate event data (if schema exists)
   * 4. Run event middlewares
   * 5. Execute handler
   * 6. Validate and send acknowledgment (if required)
   *
   * @param controller - The controller instance containing the handler
   * @param event - Event metadata
   * @param socket - Socket connection
   * @param args - Raw arguments from socket.on
   * @param requireAuth - Whether authentication is required for all events
   */
  public async handle(
    controller: any,
    event: EventListenerMetadata,
    socket: Socket,
    args: any[],
    requireAuth: boolean = false,
  ): Promise<void> {
    const eventName = event.eventName;
    let callback: AcknowledgmentCallback | null = null;

    try {
      callback = this.extractCallback(args);

      const rawData = args[0];
      let parsedData = webSocketValidationService.parseEventData(rawData);

      const validationMetadata = WebSocketMetadataStorage.getValidation(
        controller,
        event.methodName,
      );

      if (validationMetadata?.data) {
        parsedData = webSocketValidationService.validateEventData(
          validationMetadata.data,
          parsedData,
          eventName,
        );
      }

      let middlewares = WebSocketMetadataStorage.getMiddlewares(
        controller,
        event.methodName,
      ) || [];

      if (requireAuth) {
        middlewares = [globalAuthEventMiddleware, ...middlewares];
      }

      if (middlewares.length > 0) {
        await webSocketMiddlewareRunner.run(
          middlewares,
          socket,
          parsedData,
          eventName,
        );
      }

      const result = await this.executeHandler(
        controller,
        event.methodName,
        socket,
        parsedData,
        eventName,
      );

      if (event.acknowledgment && callback) {
        await this.handleAcknowledgment(
          result,
          validationMetadata?.ack,
          callback,
          eventName,
        );
      }

      logger.info(`Successfully handled event '${eventName}' for socket ${socket.id}`);
    } catch (error) {
      webSocketErrorHandler.handle(
        error instanceof Error ? error : new Error(String(error)),
        socket,
        eventName,
        callback || undefined,
      );
    }
  }

  /**
   * Extract acknowledgment callback from socket.on arguments
   */
  private extractCallback(args: any[]): AcknowledgmentCallback | null {
    const lastArg = args[args.length - 1];
    return typeof lastArg === "function" ? lastArg : null;
  }

  /**
   * Execute the handler method on the controller
   * @throws WebSocketHandlerNotFoundError if handler doesn't exist
   */
  private async executeHandler(
    controller: any,
    methodName: string,
    socket: Socket,
    data: any,
    eventName: string,
  ): Promise<any> {
    const handler = controller[methodName];

    if (typeof handler !== "function") {
      throw new WebSocketHandlerNotFoundError(methodName, eventName);
    }

    return await handler.call(controller, socket, data);
  }

  /**
   * Handle acknowledgment response
   * Validates response if schema exists, then sends to client
   */
  private async handleAcknowledgment(
    result: any,
    ackSchema: any,
    callback: AcknowledgmentCallback,
    eventName: string,
  ): Promise<void> {
    let validatedResult = result;

    if (ackSchema) {
      try {
        validatedResult = webSocketValidationService.validateAcknowledgment(
          ackSchema,
          result,
          eventName,
        );
      } catch (error) {
        throw new WebSocketAckValidationError(
          error instanceof Error ? error.message : "Acknowledgment validation failed",
          eventName,
        );
      }
    }

    callback(validatedResult);
  }

  /**
   * Create a singleton instance
   */
  private static instance: WebSocketEventHandler;

  public static getInstance(): WebSocketEventHandler {
    if (!WebSocketEventHandler.instance) {
      WebSocketEventHandler.instance = new WebSocketEventHandler();
    }
    return WebSocketEventHandler.instance;
  }
}

export const webSocketEventHandler = WebSocketEventHandler.getInstance();
