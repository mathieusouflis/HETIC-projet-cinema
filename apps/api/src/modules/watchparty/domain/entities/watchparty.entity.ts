import type {
  WatchpartyRow,
  NewWatchpartyRow,
} from "../../infrastructure/schemas/watchparty.schema.js";

export type WatchpartyStatus = "scheduled" | "active" | "ended" | "cancelled";

/**
 * Represents a watchparty session for watching content together.
 */
export class Watchparty {
  public readonly id: string;
  public readonly createdBy: string;
  public readonly contentId: string;
  public readonly seasonId: string | null;
  public readonly episodeId: string | null;
  public readonly name: string;
  public readonly description: string | null;
  public readonly isPublic: boolean;
  public readonly maxParticipants: number | null;
  public readonly platformId: string | null;
  public readonly platformUrl: string | null;
  public readonly scheduledAt: Date | null;
  public readonly startedAt: Date | null;
  public readonly endedAt: Date | null;
  public readonly status: WatchpartyStatus;
  public readonly currentPositionTimestamp: number | null;
  public readonly isPlaying: boolean;
  public readonly leaderUserId: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WatchpartyRow) {
    this.id = props.id;
    this.createdBy = props.createdBy;
    this.contentId = props.contentId;
    this.seasonId = props.seasonId ?? null;
    this.episodeId = props.episodeId ?? null;
    this.name = props.name;
    this.description = props.description ?? null;
    this.isPublic = props.isPublic ?? false;
    this.maxParticipants = props.maxParticipants ?? null;
    this.platformId = props.platformId ?? null;
    this.platformUrl = props.platformUrl ?? null;
    this.scheduledAt = props.scheduledAt ? new Date(props.scheduledAt) : null;
    this.startedAt = props.startedAt ? new Date(props.startedAt) : null;
    this.endedAt = props.endedAt ? new Date(props.endedAt) : null;
    this.status = (props.status as WatchpartyStatus) ?? "scheduled";
    this.currentPositionTimestamp = props.currentPositionTimestamp ?? null;
    this.isPlaying = props.isPlaying ?? false;
    this.leaderUserId = props.leaderUserId ?? null;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
  }

  /**
   * Check whether this watchparty is scheduled for the future.
   */
  public isScheduled(): boolean {
    return this.status === "scheduled";
  }

  /**
   * Check whether this watchparty is currently active.
   */
  public isActive(): boolean {
    return this.status === "active";
  }

  /**
   * Check whether this watchparty has ended.
   */
  public hasEnded(): boolean {
    return this.status === "ended";
  }

  /**
   * Check whether this watchparty has been cancelled.
   */
  public isCancelled(): boolean {
    return this.status === "cancelled";
  }

  /**
   * Check whether the watchparty has started.
   */
  public hasStarted(): boolean {
    return this.startedAt !== null;
  }

  /**
   * Check if a user is the creator of the watchparty.
   */
  public isCreator(userId: string): boolean {
    return this.createdBy === userId;
  }

  /**
   * Check if a user is the current leader of the watchparty.
   */
  public isLeader(userId: string): boolean {
    return this.leaderUserId === userId;
  }

  /**
   * Check if the watchparty is full (if max participants is set).
   */
  public isFull(currentParticipants: number): boolean {
    if (this.maxParticipants === null) {
      return false;
    }
    return currentParticipants >= this.maxParticipants;
  }

  /**
   * Convenience method: returns a plain object suitable for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdBy: this.createdBy,
      contentId: this.contentId,
      seasonId: this.seasonId,
      episodeId: this.episodeId,
      name: this.name,
      description: this.description,
      isPublic: this.isPublic,
      maxParticipants: this.maxParticipants,
      platformId: this.platformId,
      platformUrl: this.platformUrl,
      scheduledAt: this.scheduledAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      status: this.status,
      currentPositionTimestamp: this.currentPositionTimestamp,
      isPlaying: this.isPlaying,
      leaderUserId: this.leaderUserId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type CreateWatchpartyProps = NewWatchpartyRow;

export type UpdateWatchpartyProps = {
  name?: WatchpartyRow["name"];
  description?: WatchpartyRow["description"];
  isPublic?: WatchpartyRow["isPublic"];
  maxParticipants?: WatchpartyRow["maxParticipants"];
  platformId?: WatchpartyRow["platformId"];
  platformUrl?: WatchpartyRow["platformUrl"];
  scheduledAt?: WatchpartyRow["scheduledAt"];
  startedAt?: WatchpartyRow["startedAt"];
  endedAt?: WatchpartyRow["endedAt"];
  status?: WatchpartyRow["status"];
  currentPositionTimestamp?: WatchpartyRow["currentPositionTimestamp"];
  isPlaying?: WatchpartyRow["isPlaying"];
  leaderUserId?: WatchpartyRow["leaderUserId"];
};
