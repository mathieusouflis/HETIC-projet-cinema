import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getApi } from "@/lib/api/services";
import { useAuth } from "../stores/auth.store";

type VerifyEmailState = {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
};

export function useVerifyEmail(token: string | undefined) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [state, setState] = useState<VerifyEmailState>({
    isLoading: !!token,
    isSuccess: false,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setState({
        isLoading: false,
        isSuccess: false,
        error: "Missing token.",
      });
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const result = await getApi().auth.verifyEmail({ token: token! });

        if (cancelled) return;

        const { user } = result.data;
        setUser(user);
        navigate({ to: "/" });
        setState({ isLoading: false, isSuccess: true, error: null });
      } catch {
        if (cancelled) return;
        setState({
          isLoading: false,
          isSuccess: false,
          error: "This link is invalid or has expired.",
        });
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, setUser, navigate]);

  return state;
}
