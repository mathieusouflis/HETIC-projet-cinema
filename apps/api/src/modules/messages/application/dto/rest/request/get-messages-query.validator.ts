import z from "zod";

export const getMessagesQueryValidator = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30).optional(),
});

export type GetMessagesQuery = z.infer<typeof getMessagesQueryValidator>;
