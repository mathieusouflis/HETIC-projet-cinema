import { and, eq, or, SQL } from "drizzle-orm";
import { db } from "../../../../database/index.js";
import { watchparties } from "../../../../database/schema.js";
import { ServerError } from "../../../../shared/errors/ServerError.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { CreateWatchpartyProps, UpdateWatchpartyProps, Watchparty, WatchpartyStatus } from "../../domain/entities/watchparty.entity.js";
import { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository.js";

export class WatchpartyRepository implements IWatchpartyRepository {

  async create(watchpartyData: CreateWatchpartyProps): Promise<Watchparty> {
    try {
      const createdWatchparty = await db.insert(watchparties).values(watchpartyData).returning();

      const watchparty = createdWatchparty[0];

      if (!watchparty) {
        throw new ServerError('Failed to create watchparty');
      }

      return new Watchparty(watchparty);

    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }
      throw new ServerError(`Unexpected error creating watchparty: ${error}`);
    }
  }

  async findById(id: string): Promise<Watchparty | null> {
    try {
      const resolvedWatchparty = await db.select().from(watchparties).where(eq(watchparties.id, id));
      const watchparty = resolvedWatchparty[0];

      if (!watchparty) {
        return null;
      }

      return new Watchparty(watchparty);
    } catch (error) {
      throw new ServerError(`Unexpected error resolving watchparty ${id}: ${error}`);
    }
  }

  async findByUserId(userId: string): Promise<Watchparty[]> {
    try {
      const resolvedWatchparties = await db
        .select()
        .from(watchparties)
        .where(
          or(
            eq(watchparties.createdBy, userId),
            eq(watchparties.leaderUserId, userId)
          )
        );

      return resolvedWatchparties.map(watchparty => new Watchparty(watchparty));
    } catch (error) {
      throw new ServerError(`Failed to list user watchparties: ${error}`);
    }
  }

  async list(params: {
    status?: WatchpartyStatus;
    isPublic?: boolean;
    contentId?: string;
  }): Promise<Watchparty[]> {
    try {
      const conditions: SQL[] = [];

      if (params.status) {
        conditions.push(eq(watchparties.status, params.status));
      }

      if (params.isPublic !== undefined) {
        conditions.push(eq(watchparties.isPublic, params.isPublic));
      }

      if (params.contentId) {
        conditions.push(eq(watchparties.contentId, params.contentId));
      }

      const query = conditions.length > 0
        ? db.select().from(watchparties).where(and(...conditions))
        : db.select().from(watchparties);

      const resolvedWatchparties = await query;

      return resolvedWatchparties.map(watchparty => new Watchparty(watchparty));
    } catch (error) {
      throw new ServerError(`Failed to list watchparties: ${error}`);
    }
  }

  async update(id: string, watchpartyData: UpdateWatchpartyProps): Promise<Watchparty> {
    try {
      const updatedWatchparty = await db.update(watchparties)
        .set({
          ...watchpartyData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(watchparties.id, id))
        .returning();

      const watchparty = updatedWatchparty[0];

      if (!watchparty) {
        throw new NotFoundError(`Watchparty with id ${id}`);
      }

      return new Watchparty(watchparty);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(`Unexpected error updating watchparty: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deletedCount = await db.delete(watchparties)
        .where(eq(watchparties.id, id))
        .returning();

      if (deletedCount.length === 0) {
        throw new NotFoundError(`Watchparty with id ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(`Unexpected error deleting watchparty: ${error}`);
    }
  }
}
