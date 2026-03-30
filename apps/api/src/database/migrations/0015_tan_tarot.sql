ALTER TABLE "list_items" DROP CONSTRAINT "unique_list_item";--> statement-breakpoint
CREATE INDEX "unique_list_item" ON "list_items" USING btree ("list_id","content_id");