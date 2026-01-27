import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export const friendshipsStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const friendshipsSchema = pgTable(
  "friendships",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    friendId: uuid("friend_id").notNull(),
    status: friendshipsStatusEnum("status").default("pending").notNull(),
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
    index("idx_friendships_friend").using(
      "btree",
      table.friendId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    index("idx_friendships_user").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "friendships_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.friendId],
      foreignColumns: [users.id],
      name: "friendships_friend_id_fkey",
    }).onDelete("cascade"),
    unique("unique_friendship").on(table.userId, table.friendId),
    check("no_self_friend", sql`user_id <> friend_id`),
  ]
);

export type FriendshipRow = typeof friendshipsSchema.$inferSelect;
export type NewFriendshipRow = typeof friendshipsSchema.$inferInsert;
