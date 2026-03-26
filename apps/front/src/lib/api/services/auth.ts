import {
  gETAuthMe,
  type POSTAuthForgotPasswordBody,
  type POSTAuthLoginBody,
  type POSTAuthRegisterBody,
  type POSTAuthResendVerificationBody,
  type POSTAuthResetPasswordBody,
  type POSTAuthVerifyEmailBody,
  pOSTAuthForgotPassword,
  pOSTAuthLogin,
  pOSTAuthLogout,
  pOSTAuthRefresh,
  pOSTAuthRegister,
  pOSTAuthResendVerification,
  pOSTAuthResetPassword,
  pOSTAuthVerifyEmail,
} from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/stores/auth.store";

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

  forgotPassword: async (params: POSTAuthForgotPasswordBody) => {
    const response = await pOSTAuthForgotPassword(params);
    return response.data;
  },

  resetPassword: async (params: POSTAuthResetPasswordBody) => {
    const response = await pOSTAuthResetPassword(params);
    return response.data;
  },

  verifyEmail: async (params: POSTAuthVerifyEmailBody) => {
    const response = await pOSTAuthVerifyEmail(params);
    return response.data;
  },

  resendVerification: async (params: POSTAuthResendVerificationBody) => {
    const response = await pOSTAuthResendVerification(params);
    return response.data;
  },
};

export const queryAuthService = {
  verifyEmail: (token: string | undefined, onSuccess?: () => void) =>
    useQuery({
      queryKey: ["verify-email", token],
      queryFn: async () => {
        const data = await authService.verifyEmail({ token: token! });
        useAuth.getState().setUser(data.data.user);
        onSuccess?.();
        return data;
      },
      enabled: !!token,
      retry: false,
      staleTime: Infinity,
    }),
};
