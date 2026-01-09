import { WebSocketError } from "./websocket-base-error";

/**
 * Error thrown when a WebSocket event handler is not found
 */
export class WebSocketHandlerNotFoundError extends WebSocketError {
  constructor(handler: string, event?: string) {
    super(
      `Handler method '${handler}' not found`,
      "WS_HANDLER_NOT_FOUND",
      event,
    );
  }
}
