import z from "zod";

export const sendMessageBodyValidator = z.object({
  content: z.string().min(1).max(4000),
});

export type SendMessageBody = z.infer<typeof sendMessageBodyValidator>;
