import { type GETCategoriesParams, gETCategories } from "@packages/api-sdk";

const list = async (props?: GETCategoriesParams) => {
  const response = await gETCategories(props);
  return response.data.data;
};

export const categorieService = {
  list,
};
