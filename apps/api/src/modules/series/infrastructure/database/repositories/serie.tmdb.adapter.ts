import {
  BaseTMDBAdapter,
  type DiscoverType,
} from "../../../../contents/infrastructure/database/repositories/base/base-tmdb.adapter";
import type { CreateSerieProps } from "../../../domain/entities/serie.entity";

type TMDBSerie = {
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

/**
 * TMDB Series Adapter
 * Handles fetching TV series data from TMDB API
 */
export class TMDBSeriesAdapter extends BaseTMDBAdapter<
  TMDBSerie,
  CreateSerieProps
> {
  protected discoverType: DiscoverType = "tv";
  protected searchEndpoint = "search/tv";
  protected discoverEndpoint = "discover/tv";
  protected videoEndpoint = "tv/{id}/videos";

  /**
   * Parse TMDB series result to CreateSerieProps
   */
  protected async parseResult(result: TMDBSerie): Promise<CreateSerieProps> {
    return {
      slug: result.id.toString(),
      title: result.name ?? null,
      type: "serie",
      backdropUrl: result.backdrop_path || null,
      posterUrl: result.poster_path || null,
      tmdbId: result.id,
      originalTitle: result.original_name ?? null,
      releaseDate: result.first_air_date ?? null,
      trailerUrl: await this.getTrailerUrl(result.id),
    };
  }

  // Convenience method aliases for backward compatibility
  async searchSeries(query: string, page = 1): Promise<CreateSerieProps[]> {
    return this.searchContent(query, page);
  }

  async listSeries(
    country?: string,
    categories?: string[],
    page = 1
  ): Promise<CreateSerieProps[]> {
    return this.listContent(country, categories, page);
  }
}
