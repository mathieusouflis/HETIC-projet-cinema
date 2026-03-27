import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodesDatabaseRepository } from "./episodes.database.repository";

const {
  dbMock,
  deleteWhere,
  findFirstMock,
  findManyMock,
  insertReturning,
  updateReturning,
} = vi.hoisted(() => {
  const findFirstMock = vi.fn();
  const findManyMock = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const deleteWhere = vi.fn();

  const dbMock = {
    query: {
      episodes: {
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
  };

  return {
    dbMock,
    deleteWhere,
    findFirstMock,
    findManyMock,
    insertReturning,
    updateReturning,
  };
});

vi.mock("../../../../database", () => ({ db: dbMock }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

describe("EpisodesDatabaseRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getEpisodeById retourne null puis une entite", async () => {
    const repo = new EpisodesDatabaseRepository();
    findFirstMock.mockResolvedValueOnce(null);
    await expect(repo.getEpisodeById("e1")).resolves.toBeNull();

    findFirstMock.mockResolvedValueOnce({
      id: "e1",
      name: "Pilot",
      seasonId: "s1",
      episodeNumber: 1,
      overview: null,
      stillUrl: null,
      airDate: null,
      durationMinutes: null,
      tmdbId: null,
    });
    const entity = await repo.getEpisodeById("e1");
    expect(entity?.id).toBe("e1");
  });

  it("getEpisodesBySeasonId et getEpisodeByNumber mappent correctement", async () => {
    const repo = new EpisodesDatabaseRepository();
    findManyMock.mockResolvedValueOnce([
      {
        id: "e1",
        name: "Pilot",
        seasonId: "s1",
        episodeNumber: 1,
        overview: null,
        stillUrl: null,
        airDate: null,
        durationMinutes: null,
        tmdbId: null,
      },
    ]);
    findFirstMock.mockResolvedValueOnce({
      id: "e2",
      name: "Ep2",
      seasonId: "s1",
      episodeNumber: 2,
      overview: null,
      stillUrl: null,
      airDate: null,
      durationMinutes: null,
      tmdbId: null,
    });

    const list = await repo.getEpisodesBySeasonId("s1");
    const single = await repo.getEpisodeByNumber("s1", 2);
    expect(list).toHaveLength(1);
    expect(single?.episodeNumber).toBe(2);
  });

  it("createEpisode et updateEpisode retournent une entite", async () => {
    const repo = new EpisodesDatabaseRepository();
    insertReturning.mockResolvedValueOnce([
      {
        id: "e3",
        name: "Ep3",
        seasonId: "s1",
        episodeNumber: 3,
        overview: null,
        stillUrl: null,
        airDate: null,
        durationMinutes: null,
        tmdbId: null,
      },
    ]);
    updateReturning.mockResolvedValueOnce([
      {
        id: "e3",
        name: "Ep3 updated",
        seasonId: "s1",
        episodeNumber: 3,
        overview: null,
        stillUrl: null,
        airDate: null,
        durationMinutes: null,
        tmdbId: null,
      },
    ]);

    const created = await repo.createEpisode({ name: "Ep3" } as never);
    const updated = await repo.updateEpisode("e3", { name: "Ep3 updated" });
    expect(created.id).toBe("e3");
    expect(updated.name).toBe("Ep3 updated");
  });

  it("deleteEpisode execute un delete", async () => {
    const repo = new EpisodesDatabaseRepository();
    deleteWhere.mockResolvedValueOnce(undefined);
    await repo.deleteEpisode("e1");
    expect(dbMock.delete).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });
});
