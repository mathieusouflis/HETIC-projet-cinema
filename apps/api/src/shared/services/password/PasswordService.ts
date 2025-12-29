import bcrypt from "bcrypt";
import type { IPasswordService } from "./IPasswordService.js";

/**
 * Password hashing service implementation using bcrypt
 *
 * @example
 * ```ts
 * const passwordService = new PasswordService();
 * const hash = await passwordService.hash('myPassword123');
 * const isValid = await passwordService.compare('myPassword123', hash);
 * ```
 */
export class PasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash a plain text password using bcrypt
   * @param password - Plain text password to hash
   * @returns Promise resolving to the bcrypt hash
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain text password with a bcrypt hash
   * @param password - Plain text password to verify
   * @param hash - Bcrypt hash to compare against
   * @returns Promise resolving to true if passwords match, false otherwise
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
