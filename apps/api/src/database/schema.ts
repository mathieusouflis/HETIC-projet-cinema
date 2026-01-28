import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  foreignKey,
  index,
  inet,
  integer,
  jsonb,
  numeric,
  pgTable,
  pgView,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  contentRelationsSchema,
  contentSchema,
} from "../modules/contents/infrastructure/database/schemas/contents.schema";
import { tmdbFetchStatusSchema } from "../modules/contents/infrastructure/database/schemas/tmdb-fetch-status.schema";
import {
  peopleRelationSchema,
  peopleSchema,
} from "../modules/peoples/infrastructure/schemas/people.schema";
import {
  friendshipsRelationsSchema,
  friendshipsSchema,
  friendshipsStatusEnum,
} from "../modules/users/infrastructure/database/schemas/friendships.schema";
import {
  usersRelationSchema,
  users as usersSchema,
} from "../modules/users/infrastructure/database/schemas/users.schema";
import {
  watchlistStatusEnum as watchlistCustomEnumImported,
  watchlistRelationsSchema,
  watchlistSchema,
} from "../modules/watchlist/infrastructure/schemas/watchlist.schema";
import { watchpartySchema } from "../modules/watchparty/infrastructure/schemas/watchparty.schema";

export const users = usersSchema;

export const tmdbFetchStatus = tmdbFetchStatusSchema;

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    tokenHash: varchar("token_hash", { length: 255 }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  },
  (table) => [
    index("idx_refresh_tokens_expires").using(
      "btree",
      table.expiresAt.asc().nullsLast()
    ),
    index("idx_refresh_tokens_hash").using(
      "btree",
      table.tokenHash.asc().nullsLast()
    ),
    index("idx_refresh_tokens_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "refresh_tokens_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const friendsshipStatus = friendshipsStatusEnum;
export const friendships = friendshipsSchema;

export const content = contentSchema;

export const categories = pgTable(
  "categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    description: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("categories_name_key").on(table.name),
    unique("categories_slug_key").on(table.slug),
  ]
);

export const contentCredits = pgTable(
  "content_credits",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    contentId: uuid("content_id").notNull(),
    personId: uuid("person_id").notNull(),
    role: varchar({ length: 50 }).notNull(),
    characterName: varchar("character_name", { length: 255 }),
    orderIndex: integer("order_index"),
  },
  (table) => [
    index("idx_credits_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_credits_person").using(
      "btree",
      table.personId.asc().nullsLast(),
      table.role.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "content_credits_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [people.id],
      name: "content_credits_person_id_fkey",
    }).onDelete("cascade"),
    unique("unique_credit").on(table.role, table.personId, table.contentId),
  ]
);

export const people = peopleSchema;

export const seasons = pgTable(
  "seasons",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    seriesId: uuid("series_id").notNull(),
    seasonNumber: integer("season_number").notNull(),
    name: varchar({ length: 255 }),
    overview: text(),
    posterUrl: text("poster_url"),
    airDate: date("air_date"),
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

export const episodes = pgTable(
  "episodes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    seasonId: uuid("season_id").notNull(),
    episodeNumber: integer("episode_number").notNull(),
    name: varchar({ length: 255 }).notNull(),
    overview: text(),
    stillUrl: text("still_url"),
    airDate: date("air_date"),
    durationMinutes: integer("duration_minutes"),
  },
  (table) => [
    index("idx_episodes_season").using(
      "btree",
      table.seasonId.asc().nullsLast(),
      table.episodeNumber.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.seasonId],
      foreignColumns: [seasons.id],
      name: "episodes_season_id_fkey",
    }).onDelete("cascade"),
    unique("unique_episode").on(table.seasonId, table.episodeNumber),
    check("valid_episode", sql`episode_number > 0`),
  ]
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    type: varchar({ length: 20 }).notNull(),
    name: varchar({ length: 100 }),
    avatarUrl: text("avatar_url"),
    createdBy: uuid("created_by"),
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
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "conversations_created_by_fkey",
    }).onDelete("set null"),
  ]
);

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id").notNull(),
    userId: uuid("user_id").notNull(),
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    lastReadAt: timestamp("last_read_at", {
      withTimezone: true,
      mode: "string",
    }),
    role: varchar({ length: 20 }).default("member"),
  },
  (table) => [
    index("idx_conv_participants_conv").using(
      "btree",
      table.conversationId.asc().nullsLast()
    ),
    index("idx_conv_participants_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "conversation_participants_conversation_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "conversation_participants_user_id_fkey",
    }).onDelete("cascade"),
    unique("unique_participant").on(table.userId, table.conversationId),
  ]
);

