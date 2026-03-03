import { ForbiddenError } from "../../../../shared/errors/index.js";
import type { IConversationRepository } from "../../../conversations/domain/interfaces/IConversationRepository.js";
import type {
  IMessageRepository,
  MessagePage,
} from "../../domain/interfaces/IMessageRepository.js";

export class GetMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<MessagePage> {
    const isParticipant = await this.conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      throw new ForbiddenError(
        "You are not a participant in this conversation"
      );
    }

    return this.messageRepository.findByConversation(
      conversationId,
      cursor,
      limit
    );
  }
}
