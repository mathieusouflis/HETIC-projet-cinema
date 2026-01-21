ALTER TABLE "tmdb_fetch_status" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tmdb_fetch_status" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tmdb_fetch_status" ADD CONSTRAINT "tmdb_fetch_status_path_unique" UNIQUE("path");