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
    options?: { withCategories?: boolean; withPlatforms?: boolean }
  ): Promise<Serie | null> {
    return this.baseGetById(id, options);
  }

  async searchSeries(
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
      withCast?: boolean;
    }
  ): Promise<Serie[]> {
    return this.baseSearch(query, options);
  }

  async createSerie(content: CreateSerieProps): Promise<Serie> {
    return this.baseCreate(content);
  }

  async updateSerie(
    id: string,
    props: Partial<CreateSerieProps>
  ): Promise<Serie> {
    return this.baseUpdate(id, props);
  }

  async deleteSerie(id: string): Promise<void> {
    return this.baseDelete(id);
  }

  async getSerieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    return this.baseGetCount(title, country, categories);
  }
}