export const watchparties = watchpartySchema;

export const streamingPlatforms = pgTable(
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

export const messages = pgTable(
  "messages",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id").notNull(),
    userId: uuid("user_id").notNull(),
    content: text().notNull(),
    type: varchar({ length: 20 }).default("text"),
    watchpartyId: uuid("watchparty_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_messages_conversation").using(
      "btree",
      table.conversationId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    index("idx_messages_watchparty").using(
      "btree",
      table.watchpartyId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "messages_conversation_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "messages_user_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "messages_watchparty_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const ratings = pgTable(
  "ratings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    contentId: uuid("content_id").notNull(),
    rating: numeric({ precision: 2, scale: 1 }).notNull(),
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
    index("idx_ratings_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_ratings_user").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "ratings_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "ratings_content_id_fkey",
    }).onDelete("cascade"),
    unique("unique_rating").on(table.userId, table.contentId),
    check("valid_rating", sql`(rating >= 1.0) AND (rating <= 5.0)`),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    contentId: uuid("content_id").notNull(),
    title: varchar({ length: 255 }),
    content: text().notNull(),
    isSpoiler: boolean("is_spoiler").default(false),
    parentReviewId: uuid("parent_review_id"),
    likesCount: integer("likes_count").default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("idx_reviews_content").using(
      "btree",
      table.contentId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    index("idx_reviews_parent").using(
      "btree",
      table.parentReviewId.asc().nullsLast()
    ),
    index("idx_reviews_user").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "reviews_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "reviews_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parentReviewId],
      foreignColumns: [table.id],
      name: "reviews_parent_review_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const watchlistStatusEnum = watchlistCustomEnumImported;
export const watchlist = watchlistSchema;

export const lists = pgTable(
  "lists",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    isPublic: boolean("is_public").default(true),
    coverImageUrl: text("cover_image_url"),
    likesCount: integer("likes_count").default(0),
    itemsCount: integer("items_count").default(0),
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
    index("idx_lists_public").using(
      "btree",
      table.isPublic.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    index("idx_lists_user").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "lists_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const listItems = pgTable(
  "list_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    listId: uuid("list_id").notNull(),
    contentId: uuid("content_id").notNull(),
    orderIndex: integer("order_index").notNull(),
    note: text(),
    addedAt: timestamp("added_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_list_items_list").using(
      "btree",
      table.listId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.listId],
      foreignColumns: [lists.id],
      name: "list_items_list_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "list_items_content_id_fkey",
    }).onDelete("cascade"),
    unique("unique_list_item").on(table.listId, table.contentId),
  ]
);

export const watchpartyParticipants = pgTable(
  "watchparty_participants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    watchpartyId: uuid("watchparty_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: varchar({ length: 20 }).default("invited"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" }),
    leftAt: timestamp("left_at", { withTimezone: true, mode: "string" }),
    totalWatchTimeSeconds: integer("total_watch_time_seconds").default(0),
  },
  (table) => [
    index("idx_watchparty_participants_party").using(
      "btree",
      table.watchpartyId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    index("idx_watchparty_participants_user").using(
      "btree",
      table.userId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "watchparty_participants_watchparty_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "watchparty_participants_user_id_fkey",
    }).onDelete("cascade"),
    unique("unique_watchparty_participant").on(
      table.watchpartyId,
      table.userId
    ),
  ]
);

