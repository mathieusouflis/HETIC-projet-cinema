import { BaseContentRepository } from "../../../../contents/infrastructure/database/repositories/base/base-content.repository";
import { Movie, CreateMovieProps } from "../../../domain/entities/movie.entity";
import { IMoviesRepository } from "../../../domain/interfaces/IMoviesRepository";
import { TMDBMoviesAdapter } from "./movie.tmdb.adapter";
import { DrizzleMovieAdapter } from "./movie.drizzle.adapter";
import { PaginationQuery } from "../../../../../shared/schemas/base/pagination.schema";

/**
 * Movie Repository
 * Handles movie-specific business logic
 */
export class MovieRepository
  extends BaseContentRepository<Movie, CreateMovieProps, TMDBMoviesAdapter, DrizzleMovieAdapter>
  implements IMoviesRepository
{
  protected contentTypeName = "movies";

  constructor() {
    super(new TMDBMoviesAdapter(), new DrizzleMovieAdapter());
  }

  // Implement interface methods with proper naming
  async createMovie(content: CreateMovieProps): Promise<Movie> {
    return this.create(content);
  }

  async getMovieById(id: string): Promise<Movie | null> {
    return this.getById(id);
  }

  async listMovies(
    title?: string,
    country?: string,
    categories?: string[],
    options?: PaginationQuery
  ): Promise<Movie[]> {
    return this.list(title, country, categories, options);
  }

  async searchMovies(query: string, options?: PaginationQuery): Promise<Movie[]> {
    return this.search(query, options);
  }

  // Additional movie-specific methods can be added here
  async updateMovie(id: string, props: Partial<CreateMovieProps>): Promise<Movie> {
    return this.update(id, props);
  }

  async deleteMovie(id: string): Promise<void> {
    return this.delete(id);
  }

  async getMovieCount(title?: string, country?: string, categories?: string[]): Promise<number> {
    return this.getCount(title, country, categories);
  }
}
