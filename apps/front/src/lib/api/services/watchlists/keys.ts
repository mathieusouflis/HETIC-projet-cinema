export const watchlistKeys = {
  all: (userId: string) => ["watchlists", userId] as const,
  getId: (userId: string, id: string) =>
    [...watchlistKeys.all(userId), id] as const,
};
