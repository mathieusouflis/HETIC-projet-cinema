export const watchlistKeys = {
  all: (userId: string) => ["watchlists", userId] as const,
  getId: (userId: string, contentId: string) =>
    ["watchlists", userId, "content", contentId] as const,
};
