import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { messages, users } from "../../../../database/schema";

export const conversationsSchema = pgTable(
  "conversations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    type: varchar({ length: 20 }).notNull(),
    name: varchar({ length: 100 }),
    avatarUrl: text("avatar_url"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "conversations_created_by_fkey",
    }).onDelete("set null"),
  ]
);

export const conversationParticipantsSchema = pgTable(
  "conversation_participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id").notNull(),
    userId: uuid("user_id").notNull(),
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    lastReadAt: timestamp("last_read_at", {
      withTimezone: true,
      mode: "string",
    }),
    role: varchar({ length: 20 }).default("member"),
  },
  (table) => [
    index("idx_conv_participants_conv").using(
      "btree",
      table.conversationId.asc().nullsLast()
    ),
    index("idx_conv_participants_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversationsSchema.id],
      name: "conversation_participants_conversation_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "conversation_participants_user_id_fkey",
    }).onDelete("cascade"),
    unique("unique_participant").on(table.userId, table.conversationId),
  ]
);

export const conversationsRelationsSchema = relations(
  conversationsSchema,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversationsSchema.createdBy],
      references: [users.id],
    }),
    conversationParticipants: many(conversationParticipantsSchema),
    messages: many(messages),
  })
);

export const conversationParticipantsRelationsSchema = relations(
  conversationParticipantsSchema,
  ({ one }) => ({
    conversation: one(conversationsSchema, {
      fields: [conversationParticipantsSchema.conversationId],
      references: [conversationsSchema.id],
    }),
    user: one(users, {
      fields: [conversationParticipantsSchema.userId],
      references: [users.id],
    }),
  })
);
