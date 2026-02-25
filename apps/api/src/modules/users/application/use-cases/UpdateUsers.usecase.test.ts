import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../../shared/errors/validation-error";
import { EmailAlreadyExistsError } from "../../domain/errors/EmailAlreadyExistsError";
import { UsernameAlreadyExistsError } from "../../domain/errors/UsernameAlreadyExistsError";
import { createMockedUserRepository } from "../../domain/interfaces/user.repository.mock.";
import { UpdateUserUseCase } from "./UpdateUser.usecase";

describe("UpdateUserUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const useCase = new UpdateUserUseCase(mockedUserRepository);

  // ------------------------------------------------------------------ //
  //  Core
  // ------------------------------------------------------------------ //
  it("should throw error if user does not exist", async () => {
    await expect(useCase.execute("non-existent-id", {})).rejects.toThrow();
  });

  it("should return the existing user when no fields are provided", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    const result = await useCase.execute(userId, {});
    expect(result).toBeDefined();
  });

  // ------------------------------------------------------------------ //
  //  Username
  // ------------------------------------------------------------------ //
  it("should throw UsernameAlreadyExistsError when username is taken", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    await expect(
      useCase.execute(userId, { username: "john_doe" })
    ).rejects.toThrow(UsernameAlreadyExistsError);
  });

  it("should update user when new username is available", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    const result = await useCase.execute(userId, {
      username: "new_unique_username",
    });
    expect(result).toBeDefined();
  });

  // ------------------------------------------------------------------ //
  //  Email
  // ------------------------------------------------------------------ //
  it("should throw EmailAlreadyExistsError when email is already taken", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    await expect(
      useCase.execute(userId, { email: "test2@example.com" })
    ).rejects.toThrow(EmailAlreadyExistsError);
  });

  it("should update email when it is unique", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    const result = await useCase.execute(userId, {
      email: "unique@example.com",
    });
    expect(result).toBeDefined();
  });

  // ------------------------------------------------------------------ //
  //  Password
  // ------------------------------------------------------------------ //
  it("should throw ValidationError when current password is wrong", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    await expect(
      useCase.execute(userId, {
        password: "WrongPassword123!",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when newPassword and confirmPassword do not match", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    await expect(
      useCase.execute(userId, {
        password: "Password123:)",
        newPassword: "NewPassword123!",
        confirmPassword: "DifferentPassword123!",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("should update password when all fields are valid", async () => {
    const userId = "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2";
    const result = await useCase.execute(userId, {
      password: "Password123:)",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });
    expect(result).toBeDefined();
  });
});
