import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";

export class RemoveFriendshipUseCase {
  constructor(private readonly friendshipsRepository: IFriendshipsRepository) {}

  async execute(callerId: string, friendshipId: string): Promise<void> {
    const friendship = await this.friendshipsRepository.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundError("Friendship not found");
    }

    if (!friendship.isParticipant(callerId)) {
      throw new ForbiddenError("You are not part of this friendship");
    }

    await this.friendshipsRepository.delete(friendshipId);
  }
}
