import type { PaginationQuery } from "../../../../../shared/schemas/base/pagination.schema";
import { BaseContentRepository } from "../../../../contents/infrastructure/database/repositories/base/base-content.repository";
import type {
  CreateMovieProps,
  Movie,
} from "../../../domain/entities/movie.entity";
import type { IMoviesRepository } from "../../../domain/interfaces/IMoviesRepository";
import { DrizzleMovieAdapter } from "./movie.drizzle.adapter";
import { TMDBMoviesAdapter } from "./movie.tmdb.adapter";

/**
 * Movie Repository
 * Handles movie-specific business logic
 */
export class MoviesRepository
  extends BaseContentRepository<
    Movie,
    CreateMovieProps,
    TMDBMoviesAdapter,
    DrizzleMovieAdapter
  >
  implements IMoviesRepository
{
  protected contentTypeName = "movie";

  constructor() {
    super(new TMDBMoviesAdapter(), new DrizzleMovieAdapter());
  }

  async createMovie(content: CreateMovieProps): Promise<Movie> {
    return await this.create(content);
  }

  async getMovieById(id: string): Promise<Movie | null> {
    return await this.getById(id);
  }

  async listMovies(
    title?: string,
    country?: string,
    categories?: string[],
    withCategory?: boolean,
    options?: PaginationQuery
  ): Promise<{
    data: Movie[];
    total: number;
  }> {
    return await this.list(title, country, categories, withCategory, options);
  }

  async searchMovies(
    query: string,
    options?: PaginationQuery
  ): Promise<Movie[]> {
    return await this.search(query, options);
  }

  async updateMovie(
    id: string,
    props: Partial<CreateMovieProps>
  ): Promise<Movie> {
    return await this.update(id, props);
  }

  async deleteMovie(id: string): Promise<void> {
    await this.delete(id);
  }

  async getMovieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    return await this.getCount(title, country, categories);
  }
}
