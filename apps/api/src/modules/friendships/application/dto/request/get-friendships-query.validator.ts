import z from "zod";

export const getFriendshipsQueryValidator = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
});

export type GetFriendshipsQuery = z.infer<typeof getFriendshipsQueryValidator>;
