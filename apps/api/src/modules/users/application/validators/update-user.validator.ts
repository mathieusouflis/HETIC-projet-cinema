import { z } from "zod";
import { usernameSchema } from "./username.validator";

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  avatarUrl: z
    .string()
    .url("Avatar must be a valid URL")
    .max(500, "Avatar URL must be less than 500 characters")
    .nullable()
    .optional(),
});
