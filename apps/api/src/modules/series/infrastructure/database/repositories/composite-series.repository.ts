import { logger } from "@packages/logger";
import type { PagePaginationQuery } from "../../../../../shared/services/pagination";
import { CategoryRepository } from "../../../../categories/infrastructure/database/repositories/category/category.repository";
import { PlatformsRepository } from "../../../../platforms/infrastructure/database/platforms.repository";
import type {
  CreateSerieProps,
  Serie,
} from "../../../domain/entities/serie.entity";
import type { ISeriesRepository } from "../../../domain/interfaces/ISeriesRepository";
import { DrizzleSeriesRepository } from "./drizzle-series.repository";
import { TMDBSeriesRepository } from "./tmdb-series.repository";

/**
 * TMDB Genre type for series
 */
export type SerieTMDBGenre = {
  id: number;
  name: string;
};

/**
 * Provider data from TMDB
 */
export type ProviderData = {
  display_priority: number;
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
};

/**
 * TMDB relations type for series
 */
export type SerieTMDBRelations = {
  genres?: Array<SerieTMDBGenre>;
  providers?: Array<ProviderData>;
};

/**
 * Cache for category lookups to avoid duplicate database queries
 * Shared across series requests for better performance
 */
const categoryCache = new Map<number, string>();
const providerCache = new Map<number, string>();

/**
 * Clear the cache
 */
export function clearCache(cache: Map<number, string>): void {
  cache.clear();
}

/**
 * Get cache size
 */
