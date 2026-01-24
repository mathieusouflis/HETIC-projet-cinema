import { PaginationQuery } from "../../../../shared/schemas/base/pagination.schema";
import { Movie } from "../entities/movie.entity";

export interface IMoviesRepository {
  getMovieById: (id: string) => Promise<Movie | null>;
  listMovies: (title?: string, country?: string, categories?: string[], options?: PaginationQuery) => Promise<Movie[]>;
  searchMovies: (query: string, options?: PaginationQuery) => Promise<Movie[]>;
}
