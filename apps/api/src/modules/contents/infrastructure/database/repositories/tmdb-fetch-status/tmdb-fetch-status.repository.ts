import { eq } from "drizzle-orm";
import { db } from "../../../../../../database";
import { tmdbFetchStatusSchema } from "../../schemas/tmdb-fetch-status.schema";
import { MetadataNotFoundError } from "./errors/metadata-not-found";

type DiscoverMetadata = {
  page: number;
};

type SearchMetadata = {
  page: number;
};

type ContentType = "movie" | "tv";

const SEARCH_CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 24 hours

export class TMDBFetchStatusRepository {
  // ============================================
  // Discover Methods
  // ============================================

  /**
   * Set metadata for a discover endpoint (e.g., discover/movie or discover/tv)
   * @param discoverType - The type of content to discover (movie or tv)
   * @param metadata - Pagination metadata
   */
  async setDiscoverMetadata(
    discoverType: ContentType,
    metadata: DiscoverMetadata
  ): Promise<void> {
    const path = this.buildDiscoverPath(discoverType);

    await db
      .insert(tmdbFetchStatusSchema)
      .values({
        path,
        type: "discover",
        metadata,
        expiresAt: null, // Discover results don't expire
      })
      .onConflictDoUpdate({
        target: [tmdbFetchStatusSchema.path],
        set: { metadata },
      });
  }

  /**
   * Get metadata for a discover endpoint
   * @param discoverType - The type of content to discover (movie or tv)
   * @returns The discover metadata
   */
  async getDiscoverMetadata(
    discoverType: ContentType
  ): Promise<DiscoverMetadata> {
    const path = this.buildDiscoverPath(discoverType);

    const result = await db.query.tmdbFetchStatus.findFirst({
      where: eq(tmdbFetchStatusSchema.path, path),
    });

    if (!result) {
      throw new MetadataNotFoundError(path);
    }

    return result.metadata as DiscoverMetadata;
  }

  /**
   * Build the path for a discover endpoint
   * @private
   */
  private buildDiscoverPath(discoverType: ContentType): string {
    return `discover/${discoverType}`;
  }

  // ============================================
  // Search Methods
  // ============================================

  /**
   * Set metadata for a search query
   * Each unique query has its own cache entry
   * @param query - The search query string
   * @param metadata - Pagination metadata
   */
  async setSearchMetadata(
    query: string,
    metadata: SearchMetadata
  ): Promise<void> {
    const path = this.buildSearchPath(query);
    const expiresAt = new Date(
      Date.now() + SEARCH_CACHE_DURATION_MS
    ).toISOString();

    await db
      .insert(tmdbFetchStatusSchema)
      .values({
        path,
        type: "search",
        metadata,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [tmdbFetchStatusSchema.path],
        set: {
          metadata,
          expiresAt,
        },
      });
  }

  /**
   * Get metadata for a search query
   * @param query - The search query string
   * @returns The search metadata
   */
  async getSearchMetadata(query: string): Promise<SearchMetadata> {
    const path = this.buildSearchPath(query);

    const result = await db.query.tmdbFetchStatus.findFirst({
      where: eq(tmdbFetchStatusSchema.path, path),
    });

    if (!result) {
      throw new MetadataNotFoundError(path);
    }

    // Check if the cache has expired
    if (result.expiresAt && new Date(result.expiresAt) < new Date()) {
      throw new MetadataNotFoundError(path);
    }

    return result.metadata as SearchMetadata;
  }

  /**
   * Build the path for a search query
   * Normalizes the query to ensure consistent cache keys
   * @private
   */
  private buildSearchPath(query: string): string {
    const normalizedQuery = query.trim().toLowerCase();
    return `search/${normalizedQuery}`;
  }

  // ============================================ //
  //               Utility Methods                //
  // ============================================ //

  /**
   * Delete expired search cache entries
   * Should be called periodically (e.g., via a cron job)
   */
  async cleanupExpiredSearches(): Promise<number> {
    const result = await db
      .delete(tmdbFetchStatusSchema)
      .where(eq(tmdbFetchStatusSchema.type, "search"))
      .returning();

    return result.length;
  }

  /**
   * Delete a specific discover cache entry
   */
  async deleteDiscoverMetadata(discoverType: ContentType): Promise<void> {
    const path = this.buildDiscoverPath(discoverType);
    await db
      .delete(tmdbFetchStatusSchema)
      .where(eq(tmdbFetchStatusSchema.path, path));
  }

  /**
   * Delete a specific search cache entry
   */
  async deleteSearchMetadata(query: string): Promise<void> {
    const path = this.buildSearchPath(query);
    await db
      .delete(tmdbFetchStatusSchema)
      .where(eq(tmdbFetchStatusSchema.path, path));
  }
}
