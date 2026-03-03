import type { User } from "../../../users/domain/entities/user.entity.js";
import type { FriendshipStatus } from "../../infrastructure/schemas/friendships.schema.js";
import type { Friendship } from "../entities/friendship.entity.js";

export interface IFriendshipsRepository {
  create(userId: string, friendId: string): Promise<Friendship>;
  update(friendshipId: string, status: FriendshipStatus): Promise<Friendship>;
  delete(friendshipId: string): Promise<void>;
  findById(friendshipId: string): Promise<Friendship | null>;
  findByUserAndFriend(
    userId: string,
    friendId: string
  ): Promise<Friendship | null>;
  /** Finds an accepted friendship regardless of direction (A→B or B→A). */
  findAccepted(userA: string, userB: string): Promise<Friendship | null>;
  /** All friendship rows where the user is either side, optionally filtered by status. */
  findAllForUser(
    userId: string,
    status?: FriendshipStatus
  ): Promise<Friendship[]>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
}
