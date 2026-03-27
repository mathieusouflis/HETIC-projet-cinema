import { beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshTokenRepository } from "./refresh-token.repository.js";

const { dbMock, insertValues, selectLimit, setMock, updateWhere } = vi.hoisted(
  () => {
    const insertValues = vi.fn();
    const selectLimit = vi.fn();
    const updateWhere = vi.fn();
    const setMock = vi.fn(() => ({ where: updateWhere }));

    const dbMock = {
      insert: vi.fn(() => ({ values: insertValues })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ limit: selectLimit })),
        })),
      })),
      update: vi.fn(() => ({ set: setMock })),
    };

    return { dbMock, insertValues, selectLimit, setMock, updateWhere };
  }
);

vi.mock("../../../../database/index.js", () => ({
  db: dbMock,
}));

vi.mock("../../../../database/schema.js", () => ({
  refreshTokens: {
    tokenHash: "tokenHash",
    userId: "userId",
    revokedAt: "revokedAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  isNull: vi.fn(),
}));

describe("RefreshTokenRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create insere un token", async () => {
    insertValues.mockResolvedValueOnce(undefined);
    const repo = new RefreshTokenRepository();
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");

    await repo.create("u1", "hash-1", expiresAt);

    expect(dbMock.insert).toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalledWith({
      userId: "u1",
      tokenHash: "hash-1",
      expiresAt: expiresAt.toISOString(),
    });
  });

  it("findByTokenHash retourne null si absent", async () => {
    selectLimit.mockResolvedValueOnce([]);
    const repo = new RefreshTokenRepository();

    await expect(repo.findByTokenHash("missing")).resolves.toBeNull();
  });

  it("findByTokenHash mappe un record", async () => {
    selectLimit.mockResolvedValueOnce([
      {
        id: "r1",
        userId: "u1",
        tokenHash: "hash-1",
        expiresAt: "2030-01-01T00:00:00.000Z",
        revokedAt: null,
      },
    ]);
    const repo = new RefreshTokenRepository();

    await expect(repo.findByTokenHash("hash-1")).resolves.toEqual({
      id: "r1",
      userId: "u1",
      tokenHash: "hash-1",
      expiresAt: "2030-01-01T00:00:00.000Z",
      revokedAt: null,
    });
  });

  it("revoke et revokeAllForUser executent un update", async () => {
    updateWhere.mockResolvedValue(undefined);
    const repo = new RefreshTokenRepository();

    await repo.revoke("hash-1");
    await repo.revokeAllForUser("u1");

    expect(dbMock.update).toHaveBeenCalledTimes(2);
    expect(setMock).toHaveBeenCalledTimes(2);
    expect(updateWhere).toHaveBeenCalledTimes(2);
  });
});
