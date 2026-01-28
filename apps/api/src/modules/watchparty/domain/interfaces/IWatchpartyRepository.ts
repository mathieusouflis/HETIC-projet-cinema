import type {
  CreateWatchpartyProps,
  UpdateWatchpartyProps,
  Watchparty,
  WatchpartyStatus,
} from "../entities/watchparty.entity";

export interface IWatchpartyRepository {
  create(watchparty: CreateWatchpartyProps): Promise<Watchparty>;
  findById(id: string): Promise<Watchparty | null>;
  findByUserId(userId: string): Promise<Watchparty[]>;
  list(params: {
    status?: WatchpartyStatus;
    isPublic?: boolean;
    contentId?: string;
  }): Promise<Watchparty[]>;
  update(id: string, watchparty: UpdateWatchpartyProps): Promise<Watchparty>;
  delete(id: string): Promise<void>;
}
