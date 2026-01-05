import { vi } from "vitest";
import type { IUserRepository } from "./IUserRepository";
import { User } from "../entities/user.entity";

export function createMockedUserRepository(overrides: Partial<IUserRepository> = {}): IUserRepository {
  const mockUser1: User = new User({
    id: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
    email: "test1@example.com",
    username: "john_doe",
    passwordHash: "$2b$10$YZ6ezh4qQ/Y8DDMpl71P4.DsirOqGGWDgNY2Hm6LXaUIXeUcqz7hO", // Password123:)
    avatarUrl: "https://example.com/avatar.jpg",
    bio: "I'm a test user",
    displayName: "John Doe",
    emailNotifications: true,
    language: "en",
    oauthId: null,
    oauthProvider: null,
    theme: "dark",
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const mockUser2: User = new User({
    id: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
    email: "test2@example.com",
    username: "john_doe",
    passwordHash: "$2b$10$YZ6ezh4qQ/Y8DDMpl71P4.DsirOqGGWDgNY2Hm6LXaUIXeUcqz7hO", // Password123:)
    avatarUrl: "https://example.com/avatar.jpg",
    bio: "I'm a test user",
    displayName: "John Doe",
    emailNotifications: true,
    language: "en",
    oauthId: null,
    oauthProvider: null,
    theme: "dark",
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const mockUser3: User = new User({
    id: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
    email: "test3@example.com",
    username: "john_doe",
    passwordHash: null,
    avatarUrl: "https://example.com/avatar.jpg",
    bio: "I'm a test user",
    displayName: "John Doe",
    emailNotifications: true,
    language: "en",
    oauthId: null,
    oauthProvider: null,
    theme: "dark",
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const usersMocked = [mockUser1, mockUser2, mockUser3];
  const defaults: IUserRepository = {
    create: vi.fn().mockResolvedValue(mockUser1),
    delete: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(mockUser1),
    existsByEmail: vi.fn((email: string) => Promise.resolve(usersMocked.some((user) => user.email === email))),
    existsByUsername: vi.fn((username: string) => Promise.resolve(usersMocked.some((user) => user.username === username))),
    findAll: vi.fn().mockResolvedValue(usersMocked),
    findByEmail: vi.fn((email: string) => Promise.resolve(usersMocked.find((user) => user.email === email) ?? null)),
    findById: vi.fn((id: string) => Promise.resolve(usersMocked.find((user) => user.id === id) ?? null)),
    findByOAuth: vi.fn((provider: string, oauthId: string) => Promise.resolve(usersMocked.find((user) => user.oauthId === oauthId && user.oauthProvider === provider) ?? null)),
    findByUsername: vi.fn((username: string) => Promise.resolve(usersMocked.find((user) => user.username === username) ?? null)),
  };

  return {
    ...defaults,
    ...overrides,
  };
}
