import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import type { Conversation } from "../../domain/entities/conversation.entity.js";
import type { IConversationRepository } from "../../domain/interfaces/IConversationRepository.js";

export class GetConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(userId: string, conversationId: string): Promise<Conversation> {
    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isParticipant = await this.conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      throw new ForbiddenError(
        "You are not a participant in this conversation"
      );
    }

    return conversation;
  }
}
