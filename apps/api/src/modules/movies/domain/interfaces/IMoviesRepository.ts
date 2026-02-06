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
    withCategories?: boolean,
    withPlatforms?: boolean,
    withCast?: boolean,
    options?: PagePaginationQuery
  ) => Promise<{
    data: Movie[];
    total: number;
  }>;
  searchMovies: (
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
      withCast?: boolean;
    }
  ) => Promise<Movie[]>;
}
