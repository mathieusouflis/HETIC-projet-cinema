import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  pgView,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const upcomingWatchpartiesSchema = pgView("upcoming_watchparties", {
  id: uuid(),
  createdBy: uuid("created_by"),
  contentId: uuid("content_id"),
  seasonId: uuid("season_id"),
  episodeId: uuid("episode_id"),
  name: varchar({ length: 255 }),
  description: text(),
  isPublic: boolean("is_public"),
  maxParticipants: integer("max_participants"),
  platformId: uuid("platform_id"),
  platformUrl: text("platform_url"),
  scheduledAt: timestamp("scheduled_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
  endedAt: timestamp("ended_at", { withTimezone: true, mode: "string" }),
  status: varchar({ length: 20 }),
  currentPositionTimestamp: integer("current_position_timestamp"),
  isPlaying: boolean("is_playing"),
  leaderUserId: uuid("leader_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  creatorUsername: varchar("creator_username", { length: 50 }),
  contentTitle: varchar("content_title", { length: 255 }),
  platformName: varchar("platform_name", { length: 100 }),
  participantCount: bigint("participant_count", { mode: "number" }),
}).as(
  sql`SELECT wp.id, wp.created_by, wp.content_id, wp.season_id, wp.episode_id, wp.name, wp.description, wp.is_public, wp.max_participants, wp.platform_id, wp.platform_url, wp.scheduled_at, wp.started_at, wp.ended_at, wp.status, wp.current_position_timestamp, wp.is_playing, wp.leader_user_id, wp.created_at, wp.updated_at, u.username AS creator_username, c.title AS content_title, sp.name AS platform_name, count(wpp.id) AS participant_count FROM watchparties wp JOIN users u ON wp.created_by = u.id JOIN content c ON wp.content_id = c.id JOIN streaming_platforms sp ON wp.platform_id = sp.id LEFT JOIN watchparty_participants wpp ON wp.id = wpp.watchparty_id AND wpp.status::text = 'confirmed'::text WHERE wp.status::text = 'scheduled'::text AND wp.scheduled_at > now() GROUP BY wp.id, u.username, c.title, sp.name`
);
