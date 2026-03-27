import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { WatchpartyRepository } from "./watchparty.repository.js";

const {
  dbMock,
  deleteReturning,
  findSelectWhere,
  insertReturning,
  updateReturning,
} = vi.hoisted(() => {
  const findSelectWhere = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const deleteReturning = vi.fn();

  const dbMock = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
    select: vi.fn((arg?: unknown) => ({
      from: vi.fn(() =>
        arg
          ? {
              where: findSelectWhere,
              // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
              then: (resolve: (value: unknown) => unknown) =>
                resolve(findSelectWhere()),
            }
          : {
              where: findSelectWhere,
              // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
              then: (resolve: (value: unknown) => unknown) =>
                resolve(findSelectWhere()),
            }
      ),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: updateReturning })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({ returning: deleteReturning })),
    })),
  };

  return {
    dbMock,
    deleteReturning,
    findSelectWhere,
    insertReturning,
    updateReturning,
  };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("WatchpartyRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const row = {
    id: "w1",
    contentId: "c1",
    createdBy: "u1",
    leaderUserId: "u1",
    title: "Party",
    status: "scheduled",
    startsAt: "2024-01-01T00:00:00.000Z",
    isPublic: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("create/findById/findByUserId/list", async () => {
    const repo = new WatchpartyRepository();
    insertReturning.mockResolvedValueOnce([row]);
    const created = await repo.create({} as never);
    expect(created.id).toBe("w1");

    findSelectWhere.mockResolvedValueOnce([row]);
    const byId = await repo.findById("w1");
    expect(byId?.id).toBe("w1");

    findSelectWhere.mockResolvedValueOnce([row]);
    const byUser = await repo.findByUserId("u1");
    expect(byUser).toHaveLength(1);

    findSelectWhere
      .mockReturnValueOnce([row])
      .mockReturnValueOnce([{ count: 1 }]);
    const listed = await repo.list({});
    expect(listed.total).toBe(1);
    expect(listed.data).toHaveLength(1);
  });

  it("update/delete et not found branches", async () => {
    const repo = new WatchpartyRepository();
    updateReturning.mockResolvedValueOnce([row]);
    const updated = await repo.update("w1", { title: "x" });
    expect(updated.id).toBe("w1");

    deleteReturning.mockResolvedValueOnce([row]);
    await repo.delete("w1");

    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.update("missing", {})).rejects.toBeInstanceOf(
      NotFoundError
    );
    deleteReturning.mockResolvedValueOnce([]);
    await expect(repo.delete("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