export const watchpartyInvitations = pgTable(
  "watchparty_invitations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    watchpartyId: uuid("watchparty_id").notNull(),
    inviterId: uuid("inviter_id").notNull(),
    inviteeId: uuid("invitee_id"),
    inviteToken: varchar("invite_token", { length: 255 }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_invitations_invitee").using(
      "btree",
      table.inviteeId.asc().nullsLast()
    ),
    index("idx_invitations_token").using(
      "btree",
      table.inviteToken.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "watchparty_invitations_watchparty_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [users.id],
      name: "watchparty_invitations_inviter_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviteeId],
      foreignColumns: [users.id],
      name: "watchparty_invitations_invitee_id_fkey",
    }).onDelete("cascade"),
    unique("watchparty_invitations_invite_token_key").on(table.inviteToken),
    unique("unique_invitation").on(table.watchpartyId, table.inviteeId),
  ]
);

export const userActivityLogs = pgTable(
  "user_activity_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    contentId: uuid("content_id"),
    watchpartyId: uuid("watchparty_id"),
    metadata: jsonb(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_activity_content").using(
      "btree",
      table.contentId.asc().nullsLast()
    ),
    index("idx_activity_type").using(
      "btree",
      table.eventType.asc().nullsLast()
    ),
    index("idx_activity_user").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_activity_logs_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "user_activity_logs_content_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.watchpartyId],
      foreignColumns: [watchparties.id],
      name: "user_activity_logs_watchparty_id_fkey",
    }).onDelete("set null"),
  ]
);

export const userStats = pgTable(
  "user_stats",
  {
    userId: uuid("user_id").primaryKey().notNull(),
    totalWatchTimeMinutes: integer("total_watch_time_minutes").default(0),
    totalMoviesWatched: integer("total_movies_watched").default(0),
    totalSeriesWatched: integer("total_series_watched").default(0),
    totalEpisodesWatched: integer("total_episodes_watched").default(0),
    totalWatchpartiesCreated: integer("total_watchparties_created").default(0),
    totalWatchpartiesJoined: integer("total_watchparties_joined").default(0),
    totalReviewsWritten: integer("total_reviews_written").default(0),
    totalListsCreated: integer("total_lists_created").default(0),
    favoriteGenreId: uuid("favorite_genre_id"),
    favoriteDecade: integer("favorite_decade"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_stats_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.favoriteGenreId],
      foreignColumns: [categories.id],
      name: "user_stats_favorite_genre_id_fkey",
    }),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    type: varchar({ length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    message: text(),
    relatedUserId: uuid("related_user_id"),
    relatedContentId: uuid("related_content_id"),
    relatedWatchpartyId: uuid("related_watchparty_id"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_notifications_user").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.isRead.asc().nullsLast(),
      table.createdAt.desc().nullsFirst()
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "notifications_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.relatedUserId],
      foreignColumns: [users.id],
      name: "notifications_related_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.relatedContentId],
      foreignColumns: [content.id],
      name: "notifications_related_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.relatedWatchpartyId],
      foreignColumns: [watchparties.id],
      name: "notifications_related_watchparty_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const contentCategories = pgTable(
  "content_categories",
  {
    contentId: uuid("content_id").notNull(),
    categoryId: uuid("category_id").notNull(),
  },
  (table) => [
    index("idx_content_categories_category").using(
      "btree",
      table.categoryId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.contentId],
      foreignColumns: [content.id],
      name: "content_categories_content_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "content_categories_category_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.contentId, table.categoryId],
      name: "content_categories_pkey",
    }),
  ]
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    userId: uuid("user_id").notNull(),
    reviewId: uuid("review_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "review_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [reviews.id],
      name: "review_likes_review_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.reviewId],
      name: "review_likes_pkey",
    }),
  ]
);

