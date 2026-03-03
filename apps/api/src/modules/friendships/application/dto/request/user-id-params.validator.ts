import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const userIdParamsValidator = z.object({
  userId: uuidSchema,
});

export type UserIdParams = z.infer<typeof userIdParamsValidator>;
