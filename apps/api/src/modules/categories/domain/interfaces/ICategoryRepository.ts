import type {
  Category,
  CreateCategoryProps,
  UpdateCategoryProps,
} from "../entities/category.entity.js";

export interface ICategoryRepository {
  /**
   * Find a category by its unique ID
   *
   * @param id - Category's unique identifier
   * @returns Promise resolving to Category entity or null if not found
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find a category by its slug
   *
   * @param slug - Category's slug
   * @returns Promise resolving to Category entity or null if not found
   */
  findBySlug(slug: string): Promise<Category | null>;

  /**
   * Find a category by its name
   *
   * @param name - Category's name
   * @returns Promise resolving to Category entity or null if not found
   */
  findByName(name: string): Promise<Category | null>;

  /**
   * Check if a category exists with the given name
   *
   * @param name - Name to check
   * @returns Promise resolving to true if name exists, false otherwise
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Check if a category exists with the given slug
   *
   * @param slug - Slug to check
   * @returns Promise resolving to true if slug exists, false otherwise
   */
  existsBySlug(slug: string): Promise<boolean>;

  /**
   * Create a new category
   *
   * @param data - Category creation data
   * @returns Promise resolving to the created Category entity
   */
  create(data: CreateCategoryProps): Promise<Category>;

  /**
   * Update an existing category
   *
   * @param id - Category's unique identifier
   * @param data - Partial category data to update
   * @returns Promise resolving to the updated Category entity
   * @throws NotFoundError if category doesn't exist
   */
  update(id: string, data: UpdateCategoryProps): Promise<Category>;

  /**
   * Delete a category by its ID
   *
   * @param id - Category's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws NotFoundError if category doesn't exist
   */
  delete(id: string): Promise<void>;

  /**
   * Get all categories with pagination
   *
   * @param options - Pagination options
   * @returns Promise resolving to array of Category entities and total count
   */
  findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ categories: Category[]; total: number }>;

  /**
   * Find categories by TMDB genre IDs
   *
   * @param tmdbIds - Array of TMDB genre IDs
   * @returns Promise resolving to array of Category entities
   */
  findByTmdbIds(tmdbIds: number[]): Promise<Category[]>;

  /**
   * Get categories for a specific content
   *
   * @param contentId - Content's unique identifier
   * @returns Promise resolving to array of Category entities
   */
  findByContentId(contentId: string): Promise<Category[]>;
}
