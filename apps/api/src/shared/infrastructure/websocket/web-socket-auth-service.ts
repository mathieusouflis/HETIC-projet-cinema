import { logger } from "@packages/logger";
import type { Socket } from "socket.io";
import { WebSocketAuthError } from "../../errors/websocket/websocket-auth-error.js";
import { socketAuthMiddleware } from "../../middleware/socket-auth.middleware.js";

/**
 * Service responsible for WebSocket authentication
 * Consolidates all WebSocket authentication logic in one place
 * Follows Single Responsibility Principle
 */
export class WebSocketAuthService {
  /**
   * Authenticate a socket connection
   * Verifies JWT token and attaches user info to socket
   *
   * @param socket - Socket connection to authenticate
   * @throws WebSocketAuthError if authentication fails
   */
  public authenticate(socket: Socket): void {
    try {
      socketAuthMiddleware(socket);
    } catch (error) {
      logger.warn(
        `Socket ${socket.id} authentication failed: ${error instanceof Error ? error.message : String(error)}`
      );

      throw new WebSocketAuthError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }

  /**
   * Check if a socket is authenticated
   * Validates that socket.user exists with required fields
   *
   * @param socket - Socket to check
   * @returns true if socket has valid user attached
   */
  public isAuthenticated(socket: Socket): boolean {
    const user = socket.user;
    return !!(user?.userId && user.email);
  }

  /**
   * Get authenticated user from socket
   *
   * @param socket - Socket connection
   * @returns User info or undefined if not authenticated
   */
  public getUser(
    socket: Socket
  ): { userId: string; email: string } | undefined {
    return socket.user;
  }

  /**
   * Require authentication - throws if not authenticated
   *
   * @param socket - Socket connection
   * @throws WebSocketAuthError if not authenticated
   */
  public requireAuth(socket: Socket): void {
    if (!this.isAuthenticated(socket)) {
      throw new WebSocketAuthError(
        "User must be authenticated to access this resource"
      );
    }
  }

  /**
   * Global authentication middleware for WebSocket events
   * Ensures socket.user exists before processing any event
   *
   * This middleware runs on EVERY event when namespace requires authentication
   * It's automatically added by WebSocketEventHandler when requireAuth flag is true
   *
   * @param socket - Socket connection
   * @param _data - Event data (unused, for middleware signature compatibility)
   * @returns true if authenticated
   * @throws WebSocketAuthError if not authenticated
   */
  public async globalAuthEventMiddleware(
    socket: Socket,
    _data: any
  ): Promise<boolean | undefined> {
    if (!socket.user) {
      logger.warn(
        `Event blocked: Socket ${socket.id} not authenticated (user missing)`
      );
      throw new WebSocketAuthError("Authentication required for this event");
    }

    return true;
  }

  /**
   * Create a singleton instance
   */
  private static instance: WebSocketAuthService;

  public static getInstance(): WebSocketAuthService {
    if (!WebSocketAuthService.instance) {
      WebSocketAuthService.instance = new WebSocketAuthService();
    }
    return WebSocketAuthService.instance;
  }
}

export const webSocketAuthService = WebSocketAuthService.getInstance();

// Standalone function exports for backward compatibility and convenience
// These delegate to the singleton service instance

/**
 * Check if a socket has a valid authenticated user
 * @deprecated Use webSocketAuthService.isAuthenticated() instead
 */
export function isSocketAuthenticated(socket: Socket): boolean {
  return webSocketAuthService.isAuthenticated(socket);
}

/**
 * Get user from socket (with type safety)
 * @deprecated Use webSocketAuthService.getUser() instead
 */
export function getSocketUser(
  socket: Socket
): { userId: string; email: string } | undefined {
  return webSocketAuthService.getUser(socket);
}

/**
 * Require socket to be authenticated
 * Throws WebSocketAuthError if not authenticated
 * @deprecated Use webSocketAuthService.requireAuth() instead
 */
export function requireSocketAuth(socket: Socket): void {
  webSocketAuthService.requireAuth(socket);
}

/**
 * Global authentication middleware for WebSocket events
 * @deprecated Use webSocketAuthService.globalAuthEventMiddleware() instead
 */
export async function globalAuthEventMiddleware(
  socket: Socket,
  data: any
): Promise<boolean | undefined> {
  return webSocketAuthService.globalAuthEventMiddleware(socket, data);
}
