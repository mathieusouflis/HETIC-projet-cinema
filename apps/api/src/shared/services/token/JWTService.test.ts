import { describe } from "vitest";
import { JWTService } from "./JWTService";
import { AccessTokenPayload, RefreshTokenPayload } from "./ITokenService";

describe("JWT service test", () => {
  const jwtService = new JWTService();
  const ACCESS_TOKEN_PAYLOAD:  Omit<AccessTokenPayload, "type"> = { userId: "1", email: "test@example.com" };
  const REFRESH_TOKEN_PAYLOAD:  Omit<RefreshTokenPayload, "type"> = { userId: "1"};
  it("should generate an access token", async () => {
    const token = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
    expect(token).toBeDefined();
  });

  it("should generate a refresh token", async () => {
    const token = jwtService.generateRefreshToken(REFRESH_TOKEN_PAYLOAD);
    expect(token).toBeDefined();
  });

  it("should generate a pair of tokens", async () => {
    const token = jwtService.generateTokenPair(ACCESS_TOKEN_PAYLOAD.userId, ACCESS_TOKEN_PAYLOAD.email);
    expect(token.accessToken).toBeDefined();
    expect(token.refreshToken).toBeDefined();
  });

  it("should verify access token", async () => {
    expect(() => {
      jwtService.verifyAccessToken("asdasd")
    }).toThrowError("Invalid access token")
    expect(() => {
      jwtService.verifyAccessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30")
    }).toThrowError("Invalid access token")

    const token = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
    const decoded = jwtService.verifyAccessToken(token);
    expect(decoded.email).toEqual(ACCESS_TOKEN_PAYLOAD.email);
    expect(decoded.userId).toEqual(ACCESS_TOKEN_PAYLOAD.userId);
    expect(decoded.type).toEqual("access");
  });

  it("should verify refresh token", async () => {
    expect(() => {
      jwtService.verifyRefreshToken("asdasd")
    }).toThrowError("Invalid refresh token")
    expect(() => {
      jwtService.verifyRefreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30")
    }).toThrowError("Invalid refresh token")

    const accessToken = jwtService.generateAccessToken(ACCESS_TOKEN_PAYLOAD);
    expect(() => {
      jwtService.verifyRefreshToken(accessToken)
    }).toThrowError("Invalid refresh token")

    const refreshToken = jwtService.generateRefreshToken(REFRESH_TOKEN_PAYLOAD);
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    expect(decoded.userId).toEqual(REFRESH_TOKEN_PAYLOAD.userId);
    expect(decoded.type).toEqual("refresh");
  });
});
