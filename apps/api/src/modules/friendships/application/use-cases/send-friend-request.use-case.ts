import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { Friendship } from "../../domain/entities/friendship.entity.js";
import type { IFriendshipsRepository } from "../../domain/interfaces/IFriendshipsRepository.js";

export class SendFriendRequestUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly friendshipsRepository: IFriendshipsRepository
  ) {}

  async execute(callerId: string, targetUserId: string): Promise<Friendship> {
    if (callerId === targetUserId) {
      throw new ForbiddenError("Cannot send a friend request to yourself");
    }

    const target = await this.userRepository.findById(targetUserId);
    if (!target) {
      throw new NotFoundError("User not found");
    }

    const existing = await this.friendshipsRepository.findByUserAndFriend(
      callerId,
      targetUserId
    );
    if (existing) {
      throw new ConflictError("A friendship request already exists");
    }

    return this.friendshipsRepository.create(callerId, targetUserId);
  }
}
