import { PaginationQuery } from "../../../../shared/schemas/base/pagination.schema";
import { CreateSerieProps, Serie } from "../entities/serie.entity";

export interface ISeriesRepository {
  getSerieById: (id: string) => Promise<Serie | null>;
  listSeries: (title?: string, country?: string, categories?: string[], options?: PaginationQuery) => Promise<Serie[]>;
  searchSeries: (query: string, options?: PaginationQuery) => Promise<Serie[]>;
  createSerie: (content: CreateSerieProps) => Promise<Serie>;
}
