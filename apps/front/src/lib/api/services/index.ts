import { authService } from "./auth";
import { contentService } from "./content";

export const getApi = () => ({
  auth: authService,
  contents: contentService,
});
