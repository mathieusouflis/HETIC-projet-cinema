import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { seasons, watchparties } from "../../../../database/schema";

export const episodesSchema = pgTable(
  "episodes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    seasonId: uuid("season_id").notNull(),
    episodeNumber: integer("episode_number").notNull(),
    name: varchar({ length: 255 }).notNull(),
    overview: text(),
    stillUrl: text("still_url"),
    airDate: date("air_date"),
    durationMinutes: integer("duration_minutes"),
  },
  (table) => [
    index("idx_episodes_season").using(
      "btree",
      table.seasonId.asc().nullsLast(),
      table.episodeNumber.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.seasonId],
      foreignColumns: [seasons.id],
      name: "episodes_season_id_fkey",
    }).onDelete("cascade"),
    unique("unique_episode").on(table.seasonId, table.episodeNumber),
    check("valid_episode", sql`episode_number > 0`),
  ]
);

export type EpisodeRow = typeof episodesSchema.$inferSelect;
export type NewEpisodeRow = typeof episodesSchema.$inferInsert;

export const episodesRelationsSchema = relations(
  episodesSchema,
  ({ one, many }) => ({
    season: one(seasons, {
      fields: [episodesSchema.seasonId],
      references: [seasons.id],
    }),
    watchparties: many(watchparties),
  })
);
