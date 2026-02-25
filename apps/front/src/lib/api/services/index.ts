import { authService } from "./auth";
import { contentService } from "./contents";
import { categorieService } from "./genres";
import { usersService } from "./users";

export const getApi = () => ({
  auth: authService,
  contents: contentService,
  categories: categorieService,
  users: usersService,
});
