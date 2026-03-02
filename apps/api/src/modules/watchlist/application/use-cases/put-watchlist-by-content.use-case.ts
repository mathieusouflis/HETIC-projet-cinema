import { NotFoundError } from "../../../../shared/errors";
import type { Watchlist } from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import type { PatchWatchlistBody } from "../dto/request/patch-watchlist.body.validator";

export class PutWatchlistByContentIdUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {}

  async execute(
    userId: string,
    id: string,
    body: PatchWatchlistBody
  ): Promise<Watchlist> {
    const normalizedBody = {
      ...body,
      completedAt: body.completedAt?.toISOString() ?? undefined,
      startedAt: body.startedAt?.toISOString() ?? undefined,
    };

    try {
      const existing = await this.watchlistRepository.findByContentId(
        userId,
        id
      );

      if (!existing) {
        throw new NotFoundError("Existing watchlist content not found");
      }

      return await this.watchlistRepository.update(existing.id, normalizedBody);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return await this.watchlistRepository.create({
          userId,
          contentId: id,
          ...normalizedBody,
        });
      }
      throw error;
    }
  }
}
