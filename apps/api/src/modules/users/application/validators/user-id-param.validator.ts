import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z
    .string({ required_error: "User ID is required" })
    .regex(/^\d+$/, "User ID must be a valid number"),
});
