import {
  gETAuthMe,
  type POSTAuthLoginBody,
  type POSTAuthRegisterBody,
  pOSTAuthLogin,
  pOSTAuthLogout,
  pOSTAuthRefresh,
  pOSTAuthRegister,
} from "@packages/api-sdk";

export const authService = {
  register: async (params: POSTAuthRegisterBody) => {
    const response = await pOSTAuthRegister(params);
    return response.data;
  },

  login: async (params: POSTAuthLoginBody) => {
    const response = await pOSTAuthLogin(params);
    return response.data;
  },

  logout: async () => {
    await pOSTAuthLogout();
  },

  refresh: async () => {
    const response = await pOSTAuthRefresh();
    return response.data;
  },

  me: async () => {
    const response = await gETAuthMe();
    return response.data;
  },
};
