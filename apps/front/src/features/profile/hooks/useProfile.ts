import { useApi } from "@/lib/api/services";
import type { Profile } from "../domain/Profile";
import type { ProfileStats } from "../domain/ProfileStats";

type GetMeProfileData = {
  username: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  stats: {
    totalSeriesHours: number;
    totalMovieHours: number;
    totalEpisodes: number;
    totalMovies: number;
  };
};

export function useProfile() {
  const api = useApi();
  const { data: meResponse, isLoading, error } = api.users.getMe();
  const user = (meResponse?.data as GetMeProfileData | undefined) ?? null;

  // GET /users/me renvoie profil + stats
  const profile: Profile | null = user
    ? {
        username: user.username,
        avatarUrl: user.avatarUrl ?? "",
        followersCount: user.followersCount ?? 0,
        followingCount: user.followingCount ?? 0,
      }
    : null;

  const stats: ProfileStats | null = user
    ? {
        totalSeriesHours: user.stats?.totalSeriesHours ?? 0,
        totalMovieHours: user.stats?.totalMovieHours ?? 0,
        totalEpisodes: user.stats?.totalEpisodes ?? 0,
        totalMovies: user.stats?.totalMovies ?? 0,
      }
    : null;

  return { profile, stats, isLoading, error };
}
