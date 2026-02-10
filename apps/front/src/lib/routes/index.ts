export const useRoutes = () => {
  return {
    home: "/",
    profile: "/me",
    watchlist: "/watchlist",
    messages: "/messages",
    calendar: "/calendar",
    search: {
      root: "/search",
      query: (query: string) => `/search?q=${query}`,
    },
  };
};
