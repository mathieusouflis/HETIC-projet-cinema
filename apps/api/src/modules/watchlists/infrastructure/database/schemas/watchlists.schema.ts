import { content, users } from "@/database/schema";
import { foreignKey, index, integer, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const userWatchlist = pgTable(
  "user_watchlist",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    contentId: uuid("content_id").notNull(),
    status: varchar({ length: 20 }).default("to_watch").notNull(),
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
      table.contentId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_watchlist_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.status.asc().nullsLast().op("text_ops"),
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
  ],
);


export type WatchlistRow = typeof userWatchlist.$inferSelect;
export type NewWatchlistRow = typeof userWatchlist.$inferInsert;
