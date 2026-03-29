import { gETAuthMe, gETUsersId } from "@packages/api-sdk";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main";
import { useAuth } from "@/features/auth/stores/auth.store";

export const Route = createFileRoute("/_main")({
  component: MainBaseComponent,
});

function AuthHydrator() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      return;
    }
    gETAuthMe()
      .then(async (meRes) => {
        const userId = meRes.data.data.userId;
        const profileRes = await gETUsersId(userId);
        setUser(profileRes.data.data);
      })
      .catch(() => {
        // No valid session — leave user as null, router will redirect to login
      });
  }, [setUser, user]);

  return null;
}

function MainBaseComponent() {
  return (
    <>
      <AuthHydrator />
      <MainLayout />
    </>
  );
}
