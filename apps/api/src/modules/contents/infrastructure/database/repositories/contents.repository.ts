import { logger } from "@packages/logger";
import { eq } from "drizzle-orm";
import { db } from "../../../../../database";
import type {
  PagePaginationQuery,
  PaginationQuery,
} from "../../../../../shared/services/pagination";
import { Category } from "../../../../categories/domain/entities/category.entity";
import { Episode } from "../../../../episodes/domain/episode.entity";
import type { IMoviesRepository } from "../../../../movies/domain/interfaces/IMoviesRepository";
import { CompositeMoviesRepository } from "../../../../movies/infrastructure/database/repositories/composite-movies.repository";
import { People } from "../../../../peoples/domain/entities/people.entity";
import { Platform } from "../../../../platforms/domain/entities/platforms.entity";
import { Season } from "../../../../seasons/domain/seasons.entity";
import type { ISeriesRepository } from "../../../../series/domain/interfaces/ISeriesRepository";
import { CompositeSeriesRepository } from "../../../../series/infrastructure/database/repositories/composite-series.repository";
import { Content } from "../../../domain/entities/content.entity";
import type { IContentRepository } from "../../../domain/interfaces/IContentRepository";
import { contentSchema } from "../schemas/contents.schema";

/**
 * Contents Repository
 * Unified repository for accessing both movies and series
 * Delegates to specialized repositories for type-specific requests (with TMDB sync)
 * Queries database directly for combined (unfiltered) requests (proper pagination)
 */
export class ContentsRepository implements IContentRepository {
  private readonly moviesRepository: IMoviesRepository;
  private readonly seriesRepository: ISeriesRepository;

  constructor() {
    this.moviesRepository = new CompositeMoviesRepository();
    this.seriesRepository = new CompositeSeriesRepository();
  }

  async getContentById(params: {
    id: string;
    withCast?: boolean;
    withCategory?: boolean;
    withPlatform?: boolean;
    withSeasons?: boolean;
    withEpisodes?: boolean;
  }): Promise<Content | undefined> {
    try {
      const content = await db.query.content.findFirst({
        where: eq(contentSchema.id, params.id),
        with: {
          contentCredits: {
            with: {
              person: true,
            },
          },
          contentCategories: {
            with: {
              category: true,
            },
          },
          contentPlatforms: {
            with: {
              platform: true,
            },
          },
          seasons: {
            with: {
              episodes: true,
            },
          },
        },
      });

      if (!content) {
        return undefined;
      }

      const contentEntity = new Content(content);
      if (params.withCast) {
        const peoples = content.contentCredits.map(
          (credit) => new People(credit.person)
        );
        contentEntity.setRelations("contentCredits", peoples);
      }

      if (params.withCategory) {
        const categories = content.contentCategories.map(
          (category) => new Category(category.category)
        );
        contentEntity.setRelations("contentCategories", categories);
      }

      if (params.withSeasons) {
        const seasons = content.seasons.map((season) => {
          const seasonEntity = new Season(season);
          if (params.withEpisodes) {
            seasonEntity.setRelations(
              "episodes",
              season.episodes.map((ep) => new Episode(ep))
            );
          }
          logger.info(seasonEntity.toJSONWithRelations());
          return seasonEntity;
        });

        contentEntity.setRelations("seasons", seasons);
      }

      if (params.withPlatform) {
        const platforms = content.contentPlatforms.map(
          (platform) => new Platform(platform.platform)
        );

        contentEntity.setRelations("contentPlatforms", platforms);
      }

      return contentEntity;
    } catch (error) {
      logger.error(`Error getting content by id ${params.id}: ${error}`);
      throw error;
    }
  }

  /**
   * List contents with optional type filter
   * If type is specified, delegates to appropriate repository (with TMDB sync)
   * If no type, queries database directly (no TMDB sync, proper pagination)
   */
  async listContents(
    type?: string,
    title?: string,
    country?: string,
    categories?: string[],
    withCategory?: boolean,
    withPlatform?: boolean,
    withCast?: boolean,
    withSeason?: boolean,
    withEpisode?: boolean,
    options?: PagePaginationQuery
  ): Promise<{ data: Content[]; total: number }> {
    try {
      // If type is specified, delegate to the appropriate repository
      // This includes TMDB synchronization
      if (type === "movie") {
        const result = await this.moviesRepository.listMovies(
          title,
          country,
          categories,
          withCategory,
          withPlatform,
          withCast,
          options
        );
        return result;
      }

      if (type === "serie") {
        const result = await this.seriesRepository.listSeries(
          title,
          country,
          categories,
          withCategory,
          withPlatform,
          withCast,
          withSeason,
          withEpisode,
          options
        );
        return result;
      }

      const movies = await this.moviesRepository.listMovies(
        title,
        country,
        categories,
        withCategory,
        withPlatform,
        withCast,
        options
      );

      const series = await this.seriesRepository.listSeries(
        title,
        country,
        categories,
        withCategory,
        withPlatform,
        withCast,
        withSeason,
        withEpisode,
        options
      );

      // When no type filter, query database directly for proper pagination
      // This gives us all movies AND series combined from the local database
      return {
        data: [...movies.data, ...series.data],
        total: movies.total + series.total,
      };
    } catch (error) {
      logger.error(`Error listing contents: ${error}`);
      throw error;
    }
  }

  /**
   * Search contents with optional type filter
   * If type is specified, delegates to appropriate repository
   * If no type, searches database directly
   */
  async searchContents(
    query: string,
    type?: string,
    options?: PaginationQuery
  ): Promise<Content[]> {
    try {
      if (type === "movie") {
        const results = await this.moviesRepository.searchMovies(
          query,
          options
        );
        return results;
      }

      if (type === "serie") {
        const results = await this.seriesRepository.searchSeries(
          query,
          options
        );
        return results;
      }

      const movies = await this.moviesRepository.searchMovies(query, options);
      const series = await this.seriesRepository.searchSeries(query, options);

      return [...movies, ...series];
    } catch (error) {
      logger.error(`Error searching contents: ${error}`);
      throw error;
    }
  }
}
