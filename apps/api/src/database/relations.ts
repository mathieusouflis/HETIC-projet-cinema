import { relations } from "drizzle-orm/relations";
import { users, refreshTokens, friendships, content, contentCredits, people, seasons, episodes, conversations, conversationParticipants, watchparties, streamingPlatforms, messages, ratings, reviews, userWatchlist, lists, listItems, watchpartyParticipants, watchpartyInvitations, userActivityLogs, userStats, categories, notifications, contentCategories, reviewLikes, listLikes, peopleLikes } from "./schema";

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	refreshTokens: many(refreshTokens),
	friendships_userId: many(friendships, {
		relationName: "friendships_userId_users_id"
	}),
	friendships_friendId: many(friendships, {
		relationName: "friendships_friendId_users_id"
	}),
	conversations: many(conversations),
	conversationParticipants: many(conversationParticipants),
	watchparties_createdBy: many(watchparties, {
		relationName: "watchparties_createdBy_users_id"
	}),
	watchparties_leaderUserId: many(watchparties, {
		relationName: "watchparties_leaderUserId_users_id"
	}),
	messages: many(messages),
	ratings: many(ratings),
	reviews: many(reviews),
	userWatchlists: many(userWatchlist),
	lists: many(lists),
	watchpartyParticipants: many(watchpartyParticipants),
	watchpartyInvitations_inviterId: many(watchpartyInvitations, {
		relationName: "watchpartyInvitations_inviterId_users_id"
	}),
	watchpartyInvitations_inviteeId: many(watchpartyInvitations, {
		relationName: "watchpartyInvitations_inviteeId_users_id"
	}),
	userActivityLogs: many(userActivityLogs),
	userStats: many(userStats),
	notifications_userId: many(notifications, {
		relationName: "notifications_userId_users_id"
	}),
	notifications_relatedUserId: many(notifications, {
		relationName: "notifications_relatedUserId_users_id"
	}),
	reviewLikes: many(reviewLikes),
	listLikes: many(listLikes),
	peopleLikes: many(peopleLikes),
}));

export const friendshipsRelations = relations(friendships, ({one}) => ({
	user_userId: one(users, {
		fields: [friendships.userId],
		references: [users.id],
		relationName: "friendships_userId_users_id"
	}),
	user_friendId: one(users, {
		fields: [friendships.friendId],
		references: [users.id],
		relationName: "friendships_friendId_users_id"
	}),
}));

export const contentCreditsRelations = relations(contentCredits, ({one}) => ({
	content: one(content, {
		fields: [contentCredits.contentId],
		references: [content.id]
	}),
	person: one(people, {
		fields: [contentCredits.personId],
		references: [people.id]
	}),
}));

export const contentRelations = relations(content, ({many}) => ({
	contentCredits: many(contentCredits),
	seasons: many(seasons),
	watchparties: many(watchparties),
	ratings: many(ratings),
	reviews: many(reviews),
	userWatchlists: many(userWatchlist),
	listItems: many(listItems),
	userActivityLogs: many(userActivityLogs),
	notifications: many(notifications),
	contentCategories: many(contentCategories),
}));

export const peopleRelations = relations(people, ({many}) => ({
	contentCredits: many(contentCredits),
	peopleLikes: many(peopleLikes),
}));

export const seasonsRelations = relations(seasons, ({one, many}) => ({
	content: one(content, {
		fields: [seasons.seriesId],
		references: [content.id]
	}),
	episodes: many(episodes),
	watchparties: many(watchparties),
}));

export const episodesRelations = relations(episodes, ({one, many}) => ({
	season: one(seasons, {
		fields: [episodes.seasonId],
		references: [seasons.id]
	}),
	watchparties: many(watchparties),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user: one(users, {
		fields: [conversations.createdBy],
		references: [users.id]
	}),
	conversationParticipants: many(conversationParticipants),
	messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [conversationParticipants.userId],
		references: [users.id]
	}),
}));

export const watchpartiesRelations = relations(watchparties, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [watchparties.createdBy],
		references: [users.id],
		relationName: "watchparties_createdBy_users_id"
	}),
	content: one(content, {
		fields: [watchparties.contentId],
		references: [content.id]
	}),
	season: one(seasons, {
		fields: [watchparties.seasonId],
		references: [seasons.id]
	}),
	episode: one(episodes, {
		fields: [watchparties.episodeId],
		references: [episodes.id]
	}),
	streamingPlatform: one(streamingPlatforms, {
		fields: [watchparties.platformId],
		references: [streamingPlatforms.id]
	}),
	user_leaderUserId: one(users, {
		fields: [watchparties.leaderUserId],
		references: [users.id],
		relationName: "watchparties_leaderUserId_users_id"
	}),
	messages: many(messages),
	watchpartyParticipants: many(watchpartyParticipants),
	watchpartyInvitations: many(watchpartyInvitations),
	userActivityLogs: many(userActivityLogs),
	notifications: many(notifications),
}));

