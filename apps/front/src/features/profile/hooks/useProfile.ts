import { useApi } from "@/lib/api/services";
import type { Profile } from "../domain/Profile";
import type { ProfileStats } from "../domain/ProfileStats";

export function useProfile() {
  const api = useApi();
  const { data, isLoading, error } = api.users.getMe();
  const user = data?.data;

  // Mapper la réponse API vers vos domaines
  const profile: Profile | null = user
    ? {
        username: user.username ?? "",
        avatarUrl: /*user.avatarUrl ??*/ "",
        followersCount: /*user.followersCount ??*/ 0,
        followingCount: /*user.followingCount ??*/ 0,
      }
    : null;

  const stats: ProfileStats | null = user
    ? {
        totalSeriesHours: /*user.totalSeriesHours ??*/ 0,
        totalMovieHours: /*user.totalMovieHours ??*/ 0,
        totalEpisodes: /*user.totalEpisodes ??*/ 0,
        totalMovies: /*user.totalMovies ??*/ 0,
      }
    : null;

  return { profile, stats, isLoading, error };
}
