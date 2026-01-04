import jwt from "jsonwebtoken";
import type {
  ITokenService,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from "./ITokenService.js";
import { config } from "@packages/config";

export class JWTService implements ITokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpirySeconds: number;
  private readonly refreshTokenExpirySeconds: number;

  constructor() {
    this.accessTokenSecret = config.env.JWT_SECRET + "_access";
    this.refreshTokenSecret = config.env.JWT_SECRET + "_refresh";
    this.accessTokenExpirySeconds = 15 * 60;
    this.refreshTokenExpirySeconds = 7 * 24 * 60 * 60;
  }

  /**
   * Generate an access token for a user
   *
   * @param payload - User data to encode (userId, email)
   * @returns JWT access token string
   */
  generateAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
    const tokenPayload: AccessTokenPayload = {
      ...payload,
      type: "access",
    };

    return jwt.sign(tokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpirySeconds,
    });
  }

  /**
   * Generate a refresh token for a user
   *
   * @param payload - User data to encode (userId)
   * @returns JWT refresh token string
   */
  generateRefreshToken(payload: Omit<RefreshTokenPayload, "type">): string {
    const tokenPayload: RefreshTokenPayload = {
      ...payload,
      type: "refresh",
    };

    return jwt.sign(tokenPayload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpirySeconds,
    });
  }

  /**
   * Generate both access and refresh tokens
   *
   * @param userId - User ID to encode
   * @param email - User email to encode (only in access token)
   * @returns Object containing both tokens
   */
  generateTokenPair(userId: string, email: string): TokenPair {
    return {
      accessToken: this.generateAccessToken({ userId, email }),
      refreshToken: this.generateRefreshToken({ userId }),
    };
  }

  /**
   * Verify and decode an access token
   *
   * @param token - JWT access token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid, expired, or not an access token
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(
        token,
        this.accessTokenSecret,
      ) as AccessTokenPayload;

      if (payload.type !== "access") {
        throw new Error("Invalid token type");
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid access token");
      }
      throw error;
    }
  }

  /**
   * Verify and decode a refresh token
   *
   * @param token - JWT refresh token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid, expired, or not a refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(
        token,
        this.refreshTokenSecret,
      ) as RefreshTokenPayload;

      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      }
      throw error;
    }
  }
}
