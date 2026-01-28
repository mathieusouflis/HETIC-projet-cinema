import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  type categories,
  contentCategories,
  userStats,
} from "../../../../../database/schema";

export const categorySchema = pgTable(
  "categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    description: text(),
    tmdbId: integer("tmdb_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("categories_name_key").on(table.name),
    unique("categories_slug_key").on(table.slug),
  ]
);

export const categoriesRelationsSchema = relations(
  categorySchema,
  ({ many }) => ({
    userStats: many(userStats),
    contentCategories: many(contentCategories),
  })
);

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
