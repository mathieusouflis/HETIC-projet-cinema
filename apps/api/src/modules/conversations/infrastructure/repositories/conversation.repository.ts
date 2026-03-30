import { and, count, eq, gt, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "../../../../database/index";
import {
  conversationParticipants,
  conversations,
  messages,
} from "../../../../database/schema";
import { ServerError } from "../../../../shared/errors/server-error";
import { Conversation } from "../../domain/entities/conversation.entity";
import type {
  ConversationWithMeta,
  IConversationRepository,
} from "../../domain/interfaces/IConversationRepository";

export class ConversationRepository implements IConversationRepository {
  async findAllForUser(userId: string): Promise<ConversationWithMeta[]> {
    try {
      const [participations, unreadRows] = await Promise.all([
        db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.userId, userId),
          with: {
            conversation: {
              with: {
                conversationParticipants: {
                  with: { user: true },
                },
                messages: {
                  orderBy: (m, { desc }) => [desc(m.createdAt)],
                  limit: 1,
                },
              },
            },
          },
        }),
        db
          .select({
            conversationId: messages.conversationId,
            count: count(messages.id),
          })
          .from(messages)
          .innerJoin(
            conversationParticipants,
            and(
              eq(
                conversationParticipants.conversationId,
                messages.conversationId
              ),
              eq(conversationParticipants.userId, userId)
            )
          )
          .where(
            and(
              isNull(messages.deletedAt),
              ne(messages.userId, userId),
              or(
                isNull(conversationParticipants.lastReadAt),
                gt(messages.createdAt, conversationParticipants.lastReadAt)
              )
            )
          )
          .groupBy(messages.conversationId),
      ]);

      const unreadMap = new Map(
        unreadRows.map((r) => [r.conversationId, r.count])
      );

      return participations.map((p) => {
        const conv = p.conversation;
        const otherParticipantRow = conv.conversationParticipants.find(
          (cp) => cp.userId !== userId
        );
        const other = otherParticipantRow?.user;
        const lastMsg = conv.messages[0] ?? null;

        const conversation = new Conversation(conv);
        return Object.assign(conversation, {
          otherParticipant: {
            id: other?.id ?? "",
            username: other?.username ?? "",
            avatarUrl: other?.avatarUrl ?? null,
          },
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                content: lastMsg.deletedAt ? null : lastMsg.content,
                isDeleted: !!lastMsg.deletedAt,
                createdAt: new Date(lastMsg.createdAt ?? ""),
                authorId: lastMsg.userId,
              }
            : null,
          unreadCount: unreadMap.get(conv.id) ?? 0,
        }) as ConversationWithMeta;
      });
    } catch (error) {
      throw new ServerError(`Failed to list conversations: ${error}`);
    }
  }

  async findByIdForUser(
    conversationId: string,
    userId: string
  ): Promise<ConversationWithMeta | null> {
    try {
      const [participation, unreadRow] = await Promise.all([
        db.query.conversationParticipants.findFirst({
          where: and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          ),
          with: {
            conversation: {
              with: {
                conversationParticipants: {
                  with: { user: true },
                },
                messages: {
                  orderBy: (m, { desc }) => [desc(m.createdAt)],
                  limit: 1,
                },
              },
            },
          },
        }),
        db
          .select({ count: count(messages.id) })
          .from(messages)
          .innerJoin(
            conversationParticipants,
            and(
              eq(
                conversationParticipants.conversationId,
                messages.conversationId
              ),
              eq(conversationParticipants.userId, userId)
            )
          )
          .where(
            and(
              eq(messages.conversationId, conversationId),
              isNull(messages.deletedAt),
              ne(messages.userId, userId),
              or(
                isNull(conversationParticipants.lastReadAt),
                gt(messages.createdAt, conversationParticipants.lastReadAt)
              )
            )
          ),
      ]);

      if (!participation) {
        return null;
      }

      const conv = participation.conversation;
      const otherParticipantRow = conv.conversationParticipants.find(
        (cp) => cp.userId !== userId
      );
      const other = otherParticipantRow?.user;
      const lastMsg = conv.messages[0] ?? null;

      const conversation = new Conversation(conv);
      return Object.assign(conversation, {
        otherParticipant: {
          id: other?.id ?? "",
          username: other?.username ?? "",
          avatarUrl: other?.avatarUrl ?? null,
        },
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.deletedAt ? null : lastMsg.content,
              isDeleted: !!lastMsg.deletedAt,
              createdAt: new Date(lastMsg.createdAt ?? ""),
              authorId: lastMsg.userId,
            }
          : null,
        unreadCount: unreadRow[0]?.count ?? 0,
      }) as ConversationWithMeta;
    } catch (error) {
      throw new ServerError(`Failed to find conversation for user: ${error}`);
    }
  }

  async findById(conversationId: string): Promise<Conversation | null> {
    try {
      const row = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });
      return row ? new Conversation(row) : null;
    } catch (error) {
      throw new ServerError(`Failed to find conversation: ${error}`);
    }
  }

  async findDirectBetween(
    userA: string,
    userB: string
  ): Promise<Conversation | null> {
    try {
      const result = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversationParticipants.conversationId, conversations.id)
        )
        .where(
          and(
            eq(conversations.type, "direct"),
            or(
              eq(conversationParticipants.userId, userA),
              eq(conversationParticipants.userId, userB)
            )
          )
        )
        .groupBy(conversations.id)
        .having(sql`count(distinct ${conversationParticipants.userId}) = 2`);

      if (!result[0]) {
        return null;
      }

      const row = await db.query.conversations.findFirst({
        where: eq(conversations.id, result[0].id),
      });
      return row ? new Conversation(row) : null;
    } catch (error) {
      throw new ServerError(`Failed to find direct conversation: ${error}`);
    }
  }

  async create(
    createdBy: string,
    participantIds: [string, string]
  ): Promise<Conversation> {
    try {
      const rows = await db
        .insert(conversations)
        .values({ type: "direct", createdBy })
        .returning();

      const conv = rows[0];
      if (!conv) {
        throw new ServerError("Failed to create conversation");
      }

      await db.insert(conversationParticipants).values(
        participantIds.map((userId) => ({
          conversationId: conv.id,
          userId,
        }))
      );

      return new Conversation(conv);
    } catch (error) {
      throw new ServerError(`Failed to create conversation: ${error}`);
    }
  }

  async isParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const row = await db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ),
      });
      return !!row;
    } catch (error) {
      throw new ServerError(`Failed to check participant: ${error}`);
    }
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date().toISOString() })
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
          )
        );
    } catch (error) {
      throw new ServerError(`Failed to mark conversation as read: ${error}`);
    }
  }
}
