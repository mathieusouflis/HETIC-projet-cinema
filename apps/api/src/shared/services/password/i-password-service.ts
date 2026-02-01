export interface IPasswordService {
  /**
   * Hash a plain text password
   * @param password - Plain text password to hash
   * @returns Promise resolving to the hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hash
   * @param password - Plain text password to verify
   * @param hash - Hashed password to compare against
   * @returns Promise resolving to true if passwords match, false otherwise
   */
  compare(password: string, hash: string): Promise<boolean>;
}
