import { logger } from "@packages/logger";
import type { PaginationQuery } from "../../../../../shared/services/pagination";
import { CategoryRepository } from "../../../../categories/infrastructure/database/repositories/category/category.repository";
import type {
  CreateSerieProps,
  Serie,
} from "../../../domain/entities/serie.entity";
import type { ISeriesRepository } from "../../../domain/interfaces/ISeriesRepository";
import { DrizzleSeriesRepository } from "./drizzle-series.repository";
import { TMDBSeriesRepository } from "./tmdb-series.repository";

const categoryCache = new Map<number, string>();

export function clearCategoryCache(): void {
  categoryCache.clear();
  logger.info("Category cache cleared");
}

export function getCategoryCacheSize(): number {
  return categoryCache.size;
}

/**
 * Composite Series Repository
 * Orchestrates data fetching from TMDB and local database
 * Handles the complete flow: fetch from TMDB, check DB, create missing entries with relations
 */
export class CompositeSeriesRepository implements ISeriesRepository {
  private readonly tmdbRepository: TMDBSeriesRepository;
  private readonly drizzleRepository: DrizzleSeriesRepository;
  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.tmdbRepository = new TMDBSeriesRepository();
    this.drizzleRepository = new DrizzleSeriesRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async listSeries(
    title?: string,
    _country?: string,
    categories?: string[],
    withCategories?: boolean,
    options?: PaginationQuery
  ): Promise<{
    data: Serie[];
    total: number;
  }> {
    try {
      const page = options?.page || 1;

      let tmdbResult: { ids: number[]; results: any[] };

      if (title) {
        tmdbResult = await this.tmdbRepository.search({
          query: title,
          page,
          withCategories: categories,
        });
      } else {
        tmdbResult = await this.tmdbRepository.discover({
          page,
          withCategories: categories,
        });
      }

      const tmdbIds = tmdbResult.ids;

      if (tmdbIds.length === 0) {
        return { data: [], total: 0 };
      }

      const existingSeries = await this.drizzleRepository.getByTmdbIds(tmdbIds);

      const existingTmdbIds = existingSeries
        .map((serie) => serie.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      let newlySeries: Serie[] = [];
      if (missingTmdbIds.length > 0) {
        const seriesDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);

        newlySeries = await this.createSeriesWithRelations(seriesDetails);
      }

      const allSeries = [...existingSeries, ...newlySeries];

      const { data, total } = this.applyPaginationAndFilters(
        allSeries,
        title,
        categories,
        options
      );

      if (withCategories && newlySeries.length > 0) {
        const categoryPromises = newlySeries.map((serie) =>
          this.categoryRepository.findByContentId(serie.id)
        );
        const categoriesResults = await Promise.all(categoryPromises);

        newlySeries.forEach((serie, index) => {
          const categoriesData = categoriesResults[index];
          if (categoriesData) {
            serie.setRelations("contentCategories", categoriesData);
          }
        });
      }

      return { data, total };
    } catch (error) {
      logger.error(`Error listing series: ${error}`);
      throw error;
    }
  }

  /**
   * Get series by ID
   * First checks the database, then falls back to TMDB if not found
   */
  async getSerieById(id: string): Promise<Serie | null> {
    try {
      // Try to get from database first
      const serie = await this.drizzleRepository.getById(id);

      if (serie) {
        return serie;
      }

      return null;
    } catch (error) {
      logger.error(`Error getting series by ID ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Search series
   * Uses TMDB search and ensures all results are in the database
   */
  async searchSeries(
    query: string,
    options?: PaginationQuery
  ): Promise<Serie[]> {
    try {
      const page = options?.page || 1;

      const tmdbResult = await this.tmdbRepository.search({
        query,
        page,
      });

      const tmdbIds = tmdbResult.ids;

      if (tmdbIds.length === 0) {
        return [];
      }

      const existingSeries = await this.drizzleRepository.getByTmdbIds(tmdbIds);
      const existingTmdbIds = existingSeries
        .map((serie) => serie.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      let newSeries: Serie[] = [];
      if (missingTmdbIds.length > 0) {
        const seriesDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);
        newSeries = await this.createSeriesWithRelations(seriesDetails);
      }

      return [...existingSeries, ...newSeries];
    } catch (error) {
      logger.error(`Error searching series: ${error}`);
      throw error;
    }
  }

  async createSerie(content: CreateSerieProps): Promise<Serie> {
    try {
      const serie = await this.drizzleRepository.create(content);
      return serie;
    } catch (error) {
      logger.error(`Error creating series: ${error}`);
      throw error;
    }
  }

  /**
   * Create multiple series with their category relations
   * Handles category creation if they don't exist
   * Optimized to batch process all categories first
   */
  private async createSeriesWithRelations(
    seriesProps: CreateSerieProps[]
  ): Promise<Serie[]> {
    const allGenresMap = new Map<number, { id: number; name: string }>();

    for (const props of seriesProps) {
      const { genres } = props as CreateSerieProps & {
        genres?: Array<{ id: number; name: string }>;
      };

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

    // Step 3: Create all series with their category links
    const createdSeries: Serie[] = [];

    for (const serieProps of seriesProps) {
      try {
        // Extract genres from props
        const { genres, ...serieData } = serieProps as CreateSerieProps & {
          genres?: Array<{ id: number; name: string }>;
        };

        // Create the series
        const serie = await this.drizzleRepository.create(serieData);

        // Handle category relations
        if (genres && genres.length > 0) {
          // Get category IDs from cache (they were already created/fetched)
          const categoryIds: string[] = [];
          for (const genre of genres) {
            const categoryId = categoryCache.get(genre.id);
            if (categoryId) {
              categoryIds.push(categoryId);
            }
          }

          if (categoryIds.length > 0) {
            await this.drizzleRepository.linkCategories(serie.id, categoryIds);
          }
        }

        createdSeries.push(serie);
      } catch (error) {
        logger.error(
          `Error creating series with TMDB ID ${serieProps.tmdbId}: ${error}`
        );
        // Continue with other series even if one fails
      }
    }

    return createdSeries;
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

  /**
   * Apply pagination and filters to series list
   */
  private applyPaginationAndFilters(
    series: Serie[],
    title?: string,
    _categories?: string[],
    options?: PaginationQuery
  ): { data: Serie[]; total: number } {
    let filtered = series;

    // Filter by title if provided
    if (title) {
      const lowerTitle = title.toLowerCase();
      filtered = filtered.filter(
        (serie) =>
          serie.title.toLowerCase().includes(lowerTitle) ||
          (serie.originalTitle?.toLowerCase().includes(lowerTitle) ?? false)
      );
    }

    const total = filtered.length;

    // Apply pagination
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      filtered = filtered.slice(start, end);
    }

    return { data: filtered, total };
  }
}
