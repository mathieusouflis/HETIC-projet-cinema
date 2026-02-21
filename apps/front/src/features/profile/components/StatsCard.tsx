import type { ProfileStats } from "../domain/ProfileStats";

type Props = {
  stats: ProfileStats;
};

export function StatsCards({ stats }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Series</h3>
        <p>{stats.totalSeriesHours}h watched</p>
        <p className="text-sm text-muted-foreground">
          {stats.totalEpisodes} episodes
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Movies</h3>
        <p>{stats.totalMovieHours}h watched</p>
        <p className="text-sm text-muted-foreground">
          {stats.totalMovies} movies
        </p>
      </div>
    </div>
  );
}
