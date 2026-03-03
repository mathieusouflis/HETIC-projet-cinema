export interface MessageRow {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  type: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class Message {
  public readonly id: string;
  public readonly conversationId: string;
  public readonly userId: string;
  public readonly content: string;
  public readonly type: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date | null;
  public readonly deletedAt: Date | null;

  constructor(row: MessageRow) {
    this.id = row.id;
    this.conversationId = row.conversationId;
    this.userId = row.userId;
    this.content = row.content;
    this.type = row.type ?? "text";
    this.createdAt = row.createdAt ? new Date(row.createdAt) : new Date();
    this.updatedAt = row.updatedAt ? new Date(row.updatedAt) : null;
    this.deletedAt = row.deletedAt ? new Date(row.deletedAt) : null;
  }

  public isSoftDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public isAuthor(userId: string): boolean {
    return this.userId === userId;
  }

  public toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      userId: this.userId,
      content: this.isSoftDeleted() ? null : this.content,
      type: this.type,
      isDeleted: this.isSoftDeleted(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
