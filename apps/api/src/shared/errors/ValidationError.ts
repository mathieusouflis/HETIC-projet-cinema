import { AppError } from "./AppError.js";

/**
 * Error thrown when request validation fails
 * Returns HTTP 400 Bad Request
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string>[];

  constructor(
    message = "Validation failed",
    details?: Record<string, string>[]
  ) {
    super(message, 400);
    this.details = details;
  }
}
