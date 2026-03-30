import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { SeasonsDatabaseRepository } from "./seasons.database.repository.js";

const {
  dbMock,
  findFirst,
  findMany,
  insertReturning,
  updateReturning,
  selectRows,
} = vi.hoisted(() => {
  const findFirst = vi.fn();
  const findMany = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const selectRows = vi.fn();

  const dbMock = {
    query: {
      seasons: {
        findFirst,
        findMany,
      },
    },
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
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(selectRows())),
      })),
    })),
  };

  return {
    dbMock,
    findFirst,
    findMany,
    insertReturning,
    updateReturning,
    selectRows,
  };
});

vi.mock("../../../../database", () => ({ db: dbMock }));

describe("SeasonsDatabaseRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const seasonRow: any = {
    id: "s1",
    seriesId: "series1",
    tmdbId: 11,
    seasonNumber: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    content: { id: "c1" },
  };
  const episodeRow: any = {
    id: "e1",
    seasonId: "s1",
    episodeNumber: 1,
  };

  it("getSeasonById: null, avec episodes, et error => ServerError", async () => {
    const repo = new SeasonsDatabaseRepository();

    findFirst.mockResolvedValueOnce(null);
    await expect(repo.getSeasonById("s1")).resolves.toBeNull();

    findFirst.mockResolvedValueOnce({ ...seasonRow, episodes: [episodeRow] });
    const season = await repo.getSeasonById("s1", { withEpisodes: true });
    expect(season).not.toBeNull();

    findFirst.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getSeasonById("s1")).rejects.toBeInstanceOf(ServerError);
  });

  it("getSeasonsBySeriesId: filtre seasonNumber + withEpisodes, et error", async () => {
    const repo = new SeasonsDatabaseRepository();
    findMany.mockResolvedValueOnce([{ ...seasonRow, episodes: [episodeRow] }]);
    const list = await repo.getSeasonsBySeriesId("series1", {
      withEpisodes: true,
      seasonNumber: 1,
    });
    expect(list).toHaveLength(1);

    findMany.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getSeasonsBySeriesId("series1")).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("createSeason: ok, empty result, undefined row", async () => {
    const repo = new SeasonsDatabaseRepository();
    insertReturning.mockResolvedValueOnce([seasonRow]);
    await expect(repo.createSeason(seasonRow)).resolves.toBeDefined();

    insertReturning.mockResolvedValueOnce([]);
    await expect(repo.createSeason(seasonRow)).rejects.toBeInstanceOf(
      ServerError
    );

    insertReturning.mockResolvedValueOnce([undefined]);
    await expect(repo.createSeason(seasonRow)).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("updateSeason: ok, empty, undefined", async () => {
    const repo = new SeasonsDatabaseRepository();
    updateReturning.mockResolvedValueOnce([seasonRow]);
    await expect(
      repo.updateSeason("s1", { seasonNumber: 2 })
    ).resolves.toBeDefined();

    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.updateSeason("s1", {})).rejects.toBeInstanceOf(
      ServerError
    );

    updateReturning.mockResolvedValueOnce([undefined]);
    await expect(repo.updateSeason("s1", {})).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("deleteSeason: ok + error", async () => {
    const repo = new SeasonsDatabaseRepository();
    await expect(repo.deleteSeason("s1")).resolves.toBeUndefined();
    dbMock.delete.mockImplementationOnce(() => ({
      where: vi.fn(() => Promise.reject(new Error("db"))),
    }));
    await expect(repo.deleteSeason("s1")).rejects.toBeInstanceOf(ServerError);
  });

  it("getByTmdbIds: ok + vide => error", async () => {
    const repo = new SeasonsDatabaseRepository();
    selectRows.mockResolvedValueOnce([seasonRow]);
    await expect(repo.getByTmdbIds([11])).resolves.toHaveLength(1);

    selectRows.mockResolvedValueOnce([]);
    await expect(repo.getByTmdbIds([11])).rejects.toBeInstanceOf(ServerError);
  });

  it("getByTmdbId: ok + not found + thrown error", async () => {
    const repo = new SeasonsDatabaseRepository();
    findFirst.mockResolvedValueOnce(seasonRow);
    await expect(repo.getByTmdbId(11)).resolves.toBeDefined();

    findFirst.mockResolvedValueOnce(null);
    await expect(repo.getByTmdbId(11)).rejects.toBeInstanceOf(ServerError);

    findFirst.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getByTmdbId(11)).rejects.toBeInstanceOf(ServerError);
  });
});
