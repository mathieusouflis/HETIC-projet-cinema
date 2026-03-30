import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/lib/api/parse-error";
import { getApi } from "@/lib/api/services";

const COOLDOWN_SECONDS = 60;

export function useResendVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resend = useCallback(
    async (email: string) => {
      if (isLoading || cooldown > 0) {
        return;
      }

      try {
        setIsLoading(true);

        await getApi().auth.resendVerification({ email });

        toast.success("Email sent!");
        startCooldown();
      } catch (err: unknown) {
        const { globalError } = parseApiError(err);
        toast.error(globalError ?? "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, cooldown, startCooldown]
  );

  return { resend, isLoading, cooldown };
}
