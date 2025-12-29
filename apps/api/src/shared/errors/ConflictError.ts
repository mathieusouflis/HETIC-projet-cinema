import { AppError } from "./AppError.js";

/**
 * Error thrown when a resource conflict occurs (e.g., duplicate entry)
 * Returns HTTP 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}
