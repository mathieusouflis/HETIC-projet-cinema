export type ConversationType = "direct";

export interface ConversationRow {
  id: string;
  type: string;
  name: string | null;
  avatarUrl: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ParticipantRow {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string | null;
  lastReadAt: string | null;
  role: string | null;
}

export class Conversation {
  public readonly id: string;
  public readonly type: ConversationType;
  public readonly name: string | null;
  public readonly avatarUrl: string | null;
  public readonly createdBy: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(row: ConversationRow) {
    this.id = row.id;
    this.type = row.type as ConversationType;
    this.name = row.name ?? null;
    this.avatarUrl = row.avatarUrl ?? null;
    this.createdBy = row.createdBy ?? null;
    this.createdAt = row.createdAt ? new Date(row.createdAt) : new Date();
    this.updatedAt = row.updatedAt ? new Date(row.updatedAt) : new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      avatarUrl: this.avatarUrl,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
