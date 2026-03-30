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

export const reviewsSchema = pgTable(
  "reviews",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    contentId: uuid("content_id").notNull(),
    title: varchar({ length: 255 }),
    content: text().notNull(),
    isSpoiler: boolean("is_spoiler").default(false),
    parentReviewId: uuid("parent_review_id"),
    likesCount: integer("likes_count").default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_reviews_content").using(
      "btree",
      table.contentId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    index("idx_reviews_parent").using(
      "btree",
      table.parentReviewId.asc().nullsLast()
    ),
    index("idx_reviews_user").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "reviews_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "reviews_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parentReviewId],
      foreignColumns: [table.id],
      name: "reviews_parent_review_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const reviewLikesSchema = pgTable(
  "review_likes",
  {
    userId: uuid("user_id").notNull(),
    reviewId: uuid("review_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "review_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [reviewsSchema.id],
      name: "review_likes_review_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.reviewId],
      name: "review_likes_pkey",
    }),
  ]
);

export const reviewsRelationsSchema = relations(
  reviewsSchema,
  ({ one, many }) => ({
    user: one(users, {
      fields: [reviewsSchema.userId],
      references: [users.id],
    }),
    content: one(content, {
      fields: [reviewsSchema.contentId],
      references: [content.id],
    }),
    review: one(reviewsSchema, {
      fields: [reviewsSchema.parentReviewId],
      references: [reviewsSchema.id],
      relationName: "reviews_parentReviewId_reviews_id",
    }),
    reviews: many(reviewsSchema, {
      relationName: "reviews_parentReviewId_reviews_id",
    }),
    reviewLikes: many(reviewLikesSchema),
  })
);

export const reviewLikesRelationsSchema = relations(
  reviewLikesSchema,
  ({ one }) => ({
    user: one(users, {
      fields: [reviewLikesSchema.userId],
      references: [users.id],
    }),
    review: one(reviewsSchema, {
      fields: [reviewLikesSchema.reviewId],
      references: [reviewsSchema.id],
    }),
  })
);
