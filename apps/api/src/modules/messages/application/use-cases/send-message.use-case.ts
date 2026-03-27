import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import type { IConversationRepository } from "../../../conversations/domain/interfaces/IConversationRepository";
import type { Message } from "../../domain/entities/message.entity";
import type { IMessageRepository } from "../../domain/interfaces/IMessageRepository";

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    content: string
  ): Promise<Message> {
    const isParticipant = await this.conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      throw new ForbiddenError(
        "You are not a participant in this conversation"
      );
    }

    return this.messageRepository.create({ conversationId, userId, content });
  }
}
