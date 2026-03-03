const BASEKEY = "messages";

export const messageKeys = {
  conversation: (conversationId: string) =>
    [BASEKEY, "conversation", conversationId] as const,
};
