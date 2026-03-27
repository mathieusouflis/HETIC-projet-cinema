import { z } from "zod";
import { emailSchemaOptional } from "../../../../../shared/schemas/fields/email.schema";
import { passwordSchema } from "../../../../../shared/schemas/fields/password.schema";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";
import { usernameSchemaOptional } from "../../../../../shared/schemas/fields/username.schema";

export const patchMeBodySchema = z.object({
  username: usernameSchemaOptional,
  email: emailSchemaOptional,
  avatarUrl: avatarUrlSchemaOptionalNullable,
  password: passwordSchema.optional(),
  newPassword: passwordSchema.optional(),
  confirmPassword: passwordSchema.optional(),
});
