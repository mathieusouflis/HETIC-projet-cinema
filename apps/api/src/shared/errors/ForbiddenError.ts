import { AppError } from "./AppError.js";

/**
 * Error thrown when a user doesn't have permission to access a resource
 * Returns HTTP 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}
