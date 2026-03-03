const BASEKEY = "conversations";

export const conversationKeys = {
  all: (userId: string) => [BASEKEY, userId] as const,
  detail: (userId: string, id: string) =>
    [...conversationKeys.all(userId), id] as const,
};
