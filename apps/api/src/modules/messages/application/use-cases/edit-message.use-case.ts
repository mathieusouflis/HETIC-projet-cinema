import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import type { Message } from "../../domain/entities/message.entity";
import type { IMessageRepository } from "../../domain/interfaces/IMessageRepository";

export class EditMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(
    userId: string,
    messageId: string,
    content: string
  ): Promise<Message> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }

    if (message.isSoftDeleted()) {
      throw new ForbiddenError("Cannot edit a deleted message");
    }

    if (!message.isAuthor(userId)) {
      throw new ForbiddenError("Only the author can edit this message");
    }

    return this.messageRepository.update(messageId, content);
  }
}
