import { logger } from "@packages/logger";
import { BaseTMDBRepository } from "../../../../../shared/infrastructure/repositories/base-tmdb-repository";
import type { CreateMovieProps } from "../../../domain/entities/movie.entity";

export type MovieWithGenres = CreateMovieProps & {
  genres?: Array<{ id: number; name: string }>;
};

export type TMDBMovieDiscoverResult = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type TMDBMovieDetail = {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
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
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

/**
 * TMDB Movies Repository
 * Handles fetching movie data from TMDB API
 */
export class TMDBMoviesRepository extends BaseTMDBRepository<
  TMDBMovieDiscoverResult,
  MovieWithGenres
> {
  protected readonly discoverEndpoint = "discover/movie";
  protected readonly searchEndpoint = "search/movie";
  protected readonly detailEndpoint = "movie";
  protected readonly videoEndpoint = "movie/{id}/videos";
  protected readonly contentTypeName = "movie";

  /**
   * Get detailed information about a movie from TMDB
   */
  async detail(id: number): Promise<MovieWithGenres> {
    try {
      const result = await this.tmdbService.request<TMDBMovieDetail>(
        "GET",
        `${this.detailEndpoint}/${id}`
      );

      const trailerUrl = await this.getTrailerUrl(id);

      const movieProps: MovieWithGenres = {
        type: "movie",
        slug: result.id.toString(),
        title: result.title,
        originalTitle: result.original_title,
        synopsis: result.overview || null,
        posterUrl: result.poster_path
          ? `${this.TMDB_IMAGE_BASE_URL}${result.poster_path}`
          : null,
        backdropUrl: result.backdrop_path
          ? `${this.TMDB_IMAGE_BASE_URL}${result.backdrop_path}`
          : null,
        trailerUrl: trailerUrl,
        releaseDate: result.release_date || null,
        tmdbId: result.id,
        averageRating: result.vote_average.toString(),
        totalRatings: result.vote_count,
        totalViews: 0,
        durationMinutes: result.runtime,
        // Store genres as metadata to be processed by the composite repository
        genres: result.genres,
      };

      logger.info(
        `Fetched detailed information for movie ${id} (${result.title})`
      );

      return movieProps;
    } catch (error) {
      logger.error(`Error fetching movie detail for ID ${id}: ${error}`);
      throw error;
    }
  }
}
