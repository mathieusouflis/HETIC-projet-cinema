CREATE TABLE "tmdb_fetch_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "valid_type" CHECK ((type)::text = ANY ((ARRAY['discover'::character varying])::text[]))
);
--> statement-breakpoint
CREATE INDEX "idx_fetch_status_type" ON "tmdb_fetch_status" USING btree ("type" text_ops);