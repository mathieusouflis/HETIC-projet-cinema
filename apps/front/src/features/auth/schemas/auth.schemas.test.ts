import { describe, expect, it } from "vitest";
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
  usernameSchema,
} from "./auth.schemas";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = emailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("rejects email longer than 255 characters", () => {
    const long = `${"a".repeat(250)}@b.com`;
    const result = emailSchema.safeParse(long);
    expect(result.success).toBe(false);
  });

  it("lowercases the email on parse", () => {
    const result = emailSchema.safeParse("USER@EXAMPLE.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("user@example.com");
    }
  });

  it("lowercases and trims a clean email on parse", () => {
    const result = emailSchema.safeParse("USER@Example.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("user@example.com");
    }
  });
});

describe("usernameSchema", () => {
  it("accepts a valid username", () => {
    expect(usernameSchema.safeParse("john_doe-42").success).toBe(true);
  });

  it("rejects username shorter than 3 characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });

  it("rejects username longer than 30 characters", () => {
    expect(usernameSchema.safeParse("a".repeat(31)).success).toBe(false);
  });

  it("rejects username with spaces", () => {
    expect(usernameSchema.safeParse("john doe").success).toBe(false);
  });

  it("rejects username with @", () => {
    expect(usernameSchema.safeParse("john@doe").success).toBe(false);
  });

  it("allows underscores and hyphens", () => {
    expect(usernameSchema.safeParse("john_doe-42").success).toBe(true);
  });

  it("allows exactly 3 characters", () => {
    expect(usernameSchema.safeParse("abc").success).toBe(true);
  });

  it("allows exactly 30 characters", () => {
    expect(usernameSchema.safeParse("a".repeat(30)).success).toBe(true);
  });
});

describe("passwordSchema", () => {
  const valid = "Abcdef1!";

  it("accepts a valid password", () => {
    expect(passwordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("Ab1!").success).toBe(false);
  });

  it("rejects password longer than 100 characters", () => {
    // 101 chars: 1 uppercase + 98 lowercase + 1 digit + 1 special = 101
    const long = `A${"a".repeat(98)}1!`;
    expect(passwordSchema.safeParse(long).success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    expect(passwordSchema.safeParse("abcdef1!").success).toBe(false);
  });

  it("rejects password without lowercase letter", () => {
    expect(passwordSchema.safeParse("ABCDEF1!").success).toBe(false);
  });

  it("rejects password without a number", () => {
    expect(passwordSchema.safeParse("Abcdefg!").success).toBe(false);
  });

  it("rejects password without a special character", () => {
    expect(passwordSchema.safeParse("Abcdef12").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Abcdef1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      loginSchema.safeParse({ email: "bad", password: "Abcdef1!" }).success
    ).toBe(false);
  });

  it("rejects weak password", () => {
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "abc" })
        .success
    ).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    email: "user@example.com",
    username: "johndoe",
    password: "Abcdef1!",
    confirmPassword: "Abcdef1!",
  };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...base,
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === "confirmPassword"
      );
      expect(confirmError?.message).toBe("Passwords do not match");
    }
  });

  it("rejects invalid username", () => {
    expect(registerSchema.safeParse({ ...base, username: "ab" }).success).toBe(
      false
    );
  });

  it("rejects invalid email", () => {
    expect(
      registerSchema.safeParse({ ...base, email: "not-valid" }).success
    ).toBe(false);
  });
});
