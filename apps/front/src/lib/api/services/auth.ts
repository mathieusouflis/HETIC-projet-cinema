import {
  gETAuthMe,
  type POSTAuthLoginBody,
  type POSTAuthRegisterBody,
  pOSTAuthLogin,
  pOSTAuthLogout,
  pOSTAuthRefresh,
  pOSTAuthRegister,
} from "@packages/api-sdk";

import { useAuth } from "@/features/auth/stores/auth.store";

export const authService = {
  register: async (email: string, password: string, username: string) => {
    const response = await pOSTAuthRegister({
      email,
      password,
      username,
    });

    return response.data.data;
  },

  login: async (params: POSTAuthLoginBody) => {
    const response = await pOSTAuthLogin(params);
    return response.data;
  },

  logout: async () => {
    await pOSTAuthLogout();

    // ⚠️ getState = OK dans un service
    useAuth.getState().clear();
  },

  refresh: async () => {
    const response = await pOSTAuthRefresh();

    useAuth.getState().setAccessToken(response.data.data.accessToken);
  },
};
