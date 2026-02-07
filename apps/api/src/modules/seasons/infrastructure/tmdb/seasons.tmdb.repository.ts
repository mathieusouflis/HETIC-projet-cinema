import { logger } from "@packages/logger";
import { TmdbService } from "../../../../shared/services/tmdb";
import type { TMDBEpisode } from "../../../episodes/infrastructure/tmdb/episodes.tmdb.repository";
import type { TMDBMovieProviders } from "../../../movies/infrastructure/database/repositories/tmdb-movies.repository";

export type TMDBSeason = {
  id: number;
  air_date: string;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episodes: TMDBEpisode[];
  networks: TMDBMovieProviders[]; // Related streaming platforms;
};

export class SeasonTmdbRepository {
  private readonly tmdbService: TmdbService;

  constructor() {
    this.tmdbService = new TmdbService();
  }

  async getSeason(tmdbSerieId: number, seasonNumber: number) {
    return (await this.tmdbService.request(
      "GET",
      `/tv/${tmdbSerieId}/season/${seasonNumber}`
    )) as TMDBSeason;
  }

  async getAllSeasons(tmdbSerieId: number, seasonsNumber: number[]) {
    const seasons: TMDBSeason[] = [];

    for (const seasonNumber of seasonsNumber) {
      try {
        const season = await this.getSeason(tmdbSerieId, seasonNumber);
        seasons.push(season);
      } catch {
        logger.error(
          `Season ${seasonNumber} not found for serie ${tmdbSerieId}           (CONTINUE)`
        );
      }
    }
    return seasons;
  }
}
