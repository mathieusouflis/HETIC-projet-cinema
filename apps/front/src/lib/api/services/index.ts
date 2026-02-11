import { authService } from "./auth";
import { contentService } from "./contents";

export const getApi = () => ({
  auth: authService,
  contents: contentService,
});
