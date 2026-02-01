export interface AccessTokenPayload {
  userId: string;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Interface for JWT token service
 */
export interface ITokenService {
  /**
   * Generate an access token for a user
   * @param payload - Data to encode in the token
   * @returns JWT access token string
   */
  generateAccessToken(payload: Omit<AccessTokenPayload, "type">): string;

  /**
   * Generate a refresh token for a user
   * @param payload - Data to encode in the token
   * @returns JWT refresh token string
   */
  generateRefreshToken(payload: Omit<RefreshTokenPayload, "type">): string;

  /**
   * Generate both access and refresh tokens
   * @param userId - User ID to encode
   * @param email - User email to encode
   * @returns Object containing both tokens
   */
  generateTokenPair(userId: string, email: string): TokenPair;

  /**
   * Verify and decode an access token
   * @param token - JWT access token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyAccessToken(token: string): AccessTokenPayload;

  /**
   * Verify and decode a refresh token
   * @param token - JWT refresh token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyRefreshToken(token: string): RefreshTokenPayload;
}
