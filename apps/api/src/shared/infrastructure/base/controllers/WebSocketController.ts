import "reflect-metadata";
import type { Server as SocketIOServer, Socket, Namespace } from "socket.io";
import { logger } from "@packages/logger";
import {
  webSocketEventRegistrar,
  webSocketErrorHandler,
  getSocketUser,
  requireSocketAuth,
} from "../../websocket/index.js";
import { Shared } from "../../../index.js";

/**
 * Base controller for WebSocket event handlers
 * Extend this class to create WebSocket controllers with decorator support
 *
 * @example
 * ```ts
 * @Namespace({ path: '/chat' })
 * @RequireSocketAuth
 * class ChatController extends WebSocketController {
 *   @Subscribe('message:send')
 *   @ValidateEvent(messageSchema)
 *   async handleMessage(socket: Socket, data: Message) {
 *     // Handle message
 *     this.broadcast('message:new', data);
 *   }
 * }
 * ```
 */
export abstract class WebSocketController {
  protected io?: SocketIOServer;
  protected namespace?: Namespace;

  /**
   * Register all events from this controller with Socket.IO
   * This method is called automatically when the controller is registered
   */
  public registerEvents(io: SocketIOServer): void {
    this.io = io;

    const namespaceMetadata = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getNamespace(this);
    const events = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getEvents(this);

    if (!namespaceMetadata) {
      logger.warn(
        `No @Namespace decorator found on ${this.constructor.name}`,
      );
      return;
    }

    // Create or get namespace
    this.namespace = io.of(namespaceMetadata.path);

    // Apply namespace-level middlewares
    this.applyNamespaceMiddlewares(namespaceMetadata.middlewares);

    // Handle connections
    this.namespace.on("connection", (socket: Socket) => {
      this.handleConnection(socket, events);
    });

    // Log successful registration
    this.logNamespaceRegistration(namespaceMetadata.path, events);
  }

  /**
   * Apply namespace-level middlewares
   */
  private applyNamespaceMiddlewares(middlewares?: any[]): void {
    if (!middlewares || middlewares.length === 0) {
      return;
    }

    middlewares.forEach((middleware) => {
      this.namespace!.use(middleware);
    });
  }

  /**
   * Handle new socket connection
   * Performs authentication if required and registers events
   */
  private handleConnection(socket: Socket, events: any[]): void {
    try {
      // Check if namespace requires authentication
      const namespaceMetadata = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getNamespace(this);
      const requireAuth = namespaceMetadata?.requireAuth ?? false;

      // Log connection
      logger.info(
        `🔌 Client connected to ${this.constructor.name}: ${socket.id}`,
      );

      // Register socket events with auth requirement flag
      webSocketEventRegistrar.registerEvents(socket, events, this, requireAuth);

      // Setup lifecycle handlers
      this.setupSocketLifecycle(socket);

      // Setup global error handler for this socket
      this.setupGlobalErrorHandler(socket);

      // Call custom connection handler
      this.onConnection(socket);
    } catch (error) {
      // Handle authentication or connection errors
      webSocketErrorHandler.handleFatal(
        error instanceof Error ? error : new Error(String(error)),
        socket,
        "connection",
      );
    }
  }

  /**
   * Setup socket lifecycle event handlers
   */
  private setupSocketLifecycle(socket: Socket): void {
    socket.on("disconnect", (reason) => {
      this.handleDisconnection(socket, reason);
    });

    socket.on("error", (error) => {
      this.handleError(socket, error);
    });
  }

  /**
   * Setup global error handler for socket
   * Catches all unhandled errors and emits them to the client
   */
  private setupGlobalErrorHandler(socket: Socket): void {
    // Override socket.onevent to catch all errors globally
    const originalOnevent = (socket as any)._onevent;

    (socket as any)._onevent = function(packet: any) {
      const args = packet.data || [];
      const event = args.shift();

      // Wrap in try-catch to catch synchronous errors
      try {
        originalOnevent.call(this, packet);
      } catch (error) {
        logger.error(
          `Unhandled error in socket event '${event}' for socket ${socket.id}:`,
          error instanceof Error ? error.message : String(error),
        );

        // Emit error to client
        webSocketErrorHandler.handle(
          error instanceof Error ? error : new Error(String(error)),
          socket,
          event,
        );
      }
    };
  }

  /**
   * Log namespace registration
   */
  private logNamespaceRegistration(path: string, events: any[]): void {
    const eventTree = events
      .map(
        (event, idx) =>
          `\n\t\t\t\t\t       ${idx !== events.length - 1 ? "├── " : "└── "}${event.eventName}`,
      )
      .join("");

    logger.success(
      `💉 WebSocket namespace registered: ${path} (${events.length} events)${eventTree}`,
    );
  }

  // ============================================
  // Protected Helper Methods
  // ============================================

