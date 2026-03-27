import type { Message } from "../entities/message.entity";

export interface MessagePage {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IMessageRepository {
  findByConversation(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<MessagePage>;
  findById(messageId: string): Promise<Message | null>;
  create(data: {
    conversationId: string;
    userId: string;
    content: string;
  }): Promise<Message>;
  update(messageId: string, content: string): Promise<Message>;
  softDelete(messageId: string): Promise<Message>;
}
