import {
  BaseCompositeRepository,
  type CompositeEntity,
} from "../../../../../shared/infrastructure/repositories/base-composite-repository";
import type { PagePaginationQuery } from "../../../../../shared/services/pagination";
import type {
  CreateMovieProps,
  Movie,
} from "../../../domain/entities/movie.entity";
import type { IMoviesRepository } from "../../../domain/interfaces/IMoviesRepository";
import { DrizzleMoviesRepository } from "./drizzle-movies.repository";
import { TMDBMoviesRepository } from "./tmdb-movies.repository";

export class CompositeMoviesRepository
  extends BaseCompositeRepository<
    Movie & CompositeEntity,
    any,
    CreateMovieProps,
    TMDBMoviesRepository,
    DrizzleMoviesRepository
  >
  implements IMoviesRepository
{
  protected readonly entityType = "movies";

  constructor() {
    super(new TMDBMoviesRepository(), new DrizzleMoviesRepository());
  }

  async listMovies(
    title?: string,
    country?: string,
    categories?: string[],
    withCategories?: boolean,
    withPlatforms?: boolean,
    withCast?: boolean,
    options?: PagePaginationQuery
  ): Promise<{
    data: Movie[];
    total: number;
  }> {
    return await this.baseList(
      title,
      country,
      categories,
      withCategories,
      withPlatforms,
      withCast,
      false,
      false,
      options
    );
  }

  async getMovieById(
    id: string,
    options?: { withCategories?: boolean; withPlatforms?: boolean }
  ): Promise<Movie | null> {
    return this.baseGetById(id, options);
  }

  async searchMovies(
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
      withCast?: boolean;
    }
  ): Promise<Movie[]> {
    return this.baseSearch(query, options);
  }

  async createMovie(content: CreateMovieProps): Promise<Movie> {
    return this.baseCreate(content);
  }

  async updateMovie(
    id: string,
    props: Partial<CreateMovieProps>
  ): Promise<Movie> {
    return this.baseUpdate(id, props);
  }

  async deleteMovie(id: string): Promise<void> {
    return this.baseDelete(id);
  }

  async getMovieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    return this.baseGetCount(title, country, categories);
  }
}
