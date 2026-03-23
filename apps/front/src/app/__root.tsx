import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/stores/auth.store";
import { gETAuthMe, gETUsersId } from "@/lib/api";
import { queryClient } from "@/lib/api/client";

export const Route = createRootRoute({
  component: RootComponent,
});

function AuthHydrator() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) return;
    gETAuthMe()
      .then(async (meRes) => {
        const userId = meRes.data.data.userId;
        const profileRes = await gETUsersId(userId);
        setUser(profileRes.data.data);
      })
      .catch(() => {
        // No valid session — leave user as null, router will redirect to login
      });
  }, []);

  return null;
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator />
      <Outlet />
    </QueryClientProvider>
  );
}
