import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileTabs } from "@/features/profile/components/ProfileTabs";
import { useProfile } from "@/features/profile/hooks/useProfile";

export function ProfilePage() {
  const { profile, stats } = useProfile();

  return (
    <div className="flex flex-col gap-6 p-4">
      <ProfileHeader profile={profile} />
      <ProfileTabs stats={stats} />
    </div>
  );
}
