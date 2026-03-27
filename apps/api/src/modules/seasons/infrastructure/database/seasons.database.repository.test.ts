import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeasonsDatabaseRepository } from "./seasons.database.repository";

const {
  dbMock,
  deleteWhere,
  findFirstMock,
  findManyMock,
  insertReturning,
  selectWhere,
  updateReturning,
} = vi.hoisted(() => {
  const findFirstMock = vi.fn();
  const findManyMock = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const deleteWhere = vi.fn();
  const selectWhere = vi.fn();

  const dbMock = {
    query: {
      seasons: {
        findFirst: findFirstMock,
        findMany: findManyMock,
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
    delete: vi.fn(() => ({ where: deleteWhere })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: selectWhere,
      })),
    })),
  };

  return {
    dbMock,
    deleteWhere,
    findFirstMock,
    findManyMock,
    insertReturning,
    selectWhere,
    updateReturning,
  };
});

vi.mock("../../../../database", () => ({ db: dbMock }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, and: vi.fn(), eq: vi.fn(), inArray: vi.fn() };
});

describe("SeasonsDatabaseRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSeasonById retourne null puis une saison", async () => {
    const repo = new SeasonsDatabaseRepository();
    findFirstMock.mockResolvedValueOnce(null);
    await expect(repo.getSeasonById("s1")).resolves.toBeNull();

    findFirstMock.mockResolvedValueOnce({
      id: "s1",
      seriesId: "serie-1",
      name: "Season 1",
      seasonNumber: 1,
      episodeCount: 10,
      overview: null,
      posterUrl: null,
      airDate: null,
      tmdbId: 1,
    });
    const season = await repo.getSeasonById("s1");
    expect(season?.id).toBe("s1");
  });

  it("getSeasonsBySeriesId et createSeason retournent des saisons", async () => {
    const repo = new SeasonsDatabaseRepository();
    findManyMock.mockResolvedValueOnce([
      {
        id: "s1",
        seriesId: "serie-1",
        name: "Season 1",
        seasonNumber: 1,
        episodeCount: 10,
        overview: null,
        posterUrl: null,
        airDate: null,
        tmdbId: 1,
      },
    ]);
    insertReturning.mockResolvedValueOnce([
      {
        id: "s2",
        seriesId: "serie-1",
        name: "Season 2",
        seasonNumber: 2,
        episodeCount: 8,
        overview: null,
        posterUrl: null,
        airDate: null,
        tmdbId: 2,
      },
    ]);

    const list = await repo.getSeasonsBySeriesId("serie-1");
    const created = await repo.createSeason({ name: "Season 2" } as never);
    expect(list).toHaveLength(1);
    expect(created.id).toBe("s2");
  });

  it("updateSeason, deleteSeason, getByTmdbIds et getByTmdbId fonctionnent", async () => {
    const repo = new SeasonsDatabaseRepository();
    updateReturning.mockResolvedValueOnce([
      {
        id: "s1",
        seriesId: "serie-1",
        name: "Season 1 Updated",
        seasonNumber: 1,
        episodeCount: 10,
        overview: null,
        posterUrl: null,
        airDate: null,
        tmdbId: 1,
      },
    ]);
    deleteWhere.mockResolvedValueOnce(undefined);
    selectWhere.mockResolvedValueOnce([
      {
        id: "s1",
        seriesId: "serie-1",
        name: "Season 1 Updated",
        seasonNumber: 1,
        episodeCount: 10,
        overview: null,
        posterUrl: null,
        airDate: null,
        tmdbId: 1,
      },
    ]);
    findFirstMock.mockResolvedValueOnce({
      id: "s1",
      seriesId: "serie-1",
      name: "Season 1 Updated",
      seasonNumber: 1,
      episodeCount: 10,
      overview: null,
      posterUrl: null,
      airDate: null,
      tmdbId: 1,
      content: {
        id: "c1",
        type: "serie",
        title: "Dark",
        slug: "dark",
      },
    });

    const updated = await repo.updateSeason("s1", { name: "Season 1 Updated" });
    await repo.deleteSeason("s1");
    const byTmdbIds = await repo.getByTmdbIds([1]);
    const byTmdbId = await repo.getByTmdbId(1);

    expect(updated.name).toBe("Season 1 Updated");
    expect(byTmdbIds).toHaveLength(1);
    expect(byTmdbId.id).toBe("s1");
  });
});
