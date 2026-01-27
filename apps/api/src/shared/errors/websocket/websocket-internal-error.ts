import { WebSocketError } from "./websocket-base-error";

/**
 * Generic WebSocket internal error
 */
export class WebSocketInternalError extends WebSocketError {
  constructor(message = "Internal server error", event?: string) {
    super(message, "WS_INTERNAL_ERROR", event, false);
  }
}
