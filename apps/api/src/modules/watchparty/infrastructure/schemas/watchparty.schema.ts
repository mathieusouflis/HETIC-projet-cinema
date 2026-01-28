import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  content,
  episodes,
  seasons,
  streamingPlatforms,
  users,
} from "../../../../database/schema";

export const watchpartySchema = pgTable(
  "watchparties",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdBy: uuid("created_by").notNull(),
    contentId: uuid("content_id").notNull(),
    seasonId: uuid("season_id"),
    episodeId: uuid("episode_id"),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    isPublic: boolean("is_public").default(false),
    maxParticipants: integer("max_participants"),
    platformId: uuid("platform_id").notNull(),
    platformUrl: text("platform_url").notNull(),
    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "string" }),
    status: varchar({ length: 20 }).default("scheduled"),
    currentPositionTimestamp: integer("current_position_timestamp").default(0),
    isPlaying: boolean("is_playing").default(false),
    leaderUserId: uuid("leader_user_id"),
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
    index("idx_watchparties_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_watchparties_content_related").using(
      "btree",
      table.contentId.asc().nullsLast(),
      table.seasonId.asc().nullsLast(),
      table.episodeId.asc().nullsLast()
    ),
    index("idx_watchparties_creator").using(
      "btree",
      table.createdBy.asc().nullsLast()
    ),
    index("idx_watchparties_episode").using(
      "btree",
      table.episodeId.asc().nullsLast()
    ),
    index("idx_watchparties_scheduled").using(
      "btree",
      table.scheduledAt.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    index("idx_watchparties_season").using(
      "btree",
      table.seasonId.asc().nullsLast()
    ),
    index("idx_watchparties_status").using(
      "btree",
      table.status.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "watchparties_created_by_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "watchparties_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.seasonId],
      foreignColumns: [seasons.id],
      name: "watchparties_season_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.episodeId],
      foreignColumns: [episodes.id],
      name: "watchparties_episode_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.platformId],
      foreignColumns: [streamingPlatforms.id],
      name: "watchparties_platform_id_fkey",
    }),
    foreignKey({
      columns: [table.leaderUserId],
      foreignColumns: [users.id],
      name: "watchparties_leader_user_id_fkey",
    }),
  ]
);

export type WatchpartyRow = typeof watchpartySchema.$inferSelect;
export type NewWatchpartyRow = typeof watchpartySchema.$inferInsert;
