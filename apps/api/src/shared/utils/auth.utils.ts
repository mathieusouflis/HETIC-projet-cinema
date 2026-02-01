import type { Request } from "express";
import { UnauthorizedError } from "../errors";

/**
 * Extracts and validates user ID from authenticated request
 * @param req Express request object with user attached by auth middleware
 * @returns Validated user ID
 * @throws UnauthorizedError if user is not authenticated
 */
export function requireUserId(req: Request): string {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  return userId;
}

/**
 * Extracts user ID from request if present
 * @param req Express request object
 * @returns User ID or undefined if not authenticated
 */
export function optionalUserId(req: Request): string | undefined {
  return req.user?.userId;
}
