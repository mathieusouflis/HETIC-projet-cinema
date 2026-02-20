import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { getApi } from "@/lib/api/services";
import { useAuth } from "../stores/auth.store";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "UNKNOWN_ERROR";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

export function useLogin() {
  const services = getApi();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    try {
      setIsLoading(true);

      const response = await services.auth.login({
        email,
        password,
      });

      const { accessToken, user } = response.data;

      setAccessToken(accessToken);
      setUser(user);

      navigate({ to: "/" });
    } catch (err: unknown) {
      const error = err as AxiosError;

      const status = error.response?.status;

      if (status === 401) {
        throw new AuthError("INVALID_CREDENTIALS");
      }

      if (status === 404) {
        throw new AuthError("USER_NOT_FOUND");
      }

      throw new AuthError("UNKNOWN_ERROR");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    login,
    isLoading,
  };
}
