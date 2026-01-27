import type { FriendshipStatus } from "../../infrastructure/database/schemas/friendships.schema";
import type { User } from "../entities";
import type { Friendship } from "../entities/friendship.entity";

export interface IFriendshipsRepository {
  create(userId: string, friendId: string): Promise<Friendship>;
  update(friendshipId: string, status: FriendshipStatus): Promise<Friendship>;
  delete(friendshipId: string): Promise<void>;
  findByUserAndFriend(
    userId: string,
    friendId: string
  ): Promise<Friendship | null>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
}
