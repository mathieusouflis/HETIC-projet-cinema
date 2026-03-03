import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const friendshipIdParamsValidator = z.object({
  id: uuidSchema,
});

export type FriendshipIdParams = z.infer<typeof friendshipIdParamsValidator>;
