import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentsRepository } from "./contents.repository";

const {
  contentFindFirst,
  dbMock,
  listMoviesMock,
  listSeriesMock,
  searchMoviesMock,
  searchSeriesMock,
} = vi.hoisted(() => {
  const listMoviesMock = vi.fn();
  const listSeriesMock = vi.fn();
  const searchMoviesMock = vi.fn();
  const searchSeriesMock = vi.fn();
  const contentFindFirst = vi.fn();

  const dbMock = {
    query: {
      content: {
        findFirst: contentFindFirst,
      },
    },
  };

  return {
    contentFindFirst,
    dbMock,
    listMoviesMock,
    listSeriesMock,
    searchMoviesMock,
    searchSeriesMock,
  };
});

vi.mock("../../../../../database", () => ({ db: dbMock }));
vi.mock(
  "../../../../movies/infrastructure/database/repositories/composite-movies.repository",
  () => ({
    CompositeMoviesRepository: class {
      listMovies = listMoviesMock;
      searchMovies = searchMoviesMock;
    },
  })
);
vi.mock(
  "../../../../series/infrastructure/database/repositories/composite-series.repository",
  () => ({
    CompositeSeriesRepository: class {
      listSeries = listSeriesMock;
      searchSeries = searchSeriesMock;
    },
  })
);
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

describe("ContentsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listContents delegate by type and merge without type", async () => {
    const repo = new ContentsRepository();
    listMoviesMock.mockResolvedValue({ data: [{ id: "m1" }], total: 1 });
    listSeriesMock.mockResolvedValue({ data: [{ id: "s1" }], total: 2 });

    const onlyMovies = await repo.listContents("movie");
    expect(onlyMovies.total).toBe(1);

    const onlySeries = await repo.listContents("serie");
    expect(onlySeries.total).toBe(2);

    const merged = await repo.listContents();
    expect(merged.data).toHaveLength(2);
    expect(merged.total).toBe(3);
  });

  it("searchContents delegate by type and merge without type", async () => {
    const repo = new ContentsRepository();
    searchMoviesMock.mockResolvedValue([{ id: "m1" }]);
    searchSeriesMock.mockResolvedValue([{ id: "s1" }]);

    await expect(repo.searchContents("dark", "movie")).resolves.toEqual([
      { id: "m1" },
    ]);
    await expect(repo.searchContents("dark", "serie")).resolves.toEqual([
      { id: "s1" },
    ]);
    await expect(repo.searchContents("dark")).resolves.toEqual([
      { id: "m1" },
      { id: "s1" },
    ]);
  });

  it("getContentById returns undefined when content missing", async () => {
    const repo = new ContentsRepository();
    contentFindFirst.mockResolvedValueOnce(null);
    await expect(repo.getContentById({ id: "x" })).resolves.toBeUndefined();
  });

  it("getContentById maps requested relations", async () => {
    const repo = new ContentsRepository();
    contentFindFirst.mockResolvedValueOnce({
      id: "c1",
      type: "movie",
      title: "Title",
      slug: "title",
      originalTitle: null,
      synopsis: null,
      posterUrl: null,
      backdropUrl: null,
      trailerUrl: null,
      releaseDate: null,
      year: null,
      durationMinutes: null,
      tmdbId: null,
      averageRating: "0",
      totalRatings: 0,
      totalViews: 0,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      contentCredits: [
        {
          person: {
            id: "p1",
            name: "John",
            bio: null,
            photoUrl: null,
            birthDate: null,
            nationality: null,
            tmdbId: null,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        },
      ],
      contentCategories: [
        {
          category: {
            id: "cat1",
            name: "Action",
            slug: "action",
            tmdbId: 1,
            description: null,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        },
      ],
      contentPlatforms: [
        {
          platform: {
            id: "pl1",
            name: "Netflix",
            slug: "netflix",
            logoUrl: null,
            baseUrl: null,
            tmdbId: null,
            isSupported: true,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        },
      ],
      seasons: [],
    });

    const content = await repo.getContentById({
      id: "c1",
      withCast: true,
      withCategory: true,
      withPlatform: true,
    });
    expect(content?.id).toBe("c1");
    expect(content?.getRelations("contentCredits")).toHaveLength(1);
    expect(content?.getRelations("contentCategories")).toHaveLength(1);
    expect(content?.getRelations("contentPlatforms")).toHaveLength(1);
  });
});
