import { WebSocketError } from "./websocket-base-error";

/**
 * Error thrown when acknowledgment validation fails
 */
export class WebSocketAckValidationError extends WebSocketError {
  constructor(message = "Acknowledgment validation failed", event?: string) {
    super(message, "WS_ACK_VALIDATION_ERROR", event);
  }
}
