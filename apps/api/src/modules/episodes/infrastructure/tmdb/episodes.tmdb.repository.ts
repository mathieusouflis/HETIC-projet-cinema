import { TmdbService } from "../../../../shared/services/tmdb";
import type { TMDBPeople } from "../../../movies/infrastructure/database/repositories/tmdb-movies.repository";

export type TMDBEpisode = {
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  still_path: string;
  air_date: string;
  episode_number: number;
  guest_stars: TMDBPeople[];
  crew: TMDBPeople[];
};

export class EpisodeTmdbRepository {
  private readonly tmdbService: TmdbService;

  constructor() {
    this.tmdbService = new TmdbService();
  }

  async getEpisode(
    TmdbSerieId: number,
    seasonNumber: number,
    episodeNumber: number
  ) {
    return (await this.tmdbService.request(
      "GET",
      `/tv/${TmdbSerieId}/season/${seasonNumber}/episode/${episodeNumber}`
    )) as TMDBEpisode;
  }
}
