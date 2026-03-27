import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailVerificationTokenRepository } from "./email-verification-token.repository.js";

const { dbMock, insertReturning, selectLimit, updateWhere } = vi.hoisted(() => {
  const insertReturning = vi.fn();
  const insertValues = vi.fn(() => ({ returning: insertReturning }));
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

  return { dbMock, insertReturning, selectLimit, updateWhere };
});

vi.mock("../../../../database/index.js", () => ({
  db: dbMock,
}));

vi.mock("../../../../database/schema.js", () => ({
  emailVerificationTokens: {
    tokenHash: "tokenHash",
    userId: "userId",
    id: "id",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("EmailVerificationTokenRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create retourne une entite EmailVerificationToken", async () => {
    insertReturning.mockResolvedValueOnce([
      {
        id: "t1",
        userId: "u1",
        tokenHash: "hash-1",
        expiresAt: "2030-01-01T00:00:00.000Z",
        usedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const repo = new EmailVerificationTokenRepository();

    const entity = await repo.create(
      "u1",
      "hash-1",
      new Date("2030-01-01T00:00:00.000Z")
    );

    expect(entity.id).toBe("t1");
    expect(entity.userId).toBe("u1");
    expect(entity.tokenHash).toBe("hash-1");
  });

  it("findByTokenHash retourne null si absent", async () => {
    selectLimit.mockResolvedValueOnce([]);
    const repo = new EmailVerificationTokenRepository();
    await expect(repo.findByTokenHash("missing")).resolves.toBeNull();
  });

  it("findByTokenHash retourne une entite si trouve", async () => {
    selectLimit.mockResolvedValueOnce([
      {
        id: "t2",
        userId: "u2",
        tokenHash: "hash-2",
        expiresAt: "2030-01-01T00:00:00.000Z",
        usedAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const repo = new EmailVerificationTokenRepository();

    const entity = await repo.findByTokenHash("hash-2");
    expect(entity?.id).toBe("t2");
  });

  it("invalidateForUser et markUsed executent un update", async () => {
    updateWhere.mockResolvedValue(undefined);
    const repo = new EmailVerificationTokenRepository();

    await repo.invalidateForUser("u1");
    await repo.markUsed("t1");

    expect(dbMock.update).toHaveBeenCalledTimes(2);
    expect(updateWhere).toHaveBeenCalledTimes(2);
  });
});