  /**
   * Emit event to specific room
   * @example
   * this.emitToRoom('room:123', 'message:new', { text: 'Hello' });
   */
  protected emitToRoom<T = any>(room: string, event: string, data: T): void {
    if (!this.namespace) {
      logger.warn("Cannot emit to room: namespace not initialized");
      return;
    }
    this.namespace.to(room).emit(event, data);
  }

  /**
   * Broadcast event to all clients in namespace
   * @example
   * this.broadcast('announcement', { text: 'Server maintenance in 5 minutes' });
   */
  protected broadcast<T = any>(event: string, data: T): void {
    if (!this.namespace) {
      logger.warn("Cannot broadcast: namespace not initialized");
      return;
    }
    this.namespace.emit(event, data);
  }

  /**
   * Emit event to specific socket
   * @example
   * this.emitToSocket(socket.id, 'notification', { message: 'Welcome!' });
   */
  protected emitToSocket<T = any>(
    socketId: string,
    event: string,
    data: T,
  ): void {
    if (!this.namespace) {
      logger.warn("Cannot emit to socket: namespace not initialized");
      return;
    }
    this.namespace.to(socketId).emit(event, data);
  }

  /**
   * Broadcast to all sockets except the sender
   * @example
   * this.broadcastExcept(socket.id, 'user:joined', { userId: '123' });
   */
  protected broadcastExcept<T = any>(
    socketId: string,
    event: string,
    data: T,
  ): void {
    if (!this.namespace) {
      logger.warn("Cannot broadcast except: namespace not initialized");
      return;
    }
    this.namespace.except(socketId).emit(event, data);
  }

  /**
   * Get all socket IDs in a specific room
   * @example
   * const socketIds = await this.getSocketsInRoom('room:123');
   */
  protected async getSocketsInRoom(room: string): Promise<Set<string>> {
    if (!this.namespace) {
      logger.warn("Cannot get sockets in room: namespace not initialized");
      return new Set();
    }

    const sockets = await this.namespace.in(room).fetchSockets();
    return new Set(sockets.map((s) => s.id));
  }

  /**
   * Get total number of connected clients in namespace
   */
  protected async getConnectedClientsCount(): Promise<number> {
    if (!this.namespace) {
      logger.warn("Cannot get client count: namespace not initialized");
      return 0;
    }

    const sockets = await this.namespace.fetchSockets();
    return sockets.length;
  }

  /**
   * Check if a socket is in a specific room
   */
  protected async isSocketInRoom(
    socketId: string,
    room: string,
  ): Promise<boolean> {
    const socketsInRoom = await this.getSocketsInRoom(room);
    return socketsInRoom.has(socketId);
  }

  /**
   * Get authenticated user from socket
   * @returns User info or undefined if not authenticated
   */
  protected getSocketUser(
    socket: Socket,
  ): { userId: string; email: string } | undefined {
    return getSocketUser(socket);
  }

  /**
   * Require socket to be authenticated
   * @throws WebSocketAuthError if socket is not authenticated
   */
  protected requireSocketAuth(socket: Socket): void {
    requireSocketAuth(socket);
  }

  /**
   * Disconnect a socket
   */
  protected disconnectSocket(socket: Socket): void {
    socket.disconnect(true);
  }

  // ============================================
  // Lifecycle Hooks (Override in subclasses)
  // ============================================

  /**
   * Called when a client connects to the namespace
   * Override this method to implement custom connection logic
   *
   * @example
   * ```ts
   * protected onConnection(socket: Socket): void {
   *   console.log(`User connected: ${socket.id}`);
   * }
   * ```
   */
  protected onConnection(_socket: Socket): void {
    // Override in subclass
  }

  /**
   * Called when a client disconnects from the namespace
   * Override this method to implement custom disconnection logic
   */
  protected handleDisconnection(socket: Socket, reason: string): void {
    logger.info(
      `🔌 Client disconnected from ${this.constructor.name}: ${socket.id} (${reason})`,
    );
  }

  /**
   * Called when a socket error occurs
   * Override this method to implement custom error handling
   */
  protected handleError(socket: Socket, error: Error): void {
    logger.error(`Socket error for ${socket.id}:`, error.message);
  }

  // ============================================
  // Metadata (for AsyncAPI generation)
  // ============================================

  /**
   * Get metadata about this WebSocket controller for documentation
   * Used by AsyncAPI generator
   */
  public getMetadata(): {
    namespace: string | undefined;
    description: string | undefined;
    events: any[];
    emits: any[];
    rooms: any[];
  } {
    const namespace = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getNamespace(this);
    const events = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getEvents(this);
    const emits = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getEmits(this);
    const rooms = Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getRooms(this);

    return {
      namespace: namespace?.path,
      description: namespace?.description,
      events: events.map((e) => ({
        name: e.eventName,
        description: e.description,
        acknowledgment: e.acknowledgment,
        deprecated: e.deprecated,
        validation: Shared.Infrastructure.Decorators.WebSockets.Metadata.WebSocketMetadataStorage.getValidation(this, e.methodName),
      })),
      emits: emits,
      rooms: rooms,
    };
  }
}
