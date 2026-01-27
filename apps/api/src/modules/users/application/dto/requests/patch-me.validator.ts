import { z } from "zod";
import { Shared } from "../../../../../shared";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";

export const patchMeBodySchema = z.object({
  username: Shared.Schemas.Fields.usernameSchemaOptional,
  avatarUrl: avatarUrlSchemaOptionalNullable,
});
