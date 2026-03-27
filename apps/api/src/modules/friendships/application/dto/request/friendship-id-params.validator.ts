import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const friendshipIdParamsValidator = z.object({
  id: uuidSchema,
});

export type FriendshipIdParams = z.infer<typeof friendshipIdParamsValidator>;
