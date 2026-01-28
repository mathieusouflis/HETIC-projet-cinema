import { AppError } from "./AppError.js";

/**
 * Error thrown when authentication fails or is missing
 * Returns HTTP 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}
