import { useState } from "react";
import type { Profile } from "../domain/Profile";
import type { ProfileStats } from "../domain/ProfileStats";

export function useProfile() {
  const [profile] = useState<Profile>({
    username: "Callista",
    avatarUrl: "/avatar.png",
    followersCount: 142,
    followingCount: 89,
  });

  const [stats] = useState<ProfileStats>({
    totalSeriesHours: 128,
    totalMovieHours: 64,
    totalEpisodes: 342,
    totalMovies: 87,
  });

  return {
    profile,
    stats,
  };
}
