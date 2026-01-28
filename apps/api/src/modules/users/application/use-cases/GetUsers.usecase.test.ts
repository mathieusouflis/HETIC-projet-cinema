import { describe, it } from "vitest";
import { createMockedUserRepository } from "../../domain/interfaces/user.repository.mock.";
import { GetUsersUseCase } from "./GetUsers.usecase";

describe("LoginUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const useCase = new GetUsersUseCase(mockedUserRepository);

  it("Should get a list of users", async () => {
    expect(
      await useCase.execute({
        page: 1,
        limit: 10,
        offset: 0,
      })
    ).toBeDefined();
  });
});
