import { authService } from "./auth";

export const getApi = () => ({
  auth: authService,
});
