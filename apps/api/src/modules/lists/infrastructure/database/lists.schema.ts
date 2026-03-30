import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { content, users } from "../../../../database/schema";

export const listsSchema = pgTable(
  "lists",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    isPublic: boolean("is_public").default(true),
    coverImageUrl: text("cover_image_url"),
    likesCount: integer("likes_count").default(0),
    itemsCount: integer("items_count").default(0),
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
    index("idx_lists_public").using(
      "btree",
      table.isPublic.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    index("idx_lists_user").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "lists_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const listItemsSchema = pgTable(
  "list_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    listId: uuid("list_id").notNull(),
    contentId: uuid("content_id").notNull(),
    orderIndex: integer("order_index").notNull(),
    note: text(),
    addedAt: timestamp("added_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_list_items_list").using(
      "btree",
      table.listId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.listId],
      foreignColumns: [listsSchema.id],
      name: "list_items_list_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "list_items_content_id_fkey",
    }).onDelete("cascade"),
    index("unique_list_item").on(table.listId, table.contentId),
  ]
);

export const listLikesSchema = pgTable(
  "list_likes",
  {
    userId: uuid("user_id").notNull(),
    listId: uuid("list_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "list_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.listId],
      foreignColumns: [listsSchema.id],
      name: "list_likes_list_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.listId],
      name: "list_likes_pkey",
    }),
  ]
);

export const listsRelationsSchema = relations(listsSchema, ({ one, many }) => ({
  user: one(users, {
    fields: [listsSchema.userId],
    references: [users.id],
  }),
  listItems: many(listItemsSchema),
  listLikes: many(listLikesSchema),
}));

export const listItemsRelationsSchema = relations(
  listItemsSchema,
  ({ one }) => ({
    list: one(listsSchema, {
      fields: [listItemsSchema.listId],
      references: [listsSchema.id],
    }),
    content: one(content, {
      fields: [listItemsSchema.contentId],
      references: [content.id],
    }),
  })
);

export const listLikesRelationsSchema = relations(
  listLikesSchema,
  ({ one }) => ({
    user: one(users, {
      fields: [listLikesSchema.userId],
      references: [users.id],
    }),
    list: one(listsSchema, {
      fields: [listLikesSchema.listId],
      references: [listsSchema.id],
    }),
  })
);
