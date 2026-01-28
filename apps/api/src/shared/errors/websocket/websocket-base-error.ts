export class WebSocketError extends Error {
  public readonly code: string;
  public readonly event?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code = "WS_ERROR",
    event?: string,
    isOperational = true
  ) {
    super(message);

    this.code = code;
    this.event = event;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to a client-safe object that can be emitted
   */
  public toJSON(): {
    error: string;
    code: string;
    event?: string;
  } {
    return {
      error: this.message,
      code: this.code,
      event: this.event,
    };
  }
}
