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
import { content, episodes, watchparties } from "../../../../database/schema";

export const seasonsSchema = pgTable(
  "seasons",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    seriesId: uuid("series_id").notNull(),
    seasonNumber: integer("season_number").notNull(),
    name: varchar({ length: 255 }),
    overview: text(),
    posterUrl: text("poster_url"),
    airDate: date("air_date"),
    tmdbId: integer("tmdb_id"),
    episodeCount: integer("episode_count").default(0),
  },
  (table) => [
    index("idx_seasons_series").using(
      "btree",
      table.seriesId.asc().nullsLast(),
      table.seasonNumber.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.seriesId],
      foreignColumns: [content.id],
      name: "seasons_series_id_fkey",
    }).onDelete("cascade"),
    unique("unique_season").on(table.seriesId, table.seasonNumber),
    check("valid_series", sql`season_number > 0`),
  ]
);

export type NewSeasonRow = typeof seasonsSchema.$inferInsert;
export type SeasonRow = typeof seasonsSchema.$inferSelect;

export const seasonsRelationsSchema = relations(
  seasonsSchema,
  ({ one, many }) => ({
    content: one(content, {
      fields: [seasonsSchema.seriesId],
      references: [content.id],
    }),
    episodes: many(episodes),
    watchparties: many(watchparties),
  })
);
