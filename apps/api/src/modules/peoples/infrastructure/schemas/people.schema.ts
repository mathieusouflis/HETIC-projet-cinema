import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  contentCredits,
  people,
  peopleLikes,
} from "../../../../database/schema";

export const peopleSchema = pgTable(
  "people",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    bio: text(),
    photoUrl: text("photo_url"),
    birthDate: date("birth_date"),
    nationality: varchar({ length: 100 }),
    tmdbId: integer("tmdb_id"),
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
    index("idx_people_name").using("btree", table.name.asc().nullsLast()),
    index("idx_people_tmdb").using("btree", table.tmdbId.asc().nullsLast()),
    unique("people_tmdb_id_key").on(table.tmdbId),
  ]
);

export const peopleRelationSchema = relations(people, ({ many }) => ({
  contentCredits: many(contentCredits),
  peopleLikes: many(peopleLikes),
}));

export type PeopleRow = typeof peopleSchema.$inferSelect;
export type NewPeopleRow = typeof peopleSchema.$inferInsert;
