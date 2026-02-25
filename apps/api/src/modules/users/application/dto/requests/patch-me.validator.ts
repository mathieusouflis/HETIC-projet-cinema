import { z } from "zod";
import { Shared } from "../../../../../shared";
import { passwordSchema } from "../../../../../shared/schemas/fields";
import { emailSchemaOptional } from "../../../../../shared/schemas/fields/email.schema";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";

export const patchMeBodySchema = z.object({
  username: Shared.Schemas.Fields.usernameSchemaOptional,
  email: emailSchemaOptional,
  avatarUrl: avatarUrlSchemaOptionalNullable,
  password: passwordSchema.optional(),
  newPassword: passwordSchema.optional(),
  confirmPassword: passwordSchema.optional(),
});
