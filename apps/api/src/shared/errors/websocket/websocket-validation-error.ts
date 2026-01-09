import { WebSocketError } from "./websocket-base-error";

/**
 * Error thrown when WebSocket event validation fails
 */
export class WebSocketValidationError extends WebSocketError {
  public readonly details?: Array<{ path: string[]; message: string }>;

  constructor(
    message: string = "Validation failed",
    details?: Array<{ path: string[]; message: string }>,
    event?: string,
  ) {
    super(message, "WS_VALIDATION_ERROR", event);
    this.details = details;
  }

  public override toJSON(): {
    error: string;
    code: string;
    event?: string;
    details?: Array<{ path: string[]; message: string }>;
  } {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}
