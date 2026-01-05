import { describe, it } from "vitest";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock";
import { DeleteUserUseCase } from "./DeleteUser.usecase";

describe("LoginUseCase", () => {

  const mockedUserRepository = createMockedUserRepository();

  const useCase = new DeleteUserUseCase(mockedUserRepository)

  it("should throw an error when user not found", async () => {
    const id = "1";
    await expect(useCase.execute(id)).rejects.toThrow();
  });

  it("should delete user", async () => {
    const id = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    expect(await useCase.execute(id)).toBeUndefined();
  });
});