export const listLikes = pgTable(
  "list_likes",
  {
    userId: uuid("user_id").notNull(),
    listId: uuid("list_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "list_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.listId],
      foreignColumns: [lists.id],
      name: "list_likes_list_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.listId],
      name: "list_likes_pkey",
    }),
  ]
);

export const peopleLikes = pgTable(
  "people_likes",
  {
    userId: uuid("user_id").notNull(),
    personId: uuid("person_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "people_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.personId],
      foreignColumns: [people.id],
      name: "people_likes_person_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.personId],
      name: "people_likes_pkey",
    }),
  ]
);
export const popularContent = pgView("popular_content", {
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
  sql`SELECT id, type, title, original_title, slug, synopsis, poster_url, backdrop_url, trailer_url, release_date, year, duration_minutes, tmdb_id, average_rating, total_ratings, total_views, created_at, updated_at, COALESCE(total_ratings::numeric * average_rating, 0::numeric) AS popularity_score FROM content c ORDER BY (COALESCE(total_ratings::numeric * average_rating, 0::numeric)) DESC`
);

export const upcomingWatchparties = pgView("upcoming_watchparties", {
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
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  participantCount: bigint("participant_count", { mode: "number" }),
}).as(
  sql`SELECT wp.id, wp.created_by, wp.content_id, wp.season_id, wp.episode_id, wp.name, wp.description, wp.is_public, wp.max_participants, wp.platform_id, wp.platform_url, wp.scheduled_at, wp.started_at, wp.ended_at, wp.status, wp.current_position_timestamp, wp.is_playing, wp.leader_user_id, wp.created_at, wp.updated_at, u.username AS creator_username, c.title AS content_title, sp.name AS platform_name, count(wpp.id) AS participant_count FROM watchparties wp JOIN users u ON wp.created_by = u.id JOIN content c ON wp.content_id = c.id JOIN streaming_platforms sp ON wp.platform_id = sp.id LEFT JOIN watchparty_participants wpp ON wp.id = wpp.watchparty_id AND wpp.status::text = 'confirmed'::text WHERE wp.status::text = 'scheduled'::text AND wp.scheduled_at > now() GROUP BY wp.id, u.username, c.title, sp.name`
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const usersRelations = usersRelationSchema;

export const friendshipsRelations = friendshipsRelationsSchema;

export const contentCreditsRelations = relations(contentCredits, ({ one }) => ({
  content: one(content, {
    fields: [contentCredits.contentId],
    references: [content.id],
  }),
  person: one(people, {
    fields: [contentCredits.personId],
    references: [people.id],
  }),
}));

export const contentRelations = contentRelationsSchema;

export const peopleRelations = peopleRelationSchema;

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  content: one(content, {
    fields: [seasons.seriesId],
    references: [content.id],
  }),
  episodes: many(episodes),
  watchparties: many(watchparties),
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
  season: one(seasons, {
    fields: [episodes.seasonId],
    references: [seasons.id],
  }),
  watchparties: many(watchparties),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.createdBy],
      references: [users.id],
    }),
    conversationParticipants: many(conversationParticipants),
    messages: many(messages),
  })
);

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  })
);

