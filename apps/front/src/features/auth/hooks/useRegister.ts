import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getApi } from "@/lib/api/services";

export function useRegister() {
  const services = getApi();
  const navigate = useNavigate();

  async function register(email: string, username: string, password: string) {
    try {
      await services.auth.register(email, password, username);
      toast.success("Account created successfully 👏");
      navigate({ to: "/login" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed");
      }
    }
  }

  return { register };
}
