import type { PaginationQuery } from "../../../../shared/services/pagination";
import type { Movie } from "../entities/movie.entity";

export interface IMoviesRepository {
  getMovieById: (id: string) => Promise<Movie | null>;
  listMovies: (
    title?: string,
    country?: string,
    categories?: string[],
    withCategory?: boolean,
    options?: PaginationQuery
  ) => Promise<{
    data: Movie[];
    total: number;
  }>;
  searchMovies: (query: string, options?: PaginationQuery) => Promise<Movie[]>;
}
