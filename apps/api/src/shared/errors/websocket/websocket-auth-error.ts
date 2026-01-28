import { WebSocketError } from "./websocket-base-error";

/**
 * Error thrown when WebSocket authentication fails
 */
export class WebSocketAuthError extends WebSocketError {
  constructor(message = "Authentication failed", event?: string) {
    super(message, "WS_AUTH_ERROR", event);
  }
}
