import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import type { Message } from "../../domain/entities/message.entity.js";
import type { IMessageRepository } from "../../domain/interfaces/IMessageRepository.js";

export class DeleteMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found");
    }

    if (!message.isAuthor(userId)) {
      throw new ForbiddenError("Only the author can delete this message");
    }

    return this.messageRepository.softDelete(messageId);
  }
}
