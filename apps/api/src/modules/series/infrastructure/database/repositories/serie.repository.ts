import { BaseContentRepository } from "../../../../contents/infrastructure/database/repositories/base/base-content.repository";
import { Serie, CreateSerieProps } from "../../../domain/entities/serie.entity";
import { ISeriesRepository } from "../../../domain/interfaces/ISeriesRepository";
import { TMDBSeriesAdapter } from "./serie.tmdb.adapter";
import { DrizzleSerieAdapter } from "./serie.drizzle.adapter";
import { PaginationQuery } from "../../../../../shared/schemas/base/pagination.schema";

/**
 * Serie Repository
 * Handles TV series-specific business logic
 */
export class SeriesRepository
  extends BaseContentRepository<Serie, CreateSerieProps, TMDBSeriesAdapter, DrizzleSerieAdapter>
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
  ): Promise<Serie[]> {
    return this.list(title, country, categories, options);
  }

  async searchSeries(query: string, options?: PaginationQuery): Promise<Serie[]> {
    return this.search(query, options);
  }

  async updateSerie(id: string, props: Partial<CreateSerieProps>): Promise<Serie> {
    return this.update(id, props);
  }

  async deleteSerie(id: string): Promise<void> {
    return this.delete(id);
  }

  async getSerieCount(title?: string, country?: string, categories?: string[]): Promise<number> {
    return this.getCount(title, country, categories);
  }
}
