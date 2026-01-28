import { NotFoundError } from "../../../../shared/errors";
import type { Watchlist } from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";

export class GetWatchlistByContentIdUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {
    this.watchlistRepository = watchlistRepository;
  }

  async execute(userId: string, id: string): Promise<Watchlist | null> {
    const watchlist = await this.watchlistRepository.findByContentId(
      userId,
      id
    );

    if (!watchlist) {
      throw new NotFoundError(`Content ${id} not found in watchlist.`);
    }

    return watchlist;
  }
}
