import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { PlatformsRepository } from "./platforms.repository.js";

const contentRow = {
  id: "c1",
  type: "movie" as const,
  title: "T",
  originalTitle: null,
  slug: "t",
  synopsis: null,
  posterUrl: null,
  backdropUrl: null,
  trailerUrl: null,
  releaseDate: null,
  year: null,
  durationMinutes: null,
  tmdbId: 1,
  averageRating: "0",
  totalRatings: 0,
  totalViews: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const platformRow = {
  id: "pl1",
  name: "Netflix",
  slug: "netflix",
  logoUrl: null,
  baseUrl: null,
  isSupported: true,
  tmdbId: 8,
  createdAt: "2024-01-01T00:00:00.000Z",
};

const {
  dbMock,
  findManyMock,
  insertReturning,
  selectFromMock,
  updateReturning,
} = vi.hoisted(() => {
  const findManyMock = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const selectFromMock = vi.fn();

  const dbMock = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: insertReturning })),
    })),
    select: vi.fn(() => ({
      from: selectFromMock,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: updateReturning })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    query: {
      streamingPlatforms: {
        findMany: findManyMock,
      },
    },
  };

  return {
    dbMock,
    findManyMock,
    insertReturning,
    selectFromMock,
    updateReturning,
  };
});

vi.mock("../../../../database/index.js", () => ({ db: dbMock }));

describe("PlatformsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create retourne une Platform", async () => {
    insertReturning.mockResolvedValueOnce([platformRow]);
    const repo = new PlatformsRepository();
    const p = await repo.create({
      name: "Netflix",
      slug: "netflix",
    } as never);
    expect(p.toJSON().id).toBe("pl1");
  });

  it("create leve ServerError si insert vide", async () => {
    insertReturning.mockResolvedValueOnce([]);
    const repo = new PlatformsRepository();
    await expect(
      repo.create({ name: "X", slug: "x" } as never)
    ).rejects.toBeInstanceOf(ServerError);
  });

  it("list mappe les lignes sans contenu lie", async () => {
    findManyMock.mockResolvedValueOnce([{ ...platformRow, contents: [] }]);
    const repo = new PlatformsRepository();
    const list = await repo.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.toJSON().name).toBe("Netflix");
  });

  it("list avec withContent attache les contenus", async () => {
    findManyMock.mockResolvedValueOnce([
      {
        ...platformRow,
        contents: [{ content: contentRow }],
      },
    ]);
    const repo = new PlatformsRepository();
    const list = await repo.list(true);
    expect(list[0]?.getRelations("contents")).toHaveLength(1);
  });

  it("getById retourne une platform", async () => {
    selectFromMock.mockReturnValue({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([platformRow])),
      })),
    });
    const repo = new PlatformsRepository();
    const p = await repo.getById("pl1");
    expect(p.toJSON().id).toBe("pl1");
  });

  it("getById leve si introuvable", async () => {
    selectFromMock.mockReturnValue({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([])),
      })),
    });
    const repo = new PlatformsRepository();
    await expect(repo.getById("missing")).rejects.toBeInstanceOf(ServerError);
  });

  it("update retourne la platform mise a jour", async () => {
    updateReturning.mockResolvedValueOnce([{ ...platformRow, name: "NF" }]);
    const repo = new PlatformsRepository();
    const p = await repo.update("pl1", { name: "NF" });
    expect(p.toJSON().name).toBe("NF");
  });

  it("update leve si aucune ligne", async () => {
    updateReturning.mockResolvedValueOnce([]);
    const repo = new PlatformsRepository();
    await expect(repo.update("x", { name: "y" })).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("delete appelle db.delete", async () => {
    const repo = new PlatformsRepository();
    await repo.delete("pl1");
    expect(dbMock.delete).toHaveBeenCalled();
  });

  it("findByTmdbIds mappe les resultats", async () => {
    selectFromMock.mockReturnValue({
      where: vi.fn(() => Promise.resolve([platformRow])),
    });
    const repo = new PlatformsRepository();
    const list = await repo.findByTmdbIds([8]);
    expect(list).toHaveLength(1);
    expect(list[0]?.toJSON().tmdbId).toBe(8);
  });
});
