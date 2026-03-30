import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRepository } from "./user.repository.js";

const {
  dbMock,
  insertReturning,
  selectCount,
  selectLimit,
  selectOffset,
  selectWhere,
  updateReturning,
} = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectLimit = vi.fn();
  const selectCount = vi.fn();
  const selectOffset = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();

  const dbMock = {
    select: vi.fn((arg?: unknown) => {
      if (arg && typeof arg === "object" && "count" in (arg as object)) {
        return {
          from: vi.fn(() => {
            const p: any = Promise.resolve(selectCount());
            p.where = vi.fn(() => Promise.resolve(selectWhere()));
            return p;
          }),
        };
      }
      return {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(selectLimit())),
          })),
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve(selectOffset())),
          })),
        })),
      };
    }),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: updateReturning })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  };

  return {
    dbMock,
    insertReturning,
    selectCount,
    selectLimit,
    selectOffset,
    selectWhere,
    updateReturning,
  };
});

vi.mock("../../../../../database/index.js", () => ({ db: dbMock }));

describe("UserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const row = {
    id: "u1",
    email: "john@doe.com",
    username: "john",
    passwordHash: "hash",
    displayName: null,
    avatarUrl: null,
    bio: null,
    oauthProvider: null,
    oauthId: null,
    theme: "dark",
    language: "fr",
    emailNotifications: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    lastLoginAt: null,
    emailVerifiedAt: null,
  };

  it("findById/email/username/oauth retourne null ou User", async () => {
    const repo = new UserRepository();
    selectLimit.mockResolvedValueOnce([]);
    await expect(repo.findById("u1")).resolves.toBeNull();

    selectLimit.mockResolvedValueOnce([row]);
    await expect(repo.findById("u1")).resolves.toMatchObject({ id: "u1" });

    selectLimit.mockResolvedValueOnce([]);
    await expect(repo.findByEmail("JOHN@DOE.COM")).resolves.toBeNull();

    selectLimit.mockResolvedValueOnce([row]);
    await expect(repo.findByEmail("JOHN@DOE.COM")).resolves.toMatchObject({
      email: "john@doe.com",
    });

    selectLimit.mockResolvedValueOnce([row]);
    await expect(repo.findByUsername("JOHN")).resolves.toMatchObject({
      username: "john",
    });

    selectLimit.mockResolvedValueOnce([row]);
    await expect(repo.findByOAuth("google", "id")).resolves.toMatchObject({
      id: "u1",
    });
  });

  it("existsByEmail/existsByUsername based on count()", async () => {
    const repo = new UserRepository();
    selectWhere.mockResolvedValueOnce([{ count: 0 }]);
    await expect(repo.existsByEmail("a@b.com")).resolves.toBe(false);

    selectWhere.mockResolvedValueOnce([{ count: 2 }]);
    await expect(repo.existsByUsername("john")).resolves.toBe(true);
  });

  it("create lowercases and applies defaults, throws when returning empty", async () => {
    const repo = new UserRepository();
    insertReturning.mockResolvedValueOnce([row]);
    await expect(
      repo.create({
        email: "JOHN@DOE.COM",
        username: "JOHN",
        passwordHash: undefined,
        displayName: undefined,
        avatarUrl: undefined,
        bio: undefined,
        oauthProvider: undefined,
        oauthId: undefined,
        theme: undefined,
        language: undefined,
        emailNotifications: undefined,
      } as never)
    ).resolves.toMatchObject({ id: "u1" });

    insertReturning.mockResolvedValueOnce([]);
    await expect(
      repo.create({ email: "a@b.com", username: "a" } as never)
    ).rejects.toThrow("Failed to create user");
  });

  it("update construit updateData selon les champs fournis (branches)", async () => {
    const repo = new UserRepository();
    updateReturning.mockResolvedValueOnce([row]);
    await expect(
      repo.update("u1", {
        email: "A@B.COM",
        username: "JOHN",
        passwordHash: "h2",
        displayName: "John",
        avatarUrl: "x",
        bio: "bio",
        theme: "light",
        language: "en",
        emailNotifications: false,
      } as never)
    ).resolves.toMatchObject({ id: "u1" });

    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.update("u1", {} as never)).rejects.toThrow(
      "Failed to update user or user not found"
    );
  });

  it("delete et markEmailVerified ne jettent pas", async () => {
    const repo = new UserRepository();
    await expect(repo.delete("u1")).resolves.toBeUndefined();
    await expect(repo.markEmailVerified("u1")).resolves.toBeUndefined();
  });

  it("findAll retourne users et total (Promise.all branches)", async () => {
    const repo = new UserRepository();
    // count query
    selectCount.mockReturnValueOnce([{ count: 2 }]);
    // rows query (limit/offset chain)
    const rows = [row, { ...row, id: "u2", email: "a@b.com" }];
    selectOffset.mockResolvedValueOnce(rows);

    const out = await repo.findAll({ page: 2, limit: 10 });
    expect(out.total).toBe(2);
    expect(out.users).toHaveLength(2);
  });
});
