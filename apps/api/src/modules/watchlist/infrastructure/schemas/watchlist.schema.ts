import {
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { content, users } from "../../../../database/schema";

export const watchlistStatusEnum = pgEnum("watchlistStatus", [
  "plan_to_watch",
  "watching",
  "completed",
  "dropped",
  "undecided",
  "not_interested",
]);

export const watchlistSchema = pgTable(
  "watchlists",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    contentId: uuid("content_id").notNull(),
    status: watchlistStatusEnum().default("plan_to_watch").notNull(),
    currentSeason: integer("current_season"),
    currentEpisode: integer("current_episode"),
    addedAt: timestamp("added_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("idx_watchlist_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_watchlist_user").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_watchlist_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "user_watchlist_content_id_fkey",
    }).onDelete("cascade"),
    unique("unique_watchlist_entry").on(table.userId, table.contentId),
  ]
);

export type WatchlistRow = typeof watchlistSchema.$inferSelect;
export type NewWatchlistRow = typeof watchlistSchema.$inferInsert;
