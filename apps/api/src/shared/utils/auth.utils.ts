import type { Request } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error.js";

export function requireUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId || userId === "") {
    throw new UnauthorizedError("User not authenticated");
  }
  return userId;
}

export function optionalUserId(req: Request): string | undefined {
  const userId = req.user?.userId;
  if (!userId || userId === "") {
    return undefined;
  }
  return userId;
}
