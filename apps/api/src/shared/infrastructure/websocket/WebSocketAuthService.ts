import { logger } from "@packages/logger";
import type { Socket } from "socket.io";
import { WebSocketAuthError } from "../../errors/websocket/websocket-auth-error.js";
import { socketAuthMiddleware } from "../../middleware/socket-auth.middleware.js";

/**
 * Service responsible for WebSocket authentication
 * Separates authentication logic into a dedicated service
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
   * @param socket - Socket to check
   * @returns true if socket has user attached
   */
  public isAuthenticated(socket: Socket): boolean {
    return !!socket.user;
  }

  /**
   * Get authenticated user from socket
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
   * @param socket - Socket connection
   * @throws WebSocketAuthError if not authenticated
   */
  public requireAuth(socket: Socket): void {
    if (!this.isAuthenticated(socket)) {
      throw new WebSocketAuthError("Authentication required");
    }
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
