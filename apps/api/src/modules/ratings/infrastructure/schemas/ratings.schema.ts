import { relations, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { content, users } from "../../../../database/schema";

export const ratingsSchema = pgTable(
  "ratings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    contentId: uuid("content_id").notNull(),
    rating: numeric({ precision: 2, scale: 1 }).notNull(),
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
    index("idx_ratings_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_ratings_user").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "ratings_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "ratings_content_id_fkey",
    }).onDelete("cascade"),
    unique("unique_rating").on(table.userId, table.contentId),
    check("valid_rating", sql`(rating >= 1.0) AND (rating <= 5.0)`),
  ]
);

export const ratingsRelationsSchema = relations(ratingsSchema, ({ one }) => ({
  user: one(users, {
    fields: [ratingsSchema.userId],
    references: [users.id],
  }),
  content: one(content, {
    fields: [ratingsSchema.contentId],
    references: [content.id],
  }),
}));
