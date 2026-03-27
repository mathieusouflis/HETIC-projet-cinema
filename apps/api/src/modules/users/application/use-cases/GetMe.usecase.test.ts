import { describe, expect, it, vi } from "vitest";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import { GetMeUseCase } from "./GetMe.usecase.js";

describe("GetMeUseCase", () => {
  it("throws UserNotFoundError when user does not exist", async () => {
    const userRepository: IUserRepository = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;
    const useCase = new GetMeUseCase(userRepository);

    await expect(useCase.execute("missing-user")).rejects.toBeInstanceOf(
      UserNotFoundError
    );
    expect(userRepository.findById).toHaveBeenCalledWith("missing-user");
  });

  it("returns mapped profile when user exists", async () => {
    const user = {
      id: "user-1",
      email: "john@doe.com",
      username: "john",
    };
    const userRepository: IUserRepository = {
      findById: vi.fn().mockResolvedValue(user),
    } as unknown as IUserRepository;
    const useCase = new GetMeUseCase(userRepository);

    const result = await useCase.execute("user-1");

    expect(result).toEqual({
      email: "john@doe.com",
      userId: "user-1",
      username: "john",
    });
  });
});
