import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const getUserFollowersParamsValidator = z.object({
  id: uuidSchema,
});

export type GetUserFollowersParams = z.infer<
  typeof getUserFollowersParamsValidator
>;
