CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."friendship_status";--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "status" SET DATA TYPE "public"."friendship_status" USING "status"::"public"."friendship_status";