export function getCacheSize(cache: Map<number, string>): number {
  return cache.size;
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
  private readonly platformRepository: PlatformsRepository;

  constructor() {
    this.tmdbRepository = new TMDBSeriesRepository();
    this.drizzleRepository = new DrizzleSeriesRepository();
    this.categoryRepository = new CategoryRepository();
    this.platformRepository = new PlatformsRepository();
  }

  /**
   * List series with the following flow:
   * 1. Use discover to retrieve series IDs from TMDB
   * 2. List in the DB all series with the IDs retrieved
   * 3. Find all the IDs not found in the DB
   * 4. For all IDs not found, use tmdb.detail to retrieve the series
   * 5. Create all series with proper relations (categories)
   */
  async listSeries(
    title?: string,
    _country?: string,
    categories?: string[],
    withCategories?: boolean,
    withPlatform?: boolean,
    options?: PagePaginationQuery
  ): Promise<{
    data: Serie[];
    total: number;
  }> {
    try {
      const page = options?.page || 1;

      // Step 1: Get series IDs from TMDB using discover or search
      let tmdbResult: { ids: number[]; results: unknown[]; total: number };

      if (title) {
        tmdbResult = await this.tmdbRepository.search({
          query: title,
          page,
          withCategories: categories,
        });
        logger.info(
          `Found ${tmdbResult.ids.length} series IDs from TMDB search for "${title}"`
        );
      } else {
        tmdbResult = await this.tmdbRepository.discover({
          page,
          withCategories: categories,
        });
        logger.info(
          `Found ${tmdbResult.ids.length} series IDs from TMDB discover (page ${page})`
        );
      }

      const tmdbIds = tmdbResult.ids;

      if (tmdbIds.length === 0) {
        return { data: [], total: 0 };
      }

      // Step 2: List in the DB all series with the IDs retrieved (no limit)
      // Already load categories if requested to avoid N+1 queries
      const existingSeries = await this.drizzleRepository.getByTmdbIds(
        tmdbIds,
        {
          withCategories: withCategories,
          withPlatform: withPlatform,
        }
      );
      logger.info(`Found ${existingSeries.length} existing series in database`);

      // Step 3: Find all the IDs not found in the DB
      const existingTmdbIds = existingSeries
        .map((serie) => serie.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      // Step 4 & 5: For all IDs not found, fetch and create with relations
      let newlyCreatedSeries: Serie[] = [];
      if (missingTmdbIds.length > 0) {
        logger.info(
          `Fetching ${missingTmdbIds.length} missing series from TMDB`
        );
        const seriesDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);

        // Create all series with proper relations (categories) - optimized batch operation
        newlyCreatedSeries =
          await this.createSeriesWithRelations(seriesDetails);
      }

      const allSeries = [...existingSeries, ...newlyCreatedSeries];

      const { data, total } = {
        data: allSeries,
        total: await this.drizzleRepository.getCount(),
      };

      if (!withCategories) {
        data.forEach((serie) => {
          serie.removeRelations("contentCategories");
        });
      }

      if (!withPlatform) {
        data.forEach((serie) => {
          serie.removeRelations("contentPlatforms");
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
  async getSerieById(
    id: string,
    options?: { withCategories?: boolean; withPlatform?: boolean }
  ): Promise<Serie | null> {
    try {
      const serie = await this.drizzleRepository.getById(id, options);

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
    options?: PagePaginationQuery
  ): Promise<Serie[]> {
    try {
      const page = options?.page || 1;

      // Step 1: Search in TMDB
      const tmdbResult = await this.tmdbRepository.search({
        query,
        page,
      });

      const tmdbIds = tmdbResult.ids;
      logger.info(
        `Found ${tmdbIds.length} series from TMDB search for "${query}"`
      );

      if (tmdbIds.length === 0) {
        return [];
      }

      // Step 2: Check which series exist in DB
      const existingSeries = await this.drizzleRepository.getByTmdbIds(tmdbIds);
      const existingTmdbIds = existingSeries
        .map((serie) => serie.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      // Step 3: Fetch missing series from TMDB and create them
      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      let newSeries: Serie[] = [];
      if (missingTmdbIds.length > 0) {
        logger.info(
          `Fetching ${missingTmdbIds.length} missing series from TMDB`
        );
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
      logger.info(`Created series ${serie.id}`);
      return serie;
    } catch (error) {
      logger.error(`Error creating series: ${error}`);
      throw error;
    }
  }

  async updateSerie(
    id: string,
    props: Partial<CreateSerieProps>
  ): Promise<Serie> {
    try {
      const serie = await this.drizzleRepository.update(id, props);
      logger.info(`Updated series ${id}`);
      return serie;
    } catch (error) {
      logger.error(`Error updating series ${id}: ${error}`);
      throw error;
    }
  }

  async deleteSerie(id: string): Promise<void> {
    try {
      await this.drizzleRepository.delete(id);
      logger.info(`Deleted series ${id}`);
    } catch (error) {
      logger.error(`Error deleting series ${id}: ${error}`);
      throw error;
    }
  }

  async getSerieCount(
    title?: string,
    country?: string,
    categories?: string[]
  ): Promise<number> {
    try {
      return await this.drizzleRepository.getCount(title, country, categories);
    } catch (error) {
      logger.error(`Error getting series count: ${error}`);
      throw error;
    }
  }

  /**
   * Create multiple series with their category relations
   * Handles category creation if they don't exist
   * Optimized to batch process all categories first
   */
  private async createSeriesWithRelations(
    seriesProps: Array<CreateSerieProps & SerieTMDBRelations>
  ): Promise<Serie[]> {
    // Step 1: Collect all unique genres from all series
    const allGenresMap = new Map<number, SerieTMDBGenre>();
    const allProvidersMap = new Map<number, ProviderData>();

    for (const props of seriesProps) {
      const { genres, providers } = props;

      if (providers) {
        for (const provider of providers) {
          if (!allProvidersMap.has(provider.provider_id)) {
            allProvidersMap.set(provider.provider_id, provider);
          }
        }
      }

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

    const allProviders = Array.from(allProvidersMap.values());
    if (allProviders.length > 0) {
      await this.ensureProvidersExist(allProviders);
    }

    // Step 3: Create all series with their category links
    const createdSeries: Serie[] = [];

    for (const serieProp of seriesProps) {
      try {
        const { genres, providers, ...serieData } = serieProp;

        const serie = await this.drizzleRepository.create(serieData);

        if (genres && genres.length > 0) {
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
          `Error creating series with TMDB ID ${serieProp.tmdbId}: ${error}`
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
    genres: Array<SerieTMDBGenre>
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

  /**
   * Ensure providers exist in the database
   * Creates providers if they don't exist, populates the cache
   */
  private async ensureProvidersExist(providers: ProviderData[]): Promise<void> {
    const uncachedProviders = providers.filter(
      (provider) => !providerCache.has(provider.provider_id)
    );

    if (uncachedProviders.length === 0) {
      return;
    }

    const providersId = uncachedProviders.map(
      (provider) => provider.provider_id
    );
    const existingProviders =
      await this.platformRepository.findByTmdbIds(providersId);

    // Update cache with existing provider
    for (const provider of existingProviders) {
      const jsonProvider = provider.toJSON();
      if (jsonProvider.tmdbId !== null) {
        providerCache.set(jsonProvider.tmdbId, jsonProvider.id);
      }
    }

    // Identify missing providers that need to be created
    const existingTmdbIds = new Set(
      existingProviders
        .map((provider) => provider.toJSON().tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingProviders = uncachedProviders.filter(
      (provider) => !existingTmdbIds.has(provider.provider_id)
    );

    if (missingProviders.length === 0) {
      return;
    }

    // Create all missing providers with error handling
    for (const provider of missingProviders) {
      // Double-check cache to avoid race conditions
      if (providerCache.has(provider.provider_id)) {
        continue;
      }

      try {
        const slug = this.generateSlug(provider.provider_name);

        // Create new provider
        const newProvider = await this.platformRepository.create({
          name: provider.provider_name,
          slug,
          tmdbId: provider.provider_id,
        });

        providerCache.set(provider.provider_id, newProvider.toJSON().id);
        logger.info(`Created provider: ${provider.provider_name}`);
      } catch (error) {
        logger.error(
          `Error creating provider ${provider.provider_name}: ${error}`
        );
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
