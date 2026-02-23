import type { GETCategoriesParams } from "@packages/api-sdk";

const BASEKEY = "categories";
export const categoriesKeys = {
  list: (params?: GETCategoriesParams) => [
    BASEKEY,
    "list",
    ...Object.values(params ?? {}),
  ],
};
