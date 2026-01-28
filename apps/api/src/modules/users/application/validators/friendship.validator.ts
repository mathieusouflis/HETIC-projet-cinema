import z from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields";

export const friendshipStatus = z.enum(["pending", "accepted", "rejected"]);

export const friendshipValidator = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  friendId: uuidSchema,
  status: friendshipStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});
