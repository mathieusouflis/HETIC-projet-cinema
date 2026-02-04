import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { content, streamingPlatforms } from "../../../../database/schema";

export const contentPlatformsSchema = pgTable(
  "content_platforms",
  {
    contentId: uuid("content_id").notNull(),
    platformId: uuid("platform_id").notNull(),
    key: text("key").notNull(),
  },
  (table) => [
    index("idx_content_platforms_platform").using(
      "btree",
      table.platformId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "content_platforms_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.platformId],
      foreignColumns: [streamingPlatforms.id],
      name: "content_platforms_platform_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.contentId, table.platformId],
      name: "content_platforms_pkey",
    }),
  ]
);

export type ContentPlatformsRow = typeof contentPlatformsSchema.$inferSelect;

export const contentPlatformsRelationsSchema = relations(
  contentPlatformsSchema,
  ({ one }) => ({
    content: one(content, {
      fields: [contentPlatformsSchema.contentId],
      references: [content.id],
    }),
    platform: one(streamingPlatforms, {
      fields: [contentPlatformsSchema.platformId],
      references: [streamingPlatforms.id],
    }),
  })
);
