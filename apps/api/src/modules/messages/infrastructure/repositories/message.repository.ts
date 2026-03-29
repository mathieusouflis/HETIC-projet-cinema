import { and, eq, lt } from "drizzle-orm";
import { db } from "../../../../database/index";
import { messages } from "../../../../database/schema";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { ServerError } from "../../../../shared/errors/server-error";
import { Message } from "../../domain/entities/message.entity";
import type {
  IMessageRepository,
  MessagePage,
} from "../../domain/interfaces/IMessageRepository";

const DEFAULT_LIMIT = 30;

export class MessageRepository implements IMessageRepository {
  async findByConversation(
    conversationId: string,
    cursor?: string,
    limit = DEFAULT_LIMIT
  ): Promise<MessagePage> {
    try {
      let cursorDate: Date | undefined;

      if (cursor) {
        const cursorRow = await db.query.messages.findFirst({
          where: eq(messages.id, cursor),
        });
        if (cursorRow?.createdAt) {
          cursorDate = new Date(cursorRow.createdAt);
        }
      }

      const rows = await db.query.messages.findMany({
        where: and(
          eq(messages.conversationId, conversationId),
          cursorDate
            ? lt(messages.createdAt, cursorDate.toISOString())
            : undefined
        ),
        orderBy: (m, { asc }) => [asc(m.createdAt)],
        limit: limit + 1,
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

      return {
        items: items.map((r) => new Message(r)),
        nextCursor,
        hasMore,
      };
    } catch (error) {
      throw new ServerError(`Failed to fetch messages: ${error}`);
    }
  }

  async findById(messageId: string): Promise<Message | null> {
    try {
      const row = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      });
      return row ? new Message(row) : null;
    } catch (error) {
      throw new ServerError(`Failed to find message: ${error}`);
    }
  }

  async create(data: {
    conversationId: string;
    userId: string;
    content: string;
  }): Promise<Message> {
    try {
      const rows = await db
        .insert(messages)
        .values({
          conversationId: data.conversationId,
          userId: data.userId,
          content: data.content,
          type: "text",
        })
        .returning();

      const row = rows[0];
      if (!row) {
        throw new ServerError("Failed to create message");
      }
      return new Message(row);
    } catch (error) {
      throw new ServerError(`Failed to create message: ${error}`);
    }
  }

  async update(messageId: string, content: string): Promise<Message> {
    try {
      const rows = await db
        .update(messages)
        .set({ content, updatedAt: new Date().toISOString() })
        .where(eq(messages.id, messageId))
        .returning();

      const row = rows[0];
      if (!row) {
        throw new NotFoundError("Message not found");
      }
      return new Message(row);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(`Failed to update message: ${error}`);
    }
  }

  async softDelete(messageId: string): Promise<Message> {
    try {
      const rows = await db
        .update(messages)
        .set({ deletedAt: new Date().toISOString() })
        .where(eq(messages.id, messageId))
        .returning();

      const row = rows[0];
      if (!row) {
        throw new NotFoundError("Message not found");
      }
      return new Message(row);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(`Failed to delete message: ${error}`);
    }
  }
}
