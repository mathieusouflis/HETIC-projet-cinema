import { describe, it } from "vitest";
import { PasswordService } from "../../../../shared/services/password";
import { JWTService } from "../../../../shared/services/token";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock";
import { LoginUseCase } from "./login.usecase";

describe("LoginUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const tokenService = new JWTService();
  const passwordService = new PasswordService();

  const useCase = new LoginUseCase(
    mockedUserRepository,
    passwordService,
    tokenService
  );

  it("should throw an error when user not found", async () => {
    const email = "fakeEmail@gmail.com";
    await expect(
      useCase.execute({ email, password: "fakePassword" })
    ).rejects.toThrow();
  });

  it("should throw an error when wrong password", async () => {
    const email = "test1@example.com";
    const password = "fakePassword123";
    await expect(
      useCase.execute({ email, password: password })
    ).rejects.toThrow();
  });

  it("should throw error if user does not have password", async () => {
    const email = "test3@example.com";
    const password = "fakePassword123";
    await expect(
      useCase.execute({ email, password: password })
    ).rejects.toThrow();
  });

  it("should pass when email and password are correct", async () => {
    const email = "test2@example.com";
    const password = "Password123:)";

    const loginResponse = await useCase.execute({ email, password });
    expect(loginResponse).toBeDefined();
  });
});
