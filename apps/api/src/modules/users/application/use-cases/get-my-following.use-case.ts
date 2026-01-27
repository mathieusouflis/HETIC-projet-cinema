import type { User } from "../../domain/entities/index.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";

export class GetMyFollowingUseCase {
  constructor(private readonly friendshipsRepository: IFriendshipsRepository) {}

  /**
   * Get the list of users that the authenticated user is following
   * @param userId - The ID of the authenticated user
   * @returns Promise resolving to an array of User entities
   */
  async execute(userId: string): Promise<User[]> {
    const following = await this.friendshipsRepository.getFollowing(userId);

    return following;
  }
}
