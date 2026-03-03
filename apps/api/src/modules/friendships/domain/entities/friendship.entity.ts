import type {
  FriendshipRow,
  FriendshipStatus,
  NewFriendshipRow,
} from "../../infrastructure/schemas/friendships.schema.js";

export class Friendship {
  public readonly id: string;
  public readonly userId: string;
  public readonly friendId: string;
  public readonly status: FriendshipStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: FriendshipRow) {
    this.id = props.id;
    this.userId = props.userId;
    this.friendId = props.friendId;
    this.status = props.status as FriendshipStatus;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
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

  public isParticipant(userId: string): boolean {
    return this.userId === userId || this.friendId === userId;
  }

  public toJSON(): Omit<
    Friendship,
    "toJSON" | "isPending" | "isAccepted" | "isRejected" | "isParticipant"
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

export type CreateFriendshipProps = NewFriendshipRow;
export type UpdateFriendshipProps = Partial<
  Pick<FriendshipRow, "userId" | "friendId" | "status">
>;
