import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import type { IFriendshipsRepository } from "../../../friendships/domain/interfaces/IFriendshipsRepository.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { Conversation } from "../../domain/entities/conversation.entity.js";
import type { IConversationRepository } from "../../domain/interfaces/IConversationRepository.js";

export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly friendshipsRepository: IFriendshipsRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(callerId: string, friendId: string): Promise<Conversation> {
    if (callerId === friendId) {
      throw new ForbiddenError("Cannot start a conversation with yourself");
    }

    const friend = await this.userRepository.findById(friendId);
    if (!friend) {
      throw new NotFoundError("User not found");
    }

    const accepted = await this.friendshipsRepository.findAccepted(
      callerId,
      friendId
    );
    if (!accepted) {
      throw new ForbiddenError("You can only message accepted friends");
    }

    const existing = await this.conversationRepository.findDirectBetween(
      callerId,
      friendId
    );
    if (existing) {
      return existing;
    }

    return this.conversationRepository.create(callerId, [callerId, friendId]);
  }
}
