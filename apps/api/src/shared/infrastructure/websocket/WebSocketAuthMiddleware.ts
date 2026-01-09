import type { Socket } from "socket.io";
import { logger } from "@packages/logger";
import { WebSocketAuthError } from "../../errors/websocket";

/**
 * Global authentication middleware for WebSocket events
 * Ensures socket.user exists before processing any event
 *
 * This middleware runs on EVERY event when namespace requires authentication
 * It's automatically added by WebSocketController when @RequireSocketAuth is present
 */
export async function globalAuthEventMiddleware(
  socket: Socket,
  _data: any,
): Promise<boolean | void> {
  if (!(socket as any).user) {
    logger.warn(
      `Event blocked: Socket ${socket.id} not authenticated (user missing)`,
    );
    throw new WebSocketAuthError(
      "Authentication required for this event",
    );
  }

  return true;
}

/**
 * Check if a socket has a valid authenticated user
 */
export function isSocketAuthenticated(socket: Socket): boolean {
  const user = (socket as any).user;
  return !!(user && user.userId && user.email);
}

/**
 * Get user from socket (with type safety)
 */
export function getSocketUser(
  socket: Socket,
): { userId: string; email: string } | undefined {
  return (socket as any).user;
}

/**
 * Require socket to be authenticated
 * Throws WebSocketAuthError if not authenticated
 */
export function requireSocketAuth(socket: Socket): void {
  if (!isSocketAuthenticated(socket)) {
    throw new WebSocketAuthError(
      "User must be authenticated to access this resource",
    );
  }
}
