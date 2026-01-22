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
    path: varchar({ length: 255 }).notNull().unique(),
    type: varchar({ length: 20 }).notNull(),
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: jsonb().$type<Record<string, any>>().notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow().$onUpdate(() => sql`now()`).notNull(),
  },
  (table) => [
    index("idx_fetch_status_type").using(
      "btree",
      table.type.asc().nullsLast().op("text_ops"),
    ),
    check(
      "valid_type",
      sql`(type)::text = ANY ((ARRAY['discover'::character varying, 'search'::character varying])::text[])`,
    ),
    check(
      "remove_expired",
      sql`expires_at > now()`,
    ),
  ],
);

export type TMDBFetchStatusRow = typeof tmdbFetchStatusSchema.$inferSelect;
export type NewTMDBFetchStatusRow = typeof tmdbFetchStatusSchema.$inferInsert;
