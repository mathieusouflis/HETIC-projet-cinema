import { z } from "zod";
import { emailSchemaOptional } from "../../../../../shared/schemas/fields/email.schema";
import { passwordSchemaOptional } from "../../../../../shared/schemas/fields/password.schema";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const patchIdParamsSchema = z.object({
  id: uuidSchema,
});

export const patchIdBodySchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchemaOptional,
  avatarUrl: avatarUrlSchemaOptionalNullable,
  password: passwordSchemaOptional,
  newPassword: passwordSchemaOptional,
  confirmPassword: passwordSchemaOptional,
});

export type PatchIdRequestDTO = z.infer<typeof patchIdBodySchema>;
