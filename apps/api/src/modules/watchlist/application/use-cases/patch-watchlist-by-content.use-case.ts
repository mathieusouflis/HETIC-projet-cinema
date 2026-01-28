import { NotFoundError } from "../../../../shared/errors";
import type { Watchlist } from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import type { PatchWatchlistBody } from "../dto/request/patch-watchlist.body.validator";

export class PatchWatchlistByContentIdUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {}

  async execute(
    userId: string,
    id: string,
    body: PatchWatchlistBody
  ): Promise<Watchlist> {
    const watchlist = await this.watchlistRepository.findByContentId(
      userId,
      id
    );

    if (!watchlist) {
      throw new NotFoundError(`Watchlist with id ${id}`);
    }

    const updatedWatchlist = await this.watchlistRepository.update(id, {
      ...body,
      completedAt: body.completedAt?.toISOString() ?? undefined,
      startedAt: body.startedAt?.toISOString() ?? undefined,
    });

    return updatedWatchlist;
  }
}
