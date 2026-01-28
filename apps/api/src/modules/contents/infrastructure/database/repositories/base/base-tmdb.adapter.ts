import { logger } from "@packages/logger";
import { TmdbService } from "../../../../../../shared/services/tmdb";
import type { CreateContentProps } from "../../../../domain/entities/content.entity";
import { MetadataNotFoundError } from "../tmdb-fetch-status/errors/metadata-not-found";
import { TMDBFetchStatusRepository } from "../tmdb-fetch-status/tmdb-fetch-status.repository";

export type DiscoverType = "movie" | "tv";

type Video = {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string | "Youtube";
  size: string;
  type: "Featurette" | "Trailer" | "Teaser";
  official: boolean;
  published_at: string;
  id: string;
};

type GetTrailersResult = {
  id: number;
  results: Video[];
};

export type DiscoverResult<T> = {
  page: number;
  results: T[];
};

/**
 * Base TMDB Adapter
 * Provides shared functionality for fetching content from TMDB API
 */
export abstract class BaseTMDBAdapter<
  TResult,
  TProps extends CreateContentProps,
> {
  protected tmdbService: TmdbService;
  protected tmdbFetchStatusRepository: TMDBFetchStatusRepository;
  protected abstract discoverType: DiscoverType;
  protected abstract searchEndpoint: string;
  protected abstract discoverEndpoint: string;
  protected abstract videoEndpoint: string;

  constructor() {
    this.tmdbService = new TmdbService();
    this.tmdbFetchStatusRepository = new TMDBFetchStatusRepository();
  }

  /**
   * Abstract method to parse TMDB result to content props
   * Must be implemented by subclasses
   */
  protected abstract parseResult(result: TResult): Promise<TProps>;

  /**
   * Get trailer URL for content
   */
  protected async getTrailerUrl(contentId: number): Promise<string | null> {
    try {
      const result = (await this.tmdbService.request(
        "GET",
        this.videoEndpoint.replace("{id}", contentId.toString())
      )) as GetTrailersResult;

      const trailer = result.results.find((video) => video.type === "Trailer");
      return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
      logger.error(
        `Error fetching trailer for ${this.discoverType} ${contentId}: ${error}`
      );
      return null;
    }
  }

  /**
   * Get content by ID from TMDB
   */
  async getContentById(id: string): Promise<TProps | null> {
    try {
      const endpoint = `${this.discoverType}/${id}`;
      const result = (await this.tmdbService.request(
        "GET",
        endpoint
      )) as TResult;
      return await this.parseResult(result);
    } catch (error) {
      logger.error(`Error fetching ${this.discoverType} by ID ${id}: ${error}`);
      return null;
    }
  }

  /**
   * Fetch and parse content from TMDB discover endpoint
   */
  protected async fetchAndParseContent(
    country?: string,
    categories?: string[],
    page = 1
  ): Promise<TProps[]> {
    const params: Record<string, string> = {
      page: page.toString(),
    };

    if (country) {
      params.with_original_language = country;
    }

    if (categories && categories.length > 0) {
      params.with_genres = categories.join("|");
    }

    const result = (await this.tmdbService.request(
      "GET",
      this.discoverEndpoint,
      params
    )) as DiscoverResult<TResult>;

    const content = await Promise.all(
      result.results.map(async (item) => await this.parseResult(item))
    );

    await this.tmdbFetchStatusRepository.setDiscoverMetadata(
      this.discoverType,
      { page }
    );

    return content;
  }

  /**
   * Search content on TMDB
   */
  async searchContent(query: string, page = 1): Promise<TProps[]> {
    try {
      const result = (await this.tmdbService.request(
        "GET",
        this.searchEndpoint,
        {
          query,
          page: page.toString(),
        }
      )) as DiscoverResult<TResult>;

      const content = await Promise.all(
        result.results.map(async (item) => await this.parseResult(item))
      );

      await this.tmdbFetchStatusRepository.setSearchMetadata(query, { page });

      return content;
    } catch (error) {
      logger.error(
        `Error searching ${this.discoverType} with query "${query}": ${error}`
      );
      return [];
    }
  }

  /**
   * List content from TMDB discover endpoint with pagination tracking
   */
  async listContent(
    country?: string,
    categories?: string[],
    page = 1
  ): Promise<TProps[]> {
    try {
      const metadata = await this.tmdbFetchStatusRepository.getDiscoverMetadata(
        this.discoverType
      );

      if (metadata.page < page) {
        return await this.fetchAndParseContent(country, categories, page);
      }

      // Already fetched this page, return empty array
      return [];
    } catch (error) {
      if (error instanceof MetadataNotFoundError) {
        // First time fetching, start from requested page
        return await this.fetchAndParseContent(country, categories, page);
      }

      logger.error(`Error listing ${this.discoverType}: ${error}`);
      return [];
    }
  }
}
