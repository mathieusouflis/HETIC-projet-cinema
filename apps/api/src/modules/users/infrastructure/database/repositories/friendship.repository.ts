import { and, eq } from "drizzle-orm";
import { db } from "../../../../../database";
import { friendships } from "../../../../../database/schema";
import { NotFoundError } from "../../../../../shared/errors";
import { ServerError } from "../../../../../shared/errors/server-error";
import { User } from "../../../domain/entities";
import { Friendship } from "../../../domain/entities/friendship.entity";
import type { IFriendshipsRepository } from "../../../domain/interfaces/IFriendshipsRepository";
import type { FriendshipStatus } from "../schemas/friendships.schema";

export class FriendshipRepository implements IFriendshipsRepository {
  async create(userId: string, friendId: string): Promise<Friendship> {
    try {
      const createdFriendships = await db
        .insert(friendships)
        .values({
          friendId,
          userId,
          status: "pending",
        })
        .returning();

      const createdFriendship = createdFriendships[0];

      if (!createdFriendship) {
        throw new ServerError(
          "Something went wrong while creating a friendship"
        );
      }

      return new Friendship(createdFriendship);
    } catch (error) {
      throw new ServerError(`Failed to create friendship: ${error}`);
    }
  }

  async delete(friendshipId: string): Promise<void> {
    try {
      await db.delete(friendships).where(eq(friendships.id, friendshipId));
    } catch (error) {
      throw new ServerError(`Failed to delete friendship: ${error}`);
    }
  }

  async findByUserAndFriend(
    userId: string,
    friendId: string
  ): Promise<Friendship | null> {
    try {
      const friendship = await db.query.friendships.findFirst({
        where: and(
          eq(friendships.userId, userId),
          eq(friendships.friendId, friendId)
        ),
      });

      if (!friendship) {
        return null;
      }

      return new Friendship(friendship);
    } catch (error) {
      throw new ServerError(`Failed to find friendship: ${error}`);
    }
  }

  async getFollowers(userId: string): Promise<User[]> {
    try {
      const followers = await db.query.friendships.findMany({
        where: eq(friendships.friendId, userId),
        with: {
          user_userId: true,
        },
      });

      return followers.map((follower) => new User(follower.user_userId));
    } catch (error) {
      throw new ServerError(`Failed to get followers: ${error}`);
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    try {
      const following = await db.query.friendships.findMany({
        where: eq(friendships.userId, userId),
        with: {
          user_friendId: true,
        },
      });

      return following.map((following) => new User(following.user_friendId));
    } catch (error) {
      throw new ServerError(`Failed to get following: ${error}`);
    }
  }

  async update(
    friendshipId: string,
    status: FriendshipStatus
  ): Promise<Friendship> {
    try {
      const updatedFriendships = await db
        .update(friendships)
        .set({ status })
        .where(eq(friendships.id, friendshipId))
        .returning();

      const updatedFriendship = updatedFriendships[0];

      if (!updatedFriendship) {
        throw new NotFoundError("Friendship not found");
      }

      return new Friendship(updatedFriendship);
    } catch (error) {
      throw new ServerError(`Failed to update friendship: ${error}`);
    }
  }
}
