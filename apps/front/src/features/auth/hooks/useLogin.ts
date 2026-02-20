import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { getApi } from "@/lib/api/services";
import { useAuth } from "../stores/auth.store";

export function useLogin() {
  const services = getApi();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await services.auth.login({
        email,
        password,
      });

      const { accessToken, user } = response.data;

      setAccessToken(accessToken);
      setUser(user);

      navigate({ to: "/" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;

      setError(
        error.response?.data?.message ??
          "Une erreur est survenue lors de la connexion."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    login,
    isLoading,
    error,
  };
}
