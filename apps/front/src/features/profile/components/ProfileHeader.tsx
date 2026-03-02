import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profile } from "../domain/Profile";

type Props = {
  profile: Profile;
};

export function ProfileHeader({ profile }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top section: avatar + username */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback>
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{profile.username}</h2>

          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
            <span>
              <span className="font-medium text-foreground">
                {profile.followingCount}
              </span>{" "}
              following
            </span>

            <span>
              <span className="font-medium text-foreground">
                {profile.followersCount}
              </span>{" "}
              followers
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm">
          Share
        </Button>

        <Button size="sm">Edit Profile</Button>
      </div>
    </div>
  );
}
