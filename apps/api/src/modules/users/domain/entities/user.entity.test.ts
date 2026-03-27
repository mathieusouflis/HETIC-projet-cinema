// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { User } from "./user.entity.js";

describe("User entity", () => {
  const now = new Date("2024-01-10T00:00:00.000Z");
  const baseRow = {
    id: "u1",
    email: "john@doe.com",
    username: "john_doe",
    passwordHash: "hash",
    displayName: "John",
    avatarUrl: "avatar.png",
    bio: "bio",
    oauthProvider: null,
    oauthId: null,
    theme: "dark",
    language: "fr",
    emailNotifications: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    lastLoginAt: "2024-01-03T00:00:00.000Z",
    emailVerifiedAt: "2024-01-04T00:00:00.000Z",
  };

  it("detecte verification, oauth, avatar et displayName", () => {
    const verified = new User(baseRow);
    const oauth = new User({
      ...baseRow,
      oauthProvider: "google",
      oauthId: "g-1",
      displayName: null,
      avatarUrl: "",
      emailVerifiedAt: null,
    });

    expect(verified.isEmailVerified()).toBe(true);
    expect(verified.isOAuthUser()).toBe(false);
    expect(verified.hasAvatar()).toBe(true);
    expect(verified.getDisplayName()).toBe("John");

    expect(oauth.isEmailVerified()).toBe(false);
    expect(oauth.isOAuthUser()).toBe(true);
    expect(oauth.hasAvatar()).toBe(false);
    expect(oauth.getDisplayName()).toBe("john_doe");
  });

  it("calcule age de compte et valide email/username", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const user = new User(baseRow);

    expect(user.isAccountOlderThan(2)).toBe(true);
    expect(user.isAccountOlderThan(20)).toBe(false);
    expect(User.isValidEmail("ok@mail.com")).toBe(true);
    expect(User.isValidEmail("ko")).toBe(false);
    expect(User.isValidUsername("john_123")).toBe(true);
    expect(User.isValidUsername("a")).toBe(false);

    vi.useRealTimers();
  });

  it("toJSON exclut passwordHash", () => {
    const user = new User(baseRow);
    const json = user.toJSON();

    expect(json.id).toBe("u1");
    expect("passwordHash" in json).toBe(false);
  });
});
