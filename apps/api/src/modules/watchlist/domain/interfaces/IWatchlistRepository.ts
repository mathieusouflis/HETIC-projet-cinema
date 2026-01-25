import { CreateWatchlistProps, UpdateWatchlistProps, Watchlist, WatchStatus } from "../entities/watchlist.entity";

export interface IWatchlistRepository {
  create(watchlist: CreateWatchlistProps): Promise<Watchlist>;
  findById(id: string): Promise<Watchlist | null>;
  list(userId: string, params: {
    status?: WatchStatus;
  }): Promise<Watchlist[]>;
  update(id: string, watchlist: UpdateWatchlistProps): Promise<Watchlist>;
  delete(id: string): Promise<void>;
}
