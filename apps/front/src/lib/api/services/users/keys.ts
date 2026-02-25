const BASEKEY = "users";
export const usersKeys = {
  getId: (id: string) => [BASEKEY, "get", id],
};
