import type {
  FriendshipRow,
  FriendshipStatus,
} from "../../infrastructure/database/schemas/friendships.schema.js";
import type { NewUserRow } from "../../infrastructure/database/schemas/users.schema.js";

export class Friendship {
  public readonly id: string;
  public readonly userId: string;
  public readonly friendId: string;
  public readonly status: FriendshipStatus | null;
  public readonly createdAt: string | null;
  public readonly updatedAt: string | null;

  constructor(props: FriendshipRow) {
    this.id = props.id;
    this.userId = props.userId;
    this.friendId = props.friendId;
    this.status = props.status as FriendshipStatus | null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public isPending(): boolean {
    return this.status === "pending";
  }

  public isAccepted(): boolean {
    return this.status === "accepted";
  }

  public isRejected(): boolean {
    return this.status === "rejected";
  }

  /**
   * Convert entity to a plain object (for serialization)
   * Excludes sensitive data like passwordHash
   *
   * @returns Plain object representation without sensitive data
   */
  public toJSON(): Omit<
    Friendship,
    "toJSON" | "isPending" | "isAccepted" | "isRejected"
  > {
    return {
      id: this.id,
      userId: this.userId,
      friendId: this.friendId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type CreateUserProps = NewUserRow;

export type UpdateUserProps = Partial<
  Pick<FriendshipRow, "userId" | "friendId" | "status">
>;
