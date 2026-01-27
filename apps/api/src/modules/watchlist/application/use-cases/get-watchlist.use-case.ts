import { NotFoundError, UnauthorizedError } from "../../../../shared/errors";
import type { Watchlist } from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";

export class GetWatchlistByIdUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {
    this.watchlistRepository = watchlistRepository;
  }

  async execute(userId: string, id: string): Promise<Watchlist | null> {
    const watchlist = await this.watchlistRepository.findById(id);

    if (!watchlist) {
      throw new NotFoundError(`Watchlist ${id} not found in watchlist.`);
    }

    if (watchlist.userId !== userId) {
      throw new UnauthorizedError(
        "You are not authorized to access this watchlist."
      );
    }

    return watchlist;
  }
}
