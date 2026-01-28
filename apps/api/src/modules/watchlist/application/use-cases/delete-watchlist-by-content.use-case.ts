import { NotFoundError } from "../../../../shared/errors";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";

export class DeleteWatchlistByContentIdUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    const watchlist = await this.watchlistRepository.findByContentId(
      userId,
      id
    );

    if (!watchlist) {
      throw new NotFoundError(`Watchlist with id ${id}`);
    }

    const updatedWatchlist = await this.watchlistRepository.delete(id);

    return updatedWatchlist;
  }
}
