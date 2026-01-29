import type { PaginationQuery } from "../../../../shared/schemas/base/pagination.schema";
import type { CreateSerieProps, Serie } from "../entities/serie.entity";

export interface ISeriesRepository {
  getSerieById: (id: string) => Promise<Serie | null>;
  listSeries: (
    title?: string,
    country?: string,
    categories?: string[],
    withCategories?: boolean,
    options?: PaginationQuery
  ) => Promise<{
    data: Serie[];
    total: number;
  }>;
  searchSeries: (query: string, options?: PaginationQuery) => Promise<Serie[]>;
  createSerie: (content: CreateSerieProps) => Promise<Serie>;
}
