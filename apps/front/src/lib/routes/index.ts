export const baseRoutes = {
  home: "/",
  profile: "/me",
  watchlist: "/watchlist",
  messages: "/messages",
  community: "/community",
  calendar: "/calendar",
  contents: {
    detail: (id: string) => `/contents/${id}`,
  },
  search: {
    root: "/search",
    query: (query: string) => `/search?q=${query}`,
  },
  settings: "/settings",
  login: "/login",
  register: "/register",
};

export const useRoutes = () => {
  return baseRoutes;
};
