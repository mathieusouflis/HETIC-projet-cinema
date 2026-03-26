import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb } = vi.hoisted(() => {
  const insertReturning = vi.fn();
  const insertValues = vi.fn(() => ({
    returning: insertReturning,
    onConflictDoNothing: vi.fn(),
  }));
  const insert = vi.fn(() => ({ values: insertValues }));

  const updateReturning = vi.fn();
  const updateWhere = vi.fn(() => ({ returning: updateReturning }));
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));

  const deleteWhere = vi.fn();
  const del = vi.fn(() => ({ where: deleteWhere }));

  const selectWhere = vi.fn(() => Promise.resolve([{ count: 0 }]));
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));

  return {
    mockDb: {
      query: {
        content: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
        },
      },
      insert,
      update,
      delete: del,
      select,
    },
  };
});

vi.mock("../../../database", () => ({ db: mockDb }));

import {
  type BaseContentProps,
  BaseDrizzleRepository,
} from "./base-drizzle-repository";

type FakeEntity = {
  id: string;
  tmdbId?: number | null;
  setRelations: (key: string, value: unknown) => void;
};

class TestDrizzleRepository extends BaseDrizzleRepository<
  FakeEntity,
  Record<string, unknown>,
  BaseContentProps
> {
  public readonly contentType = "movie" as const;
  protected readonly entityName = "movie";

  protected createEntity(row: Record<string, unknown>): FakeEntity {
    return {
      id: (row.id as string) ?? "id-1",
      tmdbId: (row.tmdbId as number | null | undefined) ?? null,
      setRelations: vi.fn(),
    };
  }
}

describe("BaseDrizzleRepository", () => {
  const repository = new TestDrizzleRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getByTmdbIds should return [] for empty ids", async () => {
    const result = await repository.getByTmdbIds([]);

    expect(result).toEqual([]);
    expect(mockDb.query.content.findMany).not.toHaveBeenCalled();
  });

  it("getById should return null when not found", async () => {
    mockDb.query.content.findFirst.mockResolvedValue(null);

    const result = await repository.getById("missing-id");

    expect(result).toBeNull();
  });

  it("getByTmdbIds should map relation fields when options are enabled", async () => {
    mockDb.query.content.findMany.mockResolvedValue([
      {
        id: "movie-1",
        tmdbId: 10,
        contentCategories: [{ category: { id: "c1", name: "Action" } }],
        contentPlatforms: [{ platform: { id: "p1", name: "Netflix" } }],
        contentCredits: [{ person: { id: "pe1", name: "Actor" } }],
        seasons: [{ episodes: [{ id: "e1" }] }],
      },
    ]);

    const result = await repository.getByTmdbIds([10], {
      withCategories: true,
      withPlatforms: true,
      withCast: true,
      withSeasons: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("movie-1");
  });

  it("getByTmdbIds should throw ServerError when db query fails", async () => {
    mockDb.query.content.findMany.mockRejectedValue(new Error("db down"));

    await expect(repository.getByTmdbIds([1])).rejects.toThrow(
      "Failed to get movie by TMDB IDs"
    );
  });

  it("create should return created entity", async () => {
    const values = [{ id: "movie-1", tmdbId: 10 }];
    (mockDb.insert as any).mockImplementationOnce(() => ({
      values: (_payload: unknown) => ({
        returning: vi.fn().mockResolvedValue(values),
      }),
    }));

    const result = await repository.create({
      type: "movie",
      title: "Movie",
    } as BaseContentProps);

    expect(result.id).toBe("movie-1");
  });

  it("create should throw when insert returns no row", async () => {
    (mockDb.insert as any).mockImplementationOnce(() => ({
      values: (_payload: unknown) => ({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }));

    await expect(
      repository.create({
        type: "movie",
        title: "Nope",
      } as BaseContentProps)
    ).rejects.toThrow("Failed to create movie");
  });

  it("update should throw when no rows are updated", async () => {
    (mockDb.update as any).mockImplementationOnce(() => ({
      set: (_payload: unknown) => ({
        where: (_where: unknown) => ({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }));

    await expect(
      repository.update("not-found", { title: "X" } as any)
    ).rejects.toThrow("not found or not updated");
  });

  it("delete should call db delete chain", async () => {
    (mockDb.delete().where as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );

    await repository.delete("movie-1");

    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("getCount should return numeric count", async () => {
    (mockDb.select as any).mockImplementationOnce(() => ({
      from: (_schema: unknown) => ({
        where: vi.fn().mockResolvedValue([{ count: 7 }]),
      }),
    }));

    const count = await repository.getCount("title");

    expect(count).toBe(7);
  });

  it("linkCategories should return early on empty list", async () => {
    await repository.linkCategories("movie-1", []);

    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("linkProviders should insert providers", async () => {
    const onConflict = vi.fn();
    const values = vi.fn((_payload: unknown) => ({
      onConflictDoNothing: onConflict,
    }));
    (mockDb.insert as any).mockReturnValueOnce({ values });

    await repository.linkProviders("movie-1", ["p1", "p2"]);

    expect(values).toHaveBeenCalled();
    expect(onConflict).toHaveBeenCalled();
  });

  it("linkCasts should return early on empty list", async () => {
    await repository.linkCasts("movie-1", []);

    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("linkCasts should insert cast values", async () => {
    const onConflict = vi.fn();
    const values = vi.fn((_payload: unknown) => ({
      onConflictDoNothing: onConflict,
    }));
    (mockDb.insert as any).mockReturnValueOnce({ values });

    await repository.linkCasts("movie-1", [
      {
        dbId: "person-1",
        known_for_department: "Acting",
        character: "Hero",
        order: 0,
      } as any,
    ]);

    expect(values).toHaveBeenCalled();
    expect(onConflict).toHaveBeenCalled();
  });

  it("checkExistsByTmdbIds should map ids existence", async () => {
    vi.spyOn(repository, "getByTmdbIds").mockResolvedValue([
      { id: "1", tmdbId: 11, setRelations: vi.fn() },
    ]);

    const result = await repository.checkExistsByTmdbIds([11, 12]);

    expect(result).toEqual({ 11: true, 12: false });
  });
});
