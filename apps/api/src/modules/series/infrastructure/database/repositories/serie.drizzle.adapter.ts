import type { PaginationQuery } from "../../../../../shared/schemas/base/pagination.schema";
import { BaseDrizzleAdapter } from "../../../../contents/infrastructure/database/repositories/base/base-drizzle.adapter";
import {
  type CreateSerieProps,
  Serie,
  type SerieProps,
} from "../../../domain/entities/serie.entity";

/**
 * Drizzle Serie Adapter
 * Handles database operations for TV series
 */
export class DrizzleSerieAdapter extends BaseDrizzleAdapter<
  Serie,
  CreateSerieProps
> {
  protected contentType = "serie" as const;

  /**
   * Create a Serie entity from database row
   */
  protected createEntity(row: SerieProps): Serie {
    return new Serie(row);
  }

  // Convenience method aliases for backward compatibility
  async createSerie(serie: CreateSerieProps): Promise<Serie> {
    return this.createContent(serie);
  }

  async listSeries(
    title?: string,
    country?: string,
    categories?: string[],
    tmdbIds?: number[],
    options?: PaginationQuery
  ): Promise<Serie[]> {
    return this.listContent(title, country, categories, tmdbIds, options);
  }

  async checkSerieExistsInDb<Id extends number>(
    tmdbIds: Id[]
  ): Promise<Record<Id, boolean>> {
    return this.checkContentExistsInDb(tmdbIds);
  }
}
