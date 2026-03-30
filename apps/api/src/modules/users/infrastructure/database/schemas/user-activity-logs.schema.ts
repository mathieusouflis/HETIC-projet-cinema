import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { content, users, watchparties } from "../../../../../database/schema";

export const userActivityLogsSchema = pgTable(
  "user_activity_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    contentId: uuid("content_id"),
    watchpartyId: uuid("watchparty_id"),
    metadata: jsonb(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_activity_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_activity_type").using(
      "btree",
      table.eventType.asc().nullsLast()
    ),
    index("idx_activity_user").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_activity_logs_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "user_activity_logs_content_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "user_activity_logs_watchparty_id_fkey",
    }).onDelete("set null"),
  ]
);

export const userActivityLogsRelationsSchema = relations(
  userActivityLogsSchema,
  ({ one }) => ({
    user: one(users, {
      fields: [userActivityLogsSchema.userId],
      references: [users.id],
    }),
    content: one(content, {
      fields: [userActivityLogsSchema.contentId],
      references: [content.id],
    }),
    watchparty: one(watchparties, {
      fields: [userActivityLogsSchema.watchpartyId],
      references: [watchparties.id],
    }),
  })
);
