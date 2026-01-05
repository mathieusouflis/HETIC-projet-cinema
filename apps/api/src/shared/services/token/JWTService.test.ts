import { describe, it, expect } from "vitest";
import { JWTService } from "./JWTService";
import { AccessTokenPayload, RefreshTokenPayload } from "./ITokenService";
import jwt from "jsonwebtoken";
import { config } from "@packages/config";

describe("JWT service test", () => {
  const jwtService = new JWTService();
  const ACCESS_TOKEN_PAYLOAD: Omit<AccessTokenPayload, "type"> = {
    userId: "1",
    email: "test@example.com",
  };
  const REFRESH_TOKEN_PAYLOAD: Omit<RefreshTokenPayload, "type"> = {
    userId: "1",
  };

  describe("generateAccessToken", () => {
    it("should generate an access token", () => {
      const token = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should include correct payload in access token", () => {
      const token = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      const decoded = jwt.decode(token) as AccessTokenPayload;

      expect(decoded.userId).toBe(ACCESS_TOKEN_PAYLOAD.userId);
      expect(decoded.email).toBe(ACCESS_TOKEN_PAYLOAD.email);
      expect(decoded.type).toBe("access");
    });

    it("should set expiration time in access token", () => {
      const token = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      const decoded = jwt.decode(token) as AccessTokenPayload & {
        exp: number;
        iat: number;
      };

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it("should generate different tokens for different users", () => {
      const token1 = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      const token2 = jwtService.generateAccessToken({
        userId: "2",
        email: "other@example.com",
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token", () => {
      const token = jwtService.generateRefreshToken(REFRESH_TOKEN_PAYLOAD);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should include correct payload in refresh token", () => {
      const token = jwtService.generateRefreshToken(REFRESH_TOKEN_PAYLOAD);
      const decoded = jwt.decode(token) as RefreshTokenPayload;

      expect(decoded.userId).toBe(REFRESH_TOKEN_PAYLOAD.userId);
      expect(decoded.type).toBe("refresh");
      expect(decoded).not.toHaveProperty("email");
    });

    it("should set expiration time in refresh token", () => {
      const token = jwtService.generateRefreshToken(REFRESH_TOKEN_PAYLOAD);
      const decoded = jwt.decode(token) as RefreshTokenPayload & {
        exp: number;
        iat: number;
      };

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it("should generate different tokens for different users", () => {
      const token1 = jwtService.generateRefreshToken(REFRESH_TOKEN_PAYLOAD);
      const token2 = jwtService.generateRefreshToken({ userId: "2" });

      expect(token1).not.toBe(token2);
    });
  });

  describe("generateTokenPair", () => {
    it("should generate a pair of tokens", () => {
      const token = jwtService.generateTokenPair(
        ACCESS_TOKEN_PAYLOAD.userId,
        ACCESS_TOKEN_PAYLOAD.email,
      );
      expect(token.accessToken).toBeDefined();
      expect(token.refreshToken).toBeDefined();
      expect(typeof token.accessToken).toBe("string");
      expect(typeof token.refreshToken).toBe("string");
    });

    it("should generate valid access and refresh tokens", () => {
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        ACCESS_TOKEN_PAYLOAD.userId,
        ACCESS_TOKEN_PAYLOAD.email,
      );

      const accessDecoded = jwt.decode(accessToken) as AccessTokenPayload;
      const refreshDecoded = jwt.decode(refreshToken) as RefreshTokenPayload;

      expect(accessDecoded.type).toBe("access");
      expect(refreshDecoded.type).toBe("refresh");
      expect(accessDecoded.userId).toBe(ACCESS_TOKEN_PAYLOAD.userId);
      expect(refreshDecoded.userId).toBe(ACCESS_TOKEN_PAYLOAD.userId);
    });

    it("should include email only in access token", () => {
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        ACCESS_TOKEN_PAYLOAD.userId,
        ACCESS_TOKEN_PAYLOAD.email,
      );

      const accessDecoded = jwt.decode(accessToken) as AccessTokenPayload;
      const refreshDecoded = jwt.decode(refreshToken) as RefreshTokenPayload;

      expect(accessDecoded.email).toBe(ACCESS_TOKEN_PAYLOAD.email);
      expect(refreshDecoded).not.toHaveProperty("email");
    });

    it("should generate tokens with different expiration times", () => {
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        ACCESS_TOKEN_PAYLOAD.userId,
        ACCESS_TOKEN_PAYLOAD.email,
      );

      const accessDecoded = jwt.decode(accessToken) as AccessTokenPayload & {
        exp: number;
        iat: number;
      };
      const refreshDecoded = jwt.decode(refreshToken) as RefreshTokenPayload & {
        exp: number;
        iat: number;
      };

      const accessExpiry = accessDecoded.exp - accessDecoded.iat;
      const refreshExpiry = refreshDecoded.exp - refreshDecoded.iat;

      expect(refreshExpiry).toBeGreaterThan(accessExpiry);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", () => {
      const token = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      const decoded = jwtService.verifyAccessToken(token);

      expect(decoded.email).toEqual(ACCESS_TOKEN_PAYLOAD.email);
      expect(decoded.userId).toEqual(ACCESS_TOKEN_PAYLOAD.userId);
      expect(decoded.type).toEqual("access");
    });

    it("should throw error for invalid access token", () => {
      expect(() => {
        jwtService.verifyAccessToken("asdasd");
      }).toThrowError("Invalid access token");
    });

    it("should throw error for token with invalid signature", () => {
      expect(() => {
        jwtService.verifyAccessToken(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
        );
      }).toThrowError("Invalid access token");
    });

    it("should throw error when using refresh token for access verification", () => {
      const refreshToken = jwtService.generateRefreshToken(
        REFRESH_TOKEN_PAYLOAD,
      );
      expect(() => {
        jwtService.verifyAccessToken(refreshToken);
      }).toThrowError("Invalid access token");
    });

    it("should throw error for expired access token", () => {
      const expiredToken = jwt.sign(
        { userId: "1", email: "test@example.com", type: "access" },
        config.env.JWT_SECRET + "_access",
        { expiresIn: "0s" },
      );

      setTimeout(() => {
        expect(() => {
          jwtService.verifyAccessToken(expiredToken);
        }).toThrowError("Access token expired");
      }, 100);
    });

    it("should throw error for malformed token", () => {
      expect(() => {
        jwtService.verifyAccessToken("not.a.valid.jwt.token");
      }).toThrowError("Invalid access token");
    });

    it("should throw error for empty token", () => {
      expect(() => {
        jwtService.verifyAccessToken("");
      }).toThrowError("Invalid access token");
    });

    it("should throw error for token with wrong type field", () => {
      const wrongTypeToken = jwt.sign(
        { userId: "1", email: "test@example.com", type: "wrong" },
        config.env.JWT_SECRET + "_refresh",
        { expiresIn: "15m" },
      );

      expect(() => {
        jwtService.verifyAccessToken(wrongTypeToken);
      }).toThrowError("Invalid access token");
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", () => {
      const refreshToken = jwtService.generateRefreshToken(
        REFRESH_TOKEN_PAYLOAD,
      );
      const decoded = jwtService.verifyRefreshToken(refreshToken);

      expect(decoded.userId).toEqual(REFRESH_TOKEN_PAYLOAD.userId);
      expect(decoded.type).toEqual("refresh");
    });

    it("should throw error for invalid refresh token", () => {
      expect(() => {
        jwtService.verifyRefreshToken("asdasd");
      }).toThrowError("Invalid refresh token");
    });

    it("should throw error for token with invalid signature", () => {
      expect(() => {
        jwtService.verifyRefreshToken(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
        );
      }).toThrowError("Invalid refresh token");
    });

    it("should throw error when using access token for refresh verification", () => {
      const accessToken = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      expect(() => {
        jwtService.verifyRefreshToken(accessToken);
      }).toThrowError("Invalid refresh token");
    });

    it("should throw error for expired refresh token", () => {
      const expiredToken = jwtService.generateRefreshToken({ userId: "1" });

      vi.useFakeTimers();
      vi.advanceTimersByTime(1000 * 60 * 60 * 60 * 24 * 255);

      expect(() => {
        jwtService.verifyRefreshToken(expiredToken);
      }).toThrowError("Refresh token expired");
    });

    it("should throw error for malformed token", () => {
      expect(() => {
        jwtService.verifyRefreshToken("not.a.valid.jwt.token");
      }).toThrowError("Invalid refresh token");
    });

    it("should throw error for empty token", () => {
      expect(() => {
        jwtService.verifyRefreshToken("");
      }).toThrowError("Invalid refresh token");
    });

    it("should throw error for token with wrong type field", () => {
      const wrongTypeToken = jwt.sign(
        { userId: "1", type: "wrong" },
        config.env.JWT_SECRET + "_refresh",
        { expiresIn: "7d" },
      );

      expect(() => {
        jwtService.verifyRefreshToken(wrongTypeToken);
      }).toThrowError("Invalid token type");
    });
  });

  describe("token security", () => {
    it("should use different secrets for access and refresh tokens", () => {
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        "1",
        "test@example.com",
      );

      expect(() => {
        jwt.verify(accessToken, config.env.JWT_SECRET + "_refresh");
      }).toThrow();

      expect(() => {
        jwt.verify(refreshToken, config.env.JWT_SECRET + "_access");
      }).toThrow();
    });

    it("should not be able to swap token types", () => {
      const accessToken = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      const refreshToken = jwtService.generateRefreshToken(
        REFRESH_TOKEN_PAYLOAD,
      );

      expect(() => {
        jwtService.verifyRefreshToken(accessToken);
      }).toThrow();

      expect(() => {
        jwtService.verifyAccessToken(refreshToken);
      }).toThrow();
    });

    it("should generate unique tokens even with same payload", () => {
      const token1 = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
      setTimeout(
        () => {
          const token2 = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
          expect(token1).not.toBe(token2);
        },
        1000 * 1000 * 1000,
      );
    });
  });
});
