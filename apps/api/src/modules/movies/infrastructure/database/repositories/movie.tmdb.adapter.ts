import {
  BaseTMDBAdapter,
  type DiscoverType,
} from "../../../../contents/infrastructure/database/repositories/base/base-tmdb.adapter";
import type { CreateMovieProps } from "../../../domain/entities/movie.entity";

type TMDBMovie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string | null;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

/**
 * TMDB Movies Adapter
 * Handles fetching movie data from TMDB API
 */
export class TMDBMoviesAdapter extends BaseTMDBAdapter<
  TMDBMovie,
  CreateMovieProps
> {
  protected discoverType: DiscoverType = "movie";
  protected searchEndpoint = "search/movie";
  protected discoverEndpoint = "discover/movie";
  protected videoEndpoint = "movie/{id}/videos";

  /**
   * Parse TMDB movie result to CreateMovieProps
   */
  protected async parseResult(result: TMDBMovie): Promise<CreateMovieProps> {
    return {
      slug: result.id.toString(),
      title: result.title,
      type: "movie",
      backdropUrl: result.backdrop_path || null,
      posterUrl: result.poster_path || null,
      tmdbId: result.id,
      originalTitle: result.original_title || null,
      releaseDate: result.release_date || null,
      trailerUrl: result.video ? await this.getTrailerUrl(result.id) : null,
    };
  }

  // Convenience method aliases for backward compatibility
  async searchMovies(query: string, page = 1): Promise<CreateMovieProps[]> {
    return this.searchContent(query, page);
  }

  async listMovies(
    country?: string,
    categories?: string[],
    page = 1
  ): Promise<CreateMovieProps[]> {
    return this.listContent(country, categories, page);
  }
}
