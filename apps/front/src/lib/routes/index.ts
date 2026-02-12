export const baseRoutes = {
  home: "/",
  profile: "/me",
  watchlist: "/watchlist",
  messages: "/messages",
  calendar: "/calendar",
  contents: {
    detail: (id: string) => `/contents/${id}`,
  },
  search: {
    root: "/search",
    query: (query: string) => `/search?q=${query}`,
  },
  login: "/login",
  register: "/register",
};

export const useRoutes = () => {
  return baseRoutes;
};
