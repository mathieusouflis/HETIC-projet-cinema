import {
  pgTable,
  index,
  unique,
  check,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
      table.email.asc().nullsLast().op("text_ops"),
    ),
    index("idx_users_oauth").using(
      "btree",
      table.oauthProvider.asc().nullsLast().op("text_ops"),
      table.oauthId.asc().nullsLast().op("text_ops"),
    ),
    unique("users_email_key").on(table.email),
    unique("users_username_key").on(table.username),
    check(
      "oauth_or_email",
      sql`((oauth_provider IS NOT NULL) AND (oauth_id IS NOT NULL)) OR ((email IS NOT NULL) AND (password_hash IS NOT NULL))`,
    ),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
