import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getApi } from "@/lib/api/services";

export type RegisterErrorCode =
  | "EMAIL_ALREADY_EXISTS"
  | "USERNAME_TAKEN"
  | "UNKNOWN_ERROR";

export class RegisterError extends Error {
  constructor(
    public code: RegisterErrorCode,
    message?: string
  ) {
    super(message ?? code);
    this.name = "RegisterError";
  }
}

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

      toast.success("Account created successfully 👏");
      navigate({ to: "/login" });

      return response.data;
    } catch (err: unknown) {
      const error = err as { code?: RegisterErrorCode };

      if (error.code === "EMAIL_ALREADY_EXISTS") {
        throw { code: "EMAIL_ALREADY_EXISTS" as RegisterErrorCode };
      }

      if (error.code === "USERNAME_TAKEN") {
        throw { code: "USERNAME_TAKEN" as RegisterErrorCode };
      }

      throw { code: "UNKNOWN_ERROR" as RegisterErrorCode };
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading };
}
