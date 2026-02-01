import { AppError } from "./app-error.js";

/**
 * Error thrown when a requested resource is not found
 * Returns HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}
