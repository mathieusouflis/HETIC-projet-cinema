import {
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

  login: async (email: string, password: string) => {
    const response = await pOSTAuthLogin({
      email,
      password,
    });

    return response.data;
  },

  logout: async () => {
    const { clear } = useAuth();

    await pOSTAuthLogout();
    clear();
  },

  refresh: async () => {
    const { setAccessToken } = useAuth();
    const response = await pOSTAuthRefresh();

    setAccessToken(response.data.data.accessToken);
  },
};
