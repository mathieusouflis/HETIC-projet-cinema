import { z } from "zod";
import { publicUserSchema } from "../../../../users/application/schema/user.schema";
import { tokenSchema } from "../../../../../shared/services/token";

export const authResponseDataValidator = z.object({
  user: publicUserSchema,
  accessToken: tokenSchema,
});

export type AuthResponseDTO = z.infer<typeof authResponseDataValidator>;
