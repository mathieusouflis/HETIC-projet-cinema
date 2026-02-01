import { BaseDrizzleRepository } from "../../../../../shared/infrastructure/repositories/base-drizzle-repository";
import {
  type CreateSerieProps,
  Serie,
  type SerieProps,
} from "../../../domain/entities/serie.entity";

/**
 * Drizzle Series Repository
 * Handles database operations for TV series
 */
export class DrizzleSeriesRepository extends BaseDrizzleRepository<
  Serie,
  SerieProps,
  CreateSerieProps
> {
  protected readonly contentType = "serie" as const;
  protected readonly entityName = "series";

  protected createEntity(row: SerieProps): Serie {
    return new Serie(row);
  }
}
