import { logger } from "@packages/logger";
import { eq } from "drizzle-orm";
import { db } from "../../../../../database";
import type { PaginationQuery } from "../../../../../shared/services/pagination";
import type { IMoviesRepository } from "../../../../movies/domain/interfaces/IMoviesRepository";
import { CompositeMoviesRepository } from "../../../../movies/infrastructure/database/repositories/composite-movies.repository";
import type { ISeriesRepository } from "../../../../series/domain/interfaces/ISeriesRepository";
import { CompositeSeriesRepository } from "../../../../series/infrastructure/database/repositories/composite-series.repository";
import { Content } from "../../../domain/entities/content.entity";
import type { IContentRepository } from "../../../domain/interfaces/IContentRepository";
import { contentSchema } from "../schemas/contents.schema";

/**
 * Contents Repository
 * Unified repository for accessing both movies and series
 * Delegates to specialized repositories and combines results
 */
export class ContentsRepository implements IContentRepository {
  private readonly moviesRepository: IMoviesRepository;
  private readonly seriesRepository: ISeriesRepository;

  constructor() {
    this.moviesRepository = new CompositeMoviesRepository();
    this.seriesRepository = new CompositeSeriesRepository();
  }

  async getContentById(id: string): Promise<Content | undefined> {
    try {
      const content = await db
        .select()
        .from(contentSchema)
        .where(eq(contentSchema.id, id))
        .execute();
      return content[0] ? new Content(content[0]) : undefined;
    } catch (error) {
      logger.error(`Error getting content by id ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * List contents with optional type filter
   * If type is specified, delegates to appropriate repository
   * If no type, combines results from both repositories
   */
  async listContents(
    type?: string,
    title?: string,
    country?: string,
    categories?: string[],
    withCategory?: boolean,
    options?: PaginationQuery
  ): Promise<{ data: Content[]; total: number }> {
    try {
      if (type === "movie") {
        const result = await this.moviesRepository.listMovies(
          title,
          country,
          categories,
          withCategory,
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
          options
        );

        return result;
      }

      const [moviesResult, seriesResult] = await Promise.all([
        this.moviesRepository.listMovies(
          title,
          country,
          categories,
          withCategory,
          options
        ),
        this.seriesRepository.listSeries(
          title,
          country,
          categories,
          withCategory,
          options
        ),
      ]);

      const combinedData = [...moviesResult.data, ...seriesResult.data];

      const total = moviesResult.total + seriesResult.total;
      let paginatedData = combinedData;

      if (options?.page && options?.limit) {
        const start = (options.page - 1) * options.limit;
        const end = start + options.limit;
        paginatedData = combinedData.slice(start, end);
      }

      return {
        data: paginatedData,
        total,
      };
    } catch (error) {
      logger.error(`Error listing contents: ${error}`);
      throw error;
    }
  }

  /**
   * Search contents with optional type filter
   * If type is specified, delegates to appropriate repository
   * If no type, combines results from both repositories
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

      const [movieResults, serieResults] = await Promise.all([
        this.moviesRepository.searchMovies(query, options),
        this.seriesRepository.searchSeries(query, options),
      ]);

      const combinedResults = [...movieResults, ...serieResults];

      let paginatedResults = combinedResults;
      if (options?.page && options?.limit) {
        const start = (options.page - 1) * options.limit;
        const end = start + options.limit;
        paginatedResults = combinedResults.slice(start, end);
      }

      return paginatedResults;
    } catch (error) {
      logger.error(`Error searching contents: ${error}`);
      throw error;
    }
  }
}
