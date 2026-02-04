import type { PagePaginationQuery } from "../../../../shared/services/pagination";
import type { Movie } from "../entities/movie.entity";

export interface IMoviesRepository {
  getMovieById: (
    id: string,
    options?: { withCategories?: boolean }
  ) => Promise<Movie | null>;
  listMovies: (
    title?: string,
    country?: string,
    categories?: string[],
    withCategory?: boolean,
    withPlatform?: boolean,
    options?: PagePaginationQuery
  ) => Promise<{
    data: Movie[];
    total: number;
  }>;
  searchMovies: (
    query: string,
    options?: PagePaginationQuery
  ) => Promise<Movie[]>;
}
