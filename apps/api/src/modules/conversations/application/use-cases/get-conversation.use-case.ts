import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import type {
  ConversationWithMeta,
  IConversationRepository,
} from "../../domain/interfaces/IConversationRepository";

export class GetConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    userId: string,
    conversationId: string
  ): Promise<ConversationWithMeta> {
    const conversation = await this.conversationRepository.findByIdForUser(
      conversationId,
      userId
    );

    if (!conversation) {
      const exists = await this.conversationRepository.findById(conversationId);
      if (exists) {
        throw new ForbiddenError(
          "You are not a participant in this conversation"
        );
      }
      throw new NotFoundError("Conversation not found");
    }

    return conversation;
  }
}
