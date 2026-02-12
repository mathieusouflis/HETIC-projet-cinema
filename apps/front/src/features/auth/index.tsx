import { Button } from "@/components/ui/button";
import { getApi } from "@/lib/api/services";
import { useAuth } from "./stores/auth.store";

export function Login() {
  const { user, accessToken, setAccessToken, setUser } = useAuth();
  const api = getApi();

  const login = async () => {
    const response = await api.auth.login({
      email: "user@example.com",
      password: "Password123:)",
    });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  return (
    <div className="flex flex-col">
      <Button className="w-fit" onClick={login}>
        Login
      </Button>
      <span>
        Access Token : {accessToken}
        User : {JSON.stringify(user, null, 2)}
      </span>
    </div>
  );
}
