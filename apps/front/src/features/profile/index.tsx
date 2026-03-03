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
    <div className="flex flex-col gap-6 p-4">
      <ProfileHeader profile={profile} />
      <ProfileTabs stats={stats} />
    </div>
  );
}
