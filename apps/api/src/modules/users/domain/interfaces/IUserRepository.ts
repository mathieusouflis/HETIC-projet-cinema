import type {
  CreateUserProps,
  UpdateUserProps,
  User,
} from "../entities/user.entity.js";

export interface IUserRepository {
  /**
   * Find a user by their unique ID
   *
   * @param id - User's unique identifier
   * @returns Promise resolving to User entity or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address
   *
   * @param email - User's email address
   * @returns Promise resolving to User entity or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their username
   *
   * @param username - User's username
   * @returns Promise resolving to User entity or null if not found
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find a user by OAuth provider and ID
   *
   * @param provider - OAuth provider name (e.g., 'google', 'github')
   * @param oauthId - User's ID from the OAuth provider
   * @returns Promise resolving to User entity or null if not found
   */
  findByOAuth(provider: string, oauthId: string): Promise<User | null>;

  /**
   * Check if a user exists with the given email
   *
   * @param email - Email address to check
   * @returns Promise resolving to true if email exists, false otherwise
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Check if a user exists with the given username
   *
   * @param username - Username to check
   * @returns Promise resolving to true if username exists, false otherwise
   */
  existsByUsername(username: string): Promise<boolean>;

  /**
   * Create a new user
   *
   * @param data - User creation data
   * @returns Promise resolving to the created User entity
   */
  create(data: CreateUserProps): Promise<User>;

  /**
   * Update an existing user
   *
   * @param id - User's unique identifier
   * @param data - Partial user data to update
   * @returns Promise resolving to the updated User entity
   * @throws NotFoundError if user doesn't exist
   */
  update(id: string, data: UpdateUserProps): Promise<User>;

  /**
   * Delete a user by their ID
   *
   * @param id - User's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws NotFoundError if user doesn't exist
   */
  delete(id: string): Promise<void>;

  /**
   * Get all users with pagination
   *
   * @param options - Pagination options
   * @returns Promise resolving to array of User entities and total count
   */
  findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ users: User[]; total: number }>;
}
