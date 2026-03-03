const BASEKEY = "friendships";

export const friendshipKeys = {
  all: () => [BASEKEY] as const,
  byStatus: (status: string) => [BASEKEY, status] as const,
};
