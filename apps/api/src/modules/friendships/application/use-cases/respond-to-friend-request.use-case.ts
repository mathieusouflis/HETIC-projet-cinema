import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import type { Friendship } from "../../domain/entities/friendship.entity";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository";
import type { FriendshipStatus } from "../../infrastructure/schemas/friendships.schema";

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
