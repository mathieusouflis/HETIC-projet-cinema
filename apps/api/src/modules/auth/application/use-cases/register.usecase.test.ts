import { describe, it } from "vitest";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock";
import { JWTService } from "../../../../shared/services/token";
import { PasswordService } from "../../../../shared/services/password";
import { RegisterUseCase } from "./register.usecase";

describe("LoginUseCase", () => {

  const mockedUserRepository = createMockedUserRepository();
  const tokenService = new JWTService();
  const passwordService = new PasswordService();

  const useCase = new RegisterUseCase(mockedUserRepository, passwordService, tokenService)

  it("should throw an error when email allready exist", async () => {
    const email = "test1@example.com";
    const username = "fakeUsername";
    const password = "fakePassword";
    await expect(useCase.execute({ email, username, password })).rejects.toThrow();
  });
  it("should throw an error when username allready exist", async () => {
    const email = "test1@example.com";
    const username = "john_doe";
    const password = "fakePassword";
    await expect(useCase.execute({ email, username, password })).rejects.toThrow();
  });
  it("create and return a user with token pair", async () => {
    const email = "newEmail123@gmail.com";
    const username = "new-username";
    const password = "fakePassword";

    const response = await useCase.execute({ email, username, password });

    expect(response).toBeDefined();
  });


});
