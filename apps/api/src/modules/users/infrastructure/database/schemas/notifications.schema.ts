import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { content, users, watchparties } from "../../../../../database/schema";

export const notificationsSchema = pgTable(
  "notifications",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    type: varchar({ length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    message: text(),
    relatedUserId: uuid("related_user_id"),
    relatedContentId: uuid("related_content_id"),
    relatedWatchpartyId: uuid("related_watchparty_id"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_notifications_user").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.isRead.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "notifications_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.relatedUserId],
      foreignColumns: [users.id],
      name: "notifications_related_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.relatedContentId],
      foreignColumns: [content.id],
      name: "notifications_related_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.relatedWatchpartyId],
      foreignColumns: [watchparties.id],
      name: "notifications_related_watchparty_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const notificationsRelationsSchema = relations(
  notificationsSchema,
  ({ one }) => ({
    user_userId: one(users, {
      fields: [notificationsSchema.userId],
      references: [users.id],
      relationName: "notifications_userId_users_id",
    }),
    user_relatedUserId: one(users, {
      fields: [notificationsSchema.relatedUserId],
      references: [users.id],
      relationName: "notifications_relatedUserId_users_id",
    }),
    content: one(content, {
      fields: [notificationsSchema.relatedContentId],
      references: [content.id],
    }),
    watchparty: one(watchparties, {
      fields: [notificationsSchema.relatedWatchpartyId],
      references: [watchparties.id],
    }),
  })
);
