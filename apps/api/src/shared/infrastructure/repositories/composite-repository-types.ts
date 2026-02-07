/**
 * Shared types for composite repositories
 */

import type { TMDBPeople } from "../../../modules/movies/infrastructure/database/repositories/tmdb-movies.repository";
import type { TMDBSeason } from "../../../modules/seasons/infrastructure/tmdb/seasons.tmdb.repository";

/**
 * TMDB Genre type (shared between movies and series)
 */
export type TMDBGenre = {
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
 * TMDB relations type (shared structure)
 */
export type TMDBRelations = {
  genres?: Array<TMDBGenre>;
  providers?: Array<ProviderData>;
  cast?: Array<TMDBPeople>;
  seasons?: Array<TMDBSeason>;
};

/**
 * Cache management utilities
 */
export class CacheManager {
  /**
   * Clear the cache
   */
  static clearCache(cache: Map<number, string>): void {
    cache.clear();
  }

  /**
   * Get cache size
   */
  static getCacheSize(cache: Map<number, string>): number {
    return cache.size;
  }

  /**
   * Generate URL-friendly slug from name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
