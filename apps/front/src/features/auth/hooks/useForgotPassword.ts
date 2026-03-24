import { useState } from "react";
import { parseApiError } from "@/lib/api/parse-error";
import { getApi } from "@/lib/api/services";

export type ForgotPasswordApiError = {
  fieldErrors: Record<string, string>;
  globalError: string | null;
};

export function useForgotPassword() {
  const services = getApi();
  const [isLoading, setIsLoading] = useState(false);

  async function requestReset(email: string): Promise<void> {
    try {
      setIsLoading(true);
      await services.auth.forgotPassword({ email });
    } catch (err: unknown) {
      const { fieldErrors, globalError } = parseApiError(err);
      throw { fieldErrors, globalError } satisfies ForgotPasswordApiError;
    } finally {
      setIsLoading(false);
    }
  }

  return { requestReset, isLoading };
}
