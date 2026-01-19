import { Watchlist } from "../entities/watchlist.entity";

export interface IWatchlistRepository {
  /**
   * Find a user's watchlist by their unique ID
   *
   * @param userId - User's unique identifier
   * @returns Promise resolving to Watchlist entity or null if not found
   */
  findByUserId(userId: string): Promise<Watchlist | null>;

  /**
   * Find a user's watchlist by status
   *
   * @param userId - User's unique identifier
   * @param status - Status of the watchlist (e.g., "watched", "to-watch")
   * @returns Promise resolving to Watchlist entity or null if not found
   */
  findByStatus(userId: string, status: string): Promise<Watchlist | null>;

  /**
   * Find a user's watchlist entry by content ID
   *
   * @param userId - User's unique identifier
   * @param contentId - Unique identifier of the content
   * @returns Promise resolving to Watchlist entity or null if not found
   */
  findByContentId(userId: string, contentId: string): Promise<Watchlist | null>;

  /**
   * Update a specific content entry in a user's watchlist
   *
   * @param userId - User's unique identifier
   * @param contentId - Unique identifier of the content
   * @param patch - Partial Watchlist entity containing the updates
   * @returns Promise resolving to the updated Watchlist entity or null if not found
   */
  patchContent(userId: string, contentId: string, patch: Watchlist): Promise<Watchlist | null>;

  /**
   * Add a new content entry to a user's watchlist
   *
   * @param userId - User's unique identifier
   * @param contentId - Unique identifier of the content
   * @returns Promise resolving to the newly added Watchlist entity or null if the operation fails
   */
  addContentForUser(userId: string, contentId: string): Promise<Watchlist | null>;

  /**
   * Remove a content entry from a user's watchlist
   *
   * @param userId - User's unique identifier
   * @param contentId - Unique identifier of the content
   * @returns Promise resolving to the removed Watchlist entity or null if not found
   */
  removeContentFromUser(userId: string, contentId: string): Promise<Watchlist | null>;
}
