import { emailVerificationTokensSchema } from "../modules/auth/infrastructure/schemas/email-verification-tokens.schema";
import {
  refreshTokensRelationsSchema,
  refreshTokensSchema,
} from "../modules/auth/infrastructure/schemas/refresh-tokens.schema";
import { passwordResetTokensSchema } from "../modules/auth/infrastructure/schemas/reset-tokens.schema";
import {
  categoriesRelationsSchema,
  categorySchema,
} from "../modules/categories/infrastructure/database/schemas/categories.schema";
import {
  contentCategoriesRelationsSchema,
  contentCategoriesSchema,
} from "../modules/categories/infrastructure/database/schemas/content-categories.schema";
import {
  contentCreditsRelationsSchema,
  contentCreditsSchema,
} from "../modules/content-credits/infrastructure/database/content-credits.schema";
import {
  contentPlatformsRelationsSchema,
  contentPlatformsSchema,
} from "../modules/content-platforms/infrastructure/database/content-platforms.schema";
import {
  contentRelationsSchema,
  contentSchema,
} from "../modules/contents/infrastructure/database/schemas/contents.schema";
import { popularContentSchema } from "../modules/contents/infrastructure/database/schemas/popular-content.schema";
import { tmdbFetchStatusSchema } from "../modules/contents/infrastructure/database/schemas/tmdb-fetch-status.schema";
import {
  conversationParticipantsRelationsSchema,
  conversationParticipantsSchema,
  conversationsRelationsSchema,
  conversationsSchema,
} from "../modules/conversations/infrastructure/schemas/conversations.schema";
import {
  episodesRelationsSchema,
  episodesSchema,
} from "../modules/episodes/infrastructure/database/episodes.schema";
import {
  friendshipsRelationsSchema,
  friendshipsSchema,
  friendshipsStatusEnum,
} from "../modules/friendships/infrastructure/schemas/friendships.schema";
import {
  listItemsRelationsSchema,
  listItemsSchema,
  listLikesRelationsSchema,
  listLikesSchema,
  listsRelationsSchema,
  listsSchema,
} from "../modules/lists/infrastructure/database/lists.schema";
import {
  messagesRelationsSchema,
  messagesSchema,
} from "../modules/messages/infrastructure/schemas/messages.schema";
import {
  peopleRelationSchema,
  peopleSchema,
} from "../modules/peoples/infrastructure/schemas/people.schema";
import {
  peopleLikesRelationsSchema,
  peopleLikesSchema,
} from "../modules/peoples/infrastructure/schemas/people-likes.schema";
import {
  streamingPlatformsRelationsSchema,
  streamingPlatformsSchema,
} from "../modules/platforms/infrastructure/database/platforms.schema";
import {
  ratingsRelationsSchema,
  ratingsSchema,
} from "../modules/ratings/infrastructure/schemas/ratings.schema";
import {
  reviewLikesRelationsSchema,
  reviewLikesSchema,
  reviewsRelationsSchema,
  reviewsSchema,
} from "../modules/reviews/infrastructure/database/reviews.schema";
import {
  seasonsRelationsSchema,
  seasonsSchema,
} from "../modules/seasons/infrastructure/database/seasons.schema";
import {
  notificationsRelationsSchema,
  notificationsSchema,
} from "../modules/users/infrastructure/database/schemas/notifications.schema";
import {
  userActivityLogsRelationsSchema,
  userActivityLogsSchema,
} from "../modules/users/infrastructure/database/schemas/user-activity-logs.schema";
import {
  userStatsRelationsSchema,
  userStatsSchema,
} from "../modules/users/infrastructure/database/schemas/user-stats.schema";
import {
  usersRelationSchema,
  users as usersSchema,
} from "../modules/users/infrastructure/database/schemas/users.schema";
import {
  watchlistStatusEnum as watchlistCustomEnumImported,
  watchlistRelationsSchema,
  watchlistSchema,
} from "../modules/watchlist/infrastructure/schemas/watchlist.schema";
import { upcomingWatchpartiesSchema } from "../modules/watchparty/infrastructure/schemas/upcoming-watchparties.schema";
import { watchpartySchema } from "../modules/watchparty/infrastructure/schemas/watchparty.schema";
import {
  watchpartyInvitationsRelationsSchema,
  watchpartyInvitationsSchema,
  watchpartyParticipantsRelationsSchema,
  watchpartyParticipantsSchema,
} from "../modules/watchparty/infrastructure/schemas/watchparty-participants.schema";
import { watchpartiesRelationsSchema } from "../modules/watchparty/infrastructure/schemas/watchparty-relations.schema";

