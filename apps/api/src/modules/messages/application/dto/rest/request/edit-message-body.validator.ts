import z from "zod";

export const editMessageBodyValidator = z.object({
  content: z.string().min(1).max(4000),
});

export type EditMessageBody = z.infer<typeof editMessageBodyValidator>;
