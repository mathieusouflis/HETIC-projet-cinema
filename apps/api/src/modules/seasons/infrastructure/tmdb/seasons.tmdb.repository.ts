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

export class SeasonTmdbRepository {}
