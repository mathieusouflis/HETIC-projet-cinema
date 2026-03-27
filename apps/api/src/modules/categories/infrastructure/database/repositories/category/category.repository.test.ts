import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryRepository } from "./category.repository.js";

const {
  countFromRows,
  countWhereRows,
  dbMock,
  deleteWhere,
  joinWhereRows,
  rowsByLimit,
  insertReturning,
  rowsByLimitOffset,
  rowsWhere,
  updateReturning,
} = vi.hoisted(() => {
  const rowsWhere = vi.fn();
  const joinWhereRows = vi.fn();
  const rowsByLimit = vi.fn();
  const rowsByLimitOffset = vi.fn();
  const countWhereRows = vi.fn();
  const countFromRows = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const deleteWhere = vi.fn();

  const dbMock = {
    select: vi.fn((arg?: unknown) => {
      if (arg) {
        return {
          from: vi.fn(() => ({
            where: countWhereRows,
            // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
            then: (resolve: (value: unknown) => unknown) =>
              resolve(countFromRows()),
          })),
        };
      }
      return {
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: rowsByLimitOffset,
              // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
              then: (resolve: (value: unknown) => unknown) =>
                resolve(rowsByLimit()),
            })),
            // biome-ignore lint/suspicious/noThenProperty: mock thenable for awaited drizzle chain
            then: (resolve: (value: unknown) => unknown) =>
              resolve(rowsWhere()),
          })),
          limit: vi.fn(() => ({
            offset: rowsByLimitOffset,
          })),
          innerJoin: vi.fn(() => ({
            where: joinWhereRows,
          })),
        })),
      };
    }),
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
    countFromRows,
    countWhereRows,
    dbMock,
    deleteWhere,
    joinWhereRows,
    rowsByLimit,
    insertReturning,
    rowsByLimitOffset,
    rowsWhere,
    updateReturning,
  };
});

vi.mock("../../../../../../database/index.js", () => ({ db: dbMock }));
vi.mock("../../../../../../database/schema.js", () => ({
  categories: { id: "id", slug: "slug", name: "name", tmdbId: "tmdbId" },
  contentCategories: { categoryId: "categoryId", contentId: "contentId" },
}));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    count: vi.fn(() => "count"),
    eq: vi.fn(),
    inArray: vi.fn(),
  };
});

describe("CategoryRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rowsWhere.mockReturnValue([]);
    rowsByLimit.mockReturnValue([]);
    rowsByLimitOffset.mockResolvedValue([]);
    countFromRows.mockReturnValue([]);
    countWhereRows.mockResolvedValue([]);
    joinWhereRows.mockResolvedValue([]);
  });

  it("findById/findBySlug/findByName et exists* fonctionnent", async () => {
    const repo = new CategoryRepository();
    rowsByLimit.mockReturnValueOnce([
      {
        id: "c1",
        name: "Action",
        slug: "action",
        tmdbId: 1,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const byId = await repo.findById("c1");
    expect(byId?.id).toBe("c1");

    rowsByLimit.mockReturnValueOnce([]);
    await expect(repo.findBySlug("missing")).resolves.toBeNull();

    rowsByLimit.mockReturnValueOnce([
      {
        id: "c2",
        name: "Drama",
        slug: "drama",
        tmdbId: 2,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const byName = await repo.findByName("Drama");
    expect(byName?.slug).toBe("drama");

    countWhereRows.mockResolvedValueOnce([{ count: 1 }]);
    expect(await repo.existsByName("Drama")).toBe(true);
    countWhereRows.mockResolvedValueOnce([{ count: 0 }]);
    expect(await repo.existsBySlug("nope")).toBe(false);
  });

  it("create/update/delete couvrent succes et erreurs", async () => {
    const repo = new CategoryRepository();
    await expect(repo.create({ name: "No slug" } as never)).rejects.toThrow(
      "Slug is required"
    );

    insertReturning.mockResolvedValueOnce([
      {
        id: "c3",
        name: "Sci-Fi",
        slug: "sci-fi",
        tmdbId: 3,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const created = await repo.create({ name: "Sci-Fi", slug: "sci-fi" });
    expect(created.id).toBe("c3");

    updateReturning.mockResolvedValueOnce([]);
    await expect(repo.update("c3", { name: "X" })).rejects.toThrow(
      "Failed to update category"
    );
    updateReturning.mockResolvedValueOnce([
      {
        id: "c3",
        name: "Sci-Fi Updated",
        slug: "sci-fi",
        tmdbId: 3,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const updated = await repo.update("c3", { name: "Sci-Fi Updated" });
    expect(updated.name).toBe("Sci-Fi Updated");

    deleteWhere.mockResolvedValueOnce(undefined);
    await repo.delete("c3");
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });

  it("findAll/findByTmdbIds/findByContentId mappent les lignes", async () => {
    const repo = new CategoryRepository();
    countFromRows.mockReturnValueOnce([{ count: 2 }]);
    rowsByLimitOffset.mockResolvedValueOnce([
      {
        id: "c1",
        name: "Action",
        slug: "action",
        tmdbId: 1,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "c2",
        name: "Drama",
        slug: "drama",
        tmdbId: 2,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const all = await repo.findAll({ page: 1, limit: 10 });
    expect(all.total).toBe(2);
    expect(all.categories).toHaveLength(2);

    rowsWhere.mockReturnValueOnce([
      {
        id: "c1",
        name: "Action",
        slug: "action",
        tmdbId: 1,
        description: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const byTmdb = await repo.findByTmdbIds([1]);
    expect(byTmdb).toHaveLength(1);

    joinWhereRows.mockResolvedValueOnce([
      {
        categories: {
          id: "c2",
          name: "Drama",
          slug: "drama",
          tmdbId: 2,
          description: null,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      },
    ]);
    const byContent = await repo.findByContentId("content-1");
    expect(byContent).toHaveLength(1);
  });
});
