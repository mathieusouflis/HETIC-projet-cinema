import { describe, it } from "vitest";
import { createMockedUserRepository } from "../../domain/interfaces/user.repository.mock";
import { UpdateUserUseCase } from "./UpdateUser.usecase";

describe("LoginUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const useCase = new UpdateUserUseCase(mockedUserRepository);

  it("should throw error if user does not exist", async () => {
    const userId = "1";
    await expect(useCase.execute(userId, {})).rejects.toThrow();
  });

  it("should throw error if new username exist", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    const updateObject = {
      username: "john_doe",
    };
    await expect(useCase.execute(userId, updateObject)).rejects.toThrow();
  });
  it("should update user", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    const updateObject = {
      username: "new_username",
    };
    expect(await useCase.execute(userId, updateObject)).toBeDefined();
  });
});
