import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { contentPlatforms, watchparties } from "../../../../database/schema";

export const streamingPlatformsSchema = pgTable(
  "streaming_platforms",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    logoUrl: text("logo_url"),
    baseUrl: text("base_url"),
    isSupported: boolean("is_supported").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("streaming_platforms_name_key").on(table.name),
    unique("streaming_platforms_slug_key").on(table.slug),
  ]
);

export const streamingPlatformsRelationsSchema = relations(
  streamingPlatformsSchema,
  ({ many }) => ({
    watchparties: many(watchparties),
    contents: many(contentPlatforms),
  })
);

export type StreamingPlatformRow = typeof streamingPlatformsSchema.$inferSelect;
export type NewStreamingPlatformRow =
  typeof streamingPlatformsSchema.$inferInsert;
