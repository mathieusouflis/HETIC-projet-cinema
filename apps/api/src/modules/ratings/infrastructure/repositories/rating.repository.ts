import { and, avg, count, eq, sql } from "drizzle-orm";
import { db } from "../../../../database";
import { ratings } from "../../../../database/schema";
import { ServerError } from "../../../../shared/errors/server-error";
import { contentSchema } from "../../../contents/infrastructure/database/schemas/contents.schema";
import type { IRatingRepository } from "../../domain/interfaces/IRatingRepository";

export class RatingRepository implements IRatingRepository {
  async upsert(userId: string, contentId: string, rating: number) {
    try {
      const result = await db
        .insert(ratings)
        .values({ userId, contentId, rating: rating.toString() })
        .onConflictDoUpdate({
          target: [ratings.userId, ratings.contentId],
          set: { rating: rating.toString(), updatedAt: sql`now()` },
        })
        .returning();

      const row = result[0];
      if (!row) throw new ServerError("Failed to upsert rating");

      await this.syncContentRating(contentId);

      return {
        id: row.id,
        userId: row.userId,
        contentId: row.contentId,
        rating: Number(row.rating),
        createdAt: row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(`Unexpected error upserting rating: ${error}`);
    }
  }

  async findByUserAndContent(userId: string, contentId: string) {
    const result = await db
      .select({ rating: ratings.rating })
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.contentId, contentId)));

    const row = result[0];
    if (!row) return null;
    return { rating: Number(row.rating) };
  }

  async getAverageForContent(contentId: string) {
    const result = await db
      .select({
        average: avg(ratings.rating),
        count: count(),
      })
      .from(ratings)
      .where(eq(ratings.contentId, contentId));

    const row = result[0];
    if (!row) return { average: null, count: 0 };

    return {
      average: row.average != null ? Number(row.average) : null,
      count: row.count,
    };
  }

  async delete(userId: string, contentId: string) {
    await db
      .delete(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.contentId, contentId)));

    await this.syncContentRating(contentId);
  }

  private async syncContentRating(contentId: string): Promise<void> {
    await db
      .update(contentSchema)
      .set({
        averageRating: sql`COALESCE(
          (SELECT ROUND(AVG(rating::numeric), 2)
           FROM ${ratings}
           WHERE content_id = ${contentId}),
          0
        )`,
        totalRatings: sql`(
          SELECT COUNT(*)
          FROM ${ratings}
          WHERE content_id = ${contentId}
        )`,
      })
      .where(eq(contentSchema.id, contentId));
  }
}
