import { logger as log } from "@packages/logger";
import type { Socket } from "socket.io";
import type { AccessTokenPayload } from "../services/token/i-token-service.js";
import { JWTService } from "../services/token/jwt-service.js";

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
 * Parse a cookie string and return the value for the given name.
 */
const parseCookie = (cookieHeader: string, name: string): string | null => {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
};

/**
 * Extract access token from socket handshake.
 * Priority: httpOnly cookie → auth object → Authorization header (fallback for non-browser clients).
 *
 * @param socket - Socket.IO socket instance
 * @returns Token string or null if not found
 */
const extractSocketToken = (socket: Socket): string | null => {
  // 1. Cookie (primary — httpOnly cookie sent automatically by browser)
  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    const cookieToken = parseCookie(cookieHeader, "accessToken");
    if (cookieToken) {
      return cookieToken;
    }
  }

  // 2. Auth object (legacy / non-browser clients)
  if (socket.handshake.auth?.token) {
    return socket.handshake.auth.token;
  }

  // 3. Authorization header (non-browser clients)
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
    log.warn("WebSocket auth failed: No token provided");
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
        log.warn("WebSocket auth failed: Token expired");
        throw new Error("Token expired");
      }
      if (error.message === "Invalid access token") {
        log.warn("WebSocket auth failed: Invalid token");
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
  next: (err?: Error) => void
): void => {
  try {
    socketAuthMiddleware(socket);
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error("Authentication failed"));
  }
};
