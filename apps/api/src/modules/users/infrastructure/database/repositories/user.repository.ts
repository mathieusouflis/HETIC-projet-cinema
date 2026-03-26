import { and, count, eq, sql, sum } from "drizzle-orm";
import { db } from "../../../../../database/index.js";
import {
  content,
  episodes,
  friendships,
  seasons,
  watchlist,
} from "../../../../../database/schema.js";
import {
  type CreateUserProps,
  type UpdateUserProps,
  User,
} from "../../../domain/entities/user.entity";
import type { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { type UserRow, users } from "../schemas/users.schema";

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

    const viewedSeriesEpisodesCondition = sql`
      ${watchlist.status} = 'completed'
      OR (
        ${watchlist.currentSeason} IS NOT NULL
        AND ${watchlist.currentEpisode} IS NOT NULL
        AND ${watchlist.status} <> 'plan_to_watch'
        AND ${watchlist.status} <> 'not_interested'
        AND ${watchlist.status} <> 'undecided'
        AND (
          ${seasons.seasonNumber} < ${watchlist.currentSeason}
          OR (
            ${seasons.seasonNumber} = ${watchlist.currentSeason}
            AND ${episodes.episodeNumber} <= ${watchlist.currentEpisode}
          )
        )
      )
    `;

    const [
      [followersResult],
      [followingResult],
      [movieStatsRow],
      [seriesStatsRow],
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(friendships)
        .where(
          and(eq(friendships.friendId, id), eq(friendships.status, "accepted"))
        ),
      db
        .select({ count: count() })
        .from(friendships)
        .where(
          and(eq(friendships.userId, id), eq(friendships.status, "accepted"))
        ),
      db
        .select({
          totalMovieMinutes: sql<number>`coalesce(${sum(
            content.durationMinutes
          )}, 0)`,
          totalMoviesWatched: count(),
        })
        .from(watchlist)
        .innerJoin(content, eq(content.id, watchlist.contentId))
        .where(
          and(
            eq(watchlist.userId, id),
            eq(watchlist.status, "completed"),
            eq(content.type, "movie")
          )
        ),
      db
        .select({
          totalSeriesMinutes: sql<number>`coalesce(${sum(
            episodes.durationMinutes
          )}, 0)`,
          totalEpisodesWatched: count(episodes.id),
        })
        .from(watchlist)
        .innerJoin(content, eq(content.id, watchlist.contentId))
        .leftJoin(seasons, eq(seasons.seriesId, content.id))
        .leftJoin(episodes, eq(episodes.seasonId, seasons.id))
        .where(
          and(
            eq(watchlist.userId, id),
            eq(content.type, "serie"),
            viewedSeriesEpisodesCondition
          )
        ),
    ]);
    const totalMovieMinutes = Number(movieStatsRow?.totalMovieMinutes ?? 0);
    const totalSeriesMinutes = Number(seriesStatsRow?.totalSeriesMinutes ?? 0);
    const totalMoviesWatched = Number(movieStatsRow?.totalMoviesWatched ?? 0);
    const totalEpisodesWatched = Number(
      seriesStatsRow?.totalEpisodesWatched ?? 0
    );

    return new User({
      ...row,
      followersCount: Number(followersResult?.count ?? 0),
      followingCount: Number(followingResult?.count ?? 0),
      stats: {
        totalSeriesHours: Math.floor(totalSeriesMinutes / 60),
        totalMovieHours: Math.floor(totalMovieMinutes / 60),
        totalEpisodes: totalEpisodesWatched,
        totalMovies: totalMoviesWatched,
      },
    });
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
      .where(eq(users.username, username.toLowerCase()))
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
      .where(eq(users.username, username.toLowerCase()));

    return (result?.count ?? 0) > 0;
  }

  async create(data: CreateUserProps): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
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
      updateData.username = data.username.toLowerCase();
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

  async markEmailVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerifiedAt: new Date().toISOString() })
      .where(eq(users.id, userId));
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
