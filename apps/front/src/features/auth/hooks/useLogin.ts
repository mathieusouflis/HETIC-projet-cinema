import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getApi } from "@/lib/api/services";
import { useAuth } from "../stores/auth.store";

export function useLogin() {
  const services = getApi();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  async function login(email: string, password: string) {
    try {
      const response = await services.auth.login(email, password);

      const { accessToken, user } = response.data;

      setAccessToken(accessToken);
      setUser(user);

      toast.success("Welcome back 👋");

      navigate({ to: "." });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error("Login failed");
    }
  }

  return { login };
}
