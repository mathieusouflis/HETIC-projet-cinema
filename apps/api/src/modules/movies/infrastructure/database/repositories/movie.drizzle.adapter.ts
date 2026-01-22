import { BaseDrizzleAdapter } from "../../../../contents/infrastructure/database/repositories/base/base-drizzle.adapter";
import { Content, CreateContentProps } from "../../../../contents/domain/entities/content.entity";
import { Movie, MovieProps } from "../../../domain/entities/movie.entity";
import { PaginationQuery } from "../../../../../shared/schemas/base/pagination.schema";

/**
 * Drizzle Movie Adapter
 * Handles database operations for movies
 */
export class DrizzleMovieAdapter extends BaseDrizzleAdapter<Movie, CreateContentProps> {
  protected contentType = "movie" as const;

  /**
   * Create a Movie entity from database row
   */
  protected createEntity(row: MovieProps): Movie {
    return new Movie(row);
  }

  // Convenience method aliases for backward compatibility
  async createMovie(movie: CreateContentProps): Promise<Content> {
    return this.createContent(movie);
  }

  async listMovies(
    title?: string,
    country?: string,
    categories?: string[],
    tmdbIds?: number[],
    options?: PaginationQuery
  ): Promise<Content[]> {
    return this.listContent(title, country, categories, tmdbIds, options);
  }

  async checkMovieExistsInDb<Id extends number>(tmdbIds: Id[]): Promise<Record<Id, boolean>> {
    return this.checkContentExistsInDb(tmdbIds);
  }
}
