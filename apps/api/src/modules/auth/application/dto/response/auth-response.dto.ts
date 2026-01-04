import { z } from "zod";
import { publicUserSchema } from "../../../../users/application/schema/user.schema";
import { tokensSchema } from "../../../../../shared/services/token";

export const authResponseDataValidator = z.object({
  user: publicUserSchema,
  tokens: tokensSchema,
});

export type AuthResponseDTO = z.infer<typeof authResponseDataValidator>;
