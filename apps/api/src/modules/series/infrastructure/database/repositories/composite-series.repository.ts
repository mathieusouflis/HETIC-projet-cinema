import { logger } from "@packages/logger";
import {
  BaseCompositeRepository,
  type CompositeEntity,
} from "../../../../../shared/infrastructure/repositories/base-composite-repository";
import type { PagePaginationQuery } from "../../../../../shared/services/pagination";
import type {
  CreateSerieProps,
  Serie,
} from "../../../domain/entities/serie.entity";
import type { ISeriesRepository } from "../../../domain/interfaces/ISeriesRepository";
import { DrizzleSeriesRepository } from "./drizzle-series.repository";
import { TMDBSeriesRepository } from "./tmdb-series.repository";

export class CompositeSeriesRepository
  extends BaseCompositeRepository<
    Serie & CompositeEntity,
    any,
    CreateSerieProps,
    TMDBSeriesRepository,
    DrizzleSeriesRepository
  >
  implements ISeriesRepository
{
  protected readonly entityType = "series";

  constructor() {
    super(new TMDBSeriesRepository(), new DrizzleSeriesRepository());
  }

  async listSeries(
    title?: string,
    country?: string,
    categories?: string[],
    withCategories?: boolean,
    withPlatforms?: boolean,
    withCast?: boolean,
    withSeasons?: boolean,
    withEpisodes?: boolean,
    options?: PagePaginationQuery
  ): Promise<{
    data: Serie[];
    total: number;
  }> {
    return await this.baseList(
      title,
      country,
      categories,
      withCategories,
      withPlatforms,
      withCast,
      withSeasons,
      withEpisodes,
      options
    );
  }

  async getSerieById(
    id: string,
    options?: { withCategories?: boolean; withPlatform?: boolean }
  ): Promise<Serie | null> {
    try {
      const serie = await this.drizzleRepository.getById(id, options);
      if (serie) {
        return serie;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting series by ID ${id}: ${error}`);
      throw error;
    }
  }

  async searchSeries(
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
      withCast?: boolean;
    }
  ): Promise<Serie[]> {
    return await this.baseSearch(query, options);
  }

  async createSerie(content: CreateSerieProps): Promise<Serie> {
    try {
      const serie = await this.drizzleRepository.create(content);
      logger.info(`Created series ${serie.id}`);
      return serie;
    } catch (error) {
      logger.error(`Error creating series: ${error}`);
      throw error;
    }
  }

  async updateSerie(
    id: string,
    props: Partial<CreateSerieProps>
  ): Promise<Serie> {
    try {
      const serie = await this.drizzleRepository.update(id, props);
      logger.info(`Updated series ${id}`);
      return serie;
    } catch (error) {
      logger.error(`Error updating series ${id}: ${error}`);
      throw error;
    }
  }

  async deleteSerie(id: string): Promise<void> {
    try {
      await this.drizzleRepository.delete(id);
      logger.info(`Deleted series ${id}`);
    } catch (error) {
      logger.error(`Error deleting series ${id}: ${error}`);
      throw error;
    }
  }

  async getSerieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    try {
      return await this.drizzleRepository.getCount(title, country, categories);
    } catch (error) {
      logger.error(`Error getting series count: ${error}`);
      throw error;
    }
  }
}
