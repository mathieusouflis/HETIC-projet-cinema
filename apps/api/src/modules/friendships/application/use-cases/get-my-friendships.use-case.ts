import type { Friendship } from "../../domain/entities/friendship.entity.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";
import type { FriendshipStatus } from "../../infrastructure/schemas/friendships.schema.js";

export class GetMyFriendshipsUseCase {
  constructor(private readonly friendshipsRepository: IFriendshipsRepository) {}

  async execute(
    userId: string,
    status?: FriendshipStatus
  ): Promise<Friendship[]> {
    return this.friendshipsRepository.findAllForUser(userId, status);
  }
}
