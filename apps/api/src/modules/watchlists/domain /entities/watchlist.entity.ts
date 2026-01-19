import type {
  NewWatchlistRow,
  WatchlistRow,
} from "../../infrastructure/database/schemas/watchlists.schema.js";

export class Watchlist {
  public readonly id: string;
  public readonly userId: string;
  public readonly contentId: string;
  public readonly status: string;
  public readonly currentSeason: number | null;
  public readonly currentEpisode: number | null;
  public readonly addedAt: Date;
  public readonly startedAt: Date | null;
  public readonly completedAt: Date | null;

  constructor(props: WatchlistRow) {
    this.id = props.id;
    this.userId = props.userId;
    this.contentId = props.contentId;
    this.status = props.status;
    this.currentSeason = props.currentSeason ?? null;
    this.currentEpisode = props.currentEpisode ?? null;
    this.addedAt = props.addedAt ? new Date(props.addedAt) : new Date();
    this.startedAt = props.startedAt ? new Date(props.startedAt) : null;
    this.completedAt = props.completedAt ? new Date(props.completedAt) : null;
  }

  /**
   * Check if the content is currently being watched
   * @returns true if status is "watching"
   */
  public isWatching(): boolean {
    return this.status === "watching";
  }

  /**
   * Check if the content has been completed
   * @returns true if status is "completed"
   */
  public isCompleted(): boolean {
    return this.status === "completed";
  }

  /**
   * Check if the content is marked as dropped
   * @returns true if status is "dropped"
   */
  public isDropped(): boolean {
    return this.status === "dropped";
  }

  /**
   * Check if the content is waiting to be watched
   * @returns true if status is "to_watch"
   */
  public isToWatch(): boolean {
    return this.status === "to_watch";
  }

  /**
   * Check if the watchlist entry has started
   * @returns true if startedAt is set
   */
  public hasStarted(): boolean {
    return this.startedAt !== null;
  }

  /**
   * Get progress information for series/shows
   * @returns object with season and episode info, or null if not applicable
   */
  public getProgress(): { season: number | null; episode: number | null } | null {
    if (this.currentSeason === null && this.currentEpisode === null) {
      return null;
    }
    return {
      season: this.currentSeason,
      episode: this.currentEpisode,
    };
  }

  /**
   * Check if progress has been tracked
   * @returns true if either season or episode is set
   */
  public hasProgress(): boolean {
    return this.currentSeason !== null || this.currentEpisode !== null;
  }

  /**
   * Convert entity to a plain object (for serialization)
   *
   * @returns Plain object representation
   */
  public toJSON(): Omit<Watchlist, "toJSON" | "isWatching" | "isCompleted" | "isDropped" | "isToWatch" | "hasStarted" | "getProgress" | "hasProgress"> {
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

export type CreateWatchlistProps = NewWatchlistRow;

export type UpdateWatchlistProps = Partial<
  Pick<
    WatchlistRow,
    | "status"
    | "currentSeason"
    | "currentEpisode"
    | "startedAt"
    | "completedAt"
  >
>;
