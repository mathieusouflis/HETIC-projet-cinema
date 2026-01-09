import { z } from "zod";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";
import { Shared } from "../../../../../shared";

export const patchMeBodySchema = z.object({
  username: Shared.Schemas.Fields.usernameSchemaOptional,
  avatarUrl: avatarUrlSchemaOptionalNullable,
});
