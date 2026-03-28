import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { WatchlistRepository } from "./watchlist.repository.js";

const {
  countWhereMock,
  dbMock,
  findByIdWhereMock,
  insertReturning,
  joinWhereMock,
  updateReturning,
  deleteReturning,
} = vi.hoisted(() => {
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const deleteReturning = vi.fn();
  const findByIdWhereMock = vi.fn();
  const joinWhereMock = vi.fn();
  const countWhereMock = vi.fn();

  const dbMock = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
    select: vi.fn((arg?: unknown) => ({
      from: vi.fn(() => {
        if (
          arg !== undefined &&
          arg !== null &&
          typeof arg === "object" &&
          "total" in arg
        ) {
          return {
            where: vi.fn(() => Promise.resolve(countWhereMock())),
          };
        }
        if (arg === undefined) {
          return {
            where: vi.fn(() => Promise.resolve(findByIdWhereMock())),
          };
        }
        return {
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve(joinWhereMock())),
          })),
        };
      }),
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
    countWhereMock,
    dbMock,
    findByIdWhereMock,
    insertReturning,
    joinWhereMock,
    updateReturning,
    deleteReturning,
  };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("WatchlistRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const row = {
    id: "w1",
    userId: "u1",
    contentId: "c1",
    status: "plan_to_watch" as const,
    currentSeason: null,
    currentEpisode: null,
    addedAt: "2024-01-01T00:00:00.000Z",
    startedAt: null,
    completedAt: null,
  };

  it("create retourne une entree Watchlist", async () => {
    const repo = new WatchlistRepository();
    insertReturning.mockResolvedValueOnce([row]);
    const created = await repo.create({
      userId: "u1",
      contentId: "c1",
    } as never);
    expect(created.id).toBe("w1");
    expect(created.userId).toBe("u1");
  });

  it("create leve ServerError si insert sans ligne", async () => {
    const repo = new WatchlistRepository();
    insertReturning.mockResolvedValueOnce([]);
    await expect(
      repo.create({ userId: "u1", contentId: "c1" } as never)
    ).rejects.toBeInstanceOf(ServerError);
  });

  it("create enveloppe les erreurs inattendues en ServerError", async () => {
    const repo = new WatchlistRepository();
    insertReturning.mockRejectedValueOnce(new Error("db"));
    await expect(
      repo.create({ userId: "u1", contentId: "c1" } as never)
    ).rejects.toBeInstanceOf(ServerError);
  });

  it("findById retourne une Watchlist", async () => {
    const repo = new WatchlistRepository();
    findByIdWhereMock.mockResolvedValueOnce([row]);
    const found = await repo.findById("w1");
    expect(found?.id).toBe("w1");
  });

  it("findById leve NotFoundError si aucune ligne", async () => {
    const repo = new WatchlistRepository();
    findByIdWhereMock.mockResolvedValueOnce([]);
    await expect(repo.findById("missing")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("findById propage ServerError sur erreur inattendue", async () => {
    const repo = new WatchlistRepository();
    findByIdWhereMock.mockRejectedValueOnce(new Error("db"));
    await expect(repo.findById("w1")).rejects.toBeInstanceOf(ServerError);
  });

  it("findByContentId mappe watchlist et rating", async () => {
    const repo = new WatchlistRepository();
    joinWhereMock.mockResolvedValueOnce([
      { watchlist: row, rating: "4.5" as never },
    ]);
    const found = await repo.findByContentId("u1", "c1");
    expect(found?.contentId).toBe("c1");
    expect(found?.rating).toBe(4.5);
  });

  it("findByContentId leve NotFoundError si vide", async () => {
    const repo = new WatchlistRepository();
    joinWhereMock.mockResolvedValueOnce([]);
    await expect(repo.findByContentId("u1", "c1")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("list retourne data et total", async () => {
    const repo = new WatchlistRepository();
    joinWhereMock.mockResolvedValueOnce([
      { watchlist: row, rating: null as never },
    ]);
    countWhereMock.mockResolvedValueOnce([{ total: 1 }]);
    const result = await repo.list("u1");
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.id).toBe("w1");
  });

  it("list utilise total 0 si aggregate absent", async () => {
    const repo = new WatchlistRepository();
    joinWhereMock.mockResolvedValueOnce([]);
    countWhereMock.mockResolvedValueOnce([]);
    const result = await repo.list("u1");
    expect(result.total).toBe(0);
  });

  it("list enveloppe les erreurs en ServerError", async () => {
    const repo = new WatchlistRepository();
    joinWhereMock.mockRejectedValueOnce(new Error("db"));
    await expect(repo.list("u1")).rejects.toBeInstanceOf(ServerError);
  });

  it("update retourne la Watchlist mise a jour", async () => {
    const repo = new WatchlistRepository();
    updateReturning.mockResolvedValueOnce([{ ...row, status: "watching" }]);
    const updated = await repo.update("w1", { status: "watching" });
    expect(updated.status).toBe("watching");
  });

  it("update leve NotFoundError si aucune ligne", async () => {
    const repo = new WatchlistRepository();
    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.update("missing", {})).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("delete supprime une entree existante", async () => {
    const repo = new WatchlistRepository();
    deleteReturning.mockResolvedValueOnce([row]);
    await expect(repo.delete("w1")).resolves.toBeUndefined();
  });

  it("delete leve NotFoundError si rien supprime", async () => {
    const repo = new WatchlistRepository();
    deleteReturning.mockResolvedValueOnce([]);
    await expect(repo.delete("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
