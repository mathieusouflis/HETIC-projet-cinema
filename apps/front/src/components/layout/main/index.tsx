import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/stores/auth.store";
import { SearchProvider } from "@/features/search-modal";
import { authService } from "@/lib/api/services/auth";
import { AssideNav } from "./nav/asside-nav";
import { BottomNav } from "./nav/bottom-nav";

export const MainLayout = () => {
  const { user, setAccessToken, setUser, setLoading } = useAuth();

  useEffect(() => {
    if (user) {
      return;
    }

    const refreshToken = async () => {
      setLoading(true);
      const refreshResponse = await authService.refresh();
      console.log(refreshResponse);
      setAccessToken(refreshResponse.data.accessToken);
      setUser(refreshResponse.data.user);
      setLoading(false);
    };

    refreshToken();
  }, [user, setUser, setAccessToken, setLoading]);

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
