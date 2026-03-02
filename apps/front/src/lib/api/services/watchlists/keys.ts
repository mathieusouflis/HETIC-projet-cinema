export const watchlistKeys = {
  all: ["watchlists"] as const,
  getId: (id: string) => [...watchlistKeys.all, id] as const,
};
