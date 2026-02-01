import { logger } from "@packages/logger";
import type { PagePaginationQuery } from "../../../../../shared/services/pagination";
import { CategoryRepository } from "../../../../categories/infrastructure/database/repositories/category/category.repository";
import type {
  CreateMovieProps,
  Movie,
} from "../../../domain/entities/movie.entity";
import type { IMoviesRepository } from "../../../domain/interfaces/IMoviesRepository";
import { DrizzleMoviesRepository } from "./drizzle-movies.repository";
import { TMDBMoviesRepository } from "./tmdb-movies.repository";

/**
 * Cache for category lookups to avoid duplicate database queries
 * Shared across movie requests for better performance
 */
const categoryCache = new Map<number, string>();

/**
 * Clear the category cache
 * Useful for testing or when categories are updated externally
 */
export function clearMovieCategoryCache(): void {
  categoryCache.clear();
  logger.info("Movie category cache cleared");
}

/**
 * Get category cache size
 */
export function getMovieCategoryCacheSize(): number {
  return categoryCache.size;
}

/**
 * Composite Movies Repository
 * Orchestrates data fetching from TMDB and local database
 * Handles the complete flow: fetch from TMDB, check DB, create missing entries with relations
 */
export class CompositeMoviesRepository implements IMoviesRepository {
  private readonly tmdbRepository: TMDBMoviesRepository;
  private readonly drizzleRepository: DrizzleMoviesRepository;
  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.tmdbRepository = new TMDBMoviesRepository();
    this.drizzleRepository = new DrizzleMoviesRepository();
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * List movies with the following flow:
   * 1. Use discover to retrieve movie IDs from TMDB
   * 2. List in the DB all movies with the IDs retrieved
   * 3. Find all the IDs not found in the DB
   * 4. For all IDs not found, use tmdb.detail to retrieve the movies
   * 5. Create all movies with proper relations (categories)
   */
  async listMovies(
    title?: string,
    _country?: string,
    categories?: string[],
    withCategories?: boolean,
    options?: PagePaginationQuery
  ): Promise<{
    data: Movie[];
    total: number;
  }> {
    try {
      const page = options?.page || 1;

      // Step 1: Get movie IDs from TMDB using discover or search
      let tmdbResult: { ids: number[]; results: any[]; total: number };

      if (title) {
        tmdbResult = await this.tmdbRepository.search({
          query: title,
          page,
          withCategories: categories,
        });
        logger.info(
          `Found ${tmdbResult.ids.length} movie IDs from TMDB search for "${title}"`
        );
      } else {
        tmdbResult = await this.tmdbRepository.discover({
          page,
          withCategories: categories,
        });
        logger.info(
          `Found ${tmdbResult.ids.length} movie IDs from TMDB discover (page ${page})`
        );
      }

      const tmdbIds = tmdbResult.ids;

      if (tmdbIds.length === 0) {
        return { data: [], total: 0 };
      }

      // Step 2: List in the DB all movies with the IDs retrieved (no limit)
      // Already load categories if requested to avoid N+1 queries
      const existingMovies = await this.drizzleRepository.getByTmdbIds(tmdbIds);
      logger.info(`Found ${existingMovies.length} existing movies in database`);

      // Step 3: Find all the IDs not found in the DB
      const existingTmdbIds = existingMovies
        .map((movie) => movie.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      // Step 4 & 5: For all IDs not found, fetch and create with relations
      let newlyCreatedMovies: Movie[] = [];
      if (missingTmdbIds.length > 0) {
        const movieDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);

        // Create all movies with proper relations (categories) - optimized batch operation
        newlyCreatedMovies = await this.createMoviesWithRelations(movieDetails);
      }

      const allMovies = [...existingMovies, ...newlyCreatedMovies];

      const { data, total } = {
        data: allMovies,
        total: await this.drizzleRepository.getCount(),
      };

      if (withCategories && newlyCreatedMovies.length > 0) {
        // Batch load categories for all newly created movies
        const categoryPromises = newlyCreatedMovies.map((movie) =>
          this.categoryRepository.findByContentId(movie.id)
        );
        const categoriesResults = await Promise.all(categoryPromises);

        // Set relations
        newlyCreatedMovies.forEach((movie, index) => {
          const categoriesData = categoriesResults[index];
          if (categoriesData) {
            movie.setRelations("contentCategories", categoriesData);
          }
        });
      }

      return { data, total };
    } catch (error) {
      logger.error(`Error listing movies: ${error}`);
      throw error;
    }
  }

