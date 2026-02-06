import type { PagePaginationQuery } from "../../../../shared/services/pagination";
import type { CreateSerieProps, Serie } from "../entities/serie.entity";

export interface ISeriesRepository {
  getSerieById: (
    id: string,
    options?: { withCategories?: boolean }
  ) => Promise<Serie | null>;
  listSeries: (
    title?: string,
    country?: string,
    categories?: string[],
    withCategories?: boolean,
    withPlatforms?: boolean,
    withCast?: boolean,
    options?: PagePaginationQuery
  ) => Promise<{
    data: Serie[];
    total: number;
  }>;
  searchSeries: (
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
    }
  ) => Promise<Serie[]>;
  createSerie: (content: CreateSerieProps) => Promise<Serie>;
}
