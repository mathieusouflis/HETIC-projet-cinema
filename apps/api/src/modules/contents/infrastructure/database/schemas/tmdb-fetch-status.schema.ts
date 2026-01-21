import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  check,
  uuid,
  varchar,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const tmdbFetchStatusSchema = pgTable(
  "tmdb_fetch_status",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    path: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 20 }).notNull(),
    metadata: jsonb().notNull(),
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
    index("idx_fetch_status_type").using(
      "btree",
      table.type.asc().nullsLast().op("text_ops"),
    ),
    check(
      "valid_type",
      sql`(type)::text = ANY ((ARRAY['discover'::character varying])::text[])`,
    ),
  ],
);

export type TMDBFetchStatusRow = typeof tmdbFetchStatusSchema.$inferSelect;
export type NewTMDBFetchStatusRow = typeof tmdbFetchStatusSchema.$inferInsert;
