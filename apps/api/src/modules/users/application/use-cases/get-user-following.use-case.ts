import type { User } from "../../domain/entities/index.js";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";

export class GetUserFollowingUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly friendshipsRepository: IFriendshipsRepository
  ) {}

  /**
   * Get the list of users that a specific user is following
   * @param userId - The ID of the user whose following list to retrieve
   * @returns Promise resolving to an array of User entities
   * @throws UserNotFoundError if the user doesn't exist
   */
  async execute(userId: string): Promise<User[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const following = await this.friendshipsRepository.getFollowing(userId);

    return following;
  }
}
