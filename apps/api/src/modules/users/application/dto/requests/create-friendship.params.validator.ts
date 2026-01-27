import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const createFrienshipParamsValidator = z.object({
  id: uuidSchema,
});

export type CreateFrienshipParams = z.infer<
  typeof createFrienshipParamsValidator
>;
