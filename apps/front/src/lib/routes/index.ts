export const useRoutes = () => {
  return {
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
  };
};
