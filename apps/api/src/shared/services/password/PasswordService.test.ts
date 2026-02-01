import { describe } from "vitest";
import { PasswordService } from "./password-service";

describe("Password service test", () => {
  const PASSWORD = "password";
  const passwordService = new PasswordService();

  it("should hash a password", async () => {
    const hashedPassword = passwordService.hash(PASSWORD);
    expect(hashedPassword).not.toEqual(PASSWORD);
  });

  it("should compare a password", async () => {
    const hashedPassword = await passwordService.hash(PASSWORD);
    let isMatch = await passwordService.compare(PASSWORD, "lala");
    expect(isMatch).toBe(false);
    isMatch = await passwordService.compare(PASSWORD, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
