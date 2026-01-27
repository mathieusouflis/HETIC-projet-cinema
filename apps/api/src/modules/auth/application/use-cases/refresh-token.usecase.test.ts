import { describe, it } from "vitest";
import { JWTService } from "../../../../shared/services/token";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock";
import { RefreshTokenUseCase } from "./refresh-token.usecase";

describe("RefreshTokenUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const tokenService = new JWTService();

  const useCase = new RefreshTokenUseCase(mockedUserRepository, tokenService);
  it("should throw an error when the refresh token is invalid", async () => {
    const invalidToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkXVCJ9.eyJzdWIiOiIxMj0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
    await expect(
      useCase.execute({ refreshToken: invalidToken })
    ).rejects.toThrow("Invalid or expired refresh token");
  });

  it("should throw an error if the user in the payload is not found", async () => {
    const validToken = tokenService.generateRefreshToken({
      userId: "1",
    });
    await expect(
      useCase.execute({ refreshToken: validToken })
    ).rejects.toThrow();
  });
  it("should pass when token and user id are valid", async () => {
    const validToken = tokenService.generateRefreshToken({
      userId: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
    });
    const refreshResponse = await useCase.execute({ refreshToken: validToken });
    expect(refreshResponse).not.toBe(null);
  });
});
