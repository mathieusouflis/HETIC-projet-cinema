import type {
  UserWatchlistRow,
  NewUserWatchlistRow,
  watchlistStatusEnum
} from "../../infrastructure/schemas/user-watchlist.schema.js";


export type WatchStatus = (typeof watchlistStatusEnum)["enumValues"][number];

/**
 * Represents a user's watchlist entry for a specific content.
 */
export class UserWatchlist {
  public readonly id: string;
  public readonly userId: string;
  public readonly contentId: string;
  public readonly status: WatchStatus;
  public readonly currentSeason: number | null;
  public readonly currentEpisode: number | null;
  public readonly addedAt: Date;
  public readonly startedAt: Date | null;
  public readonly completedAt: Date | null;

  constructor(props: UserWatchlistRow) {
    this.id = props.id;
    this.userId = props.userId;
    this.contentId = props.contentId;
    this.status = (props.status as WatchStatus) ?? "plan_to_watch";
    this.currentSeason = props.currentSeason ?? null;
    this.currentEpisode = props.currentEpisode ?? null;
    this.addedAt = props.addedAt ? new Date(props.addedAt) : new Date();
    this.startedAt = props.startedAt ? new Date(props.startedAt) : null;
    this.completedAt = props.completedAt ? new Date(props.completedAt) : null;
  }

  /**
   * Check whether this entry is marked as to watch.
   */
  public isToWatch(): boolean {
    return this.status === "plan_to_watch";
  }

  /**
   * Check whether this entry is currently being watched.
   */
  public isWatching(): boolean {
    return this.status === "watching";
  }

  /**
   * Check whether this entry is completed.
   */
  public isCompleted(): boolean {
    return this.status === "completed";
  }

  /**
   * Check whether the entry has some progress (season/episode).
   */
  public hasProgress(): boolean {
    return (
      (this.currentSeason !== null && this.currentSeason > 0) ||
      (this.currentEpisode !== null && this.currentEpisode > 0)
    );
  }

  /**
   * Convenience method: returns a plain object suitable for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      contentId: this.contentId,
      status: this.status,
      currentSeason: this.currentSeason,
      currentEpisode: this.currentEpisode,
      addedAt: this.addedAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}

export type CreateUserWatchlistProps = NewUserWatchlistRow;

export type UpdateUserWatchlistProps = Partial<
  Pick<
    UserWatchlistRow,
    | "status"
    | "currentSeason"
    | "currentEpisode"
    | "startedAt"
    | "completedAt"
  >
>;
