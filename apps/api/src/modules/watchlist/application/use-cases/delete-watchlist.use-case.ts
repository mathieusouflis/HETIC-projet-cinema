import { NotFoundError, UnauthorizedError } from "../../../../shared/errors";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";

export class DeleteWatchlistByIdUseCase {
  constructor(private readonly watchlistRepository: IWatchlistRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    const watchlist = await this.watchlistRepository.findById(id);

    if (!watchlist) {
      throw new NotFoundError(`Watchlist with id ${id}`);
    }

    if (watchlist.userId !== userId) {
      throw new UnauthorizedError(
        "You are not authorized to delete this watchlist"
      );
    }

    await this.watchlistRepository.delete(id);
  }
}
