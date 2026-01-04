import type {
  NewUserRow,
  UserRow,
} from "../../infrastructure/database/schemas/users.schema.js";

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly username: string;
  public readonly passwordHash: string | null;
  public readonly displayName: string | null;
  public readonly avatarUrl: string | null;
  public readonly bio: string | null;
  public readonly oauthProvider: string | null;
  public readonly oauthId: string | null;
  public readonly theme: string | null;
  public readonly language: string | null;
  public readonly emailNotifications: boolean | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly lastLoginAt: Date | null;

  constructor(props: UserRow) {
    this.id = props.id;
    this.email = props.email;
    this.username = props.username;
    this.passwordHash = props.passwordHash ?? null;
    this.displayName = props.displayName ?? null;
    this.avatarUrl = props.avatarUrl ?? null;
    this.bio = props.bio ?? null;
    this.oauthProvider = props.oauthProvider ?? null;
    this.oauthId = props.oauthId ?? null;
    this.theme = props.theme ?? null;
    this.language = props.language ?? null;
    this.emailNotifications = props.emailNotifications ?? null;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
    this.lastLoginAt = props.lastLoginAt ? new Date(props.lastLoginAt) : null;
  }

  /**
   * Check if the user registered via OAuth
   * @returns true if user used OAuth for registration
   */
  public isOAuthUser(): boolean {
    return this.oauthProvider !== null && this.oauthId !== null;
  }

  /**
   * Check if the user has a custom avatar
   * @returns true if user has set an avatar
   */
  public hasAvatar(): boolean {
    return this.avatarUrl !== null && this.avatarUrl.length > 0;
  }

  /**
   * Get the display name for the user
   * @returns displayName if set, otherwise username
   */
  public getDisplayName(): string {
    return this.displayName ?? this.username;
  }

  /**
   * Check if the account is old enough to perform certain actions
   * Some features may require accounts to be at least N days old
   *
   * @param days - Minimum account age in days
   * @returns true if account is old enough
   */
  public isAccountOlderThan(days: number): boolean {
    const milliseconds = days * 24 * 60 * 60 * 1000;
    const threshold = new Date(Date.now() - milliseconds);
    return this.createdAt < threshold;
  }

  /**
   * Validate an email format
   *
   * @param email - Email to validate
   * @returns true if email format is valid
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate username format
   *
   * @param username - Username to validate
   * @returns true if username format is valid
   */
  public static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  /**
   * Convert entity to a plain object (for serialization)
   * Excludes sensitive data like passwordHash
   *
   * @returns Plain object representation without sensitive data
   */
  public toJSON(): Omit<
    User,
    | "passwordHash"
    | "toJSON"
    | "isOAuthUser"
    | "hasAvatar"
    | "getDisplayName"
    | "isAccountOlderThan"
  > & { passwordHash?: never } {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      oauthProvider: this.oauthProvider,
      oauthId: this.oauthId,
      theme: this.theme,
      language: this.language,
      emailNotifications: this.emailNotifications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
    };
  }
}

export type CreateUserProps = NewUserRow;

export type UpdateUserProps = Partial<
  Pick<
    UserRow,
    | "email"
    | "username"
    | "passwordHash"
    | "displayName"
    | "avatarUrl"
    | "bio"
    | "theme"
    | "language"
    | "emailNotifications"
  >
>;
