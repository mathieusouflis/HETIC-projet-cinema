import { beforeEach, describe, expect, it, vi } from "vitest";
import { PasswordResetTokenRepository } from "./password-reset-token.repository.js";

const { dbMock, deleteWhere, insertReturning, selectLimit, updateWhere } =
  vi.hoisted(() => {
    const insertReturning = vi.fn();
    const insertValues = vi.fn(() => ({ returning: insertReturning }));
    const selectLimit = vi.fn();
    const updateWhere = vi.fn();
    const deleteWhere = vi.fn();
    const setMock = vi.fn(() => ({ where: updateWhere }));

    const dbMock = {
      insert: vi.fn(() => ({ values: insertValues })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ limit: selectLimit })),
        })),
      })),
      delete: vi.fn(() => ({ where: deleteWhere })),
      update: vi.fn(() => ({ set: setMock })),
    };

    return { dbMock, deleteWhere, insertReturning, selectLimit, updateWhere };
  });

vi.mock("../../../../database/index.js", () => ({
  db: dbMock,
}));

vi.mock("../../../../database/schema.js", () => ({
  passwordResetTokens: {
    tokenHash: "tokenHash",
    userId: "userId",
    id: "id",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("PasswordResetTokenRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create retourne une entite PasswordResetToken", async () => {
    insertReturning.mockResolvedValueOnce([
      {
        id: "p1",
        userId: "u1",
        tokenHash: "hash-1",
        expiresAt: "2030-01-01T00:00:00.000Z",
        usedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const repo = new PasswordResetTokenRepository();

    const entity = await repo.create(
      "u1",
      "hash-1",
      new Date("2030-01-01T00:00:00.000Z")
    );

    expect(entity.id).toBe("p1");
    expect(entity.userId).toBe("u1");
  });

  it("findByTokenHash retourne null puis une entite", async () => {
    const repo = new PasswordResetTokenRepository();

    selectLimit.mockResolvedValueOnce([]);
    await expect(repo.findByTokenHash("missing")).resolves.toBeNull();

    selectLimit.mockResolvedValueOnce([
      {
        id: "p2",
        userId: "u2",
        tokenHash: "hash-2",
        expiresAt: "2030-01-01T00:00:00.000Z",
        usedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const found = await repo.findByTokenHash("hash-2");
    expect(found?.id).toBe("p2");
  });

  it("invalidateForUser delete et markUsed update", async () => {
    deleteWhere.mockResolvedValue(undefined);
    updateWhere.mockResolvedValue(undefined);
    const repo = new PasswordResetTokenRepository();

    await repo.invalidateForUser("u1");
    await repo.markUsed("p1");

    expect(dbMock.delete).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
    expect(dbMock.update).toHaveBeenCalledTimes(1);
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });
});
