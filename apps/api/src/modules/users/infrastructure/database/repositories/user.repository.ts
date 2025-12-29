import { eq, count, and } from "drizzle-orm";
import { db } from "../../../../../database/index.js";
import { users, type UserRow } from "../schemas/users.schema.js";
import type { IUserRepository } from "../../../domain/interfaces/IUserRepository.js";
import {
  User,
  type CreateUserProps,
  type UpdateUserProps,
} from "../../../domain/entities/user.entity.js";

/**
 * PostgreSQL User Repository Implementation
 *
 * Implements IUserRepository interface using Drizzle ORM
 *
 * @example
 * ```ts
 * const userRepository = new UserRepository();
 * const user = await userRepository.findById('123');
 * ```
 */
export class UserRepository implements IUserRepository {
  /**
   * @param row - Database row from users table
   * @returns User domain entity
   */
  private mapToDomain(row: UserRow): User {
    return new User(row);
  }

  /**
   * Find a user by their unique ID
   *
   * @param id - User's unique identifier
   * @returns Promise resolving to User entity or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  /**
   * Find a user by their email address
   *
   * @param email - User's email address
   * @returns Promise resolving to User entity or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  /**
   * Find a user by their username
   *
   * @param username - User's username
   * @returns Promise resolving to User entity or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  /**
   * Find a user by OAuth provider and ID
   *
   * @param provider - OAuth provider name (e.g., 'google', 'github')
   * @param oauthId - User's ID from the OAuth provider
   * @returns Promise resolving to User entity or null if not found
   */
  async findByOAuth(provider: string, oauthId: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.oauthProvider, provider), eq(users.oauthId, oauthId)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  /**
   * Check if a user exists with the given email
   *
   * @param email - Email address to check
   * @returns Promise resolving to true if email exists, false otherwise
   */
  async existsByEmail(email: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    return (result?.count ?? 0) > 0;
  }

  /**
   * Check if a user exists with the given username
   *
   * @param username - Username to check
   * @returns Promise resolving to true if username exists, false otherwise
   */
  async existsByUsername(username: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.username, username));

    return (result?.count ?? 0) > 0;
  }

  /**
   * Create a new user
   *
   * @param data - User creation data
   * @returns Promise resolving to the created User entity
   */
  async create(data: CreateUserProps): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        username: data.username,
        passwordHash: data.passwordHash ?? null,
        displayName: data.displayName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        bio: data.bio ?? null,
        oauthProvider: data.oauthProvider ?? null,
        oauthId: data.oauthId ?? null,
        theme: data.theme ?? "dark",
        language: data.language ?? "fr",
        emailNotifications: data.emailNotifications ?? true,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create user");
    }

    return this.mapToDomain(row);
  }

  /**
   * Update an existing user
   *
   * @param id - User's unique identifier
   * @param data - Partial user data to update
   * @returns Promise resolving to the updated User entity
   */
  async update(id: string, data: UpdateUserProps): Promise<User> {
    const updateData: Partial<UserRow> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.email !== undefined) {
      updateData.email = data.email.toLowerCase();
    }
    if (data.username !== undefined) {
      updateData.username = data.username;
    }
    if (data.passwordHash !== undefined) {
      updateData.passwordHash = data.passwordHash;
    }
    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }
    if (data.theme !== undefined) {
      updateData.theme = data.theme;
    }
    if (data.language !== undefined) {
      updateData.language = data.language;
    }
    if (data.emailNotifications !== undefined) {
      updateData.emailNotifications = data.emailNotifications;
    }

    const [row] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!row) {
      throw new Error("Failed to update user or user not found");
    }

    return this.mapToDomain(row);
  }

  /**
   * Delete a user by their ID
   *
   * @param id - User's unique identifier
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  /**
   * Get all users with pagination
   *
   * @param options - Pagination options
   * @returns Promise resolving to array of User entities and total count
   */
  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ users: User[]; total: number }> {
    const offset = (options.page - 1) * options.limit;

    const [countResult, rows] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select().from(users).limit(options.limit).offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      users: rows.map((row) => this.mapToDomain(row)),
      total,
    };
  }
}
