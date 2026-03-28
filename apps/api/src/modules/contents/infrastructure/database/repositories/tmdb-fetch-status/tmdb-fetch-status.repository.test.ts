import { beforeEach, describe, expect, it, vi } from "vitest";

import { MetadataNotFoundError } from "./errors/metadata-not-found";

import { TMDBFetchStatusRepository } from "./tmdb-fetch-status.repository";

const {
  dbMock,
  deleteReturning,
  findFirstMock,
  insertConflictUpdate,
  insertValues,
} = vi.hoisted(() => {
  const findFirstMock = vi.fn();
  const insertConflictUpdate = vi.fn();
  const insertValues = vi.fn(() => ({
    onConflictDoUpdate: insertConflictUpdate,
  }));
  const deleteReturning = vi.fn();
  const deleteWhere = vi.fn(() => ({ returning: deleteReturning }));

  const dbMock = {
    query: { tmdbFetchStatus: { findFirst: findFirstMock } },
    insert: vi.fn(() => ({ values: insertValues })),
    delete: vi.fn(() => ({ where: deleteWhere })),
  };

  return {
    dbMock,
    deleteReturning,
    deleteWhere,
    findFirstMock,
    insertConflictUpdate,
    insertValues,
  };
});

vi.mock("../../../../../../database", () => ({ db: dbMock }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

describe("TMDBFetchStatusRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("set/get discover metadata", async () => {
    const repo = new TMDBFetchStatusRepository();
    await repo.setDiscoverMetadata("movie", { page: 3 });
    expect(insertValues).toHaveBeenCalled();
    expect(insertConflictUpdate).toHaveBeenCalled();

    findFirstMock.mockResolvedValueOnce({ metadata: { page: 3 } });
    await expect(repo.getDiscoverMetadata("movie")).resolves.toEqual({
      page: 3,
    });
  });

  it("set/get search metadata et expiration", async () => {
    const repo = new TMDBFetchStatusRepository();
    await repo.setSearchMetadata("  Matrix  ", { page: 2 });
    expect(insertValues).toHaveBeenCalled();

    findFirstMock.mockResolvedValueOnce({
      metadata: { page: 2 },
      expiresAt: "2999-01-01T00:00:00.000Z",
    });
    await expect(repo.getSearchMetadata("matrix")).resolves.toEqual({
      page: 2,
    });

    findFirstMock.mockResolvedValueOnce({
      metadata: { page: 1 },
      expiresAt: "2000-01-01T00:00:00.000Z",
    });
    await expect(repo.getSearchMetadata("matrix")).rejects.toBeInstanceOf(
      MetadataNotFoundError
    );
  });

  it("throws MetadataNotFoundError when metadata missing", async () => {
    const repo = new TMDBFetchStatusRepository();
    findFirstMock.mockResolvedValueOnce(null);
    await expect(repo.getDiscoverMetadata("tv")).rejects.toBeInstanceOf(
      MetadataNotFoundError
    );
  });

  it("cleanup/delete methods call delete queries", async () => {
    const repo = new TMDBFetchStatusRepository();
    deleteReturning.mockResolvedValueOnce([{ id: "1" }, { id: "2" }]);
    await expect(repo.cleanupExpiredSearches()).resolves.toBe(2);

    await repo.deleteDiscoverMetadata("movie");
    await repo.deleteSearchMetadata("query");

    expect(dbMock.delete).toHaveBeenCalledTimes(3);
  });
});
