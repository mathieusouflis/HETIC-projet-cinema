import { z } from "zod";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";

export const patchIdParamsSchema = z.object({
  id: uuidSchema,
});

export const patchIdBodySchema = z.object({
  username: usernameSchema.optional(),
  avatarUrl: avatarUrlSchemaOptionalNullable,
});

export type PatchIdRequestDTO = z.infer<typeof patchIdBodySchema>;
