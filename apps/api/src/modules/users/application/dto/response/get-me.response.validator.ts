import z from "zod";
import { emailSchema } from "../../../../../shared/schemas/fields/email.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getMeResponseSchema = z.object({
  userId: uuidSchema,
  email: emailSchema,
  username: usernameSchema,
});

export type GetMeResponse = z.infer<typeof getMeResponseSchema>;
