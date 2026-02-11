import { type GETCategoriesParams, gETCategories } from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { categoriesKeys } from "./keys";

export const categorieService = {
  list: (props?: GETCategoriesParams) => {
    return useQuery({
      queryFn: async () => {
        const response = await gETCategories(props);
        return response.data.data;
      },
      queryKey: [categoriesKeys.list(props)],
    });
  },
};
