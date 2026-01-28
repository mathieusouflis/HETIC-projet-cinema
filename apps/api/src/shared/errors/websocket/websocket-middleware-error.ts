import { WebSocketError } from "./websocket-base-error";

/**
 * Error thrown when a WebSocket middleware rejects the request
 */
export class WebSocketMiddlewareError extends WebSocketError {
  constructor(message = "Middleware rejected request", event?: string) {
    super(message, "WS_MIDDLEWARE_ERROR", event);
  }
}
