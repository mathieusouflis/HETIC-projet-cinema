import type { PaginationQuery } from "../../../../../shared/schemas/base/pagination.schema";
import { BaseContentRepository } from "../../../../contents/infrastructure/database/repositories/base/base-content.repository";
import type {
  CreateSerieProps,
  Serie,
} from "../../../domain/entities/serie.entity";
import type { ISeriesRepository } from "../../../domain/interfaces/ISeriesRepository";
import { DrizzleSerieAdapter } from "./serie.drizzle.adapter";
import { TMDBSeriesAdapter } from "./serie.tmdb.adapter";

/**
 * Serie Repository
 * Handles TV series-specific business logic
 */
export class SeriesRepository
  extends BaseContentRepository<
    Serie,
    CreateSerieProps,
    TMDBSeriesAdapter,
    DrizzleSerieAdapter
  >
  implements ISeriesRepository
{
  protected contentTypeName = "serie";

  constructor() {
    super(new TMDBSeriesAdapter(), new DrizzleSerieAdapter());
  }

  async createSerie(content: CreateSerieProps): Promise<Serie> {
    return this.create(content);
  }

  async getSerieById(id: string): Promise<Serie | null> {
    return this.getById(id);
  }

  async listSeries(
    title?: string,
    country?: string,
    categories?: string[],
    options?: PaginationQuery
  ): Promise<{
    data: Serie[];
    total: number;
  }> {
    const [series] = await Promise.all([
      this.list(title, country, categories, options),
    ]);
    return {
      data: series.data,
      total: series.total,
    };
  }

  async searchSeries(
    query: string,
    options?: PaginationQuery
  ): Promise<Serie[]> {
    return this.search(query, options);
  }

  async updateSerie(
    id: string,
    props: Partial<CreateSerieProps>
  ): Promise<Serie> {
    return this.update(id, props);
  }

  async deleteSerie(id: string): Promise<void> {
    return this.delete(id);
  }

  async getSerieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    return this.getCount(title, country, categories);
  }
}
