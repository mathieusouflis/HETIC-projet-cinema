import { useNavigate } from "@tanstack/react-router";
import { queryAuthService } from "@/lib/api/services/auth";

type VerifyEmailState = {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
};

export function useVerifyEmail(token: string | undefined): VerifyEmailState {
  const navigate = useNavigate();

  const { isPending, isSuccess, isError } = queryAuthService.verifyEmail(
    token,
    () => navigate({ to: "/" })
  );

  if (!token) {
    return { isLoading: false, isSuccess: false, error: "Missing token." };
  }

  return {
    isLoading: isPending,
    isSuccess,
    error: isError ? "This link is invalid or has expired." : null,
  };
}
