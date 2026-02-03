CREATE TABLE "content_platforms" (
	"content_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"key" text NOT NULL,
	CONSTRAINT "content_platforms_pkey" PRIMARY KEY("content_id","platform_id")
);
--> statement-breakpoint
ALTER TABLE "content_platforms" ADD CONSTRAINT "content_platforms_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_platforms" ADD CONSTRAINT "content_platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."streaming_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_content_platforms_platform" ON "content_platforms" USING btree ("platform_id");