export const watchpartiesRelations = relations(
  watchparties,
  ({ one, many }) => ({
    user_createdBy: one(users, {
      fields: [watchparties.createdBy],
      references: [users.id],
      relationName: "watchparties_createdBy_users_id",
    }),
    content: one(content, {
      fields: [watchparties.contentId],
      references: [content.id],
    }),
    season: one(seasons, {
      fields: [watchparties.seasonId],
      references: [seasons.id],
    }),
    episode: one(episodes, {
      fields: [watchparties.episodeId],
      references: [episodes.id],
    }),
    streamingPlatform: one(streamingPlatforms, {
      fields: [watchparties.platformId],
      references: [streamingPlatforms.id],
    }),
    user_leaderUserId: one(users, {
      fields: [watchparties.leaderUserId],
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

export const streamingPlatformsRelations = relations(
  streamingPlatforms,
  ({ many }) => ({
    watchparties: many(watchparties),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  watchparty: one(watchparties, {
    fields: [messages.watchpartyId],
    references: [watchparties.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  content: one(content, {
    fields: [ratings.contentId],
    references: [content.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  content: one(content, {
    fields: [reviews.contentId],
    references: [content.id],
  }),
  review: one(reviews, {
    fields: [reviews.parentReviewId],
    references: [reviews.id],
    relationName: "reviews_parentReviewId_reviews_id",
  }),
  reviews: many(reviews, {
    relationName: "reviews_parentReviewId_reviews_id",
  }),
  reviewLikes: many(reviewLikes),
}));

export const watchlistRelations = watchlistRelationsSchema;

export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(users, {
    fields: [lists.userId],
    references: [users.id],
  }),
  listItems: many(listItems),
  listLikes: many(listLikes),
}));

export const listItemsRelations = relations(listItems, ({ one }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  content: one(content, {
    fields: [listItems.contentId],
    references: [content.id],
  }),
}));

export const watchpartyParticipantsRelations = relations(
  watchpartyParticipants,
  ({ one }) => ({
    watchparty: one(watchparties, {
      fields: [watchpartyParticipants.watchpartyId],
      references: [watchparties.id],
    }),
    user: one(users, {
      fields: [watchpartyParticipants.userId],
      references: [users.id],
    }),
  })
);

export const watchpartyInvitationsRelations = relations(
  watchpartyInvitations,
  ({ one }) => ({
    watchparty: one(watchparties, {
      fields: [watchpartyInvitations.watchpartyId],
      references: [watchparties.id],
    }),
    user_inviterId: one(users, {
      fields: [watchpartyInvitations.inviterId],
      references: [users.id],
      relationName: "watchpartyInvitations_inviterId_users_id",
    }),
    user_inviteeId: one(users, {
      fields: [watchpartyInvitations.inviteeId],
      references: [users.id],
      relationName: "watchpartyInvitations_inviteeId_users_id",
    }),
  })
);

export const userActivityLogsRelations = relations(
  userActivityLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [userActivityLogs.userId],
      references: [users.id],
    }),
    content: one(content, {
      fields: [userActivityLogs.contentId],
      references: [content.id],
    }),
    watchparty: one(watchparties, {
      fields: [userActivityLogs.watchpartyId],
      references: [watchparties.id],
    }),
  })
);

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [userStats.favoriteGenreId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  userStats: many(userStats),
  contentCategories: many(contentCategories),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user_userId: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "notifications_userId_users_id",
  }),
  user_relatedUserId: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
    relationName: "notifications_relatedUserId_users_id",
  }),
  content: one(content, {
    fields: [notifications.relatedContentId],
    references: [content.id],
  }),
  watchparty: one(watchparties, {
    fields: [notifications.relatedWatchpartyId],
    references: [watchparties.id],
  }),
}));

export const contentCategoriesRelations = relations(
  contentCategories,
  ({ one }) => ({
    content: one(content, {
      fields: [contentCategories.contentId],
      references: [content.id],
    }),
    category: one(categories, {
      fields: [contentCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  user: one(users, {
    fields: [reviewLikes.userId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [reviewLikes.reviewId],
    references: [reviews.id],
  }),
}));

export const listLikesRelations = relations(listLikes, ({ one }) => ({
  user: one(users, {
    fields: [listLikes.userId],
    references: [users.id],
  }),
  list: one(lists, {
    fields: [listLikes.listId],
    references: [lists.id],
  }),
}));

export const peopleLikesRelations = relations(peopleLikes, ({ one }) => ({
  user: one(users, {
    fields: [peopleLikes.userId],
    references: [users.id],
  }),
  person: one(people, {
    fields: [peopleLikes.personId],
    references: [people.id],
  }),
}));
