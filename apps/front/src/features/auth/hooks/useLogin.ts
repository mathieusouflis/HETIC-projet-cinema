import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { parseApiError } from "@/lib/api/parse-error";
import { getApi } from "@/lib/api/services";
import { useAuth } from "../stores/auth.store";

export type LoginApiError = {
  fieldErrors: Record<string, string>;
  globalError: string | null;
};

export function useLogin() {
  const services = getApi();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    try {
      setIsLoading(true);

      const response = await services.auth.login({ email, password });
      const { accessToken, user } = response.data;

      setAccessToken(accessToken);
      setUser(user);

      navigate({ to: "/" });
    } catch (err: unknown) {
      const { fieldErrors, globalError } = parseApiError(err);
      throw { fieldErrors, globalError } satisfies LoginApiError;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading };
}
