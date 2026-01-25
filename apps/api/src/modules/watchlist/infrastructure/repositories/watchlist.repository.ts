import { eq } from "drizzle-orm";
import { db } from "../../../../database";
import { watchlist } from "../../../../database/schema";
import { ServerError } from "../../../../shared/errors/ServerError";
import { CreateWatchlistProps, UpdateWatchlistProps, Watchlist } from "../../domain/entities/watchlist.entity";
import { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import { NotFoundError } from "../../../../shared/errors";

export class WatchlistRepository implements IWatchlistRepository {

  async create(watchlistContent: CreateWatchlistProps): Promise<Watchlist> {
    try {
      const createdContent = await db.insert(watchlist).values(watchlistContent).returning();

      const content = createdContent[0];

      if (!content) {
        throw new ServerError('Failed to create user watchlist');
      }

      return new Watchlist(content);
    } catch (error) {
      throw new ServerError(`Failed to create user watchlist: ${error}`);
    }
  }

  async findById(id: string): Promise<Watchlist | null> {
    try {
      const resolvedContent = await db.select().from(watchlist).where(eq(watchlist.id, id));
      const content = resolvedContent[0]

      if (!content) {
        throw new NotFoundError(`Content with id ${id} not found in personal watchlist.`);
      }

      return content ? new Watchlist(content) : null;
    } catch (error) {
      throw new ServerError(`Failed to create user watchlist: ${error}`)
    }
  }

  async list(userId: string): Promise<Watchlist[]> {
      try {
        const resolvedContent = await db.select().from(watchlist).where(eq(watchlist.userId, userId));
        return resolvedContent.map(content => new Watchlist(content));
      } catch (error) {
        throw new ServerError(`Failed to list user watchlist: ${error}`);
      }
    }

    async update(id: string, watchlistContent: UpdateWatchlistProps): Promise<Watchlist> {
      try {
        const updatedContent = await db.update(watchlist)
          .set(watchlistContent)
          .where(eq(watchlist.id, id))
          .returning();

        const content = updatedContent[0];

        if (!content) {
          throw new NotFoundError(`Watchlist item with id ${id} not found.`);
        }

        return new Watchlist(content);
      } catch (error) {
        throw new ServerError(`Failed to update user watchlist: ${error}`);
      }
    }

    async delete(id: string): Promise<void> {
      try {
        const deletedCount = await db.delete(watchlist)
          .where(eq(watchlist.id, id))
          .returning();

        if (deletedCount.length === 0) {
          throw new NotFoundError(`Watchlist item with id ${id} not found.`);
        }
      } catch (error) {
        throw new ServerError(`Failed to delete user watchlist: ${error}`);
      }
    }
}
