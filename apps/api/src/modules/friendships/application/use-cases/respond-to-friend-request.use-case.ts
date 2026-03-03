import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import type { Friendship } from "../../domain/entities/friendship.entity.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";
import type { FriendshipStatus } from "../../infrastructure/schemas/friendships.schema.js";

export class RespondToFriendRequestUseCase {
  constructor(private readonly friendshipsRepository: IFriendshipsRepository) {}

  async execute(
    callerId: string,
    friendshipId: string,
    status: Extract<FriendshipStatus, "accepted" | "rejected">
  ): Promise<Friendship> {
    const friendship = await this.friendshipsRepository.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundError("Friendship not found");
    }

    if (friendship.friendId !== callerId) {
      throw new ForbiddenError(
        "Only the recipient can accept or reject a friend request"
      );
    }

    return this.friendshipsRepository.update(friendshipId, status);
  }
}
