import type { GETCategoriesParams } from "@packages/api-sdk";

export const categoriesKeys = {
  list: (params?: GETCategoriesParams) => [
    "categories",
    ...Object.values(params ?? {}),
  ],
};
