import { NotFoundError } from "../../../../shared/errors/index.js";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";

export class DeleteFriendshipUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly friendshipsRepository: IFriendshipsRepository
  ) {}

  /**
   * Delete a friendship (unfollow a user)
   * @param userId - The ID of the user who wants to unfollow
   * @param friendId - The ID of the user to unfollow
   * @throws UserNotFoundError if the friend doesn't exist
   * @throws NotFoundError if the friendship doesn't exist
   */
  async execute(userId: string, friendId: string): Promise<void> {
    const friend = await this.userRepository.findById(friendId);
    if (!friend) {
      throw new UserNotFoundError(friendId);
    }

    const friendship = await this.friendshipsRepository.findByUserAndFriend(
      userId,
      friendId
    );

    if (!friendship) {
      throw new NotFoundError("Friendship not found");
    }

    await this.friendshipsRepository.delete(friendship.id);
  }
}
