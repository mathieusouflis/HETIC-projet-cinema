import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  unique,
  check,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

export const contentSchema = pgTable(
  "content",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    type: varchar({ length: 20 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    originalTitle: varchar("original_title", { length: 255 }),
    slug: varchar({ length: 255 }).notNull(),
    synopsis: text(),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    trailerUrl: text("trailer_url"),
    releaseDate: date("release_date"),
    year: integer(),
    durationMinutes: integer("duration_minutes"),
    tmdbId: integer("tmdb_id"),
    imdbId: varchar("imdb_id", { length: 20 }),
    averageRating: numeric("average_rating", {
      precision: 3,
      scale: 2,
    }).default("0"),
    totalRatings: integer("total_ratings").default(0),
    totalViews: integer("total_views").default(0),
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
    index("idx_content_rating").using(
      "btree",
      table.averageRating.desc().nullsFirst().op("numeric_ops"),
    ),
    index("idx_content_slug").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
    index("idx_content_tmdb").using(
      "btree",
      table.tmdbId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_content_type").using(
      "btree",
      table.type.asc().nullsLast().op("text_ops"),
    ),
    index("idx_content_year").using(
      "btree",
      table.year.asc().nullsLast().op("int4_ops"),
    ),
    unique("content_slug_key").on(table.slug),
    unique("content_tmdb_id_key").on(table.tmdbId),
    unique("content_imdb_id_key").on(table.imdbId),
    check(
      "valid_type",
      sql`(type)::text = ANY ((ARRAY['movie'::character varying, 'series'::character varying])::text[])`,
    ),
  ],
);

export type ContentRow = typeof contentSchema.$inferSelect;
export type NewContentRow = typeof contentSchema.$inferInsert;
