import { PaginationQuery } from "../../../../shared/schemas/base/pagination.schema";
import { Content } from "../../../contents/domain/entities/content.entity";

export interface IMoviesRepository {
  getMovieById: (id: string) => Promise<Content | null>;
  listMovies: (title?: string, country?: string, categories?: string[], options?: PaginationQuery) => Promise<Content[]>;
  searchMovies: (query: string, options?: PaginationQuery) => Promise<Content[]>;
}
