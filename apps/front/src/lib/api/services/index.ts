import type { GETCategoriesParams } from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { authService } from "./auth";
import { contentService, queryContentService } from "./contents";
import { conversationService, queryConversationService } from "./conversations";
import { friendshipService, queryFriendshipService } from "./friendships";
import { categorieService } from "./genres";
import { categoriesKeys } from "./genres/keys";
import { messageService, queryMessageService } from "./messages";
import { queryPeoplesService } from "./peoples";
import { queryUserService, usersService } from "./users";
import { queryWatchlistService, watchlistService } from "./watchlists";

/**
 * getApi() — imperative, safe to call anywhere (event handlers, effects, outside React).
 * Returns plain async functions. Use for onClick, form onSubmit, etc.
 *
 * @example
 * const api = getApi();
 * const result = await api.users.patchMe({ username: "foo" });
 */
export const getApi = () => ({
  auth: authService,
  users: usersService,
  contents: contentService,
  categories: categorieService,
  watchlsit: watchlistService,
  conversations: conversationService,
  messages: messageService,
  friendships: friendshipService,
});

/**
 * useApi() — reactive, hook-based. Must be called at component top-level (React hooks rules).
 * Returns React Query hooks (useQuery / useMutation) for data-fetching and mutations.
 *
 * @example
 * const api = useApi();
 * const { data } = api.contents.discover({ withCategory: "true" });
 * const { mutate, isPending } = api.users.patchMe();
 */
export const useApi = () => {
  return {
    auth: authService,

    users: queryUserService,

    contents: queryContentService,

    categories: {
      list: (props?: GETCategoriesParams) =>
        useQuery({
          queryKey: categoriesKeys.list(props),
          queryFn: () => categorieService.list(props),
        }),
    },

    peoples: queryPeoplesService,

    watchlist: queryWatchlistService,

    conversations: queryConversationService,

    messages: queryMessageService,

    friendships: queryFriendshipService,
  };
};
