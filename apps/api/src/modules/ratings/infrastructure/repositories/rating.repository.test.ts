import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { RatingRepository } from "./rating.repository.js";

const { dbMock, insertReturning, selectWhereResult } = vi.hoisted(() => {
  const insertReturning = vi.fn();
  const selectWhereResult = vi.fn();

  const dbMock = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => ({
          returning: insertReturning,
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(selectWhereResult())),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  };

  return { dbMock, insertReturning, selectWhereResult };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("RatingRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ratingRow = {
    id: "r1",
    userId: "u1",
    contentId: "c1",
    rating: "4.5",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("upsert retourne la note et synchronise le contenu", async () => {
    insertReturning.mockResolvedValueOnce([ratingRow]);
    const repo = new RatingRepository();
    const out = await repo.upsert("u1", "c1", 4.5);
    expect(out.rating).toBe(4.5);
    expect(dbMock.update).toHaveBeenCalled();
  });

  it("upsert leve ServerError si aucune ligne", async () => {
    insertReturning.mockResolvedValueOnce([]);
    const repo = new RatingRepository();
    await expect(repo.upsert("u1", "c1", 3)).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("upsert enveloppe les erreurs", async () => {
    insertReturning.mockRejectedValueOnce(new Error("db"));
    const repo = new RatingRepository();
    await expect(repo.upsert("u1", "c1", 3)).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("findByUserAndContent retourne null ou la note", async () => {
    const repo = new RatingRepository();
    selectWhereResult.mockResolvedValueOnce([]);
    await expect(repo.findByUserAndContent("u1", "c1")).resolves.toBeNull();

    selectWhereResult.mockResolvedValueOnce([{ rating: "3" }]);
    await expect(repo.findByUserAndContent("u1", "c1")).resolves.toEqual({
      rating: 3,
    });
  });

  it("getAverageForContent agrege les resultats", async () => {
    const repo = new RatingRepository();
    selectWhereResult.mockResolvedValueOnce([{ average: "4.2", count: 5 }]);
    await expect(repo.getAverageForContent("c1")).resolves.toEqual({
      average: 4.2,
      count: 5,
    });

    selectWhereResult.mockResolvedValueOnce([]);
    await expect(repo.getAverageForContent("c1")).resolves.toEqual({
      average: null,
      count: 0,
    });
  });

  it("delete supprime puis synchronise", async () => {
    const repo = new RatingRepository();
    await repo.delete("u1", "c1");
    expect(dbMock.delete).toHaveBeenCalled();
    expect(dbMock.update).toHaveBeenCalled();
  });
});
