import { logger } from "@packages/logger";
import { TmdbService } from "../../services/tmdb/TmdbService";

/**
 * Common video type from TMDB API
 */
export type Video = {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: "Featurette" | "Trailer" | "Teaser" | "Clip" | "Behind the Scenes";
  official: boolean;
  published_at: string;
  id: string;
};

/**
 * TMDB Videos response
 */
export type GetTrailersResult = {
  id: number;
  results: Video[];
};

/**
 * Generic TMDB Discover/Search response
 */
export type TMDBDiscoverResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

/**
 * Base TMDB Repository
 * Contains shared logic for fetching data from TMDB API
 * Used by both Movies and Series repositories
 *
 * @template TDiscoverResult - The type returned by discover/search endpoints
 * @template TEntityProps - The entity properties to create
 */
export abstract class BaseTMDBRepository<
  TDiscoverResult extends { id: number; genre_ids: number[] },
  TEntityProps,
> {
  protected readonly tmdbService: TmdbService;
  protected readonly TMDB_IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/original";

  // Abstract properties to be defined by subclasses
  protected abstract readonly discoverEndpoint: string;
  protected abstract readonly searchEndpoint: string;
  protected abstract readonly detailEndpoint: string;
  protected abstract readonly videoEndpoint: string;
  protected abstract readonly contentTypeName: string; // "movie" or "series" for logging

  constructor() {
    this.tmdbService = new TmdbService();
  }

  /**
   * Fetches trailer URL for a content item
   */
  protected async getTrailerUrl(contentId: number): Promise<string | null> {
    try {
      const result = await this.tmdbService.request<GetTrailersResult>(
        "GET",
        this.videoEndpoint.replace("{id}", contentId.toString())
      );

      const trailer = result.results.find((video) => video.type === "Trailer");
      return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
      logger.error(
        `Error fetching trailer for ${this.contentTypeName} ${contentId}: ${error}`
      );
      return null;
    }
  }

  /**
   * Discover content from TMDB
   */
  async discover(params: {
    page: number;
    withCategories?: string[];
  }): Promise<{ ids: number[]; results: TDiscoverResult[] }> {
    try {
      const queryParams: Record<string, string> = {
        page: params.page.toString(),
      };

      if (params.withCategories && params.withCategories.length > 0) {
        queryParams.with_genres = params.withCategories.join(",");
      }

      const result = await this.tmdbService.request<
        TMDBDiscoverResponse<TDiscoverResult>
      >("GET", this.discoverEndpoint, queryParams);

      logger.info(
        `Discovered ${result.results.length} ${this.contentTypeName}s from TMDB (page ${params.page})`
      );

      return {
        ids: result.results.map((item) => item.id),
        results: result.results,
      };
    } catch (error) {
      logger.error(
        `Error discovering ${this.contentTypeName}s from TMDB: ${error}`
      );
      throw error;
    }
  }

  /**
   * Search content from TMDB
   */
  async search(params: {
    query: string;
    page: number;
    withCategories?: string[];
  }): Promise<{ ids: number[]; results: TDiscoverResult[] }> {
    try {
      const queryParams: Record<string, string> = {
        query: params.query,
        page: params.page.toString(),
      };

      if (params.withCategories && params.withCategories.length > 0) {
        queryParams.with_genres = params.withCategories.join(",");
      }

      const result = await this.tmdbService.request<
        TMDBDiscoverResponse<TDiscoverResult>
      >("GET", this.searchEndpoint, queryParams);

      logger.info(
        `Found ${result.results.length} ${this.contentTypeName}s from TMDB search (query: "${params.query}", page ${params.page})`
      );

      // Filter by categories if provided
      let filteredResults = result.results;
      if (params.withCategories && params.withCategories.length > 0) {
        const categoryIds = params.withCategories.map((id) => parseInt(id, 10));
        filteredResults = result.results.filter((item) =>
          item.genre_ids.some((genreId) => categoryIds.includes(genreId))
        );
      }

      return {
        ids: filteredResults.map((item) => item.id),
        results: filteredResults,
      };
    } catch (error) {
      logger.error(
        `Error searching ${this.contentTypeName}s from TMDB: ${error}`
      );
      throw error;
    }
  }

  /**
   * Get detailed information about a content item from TMDB
   * Must be implemented by subclasses to handle specific mapping logic
   */
  abstract detail(id: number): Promise<TEntityProps>;

  /**
   * Get multiple content details by their IDs
   */
  async getMultipleDetails(ids: number[]): Promise<TEntityProps[]> {
    try {
      logger.info(
        `Fetching details for ${ids.length} ${this.contentTypeName}s from TMDB`
      );

      const detailPromises = ids.map((id) => this.detail(id));
      const details = await Promise.all(detailPromises);

      return details;
    } catch (error) {
      logger.error(
        `Error fetching multiple ${this.contentTypeName} details: ${error}`
      );
      throw error;
    }
  }
}
