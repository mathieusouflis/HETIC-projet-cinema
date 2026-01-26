import { NotFoundError } from "../../../../shared/errors";
import { Watchlist } from "../../domain/entities/watchlist.entity";
import { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
export class GetWatchlistContentUseCase {

  constructor(private readonly watchlistRepository: IWatchlistRepository) {
    this.watchlistRepository = watchlistRepository;
  }

  async execute(id: string): Promise<Watchlist | null> {
    const watchlist = await this.watchlistRepository.findById(id);

    if (!watchlist) {
      throw new NotFoundError(`Content ${id} not found in watchlist.`);
    }

    return watchlist;
  }
}
