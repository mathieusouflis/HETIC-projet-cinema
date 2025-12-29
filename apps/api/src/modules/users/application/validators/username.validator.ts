import { z } from "zod";

export const usernameSchema = z
  .string({ required_error: "Username is required" })
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  )
  .trim();
