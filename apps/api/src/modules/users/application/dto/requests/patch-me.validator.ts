import { z } from "zod";
import { avatarUrlSchemaOptionalNullable } from "../../../../../shared/schemas/fields/url.schema";
import { usernameSchemaOptional } from "../../../../../shared/schemas";


export const patchMeBodySchema = z.object({
  username: usernameSchemaOptional,
  avatarUrl:avatarUrlSchemaOptionalNullable
});
