import type {
  ConversationWithMeta,
  IConversationRepository,
} from "../../domain/interfaces/IConversationRepository.js";

export class GetConversationsUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(userId: string): Promise<ConversationWithMeta[]> {
    return this.conversationRepository.findAllForUser(userId);
  }
}
