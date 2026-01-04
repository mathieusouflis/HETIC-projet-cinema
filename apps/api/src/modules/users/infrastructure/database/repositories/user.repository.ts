import { eq, count, and } from "drizzle-orm";
import { db } from "../../../../../database/index.js";
import { users, type UserRow } from "../schemas/users.schema.js";
import type { IUserRepository } from "../../../domain/interfaces/IUserRepository.js";
import {
  User,
  type CreateUserProps,
  type UpdateUserProps,
} from "../../../domain/entities/user.entity.js";

export class UserRepository implements IUserRepository {
  private mapToDomain(row: UserRow): User {
    return new User(row);
  }

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

  async existsByEmail(email: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    return (result?.count ?? 0) > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.username, username));

    return (result?.count ?? 0) > 0;
  }

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

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

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
