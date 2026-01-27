import { z } from "zod";
import { Shared } from "../../../../../shared";
import { publicUserSchema } from "../../../../users/application/schema/user.schema";

export const authResponseDataValidator = z.object({
  user: publicUserSchema,
  accessToken: Shared.Services.Token.Schemas.tokenSchema,
});

export type AuthResponseDTO = z.infer<typeof authResponseDataValidator>;
