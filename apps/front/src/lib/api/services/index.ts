import type { GETCategoriesParams } from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { authService } from "./auth";
import { contentService, queryContentService } from "./contents";
import { categorieService } from "./genres";
import { categoriesKeys } from "./genres/keys";
import { queryUserService, usersService } from "./users";

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
  };
};
