const BASEKEY = "users";

export const usersKeys = {
  me: () => [BASEKEY, "me"],
  getId: (id: string) => [BASEKEY, "get", id],
};
