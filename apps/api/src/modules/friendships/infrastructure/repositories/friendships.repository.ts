import { and, eq, or } from "drizzle-orm";
import { db } from "../../../../database/index";
import { friendships } from "../../../../database/schema";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { ServerError } from "../../../../shared/errors/server-error";
import { User } from "../../../users/domain/entities/user.entity";
import { Friendship } from "../../domain/entities/friendship.entity";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository";
import type { FriendshipStatus } from "../schemas/friendships.schema";

export class FriendshipsRepository implements IFriendshipsRepository {
  async create(userId: string, friendId: string): Promise<Friendship> {
    try {
      const rows = await db
        .insert(friendships)
        .values({ userId, friendId, status: "pending" })
        .returning();

      const row = rows[0];
      if (!row) {
        throw new ServerError("Failed to create friendship");
      }

      return new Friendship(row);
    } catch (error) {
      throw new ServerError(`Failed to create friendship: ${error}`);
    }
  }

  async update(
    friendshipId: string,
    status: FriendshipStatus
  ): Promise<Friendship> {
    try {
      const rows = await db
        .update(friendships)
        .set({ status })
        .where(eq(friendships.id, friendshipId))
        .returning();

      const row = rows[0];
      if (!row) {
        throw new NotFoundError("Friendship not found");
      }

      return new Friendship(row);
    } catch (error) {
      throw new ServerError(`Failed to update friendship: ${error}`);
    }
  }

  async delete(friendshipId: string): Promise<void> {
    try {
      await db.delete(friendships).where(eq(friendships.id, friendshipId));
    } catch (error) {
      throw new ServerError(`Failed to delete friendship: ${error}`);
    }
  }

  async findById(friendshipId: string): Promise<Friendship | null> {
    try {
      const row = await db.query.friendships.findFirst({
        where: eq(friendships.id, friendshipId),
      });
      return row ? new Friendship(row) : null;
    } catch (error) {
      throw new ServerError(`Failed to find friendship: ${error}`);
    }
  }

  async findByUserAndFriend(
    userId: string,
    friendId: string
  ): Promise<Friendship | null> {
    try {
      const row = await db.query.friendships.findFirst({
        where: and(
          eq(friendships.userId, userId),
          eq(friendships.friendId, friendId)
        ),
      });
      return row ? new Friendship(row) : null;
    } catch (error) {
      throw new ServerError(`Failed to find friendship: ${error}`);
    }
  }

  async findAccepted(userA: string, userB: string): Promise<Friendship | null> {
    try {
      const row = await db.query.friendships.findFirst({
        where: and(
          eq(friendships.status, "accepted"),
          or(
            and(eq(friendships.userId, userA), eq(friendships.friendId, userB)),
            and(eq(friendships.userId, userB), eq(friendships.friendId, userA))
          )
        ),
      });
      return row ? new Friendship(row) : null;
    } catch (error) {
      throw new ServerError(`Failed to find accepted friendship: ${error}`);
    }
  }

  async findAllForUser(
    userId: string,
    status?: FriendshipStatus
  ): Promise<Friendship[]> {
    try {
      const whereClause = status
        ? and(
            eq(friendships.status, status),
            or(eq(friendships.userId, userId), eq(friendships.friendId, userId))
          )
        : or(eq(friendships.userId, userId), eq(friendships.friendId, userId));

      const rows = await db.query.friendships.findMany({
        where: whereClause,
      });
      return rows.map((row) => new Friendship(row));
    } catch (error) {
      throw new ServerError(`Failed to list friendships: ${error}`);
    }
  }

  async getFollowers(userId: string): Promise<User[]> {
    try {
      const rows = await db.query.friendships.findMany({
        where: eq(friendships.friendId, userId),
        with: { user_userId: true },
      });
      return rows.map((r) => new User(r.user_userId));
    } catch (error) {
      throw new ServerError(`Failed to get followers: ${error}`);
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    try {
      const rows = await db.query.friendships.findMany({
        where: eq(friendships.userId, userId),
        with: { user_friendId: true },
      });
      return rows.map((r) => new User(r.user_friendId));
    } catch (error) {
      throw new ServerError(`Failed to get following: ${error}`);
    }
  }
}
