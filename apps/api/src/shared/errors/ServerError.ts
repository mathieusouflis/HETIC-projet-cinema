import { AppError } from "./AppError.js";

/**
 * Error thrown when an error occurs in the server
 * Returns HTTP 500 Forbidden
 */
export class ServerError extends AppError {
  constructor(
    message: string = "Server error occured, please contact the administrator.",
  ) {
    super(message);
  }
}