export const streamingPlatformsRelations = relations(streamingPlatforms, ({many}) => ({
	watchparties: many(watchparties),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.userId],
		references: [users.id]
	}),
	watchparty: one(watchparties, {
		fields: [messages.watchpartyId],
		references: [watchparties.id]
	}),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id]
	}),
	content: one(content, {
		fields: [ratings.contentId],
		references: [content.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one, many}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
	content: one(content, {
		fields: [reviews.contentId],
		references: [content.id]
	}),
	review: one(reviews, {
		fields: [reviews.parentReviewId],
		references: [reviews.id],
		relationName: "reviews_parentReviewId_reviews_id"
	}),
	reviews: many(reviews, {
		relationName: "reviews_parentReviewId_reviews_id"
	}),
	reviewLikes: many(reviewLikes),
}));

export const userWatchlistRelations = relations(userWatchlist, ({one}) => ({
	user: one(users, {
		fields: [userWatchlist.userId],
		references: [users.id]
	}),
	content: one(content, {
		fields: [userWatchlist.contentId],
		references: [content.id]
	}),
}));

export const listsRelations = relations(lists, ({one, many}) => ({
	user: one(users, {
		fields: [lists.userId],
		references: [users.id]
	}),
	listItems: many(listItems),
	listLikes: many(listLikes),
}));

export const listItemsRelations = relations(listItems, ({one}) => ({
	list: one(lists, {
		fields: [listItems.listId],
		references: [lists.id]
	}),
	content: one(content, {
		fields: [listItems.contentId],
		references: [content.id]
	}),
}));

export const watchpartyParticipantsRelations = relations(watchpartyParticipants, ({one}) => ({
	watchparty: one(watchparties, {
		fields: [watchpartyParticipants.watchpartyId],
		references: [watchparties.id]
	}),
	user: one(users, {
		fields: [watchpartyParticipants.userId],
		references: [users.id]
	}),
}));

export const watchpartyInvitationsRelations = relations(watchpartyInvitations, ({one}) => ({
	watchparty: one(watchparties, {
		fields: [watchpartyInvitations.watchpartyId],
		references: [watchparties.id]
	}),
	user_inviterId: one(users, {
		fields: [watchpartyInvitations.inviterId],
		references: [users.id],
		relationName: "watchpartyInvitations_inviterId_users_id"
	}),
	user_inviteeId: one(users, {
		fields: [watchpartyInvitations.inviteeId],
		references: [users.id],
		relationName: "watchpartyInvitations_inviteeId_users_id"
	}),
}));

export const userActivityLogsRelations = relations(userActivityLogs, ({one}) => ({
	user: one(users, {
		fields: [userActivityLogs.userId],
		references: [users.id]
	}),
	content: one(content, {
		fields: [userActivityLogs.contentId],
		references: [content.id]
	}),
	watchparty: one(watchparties, {
		fields: [userActivityLogs.watchpartyId],
		references: [watchparties.id]
	}),
}));

export const userStatsRelations = relations(userStats, ({one}) => ({
	user: one(users, {
		fields: [userStats.userId],
		references: [users.id]
	}),
	category: one(categories, {
		fields: [userStats.favoriteGenreId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	userStats: many(userStats),
	contentCategories: many(contentCategories),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user_userId: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: "notifications_userId_users_id"
	}),
	user_relatedUserId: one(users, {
		fields: [notifications.relatedUserId],
		references: [users.id],
		relationName: "notifications_relatedUserId_users_id"
	}),
	content: one(content, {
		fields: [notifications.relatedContentId],
		references: [content.id]
	}),
	watchparty: one(watchparties, {
		fields: [notifications.relatedWatchpartyId],
		references: [watchparties.id]
	}),
}));

export const contentCategoriesRelations = relations(contentCategories, ({one}) => ({
	content: one(content, {
		fields: [contentCategories.contentId],
		references: [content.id]
	}),
	category: one(categories, {
		fields: [contentCategories.categoryId],
		references: [categories.id]
	}),
}));

export const reviewLikesRelations = relations(reviewLikes, ({one}) => ({
	user: one(users, {
		fields: [reviewLikes.userId],
		references: [users.id]
	}),
	review: one(reviews, {
		fields: [reviewLikes.reviewId],
		references: [reviews.id]
	}),
}));

export const listLikesRelations = relations(listLikes, ({one}) => ({
	user: one(users, {
		fields: [listLikes.userId],
		references: [users.id]
	}),
	list: one(lists, {
		fields: [listLikes.listId],
		references: [lists.id]
	}),
}));

export const peopleLikesRelations = relations(peopleLikes, ({one}) => ({
	user: one(users, {
		fields: [peopleLikes.userId],
		references: [users.id]
	}),
	person: one(people, {
		fields: [peopleLikes.personId],
		references: [people.id]
	}),
}));
