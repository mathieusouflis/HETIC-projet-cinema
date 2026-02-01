import { logger } from "@packages/logger";
import type { Socket } from "socket.io";
import type { EventListenerMetadata } from "../decorators/web-socket/websocket.metadata.js";
import { webSocketEventHandler } from "./web-socket-event-handler.js";

/**
 * Service responsible for registering WebSocket events
 * Separates event registration logic from the controller
 * Follows Single Responsibility Principle
 */
export class WebSocketEventRegistrar {
  /**
   * Register all events for a socket connection
   *
   * @param socket - Socket connection
   * @param events - Array of event metadata
   * @param controller - Controller instance containing the handlers
   * @param requireAuth - Whether all events require authentication
   */
  public registerEvents(
    socket: Socket,
    events: EventListenerMetadata[],
    controller: any,
    requireAuth = false
  ): void {
    if (!events || events.length === 0) {
      logger.warn(`No events to register for socket ${socket.id}`);
      return;
    }

    for (const event of events) {
      this.registerSingleEvent(socket, event, controller, requireAuth);
    }

    logger.info(`Registered ${events.length} event(s) for socket ${socket.id}`);
  }

  /**
   * Register a single event handler
   *
   * @param socket - Socket connection
   * @param event - Event metadata
   * @param controller - Controller instance
   * @param requireAuth - Whether authentication is required
   */
  private registerSingleEvent(
    socket: Socket,
    event: EventListenerMetadata,
    controller: any,
    requireAuth: boolean
  ): void {
    socket.on(event.eventName, async (...args: any[]) => {
      await webSocketEventHandler.handle(
        controller,
        event,
        socket,
        args,
        requireAuth
      );
    });
  }

  /**
   * Create a singleton instance
   */
  private static instance: WebSocketEventRegistrar;

  public static getInstance(): WebSocketEventRegistrar {
    if (!WebSocketEventRegistrar.instance) {
      WebSocketEventRegistrar.instance = new WebSocketEventRegistrar();
    }
    return WebSocketEventRegistrar.instance;
  }
}

export const webSocketEventRegistrar = WebSocketEventRegistrar.getInstance();
