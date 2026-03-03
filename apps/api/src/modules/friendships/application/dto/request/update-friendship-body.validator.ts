import z from "zod";

export const updateFriendshipBodyValidator = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export type UpdateFriendshipBody = z.infer<
  typeof updateFriendshipBodyValidator
>;
