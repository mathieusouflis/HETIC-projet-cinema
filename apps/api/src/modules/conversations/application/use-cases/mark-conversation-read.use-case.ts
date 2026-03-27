import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import type { IConversationRepository } from "../../domain/interfaces/IConversationRepository";

export class MarkConversationReadUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(userId: string, conversationId: string): Promise<void> {
    const isParticipant = await this.conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      throw new ForbiddenError(
        "You are not a participant in this conversation"
      );
    }

    await this.conversationRepository.markAsRead(conversationId, userId);
  }
}
