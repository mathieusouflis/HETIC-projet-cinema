import { z } from "zod";
import { passwordSchema } from "../../../../../shared/schemas/fields";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const patchIdParamsSchema = z.object({
  id: uuidSchema,
});

export const patchIdBodySchema = z.object({
  username: usernameSchema.optional(),
  avatarUrl: avatarUrlSchemaOptionalNullable,
  password: passwordSchema.optional(),
  newPassword: passwordSchema.optional(),
  confirmPassword: passwordSchema.optional(),
});

export type PatchIdRequestDTO = z.infer<typeof patchIdBodySchema>;
