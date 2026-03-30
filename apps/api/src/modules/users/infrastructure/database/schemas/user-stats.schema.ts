import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { categories, users } from "../../../../../database/schema";

export const userStatsSchema = pgTable(
  "user_stats",
  {
    userId: uuid("user_id").primaryKey().notNull(),
    totalWatchTimeMinutes: integer("total_watch_time_minutes").default(0),
    totalMoviesWatched: integer("total_movies_watched").default(0),
    totalSeriesWatched: integer("total_series_watched").default(0),
    totalEpisodesWatched: integer("total_episodes_watched").default(0),
    totalWatchpartiesCreated: integer("total_watchparties_created").default(0),
    totalWatchpartiesJoined: integer("total_watchparties_joined").default(0),
    totalReviewsWritten: integer("total_reviews_written").default(0),
    totalListsCreated: integer("total_lists_created").default(0),
    favoriteGenreId: uuid("favorite_genre_id"),
    favoriteDecade: integer("favorite_decade"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_stats_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.favoriteGenreId],
      foreignColumns: [categories.id],
      name: "user_stats_favorite_genre_id_fkey",
    }),
  ]
);

export const userStatsRelationsSchema = relations(
  userStatsSchema,
  ({ one }) => ({
    user: one(users, {
      fields: [userStatsSchema.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [userStatsSchema.favoriteGenreId],
      references: [categories.id],
    }),
  })
);
