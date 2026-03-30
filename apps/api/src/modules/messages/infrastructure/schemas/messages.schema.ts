import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  conversations,
  users,
  watchparties,
} from "../../../../database/schema";

export const messagesSchema = pgTable(
  "messages",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id").notNull(),
    userId: uuid("user_id").notNull(),
    content: text().notNull(),
    type: varchar({ length: 20 }).default("text"),
    watchpartyId: uuid("watchparty_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_messages_conversation").using(
      "btree",
      table.conversationId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    index("idx_messages_watchparty").using(
      "btree",
      table.watchpartyId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "messages_conversation_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "messages_user_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "messages_watchparty_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const messagesRelationsSchema = relations(messagesSchema, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messagesSchema.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messagesSchema.userId],
    references: [users.id],
  }),
  watchparty: one(watchparties, {
    fields: [messagesSchema.watchpartyId],
    references: [watchparties.id],
  }),
}));
