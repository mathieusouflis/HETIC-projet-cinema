import { useNavigate } from "@tanstack/react-router";
import { getApi } from "@/lib/api/services";
import { useAuth } from "../stores/auth.store";

export function useLogin() {
  const services = getApi();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  async function login(email: string, password: string) {
    const response = await services.auth.login(email, password);

    const { accessToken, user } = response.data;

    setAccessToken(accessToken);
    setUser(user);

    navigate({ to: "." });
  }

  return { login };
}
