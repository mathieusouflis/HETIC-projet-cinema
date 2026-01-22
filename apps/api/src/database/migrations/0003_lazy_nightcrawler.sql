ALTER TABLE "tmdb_fetch_status" DROP CONSTRAINT "valid_type";--> statement-breakpoint
ALTER TABLE "tmdb_fetch_status" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tmdb_fetch_status" ADD CONSTRAINT "remove_expired" CHECK (expires_at > now());--> statement-breakpoint
ALTER TABLE "tmdb_fetch_status" ADD CONSTRAINT "valid_type" CHECK ((type)::text = ANY ((ARRAY['discover'::character varying, 'search'::character varying])::text[]));