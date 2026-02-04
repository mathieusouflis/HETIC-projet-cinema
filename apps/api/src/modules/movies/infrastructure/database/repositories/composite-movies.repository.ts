import { logger } from "@packages/logger";
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
    options?: PagePaginationQuery
  ): Promise<{
    data: Movie[];
    total: number;
  }> {
    return this.baseList(
      title,
      country,
      categories,
      withCategories,
      withPlatforms,
      options
    );
  }

  async getMovieById(
    id: string,
    options?: { withCategories?: boolean; withPlatform?: boolean }
  ): Promise<Movie | null> {
    try {
      const movie = await this.drizzleRepository.getById(id, options);
      if (movie) {
        return movie;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting movie by ID ${id}: ${error}`);
      throw error;
    }
  }

  async searchMovies(
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
    }
  ): Promise<Movie[]> {
    return this.baseSearch(query, options);
  }

  async createMovie(content: CreateMovieProps): Promise<Movie> {
    try {
      const movie = await this.drizzleRepository.create(content);
      logger.info(`Created movie ${movie.id}`);
      return movie;
    } catch (error) {
      logger.error(`Error creating movie: ${error}`);
      throw error;
    }
  }

  async updateMovie(
    id: string,
    props: Partial<CreateMovieProps>
  ): Promise<Movie> {
    try {
      const movie = await this.drizzleRepository.update(id, props);
      logger.info(`Updated movie ${id}`);
      return movie;
    } catch (error) {
      logger.error(`Error updating movie ${id}: ${error}`);
      throw error;
    }
  }

  async deleteMovie(id: string): Promise<void> {
    try {
      await this.drizzleRepository.delete(id);
      logger.info(`Deleted movie ${id}`);
    } catch (error) {
      logger.error(`Error deleting movie ${id}: ${error}`);
      throw error;
    }
  }

  async getMovieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    try {
      return await this.drizzleRepository.getCount(title, country, categories);
    } catch (error) {
      logger.error(`Error getting movie count: ${error}`);
      throw error;
    }
  }
}
