import { NotFoundError } from "../../../../shared/errors";
import type { IRatingRepository } from "../../../ratings/domain/interfaces/IRatingRepository";
import type { Watchlist } from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import type { PatchWatchlistBody } from "../dto/request/patch-watchlist.body.validator";

export class PutWatchlistByContentIdUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly ratingRepository: IRatingRepository
  ) {}

  async execute(
    userId: string,
    id: string,
    body: PatchWatchlistBody
  ): Promise<Watchlist> {
    const { rating, ...rest } = body;
    const normalizedBody = {
      ...rest,
      completedAt: rest.completedAt?.toISOString() ?? undefined,
      startedAt: rest.startedAt?.toISOString() ?? undefined,
    };

    try {
      const existing = await this.watchlistRepository.findByContentId(
        userId,
        id
      );
      if (!existing) {
        throw new NotFoundError("Existing watchlist content not found");
      }
      await this.watchlistRepository.update(existing.id, normalizedBody);
    } catch (error) {
      if (error instanceof NotFoundError) {
        await this.watchlistRepository.create({
          userId,
          contentId: id,
          ...normalizedBody,
        });
      } else {
        throw error;
      }
    }

    if (rating !== undefined) {
      if (rating === null) {
        await this.ratingRepository.delete(userId, id);
      } else {
        await this.ratingRepository.upsert(userId, id, rating);
      }
    }

    return this.watchlistRepository.findByContentId(
      userId,
      id
    ) as Promise<Watchlist>;
  }
}
