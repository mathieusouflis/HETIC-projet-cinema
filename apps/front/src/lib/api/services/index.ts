import { authService } from "./auth";
import { contentService } from "./contents";
import { categorieService } from "./genres";

export const getApi = () => ({
  auth: authService,
  contents: contentService,
  categories: categorieService,
});
