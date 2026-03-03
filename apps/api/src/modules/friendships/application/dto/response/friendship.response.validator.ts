import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const friendshipResponseValidator = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  friendId: uuidSchema,
  status: z.enum(["pending", "accepted", "rejected"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FriendshipResponse = z.infer<typeof friendshipResponseValidator>;
