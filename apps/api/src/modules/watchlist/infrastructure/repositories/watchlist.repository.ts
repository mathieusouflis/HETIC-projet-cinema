import { and, count, eq } from "drizzle-orm";
import { db } from "../../../../database";
import { watchlist } from "../../../../database/schema";
import { NotFoundError } from "../../../../shared/errors";
import { ServerError } from "../../../../shared/errors/server-error";
import {
  type CreateWatchlistProps,
  type UpdateWatchlistProps,
  Watchlist,
} from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";

export class WatchlistRepository implements IWatchlistRepository {
  async create(watchlistContent: CreateWatchlistProps): Promise<Watchlist> {
    try {
      const createdContent = await db
        .insert(watchlist)
        .values(watchlistContent)
        .returning();

      const content = createdContent[0];

      if (!content) {
        throw new ServerError("Failed to create user watchlist");
      }

      return new Watchlist(content);
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }
      throw new ServerError(`Unexpected error creating watchlist: ${error}`);
    }
  }

  async findById(id: string): Promise<Watchlist | null> {
    try {
      const resolvedContent = await db
        .select()
        .from(watchlist)
        .where(eq(watchlist.id, id));
      const content = resolvedContent[0];

      if (!content) {
        throw new NotFoundError(`Personal watchlist with id ${id}`);
      }

      return content ? new Watchlist(content) : null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(
        `Unexpected error resolving watchlist ${id}: ${error}`
      );
    }
  }

  async findByContentId(
    userId: string,
    contentId: string
  ): Promise<Watchlist | null> {
    try {
      const resolvedContent = await db
        .select()
        .from(watchlist)
        .where(
          and(eq(watchlist.userId, userId), eq(watchlist.contentId, contentId))
        );
      const content = resolvedContent[0];

      if (!content) {
        throw new NotFoundError(
          `Content with id ${contentId} not found in personal watchlist.`
        );
      }

      return content ? new Watchlist(content) : null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof ServerError) {
        throw error;
      }
      throw new ServerError(
        `Unexpected error resolving watchlist with content ${contentId}: ${error}`
      );
    }
  }

  async list(userId: string): Promise<{
    data: Watchlist[];
    total: number;
  }> {
    try {
      const [resolvedContent, totalResult] = await Promise.all([
        db.select().from(watchlist).where(eq(watchlist.userId, userId)),
        db
          .select({
            total: count(),
          })
          .from(watchlist)
          .where(eq(watchlist.userId, userId)),
      ]);

      const total = totalResult[0]?.total ?? 0;

      return {
        data: resolvedContent.map((content) => new Watchlist(content)),
        total,
      };
    } catch (error) {
      throw new ServerError(`Failed to list user watchlist: ${error}`);
    }
  }

  async update(
    id: string,
    watchlistContent: UpdateWatchlistProps
  ): Promise<Watchlist> {
    try {
      const updatedContent = await db
        .update(watchlist)
        .set(watchlistContent)
        .where(eq(watchlist.id, id))
        .returning();

      const content = updatedContent[0];

      if (!content) {
        throw new NotFoundError(`Watchlist item with id ${id}`);
      }

      return new Watchlist(content);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(
        `Unexpected error updating user watchlist: ${error}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deletedCount = await db
        .delete(watchlist)
        .where(eq(watchlist.id, id))
        .returning();

      if (deletedCount.length === 0) {
        throw new NotFoundError(`Watchlist item with id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(
        `Unexpected error deleting user watchlist: ${error}`
      );
    }
  }
}
