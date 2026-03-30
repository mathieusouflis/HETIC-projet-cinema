import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { categories, content } from "../../../../../database/schema";

export const contentCategoriesSchema = pgTable(
  "content_categories",
  {
    contentId: uuid("content_id").notNull(),
    categoryId: uuid("category_id").notNull(),
  },
  (table) => [
    index("idx_content_categories_category").using(
      "btree",
      table.categoryId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "content_categories_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "content_categories_category_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.contentId, table.categoryId],
      name: "content_categories_pkey",
    }),
  ]
);

export const contentCategoriesRelationsSchema = relations(
  contentCategoriesSchema,
  ({ one }) => ({
    content: one(content, {
      fields: [contentCategoriesSchema.contentId],
      references: [content.id],
    }),
    category: one(categories, {
      fields: [contentCategoriesSchema.categoryId],
      references: [categories.id],
    }),
  })
);
