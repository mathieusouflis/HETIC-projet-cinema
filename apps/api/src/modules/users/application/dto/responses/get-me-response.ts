import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";
import { emailSchema } from "../../../../../shared/schemas/fields/email.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";

export const getMeResponseSchema = z.object({
  userId: uuidSchema,
  email: emailSchema,
  username: usernameSchema,
});

export type GetMeDTO = z.infer<typeof getMeResponseSchema>;