// Users
export const users = usersSchema;
export const usersRelations = usersRelationSchema;

// Auth
export const refreshTokens = refreshTokensSchema;
export const refreshTokensRelations = refreshTokensRelationsSchema;
export const passwordResetTokens = passwordResetTokensSchema;
export const emailVerificationTokens = emailVerificationTokensSchema;

// Friendships
export const friendsshipStatus = friendshipsStatusEnum;
export const friendships = friendshipsSchema;
export const friendshipsRelations = friendshipsRelationsSchema;

// Contents
export const tmdbFetchStatus = tmdbFetchStatusSchema;
export const content = contentSchema;
export const contentRelations = contentRelationsSchema;
export const popularContent = popularContentSchema;

// Categories
export const categories = categorySchema;
export const categoriesRelations = categoriesRelationsSchema;
export const contentCategories = contentCategoriesSchema;
export const contentCategoriesRelations = contentCategoriesRelationsSchema;

// Content credits & platforms
export const contentCredits = contentCreditsSchema;
export const contentCreditsRelations = contentCreditsRelationsSchema;
export const contentPlatforms = contentPlatformsSchema;
export const contentPlatformsRelations = contentPlatformsRelationsSchema;

// People
export const people = peopleSchema;
export const peopleRelations = peopleRelationSchema;
export const peopleLikes = peopleLikesSchema;
export const peopleLikesRelations = peopleLikesRelationsSchema;

// Seasons & episodes
export const seasons = seasonsSchema;
export const seasonsRelations = seasonsRelationsSchema;
export const episodes = episodesSchema;
export const episodesRelations = episodesRelationsSchema;

// Streaming platforms
export const streamingPlatforms = streamingPlatformsSchema;
export const streamingPlatformsRelations = streamingPlatformsRelationsSchema;

// Conversations & messages
export const conversations = conversationsSchema;
export const conversationsRelations = conversationsRelationsSchema;
export const conversationParticipants = conversationParticipantsSchema;
export const conversationParticipantsRelations =
  conversationParticipantsRelationsSchema;
export const messages = messagesSchema;
export const messagesRelations = messagesRelationsSchema;

// Watchparties
export const watchparties = watchpartySchema;
export const watchpartiesRelations = watchpartiesRelationsSchema;
export const watchpartyParticipants = watchpartyParticipantsSchema;
export const watchpartyParticipantsRelations =
  watchpartyParticipantsRelationsSchema;
export const watchpartyInvitations = watchpartyInvitationsSchema;
export const watchpartyInvitationsRelations =
  watchpartyInvitationsRelationsSchema;
export const upcomingWatchparties = upcomingWatchpartiesSchema;

// Ratings & reviews
export const ratings = ratingsSchema;
export const ratingsRelations = ratingsRelationsSchema;
export const reviews = reviewsSchema;
export const reviewsRelations = reviewsRelationsSchema;
export const reviewLikes = reviewLikesSchema;
export const reviewLikesRelations = reviewLikesRelationsSchema;

// Watchlist
export const watchlistStatusEnum = watchlistCustomEnumImported;
export const watchlist = watchlistSchema;
export const watchlistRelations = watchlistRelationsSchema;

// Lists
export const lists = listsSchema;
export const listsRelations = listsRelationsSchema;
export const listItems = listItemsSchema;
export const listItemsRelations = listItemsRelationsSchema;
export const listLikes = listLikesSchema;
export const listLikesRelations = listLikesRelationsSchema;

// User stats, activity & notifications
export const userActivityLogs = userActivityLogsSchema;
export const userActivityLogsRelations = userActivityLogsRelationsSchema;
export const userStats = userStatsSchema;
export const userStatsRelations = userStatsRelationsSchema;
export const notifications = notificationsSchema;
export const notificationsRelations = notificationsRelationsSchema;
