ALTER TABLE "user_watchlist" RENAME TO "watchlists";--> statement-breakpoint
ALTER TABLE "watchlists" DROP CONSTRAINT "user_watchlist_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "watchlists" DROP CONSTRAINT "user_watchlist_content_id_fkey";
--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "user_watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "user_watchlist_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;