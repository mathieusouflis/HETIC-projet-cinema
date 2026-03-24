import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { parseApiError } from "@/lib/api/parse-error";
import { getApi } from "@/lib/api/services";

export type ResetPasswordApiError = {
  fieldErrors: Record<string, string>;
  globalError: string | null;
};

export function useResetPassword() {
  const services = getApi();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      setIsLoading(true);
      await services.auth.resetPassword({ token, newPassword });
      navigate({ to: "/login", search: { reset: "success" } });
    } catch (err: unknown) {
      const { fieldErrors, globalError } = parseApiError(err);
      throw { fieldErrors, globalError } satisfies ResetPasswordApiError;
    } finally {
      setIsLoading(false);
    }
  }

  return { resetPassword, isLoading };
}
