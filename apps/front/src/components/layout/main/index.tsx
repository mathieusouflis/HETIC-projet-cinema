import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/stores/auth.store";
import { SearchProvider } from "@/features/search-modal";
import { authService } from "@/lib/api/services/auth";
import { AssideNav } from "./nav/asside-nav";
import { BottomNav } from "./nav/bottom-nav";

export const MainLayout = () => {
  const {
    accessToken,
    user,
    isLoading,
    setAccessToken,
    setUser,
    setLoading,
    clear,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const res = await authService.refresh();
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } catch {
        clear();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user) {
    navigate({ to: "/login", replace: true });
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row-reverse min-h-screen gap-6">
      <main className="flex-1 my-5 mx-5 lg:ml-0 overflow-x-hidden overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <AssideNav />
      <SearchProvider />
    </div>
  );
};
