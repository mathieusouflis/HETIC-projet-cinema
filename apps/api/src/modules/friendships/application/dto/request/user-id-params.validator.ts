import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const userIdParamsValidator = z.object({
  userId: uuidSchema,
});

export type UserIdParams = z.infer<typeof userIdParamsValidator>;
