import type { Socket } from "socket.io";
import { JWTService } from "../services/token/JWTService.js";
import type { AccessTokenPayload } from "../services/token/ITokenService.js";
import { logger as log } from "@packages/logger";

declare module "socket.io" {
  interface Socket {
    user?: {
      userId: string;
      email: string;
    };
  }
}

const jwtService = new JWTService();

/**
 * Extract Bearer token from socket handshake
 * Checks both auth object and authorization header
 *
 * @param socket - Socket.IO socket instance
 * @returns Token string or null if not found
 */
const extractSocketToken = (socket: Socket): string | null => {
  // Check auth object (socket.io-client sends it here)
  if (socket.handshake.auth?.token) {
    return socket.handshake.auth.token;
  }

  // Check authorization header
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1] || null;
    }
  }

  return null;
};

/**
 * Socket.IO authentication middleware
 *
 * Verifies JWT token from socket handshake (auth object or authorization header)
 * and attaches user info to socket
 *
 * Can be used as:
 * 1. Namespace-level middleware (runs on connection)
 * 2. Event-level middleware (runs before specific events)
 *
 * @example Namespace-level
 * ```ts
 * @Namespace({ path: '/chat', middlewares: [socketAuthMiddleware] })
 * class ChatController extends WebSocketController {}
 * ```
 *
 * @throws Error if authentication fails
 */
export const socketAuthMiddleware = (socket: Socket): void => {
  const token = extractSocketToken(socket);

  if (!token) {
    log.warn(`WebSocket auth failed: No token provided`);
    throw new Error("No authentication token provided");
  }

  try {
    const payload: AccessTokenPayload = jwtService.verifyAccessToken(token);

    socket.user = {
      userId: payload.userId,
      email: payload.email,
    };

    log.info(`WebSocket authenticated: ${payload.email} (${payload.userId})`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Access token expired") {
        log.warn(`WebSocket auth failed: Token expired`);
        throw new Error("Token expired");
      }
      if (error.message === "Invalid access token") {
        log.warn(`WebSocket auth failed: Invalid token`);
        throw new Error("Invalid token");
      }
    }

    log.warn(`❌ WebSocket auth failed: ${error}`);
    throw new Error("Authentication failed");
  }
};

/**
 * Socket.IO authentication middleware for namespace-level (Socket.IO standard format)
 * Wraps socketAuthMiddleware to work with Socket.IO's middleware signature
 */
export const socketAuthNamespaceMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
): void => {
  try {
    socketAuthMiddleware(socket);
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error("Authentication failed"));
  }
};
