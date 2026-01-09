import { z } from "zod";
import { Shared } from "../../../../../shared";

export const loginValidator = z.object({
  email: Shared.Schemas.Fields.emailSchema,
  password: z.string(),
});

export type LoginDTO = z.infer<typeof loginValidator>;
