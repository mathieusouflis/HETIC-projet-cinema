import { relations } from "drizzle-orm";
import {
  content,
  episodes,
  messages,
  notifications,
  seasons,
  streamingPlatforms,
  userActivityLogs,
  users,
  watchpartyInvitations,
  watchpartyParticipants,
} from "../../../../database/schema";
import { watchpartySchema } from "./watchparty.schema";

export const watchpartiesRelationsSchema = relations(
  watchpartySchema,
  ({ one, many }) => ({
    user_createdBy: one(users, {
      fields: [watchpartySchema.createdBy],
      references: [users.id],
      relationName: "watchparties_createdBy_users_id",
    }),
    content: one(content, {
      fields: [watchpartySchema.contentId],
      references: [content.id],
    }),
    season: one(seasons, {
      fields: [watchpartySchema.seasonId],
      references: [seasons.id],
    }),
    episode: one(episodes, {
      fields: [watchpartySchema.episodeId],
      references: [episodes.id],
    }),
    streamingPlatform: one(streamingPlatforms, {
      fields: [watchpartySchema.platformId],
      references: [streamingPlatforms.id],
    }),
    user_leaderUserId: one(users, {
      fields: [watchpartySchema.leaderUserId],
      references: [users.id],
      relationName: "watchparties_leaderUserId_users_id",
    }),
    messages: many(messages),
    watchpartyParticipants: many(watchpartyParticipants),
    watchpartyInvitations: many(watchpartyInvitations),
    userActivityLogs: many(userActivityLogs),
    notifications: many(notifications),
  })
);
