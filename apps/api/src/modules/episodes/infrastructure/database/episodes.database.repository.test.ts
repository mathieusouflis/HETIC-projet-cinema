import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { EpisodesDatabaseRepository } from "./episodes.database.repository.js";

const { dbMock, findFirst, findMany, insertReturning, updateReturning } =
  vi.hoisted(() => {
    const findFirst = vi.fn();
    const findMany = vi.fn();
    const insertReturning = vi.fn();
    const updateReturning = vi.fn();

    const dbMock = {
      query: {
        episodes: {
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
    };

    return { dbMock, findFirst, findMany, insertReturning, updateReturning };
  });

vi.mock("../../../../database", () => ({ db: dbMock }));

describe("EpisodesDatabaseRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const episodeRow: any = {
    id: "e1",
    seasonId: "s1",
    tmdbId: 101,
    episodeNumber: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("getEpisodeById: null, ok, error", async () => {
    const repo = new EpisodesDatabaseRepository();
    findFirst.mockResolvedValueOnce(null);
    await expect(repo.getEpisodeById("e1")).resolves.toBeNull();

    findFirst.mockResolvedValueOnce(episodeRow);
    await expect(repo.getEpisodeById("e1")).resolves.toBeDefined();

    findFirst.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getEpisodeById("e1")).rejects.toBeInstanceOf(ServerError);
  });

  it("getEpisodesBySeasonId: ok + error", async () => {
    const repo = new EpisodesDatabaseRepository();
    findMany.mockResolvedValueOnce([episodeRow]);
    await expect(repo.getEpisodesBySeasonId("s1")).resolves.toHaveLength(1);

    findMany.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getEpisodesBySeasonId("s1")).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("getEpisodeByNumber: null, ok, error", async () => {
    const repo = new EpisodesDatabaseRepository();
    findFirst.mockResolvedValueOnce(null);
    await expect(repo.getEpisodeByNumber("s1", 1)).resolves.toBeNull();

    findFirst.mockResolvedValueOnce(episodeRow);
    await expect(repo.getEpisodeByNumber("s1", 1)).resolves.toBeDefined();

    findFirst.mockRejectedValueOnce(new Error("db"));
    await expect(repo.getEpisodeByNumber("s1", 1)).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("createEpisode: ok, empty, undefined row", async () => {
    const repo = new EpisodesDatabaseRepository();
    insertReturning.mockResolvedValueOnce([episodeRow]);
    await expect(repo.createEpisode(episodeRow)).resolves.toBeDefined();

    insertReturning.mockResolvedValueOnce([]);
    await expect(repo.createEpisode(episodeRow)).rejects.toBeInstanceOf(
      ServerError
    );

    insertReturning.mockResolvedValueOnce([undefined]);
    await expect(repo.createEpisode(episodeRow)).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("updateEpisode: ok, empty, undefined row", async () => {
    const repo = new EpisodesDatabaseRepository();
    updateReturning.mockResolvedValueOnce([episodeRow]);
    await expect(
      repo.updateEpisode("e1", { episodeNumber: 2 })
    ).resolves.toBeDefined();

    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.updateEpisode("e1", {})).rejects.toBeInstanceOf(
      ServerError
    );

    updateReturning.mockResolvedValueOnce([undefined]);
    await expect(repo.updateEpisode("e1", {})).rejects.toBeInstanceOf(
      ServerError
    );
  });

  it("deleteEpisode: ok + error", async () => {
    const repo = new EpisodesDatabaseRepository();
    await expect(repo.deleteEpisode("e1")).resolves.toBeUndefined();

    dbMock.delete.mockImplementationOnce(() => ({
      where: vi.fn(() => Promise.reject(new Error("db"))),
    }));
    await expect(repo.deleteEpisode("e1")).rejects.toBeInstanceOf(ServerError);
  });
});
