export interface EmailVerificationTokenRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string | null;
}

export class EmailVerificationToken {
  public readonly id: string;
  public readonly userId: string;
  public readonly tokenHash: string;
  public readonly expiresAt: Date;
  public readonly usedAt: Date | null;
  public readonly createdAt: Date;

  constructor(props: EmailVerificationTokenRow) {
    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = new Date(props.expiresAt);
    this.usedAt = props.usedAt ? new Date(props.usedAt) : null;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
  }

  public isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  public isUsed(): boolean {
    return this.usedAt !== null;
  }

  public isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }
}
