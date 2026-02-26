import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/lib/api/parse-error";
import { getApi } from "@/lib/api/services";

export type RegisterApiError = {
  fieldErrors: Record<string, string>;
  globalError: string | null;
};

export function useRegister() {
  const services = getApi();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function register(email: string, username: string, password: string) {
    try {
      setIsLoading(true);

      const response = await services.auth.register({
        email,
        username,
        password,
      });

      toast.success("Account created successfully!");
      navigate({ to: "/login" });

      return response.data;
    } catch (err: unknown) {
      const { fieldErrors, globalError } = parseApiError(err);
      throw { fieldErrors, globalError } satisfies RegisterApiError;
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading };
}
