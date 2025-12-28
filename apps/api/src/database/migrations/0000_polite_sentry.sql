CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "categories_name_key" UNIQUE("name"),
	CONSTRAINT "categories_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"original_title" varchar(255),
	"slug" varchar(255) NOT NULL,
	"synopsis" text,
	"poster_url" text,
	"backdrop_url" text,
	"trailer_url" text,
	"release_date" date,
	"year" integer,
	"duration_minutes" integer,
	"tmdb_id" integer,
	"imdb_id" varchar(20),
	"average_rating" numeric(3, 2) DEFAULT '0',
	"total_ratings" integer DEFAULT 0,
	"total_views" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "content_slug_key" UNIQUE("slug"),
	CONSTRAINT "content_tmdb_id_key" UNIQUE("tmdb_id"),
	CONSTRAINT "content_imdb_id_key" UNIQUE("imdb_id"),
	CONSTRAINT "valid_type" CHECK ((type)::text = ANY ((ARRAY['movie'::character varying, 'series'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "content_categories" (
	"content_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "content_categories_pkey" PRIMARY KEY("content_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "content_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"character_name" varchar(255),
	"order_index" integer,
	CONSTRAINT "unique_credit" UNIQUE("role","person_id","content_id")
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"last_read_at" timestamp with time zone,
	"role" varchar(20) DEFAULT 'member',
	CONSTRAINT "unique_participant" UNIQUE("user_id","conversation_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"name" varchar(100),
	"avatar_url" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"episode_number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"overview" text,
	"still_url" text,
	"air_date" date,
	"duration_minutes" integer,
	CONSTRAINT "unique_episode" UNIQUE("season_id","episode_number"),
	CONSTRAINT "valid_episode" CHECK (episode_number > 0)
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"friend_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_friendship" UNIQUE("user_id","friend_id"),
	CONSTRAINT "no_self_friend" CHECK (user_id <> friend_id)
);
--> statement-breakpoint
CREATE TABLE "list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"note" text,
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_list_item" UNIQUE("list_id","content_id")
);
--> statement-breakpoint
CREATE TABLE "list_likes" (
	"user_id" uuid NOT NULL,
	"list_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "list_likes_pkey" PRIMARY KEY("user_id","list_id")
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true,
	"cover_image_url" text,
	"likes_count" integer DEFAULT 0,
	"items_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" varchar(20) DEFAULT 'text',
	"watchparty_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"related_user_id" uuid,
	"related_content_id" uuid,
	"related_watchparty_id" uuid,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"bio" text,
	"photo_url" text,
	"birth_date" date,
	"nationality" varchar(100),
	"tmdb_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "people_tmdb_id_key" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "people_likes" (
	"user_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "people_likes_pkey" PRIMARY KEY("user_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_rating" UNIQUE("user_id","content_id"),
	CONSTRAINT "valid_rating" CHECK ((rating >= 1.0) AND (rating <= 5.0))
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"revoked_at" timestamp with time zone,
	"ip_address" "inet",
	"user_agent" text,
	"device_fingerprint" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "review_likes" (
	"user_id" uuid NOT NULL,
	"review_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "review_likes_pkey" PRIMARY KEY("user_id","review_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"is_spoiler" boolean DEFAULT false,
	"parent_review_id" uuid,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid NOT NULL,
	"season_number" integer NOT NULL,
	"name" varchar(255),
	"overview" text,
	"poster_url" text,
	"air_date" date,
	"episode_count" integer DEFAULT 0,
	CONSTRAINT "unique_season" UNIQUE("series_id","season_number"),
	CONSTRAINT "valid_series" CHECK (season_number > 0)
);
--> statement-breakpoint
CREATE TABLE "streaming_platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_url" text,
	"base_url" text,
	"is_supported" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "streaming_platforms_name_key" UNIQUE("name"),
	CONSTRAINT "streaming_platforms_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"content_id" uuid,
	"watchparty_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"total_watch_time_minutes" integer DEFAULT 0,
	"total_movies_watched" integer DEFAULT 0,
	"total_series_watched" integer DEFAULT 0,
	"total_episodes_watched" integer DEFAULT 0,
	"total_watchparties_created" integer DEFAULT 0,
	"total_watchparties_joined" integer DEFAULT 0,
	"total_reviews_written" integer DEFAULT 0,
	"total_lists_created" integer DEFAULT 0,
	"favorite_genre_id" uuid,
	"favorite_decade" integer,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'to_watch' NOT NULL,
	"current_season" integer,
	"current_episode" integer,
	"added_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "unique_watchlist_entry" UNIQUE("user_id","content_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"avatar_url" text,
	"bio" text,
	"oauth_provider" varchar(50),
	"oauth_id" varchar(255),
	"theme" varchar(20) DEFAULT 'dark',
	"language" varchar(10) DEFAULT 'fr',
	"email_notifications" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "oauth_or_email" CHECK (((oauth_provider IS NOT NULL) AND (oauth_id IS NOT NULL)) OR ((email IS NOT NULL) AND (password_hash IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "watchparties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"season_id" uuid,
	"episode_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"max_participants" integer,
	"platform_id" uuid NOT NULL,
	"platform_url" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'scheduled',
	"current_position_timestamp" integer DEFAULT 0,
	"is_playing" boolean DEFAULT false,
	"leader_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "watchparty_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"watchparty_id" uuid NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_id" uuid,
	"invite_token" varchar(255),
	"expires_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "watchparty_invitations_invite_token_key" UNIQUE("invite_token"),
	CONSTRAINT "unique_invitation" UNIQUE("watchparty_id","invitee_id")
);
--> statement-breakpoint
CREATE TABLE "watchparty_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"watchparty_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'invited',
	"joined_at" timestamp with time zone,
	"left_at" timestamp with time zone,
	"total_watch_time_seconds" integer DEFAULT 0,
	CONSTRAINT "unique_watchparty_participant" UNIQUE("watchparty_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_credits" ADD CONSTRAINT "content_credits_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_credits" ADD CONSTRAINT "content_credits_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_watchparty_id_fkey" FOREIGN KEY ("watchparty_id") REFERENCES "public"."watchparties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_content_id_fkey" FOREIGN KEY ("related_content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_watchparty_id_fkey" FOREIGN KEY ("related_watchparty_id") REFERENCES "public"."watchparties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_likes" ADD CONSTRAINT "people_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_likes" ADD CONSTRAINT "people_likes_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_parent_review_id_fkey" FOREIGN KEY ("parent_review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_watchparty_id_fkey" FOREIGN KEY ("watchparty_id") REFERENCES "public"."watchparties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_favorite_genre_id_fkey" FOREIGN KEY ("favorite_genre_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_watchlist" ADD CONSTRAINT "user_watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_watchlist" ADD CONSTRAINT "user_watchlist_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparties" ADD CONSTRAINT "watchparties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparties" ADD CONSTRAINT "watchparties_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparties" ADD CONSTRAINT "watchparties_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparties" ADD CONSTRAINT "watchparties_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparties" ADD CONSTRAINT "watchparties_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."streaming_platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparties" ADD CONSTRAINT "watchparties_leader_user_id_fkey" FOREIGN KEY ("leader_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparty_invitations" ADD CONSTRAINT "watchparty_invitations_watchparty_id_fkey" FOREIGN KEY ("watchparty_id") REFERENCES "public"."watchparties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparty_invitations" ADD CONSTRAINT "watchparty_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparty_invitations" ADD CONSTRAINT "watchparty_invitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparty_participants" ADD CONSTRAINT "watchparty_participants_watchparty_id_fkey" FOREIGN KEY ("watchparty_id") REFERENCES "public"."watchparties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchparty_participants" ADD CONSTRAINT "watchparty_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_content_rating" ON "content" USING btree ("average_rating" numeric_ops);--> statement-breakpoint
CREATE INDEX "idx_content_slug" ON "content" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_content_tmdb" ON "content" USING btree ("tmdb_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_content_type" ON "content" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_content_year" ON "content" USING btree ("year" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_content_categories_category" ON "content_categories" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_credits_content" ON "content_credits" USING btree ("content_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_credits_person" ON "content_credits" USING btree ("person_id" uuid_ops,"role" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conv_participants_conv" ON "conversation_participants" USING btree ("conversation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conv_participants_user" ON "conversation_participants" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_episodes_season" ON "episodes" USING btree ("season_id" int4_ops,"episode_number" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_friendships_friend" ON "friendships" USING btree ("friend_id" text_ops,"status" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_friendships_user" ON "friendships" USING btree ("user_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_list_items_list" ON "list_items" USING btree ("list_id" int4_ops,"order_index" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lists_public" ON "lists" USING btree ("is_public" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_lists_user" ON "lists" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_watchparty" ON "messages" USING btree ("watchparty_id" uuid_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id" timestamptz_ops,"is_read" uuid_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_people_name" ON "people" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_people_tmdb" ON "people" USING btree ("tmdb_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_ratings_content" ON "ratings" USING btree ("content_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_ratings_user" ON "ratings" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_expires" ON "refresh_tokens" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_hash" ON "refresh_tokens" USING btree ("token_hash" text_ops);--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_content" ON "reviews" USING btree ("content_id" uuid_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_parent" ON "reviews" USING btree ("parent_review_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_user" ON "reviews" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_seasons_series" ON "seasons" USING btree ("series_id" int4_ops,"season_number" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_activity_content" ON "user_activity_logs" USING btree ("content_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_activity_type" ON "user_activity_logs" USING btree ("event_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_activity_user" ON "user_activity_logs" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_watchlist_content" ON "user_watchlist" USING btree ("content_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchlist_user" ON "user_watchlist" USING btree ("user_id" uuid_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_oauth" ON "users" USING btree ("oauth_provider" text_ops,"oauth_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_content" ON "watchparties" USING btree ("content_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_content_related" ON "watchparties" USING btree ("content_id" uuid_ops,"season_id" uuid_ops,"episode_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_creator" ON "watchparties" USING btree ("created_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_episode" ON "watchparties" USING btree ("episode_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_scheduled" ON "watchparties" USING btree ("scheduled_at" text_ops,"status" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_season" ON "watchparties" USING btree ("season_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparties_status" ON "watchparties" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_invitations_invitee" ON "watchparty_invitations" USING btree ("invitee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invitations_token" ON "watchparty_invitations" USING btree ("invite_token" text_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparty_participants_party" ON "watchparty_participants" USING btree ("watchparty_id" uuid_ops,"status" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_watchparty_participants_user" ON "watchparty_participants" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE VIEW "public"."popular_content" AS (SELECT id, type, title, original_title, slug, synopsis, poster_url, backdrop_url, trailer_url, release_date, year, duration_minutes, tmdb_id, imdb_id, average_rating, total_ratings, total_views, created_at, updated_at, COALESCE(total_ratings::numeric * average_rating, 0::numeric) AS popularity_score FROM content c ORDER BY (COALESCE(total_ratings::numeric * average_rating, 0::numeric)) DESC);--> statement-breakpoint
CREATE VIEW "public"."upcoming_watchparties" AS (SELECT wp.id, wp.created_by, wp.content_id, wp.season_id, wp.episode_id, wp.name, wp.description, wp.is_public, wp.max_participants, wp.platform_id, wp.platform_url, wp.scheduled_at, wp.started_at, wp.ended_at, wp.status, wp.current_position_timestamp, wp.is_playing, wp.leader_user_id, wp.created_at, wp.updated_at, u.username AS creator_username, c.title AS content_title, sp.name AS platform_name, count(wpp.id) AS participant_count FROM watchparties wp JOIN users u ON wp.created_by = u.id JOIN content c ON wp.content_id = c.id JOIN streaming_platforms sp ON wp.platform_id = sp.id LEFT JOIN watchparty_participants wpp ON wp.id = wpp.watchparty_id AND wpp.status::text = 'confirmed'::text WHERE wp.status::text = 'scheduled'::text AND wp.scheduled_at > now() GROUP BY wp.id, u.username, c.title, sp.name);