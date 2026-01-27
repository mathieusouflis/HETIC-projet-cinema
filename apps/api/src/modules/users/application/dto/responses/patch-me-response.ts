import z from "zod";
import { emailSchema } from "../../../../../shared/schemas/fields/email.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const patchMeResponseSchema = z.object({
  userId: uuidSchema,
  email: emailSchema,
  username: usernameSchema,
});
