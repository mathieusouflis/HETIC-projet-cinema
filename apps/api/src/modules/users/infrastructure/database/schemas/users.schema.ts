import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  conversationParticipants,
  conversations,
  friendships,
  listLikes,
  lists,
  messages,
  notifications,
  peopleLikes,
  ratings,
  refreshTokens,
  reviewLikes,
  reviews,
  userActivityLogs,
  userStats,
  watchlist,
  watchparties,
  watchpartyInvitations,
  watchpartyParticipants,
} from "../../../../../database/schema";

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    username: varchar({ length: 50 }).notNull(),
    displayName: varchar("display_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    bio: text(),
    oauthProvider: varchar("oauth_provider", { length: 50 }),
    oauthId: varchar("oauth_id", { length: 255 }),
    theme: varchar({ length: 20 }).default("dark"),
    language: varchar({ length: 10 }).default("fr"),
    emailNotifications: boolean("email_notifications").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("idx_users_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    index("idx_users_oauth").using(
      "btree",
      table.oauthProvider.asc().nullsLast().op("text_ops"),
      table.oauthId.asc().nullsLast().op("text_ops")
    ),
    unique("users_email_key").on(table.email),
    unique("users_username_key").on(table.username),
    check(
      "oauth_or_email",
      sql`((oauth_provider IS NOT NULL) AND (oauth_id IS NOT NULL)) OR ((email IS NOT NULL) AND (password_hash IS NOT NULL))`
    ),
  ]
);

export const usersRelationSchema = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  friendships_userId: many(friendships, {
    relationName: "friendships_userId_users_id",
  }),
  friendships_friendId: many(friendships, {
    relationName: "friendships_friendId_users_id",
  }),
  conversations: many(conversations),
  conversationParticipants: many(conversationParticipants),
  watchparties_createdBy: many(watchparties, {
    relationName: "watchparties_createdBy_users_id",
  }),
  watchparties_leaderUserId: many(watchparties, {
    relationName: "watchparties_leaderUserId_users_id",
  }),
  messages: many(messages),
  ratings: many(ratings),
  reviews: many(reviews),
  watchlists: many(watchlist),
  lists: many(lists),
  watchpartyParticipants: many(watchpartyParticipants),
  watchpartyInvitations_inviterId: many(watchpartyInvitations, {
    relationName: "watchpartyInvitations_inviterId_users_id",
  }),
  watchpartyInvitations_inviteeId: many(watchpartyInvitations, {
    relationName: "watchpartyInvitations_inviteeId_users_id",
  }),
  userActivityLogs: many(userActivityLogs),
  userStats: many(userStats),
  notifications_userId: many(notifications, {
    relationName: "notifications_userId_users_id",
  }),
  notifications_relatedUserId: many(notifications, {
    relationName: "notifications_relatedUserId_users_id",
  }),
  reviewLikes: many(reviewLikes),
  listLikes: many(listLikes),
  peopleLikes: many(peopleLikes),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
