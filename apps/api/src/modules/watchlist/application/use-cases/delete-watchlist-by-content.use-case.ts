import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import type { IRatingRepository } from "../../../ratings/domain/interfaces/IRatingRepository";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";

export class DeleteWatchlistByContentIdUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly ratingRepository: IRatingRepository
  ) {}

  async execute(userId: string, contentId: string): Promise<void> {
    const watchlist = await this.watchlistRepository.findByContentId(
      userId,
      contentId
    );

    if (!watchlist) {
      throw new NotFoundError(`Watchlist with id ${contentId}`);
    }

    if (watchlist.userId !== userId) {
      throw new UnauthorizedError(
        "You are not authorized to delete this watchlist"
      );
    }

    await this.watchlistRepository.delete(watchlist.id);
    await this.ratingRepository.delete(userId, contentId);
  }
}
