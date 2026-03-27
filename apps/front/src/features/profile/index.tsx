import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileTabs } from "@/features/profile/components/ProfileTabs";
import { useProfile } from "@/features/profile/hooks/useProfile";

export function ProfilePage() {
  const { profile, stats, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Chargement...</div>
    );
  }
  if (error) {
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue";

    return <div className="p-8 text-center text-destructive">{message}</div>;
  }
  if (!profile || !stats) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <ProfileHeader profile={profile} />
      <ProfileTabs stats={stats} />
    </div>
  );
}