  /**
   * Get movie by ID
   * First checks the database, then falls back to TMDB if not found
   */
  async getMovieById(id: string): Promise<Movie | null> {
    try {
      const movie = await this.drizzleRepository.getById(id);

      if (movie) {
        return movie;
      }

      return null;
    } catch (error) {
      logger.error(`Error getting movie by ID ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Search movies
   * Uses TMDB search and ensures all results are in the database
   */
  async searchMovies(
    query: string,
    options?: PagePaginationQuery
  ): Promise<Movie[]> {
    try {
      const page = options?.page || 1;

      // Step 1: Search in TMDB
      const tmdbResult = await this.tmdbRepository.search({
        query,
        page,
      });

      const tmdbIds = tmdbResult.ids;
      logger.info(
        `Found ${tmdbIds.length} movies from TMDB search for "${query}"`
      );

      if (tmdbIds.length === 0) {
        return [];
      }

      // Step 2: Check which movies exist in DB
      const existingMovies = await this.drizzleRepository.getByTmdbIds(tmdbIds);
      const existingTmdbIds = existingMovies
        .map((movie) => movie.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      // Step 3: Fetch missing movies from TMDB and create them
      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      let newMovies: Movie[] = [];
      if (missingTmdbIds.length > 0) {
        logger.info(
          `Fetching ${missingTmdbIds.length} missing movies from TMDB`
        );
        const movieDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);
        newMovies = await this.createMoviesWithRelations(movieDetails);
      }

      return [...existingMovies, ...newMovies];
    } catch (error) {
      logger.error(`Error searching movies: ${error}`);
      throw error;
    }
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

  /**
   * Create multiple movies with their category relations
   * Handles category creation if they don't exist
   * Optimized to batch process all categories first
   */
  private async createMoviesWithRelations(
    movieProps: Array<
      CreateMovieProps & { genres?: Array<{ id: number; name: string }> }
    >
  ): Promise<Movie[]> {
    // Step 1: Collect all unique genres from all movies
    const allGenresMap = new Map<number, { id: number; name: string }>();

    for (const props of movieProps) {
      const { genres } = props;

      if (genres) {
        for (const genre of genres) {
          if (!allGenresMap.has(genre.id)) {
            allGenresMap.set(genre.id, genre);
          }
        }
      }
    }

    // Step 2: Ensure all categories exist (batch operation)
    const allGenres = Array.from(allGenresMap.values());
    if (allGenres.length > 0) {
      await this.ensureCategoriesExist(allGenres);
    }

    // Step 3: Create all movies with their category links
    const createdMovies: Movie[] = [];

    for (const movieProp of movieProps) {
      try {
        const { genres, ...movieData } = movieProp;

        const movie = await this.drizzleRepository.create(movieData);

        if (genres && genres.length > 0) {
          const categoryIds: string[] = [];
          for (const genre of genres) {
            const categoryId = categoryCache.get(genre.id);
            if (categoryId) {
              categoryIds.push(categoryId);
            }
          }

          if (categoryIds.length > 0) {
            await this.drizzleRepository.linkCategories(movie.id, categoryIds);
          }
        }

        createdMovies.push(movie);
      } catch (error) {
        logger.error(
          `Error creating movie with TMDB ID ${movieProp.tmdbId}: ${error}`
        );
        // Continue with other movies even if one fails
      }
    }

    return createdMovies;
  }

  /**
   * Ensure categories exist in the database
   * Creates categories if they don't exist, populates the cache
   * Optimized to handle batch operations and prevent duplicates
   */
  private async ensureCategoriesExist(
    genres: Array<{ id: number; name: string }>
  ): Promise<void> {
    // Check cache first
    const uncachedGenres = genres.filter(
      (genre) => !categoryCache.has(genre.id)
    );

    if (uncachedGenres.length === 0) {
      return;
    }

    // Batch check all uncached genres at once
    const genreIds = uncachedGenres.map((genre) => genre.id);
    const existingCategories =
      await this.categoryRepository.findByTmdbIds(genreIds);

    // Update cache with existing categories
    for (const category of existingCategories) {
      if (category.tmdbId !== null) {
        categoryCache.set(category.tmdbId, category.id);
      }
    }

    // Identify missing genres that need to be created
    const existingTmdbIds = new Set(
      existingCategories
        .map((cat) => cat.tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingGenres = uncachedGenres.filter(
      (genre) => !existingTmdbIds.has(genre.id)
    );

    if (missingGenres.length === 0) {
      return;
    }

    // Create all missing categories with error handling
    for (const genre of missingGenres) {
      // Double-check cache to avoid race conditions
      if (categoryCache.has(genre.id)) {
        continue;
      }

      try {
        const slug = this.generateSlug(genre.name);

        // Check if category with this slug already exists
        const existingBySlug = await this.categoryRepository.findBySlug(slug);

        if (existingBySlug) {
          // Category exists but might not have tmdbId, update cache
          categoryCache.set(genre.id, existingBySlug.id);
          logger.info(`Found existing category by slug: ${genre.name}`);
          continue;
        }

        // Create new category
        const newCategory = await this.categoryRepository.create({
          name: genre.name,
          slug,
          tmdbId: genre.id,
        });

        categoryCache.set(genre.id, newCategory.id);
      } catch (error) {
        logger.error(`Error creating category ${genre.name}: ${error}`);
        // Try to find it again in case another request created it
        try {
          const retryFind = await this.categoryRepository.findByTmdbIds([
            genre.id,
          ]);
          if (retryFind.length > 0 && retryFind[0]) {
            categoryCache.set(genre.id, retryFind[0].id);
            logger.info(`Found category ${genre.name} on retry`);
          }
        } catch (retryError) {
          logger.error(`Retry also failed for ${genre.name}: ${retryError}`);
        }
      }
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
