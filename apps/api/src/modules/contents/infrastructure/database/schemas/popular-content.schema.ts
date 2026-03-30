import { sql } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgView,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const popularContentSchema = pgView("popular_content", {
  id: uuid(),
  type: varchar({ length: 20 }),
  title: varchar({ length: 255 }),
  originalTitle: varchar("original_title", { length: 255 }),
  slug: varchar({ length: 255 }),
  synopsis: text(),
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  trailerUrl: text("trailer_url"),
  releaseDate: date("release_date"),
  year: integer(),
  durationMinutes: integer("duration_minutes"),
  tmdbId: integer("tmdb_id"),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
  totalRatings: integer("total_ratings"),
  totalViews: integer("total_views"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  popularityScore: numeric("popularity_score"),
}).as(
  sql`SELECT c.id, c.type, c.title, c.original_title, c.slug, c.synopsis, c.poster_url, c.backdrop_url, c.trailer_url, c.release_date, c.year, c.duration_minutes, c.tmdb_id, COALESCE(AVG(r.rating), 0)::numeric(3,2) AS average_rating, COUNT(r.id)::integer AS total_ratings, c.total_views, c.created_at, c.updated_at, COALESCE(COUNT(r.id)::numeric * AVG(r.rating), 0::numeric) AS popularity_score FROM content c LEFT JOIN ratings r ON r.content_id = c.id GROUP BY c.id ORDER BY (COALESCE(COUNT(r.id)::numeric * AVG(r.rating), 0::numeric)) DESC`
);
