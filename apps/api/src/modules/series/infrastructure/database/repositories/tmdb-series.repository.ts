import { logger } from "@packages/logger";
import { BaseTMDBRepository } from "../../../../../shared/infrastructure/repositories/base-tmdb-repository";
import type { TMDBGenre } from "../../../../../shared/infrastructure/repositories/composite-repository-types";
import type {
  TMDBMovieCast,
  TMDBMovieProviders,
  TMDBPeople,
  TMDBProvider,
} from "../../../../movies/infrastructure/database/repositories/tmdb-movies.repository";
import {
  SeasonTmdbRepository,
  type TMDBSeason,
} from "../../../../seasons/infrastructure/tmdb/seasons.tmdb.repository";
import type { CreateSerieProps } from "../../../domain/entities/serie.entity";

export type SerieWithGenres = CreateSerieProps & {
  genres?: Array<TMDBGenre>;
  providers?: TMDBProvider[];
  cast?: TMDBPeople[];
  seasons?: TMDBSeason[];
};

export type TMDBSerieDiscoverResult = {
  backdrop_path: string | null;
  first_air_date: string | null;
  genre_ids: number[];
  id: number;
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string | null;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
};

export type TMDBSerieDetail = {
  adult: boolean;
  backdrop_path: string | null;
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }>;
  episode_run_time: number[];
  first_air_date: string | null;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string | null;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string | null;
  name: string;
  networks: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  seasons: Array<{
    air_date: string | null;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string | null;
  type: string;
  vote_average: number;
  vote_count: number;
};

/**
 * TMDB Series Repository
 * Handles fetching TV series data from TMDB API
 */
export class TMDBSeriesRepository extends BaseTMDBRepository<
  TMDBSerieDiscoverResult,
  SerieWithGenres
> {
  protected readonly discoverEndpoint = "discover/tv";
  protected readonly searchEndpoint = "search/tv";
  protected readonly detailEndpoint = "tv";
  protected readonly videoEndpoint = "tv/{id}/videos";
  protected readonly contentTypeName = "series";
  private readonly seasonsTmdbRepository: SeasonTmdbRepository;

  constructor() {
    super();
    this.seasonsTmdbRepository = new SeasonTmdbRepository();
  }

  /**
   * Get detailed information about a series from TMDB
   */
  async detail(id: number): Promise<SerieWithGenres> {
    try {
      const result = await this.tmdbService.request<TMDBSerieDetail>(
        "GET",
        `${this.detailEndpoint}/${id}`
      );

      const providers = await this.tmdbService.request<TMDBMovieProviders>(
        "GET",
        `${this.detailEndpoint}/${id}/watch/providers`
      );

      const credits = await this.tmdbService.request<TMDBMovieCast>(
        "GET",
        `${this.detailEndpoint}/${id}/credits`
      );

      const seasons = await this.seasonsTmdbRepository.getAllSeasons(
        id,
        Array.from({ length: result.number_of_seasons }, (_, i) => i + 1)
      );

      const trailerUrl = await this.getTrailerUrl(id);

      const serieProps: SerieWithGenres = {
        type: "serie",
        slug: result.id.toString(),
        title: result.name,
        originalTitle: result.original_name,
        synopsis: result.overview || null,
        posterUrl: result.poster_path
          ? `${this.TMDB_IMAGE_BASE_URL}${result.poster_path}`
          : null,
        backdropUrl: result.backdrop_path
          ? `${this.TMDB_IMAGE_BASE_URL}${result.backdrop_path}`
          : null,
        trailerUrl: trailerUrl,
        releaseDate: result.first_air_date || null,
        tmdbId: result.id,
        averageRating: result.vote_average.toString(),
        totalRatings: result.vote_count,
        totalViews: 0,
        // Store genres as metadata to be processed by the composite repository
        genres: result.genres,
        providers: providers.results.FR?.flatrate ?? [],
        cast: credits.cast,
        seasons: seasons,
      };

      return serieProps;
    } catch (error) {
      logger.error(`Error fetching series detail for ID ${id}: ${error}`);
      throw error;
    }
  }
}
