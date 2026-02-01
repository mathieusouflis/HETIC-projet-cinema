import { BaseDrizzleRepository } from "../../../../../shared/infrastructure/repositories/base-drizzle-repository";
import {
  type CreateMovieProps,
  Movie,
  type MovieProps,
} from "../../../domain/entities/movie.entity";

/**
 * Drizzle Movies Repository
 * Handles database operations for movies
 */
export class DrizzleMoviesRepository extends BaseDrizzleRepository<
  Movie,
  MovieProps,
  CreateMovieProps
> {
  protected readonly contentType = "movie" as const;
  protected readonly entityName = "movie";

  protected createEntity(row: MovieProps): Movie {
    return new Movie(row);
  }
}
